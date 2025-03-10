const request = require('supertest');
const express = require('express');
const SSHClient = require('../sshClient');

// Mock SSHClient
jest.mock('../sshClient');

describe('Log Collection API', () => {
  let app;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create fresh express app for each test
    app = express();
    app.use(express.json());
    
    // Import routes (this will use the mocked SSHClient)
    require('../index')(app);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /logs/collect', () => {
    it('should collect logs from default path if no logFile specified', async () => {
      // Mock successful log collection
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 200,
          output: 'test log content',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: '/var/log/large_log.log',
        keyWord: null,
        lines: 100,  // Default value
        logs: 'test log content',
        error: '',
        instance: expect.any(String)
      });
    });

    it('should collect logs from specified log file', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({          
          code: 200,
          output: 'specific log content',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app)
        .get('/logs/collect')
        .query({ logFile: 'large_log.log' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,  // Default value
        logs: 'specific log content',
        error: '',
        instance: expect.any(String)
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo cat large_log.log | tail -n 100'
      );
    });

    it('should filter logs by keyWord when provided', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 200,
          output: 'filtered log content with ERROR',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app)
        .get('/logs/collect')
        .query({ 
          logFile: 'large_log.log',
          keyWord: 'ERROR'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: 'ERROR',
        lines: 100,  // Default value
        logs: 'filtered log content with ERROR',
        error: '',
        instance: expect.any(String)
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo cat large_log.log | grep -i "ERROR" | tail -n 100'
      );
    });

    it('should respect custom line number parameter', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 200,
          output: 'last 50 lines of logs',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app)
        .get('/logs/collect')
        .query({ 
          logFile: 'large_log.log',
          lines: 50
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: null,
        lines: 50,
        logs: 'last 50 lines of logs',
        error: '',
        instance: expect.any(String)
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo cat large_log.log | tail -n 50'
      );
    });

    it('should handle invalid lines parameter', async () => {
      const response = await request(app)
        .get('/logs/collect')
        .query({ 
          lines: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid lines parameter',
        details: 'Lines must be a positive integer number'
      });
    });

    it('should handle negative lines parameter', async () => {
      const response = await request(app)
        .get('/logs/collect')
        .query({ 
          lines: -10
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid lines parameter',
        details: 'Lines must be a positive integer number'
      });
    });

    it('should handle SSH connection errors', async () => {
      // Mock SSH connection failure
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockRejectedValue({
          message: 'Connection failed',
          details: 'Error message'
        }),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Connection failed',
        details: 'Error message'
      });
    });

    it('should handle command execution errors', async () => {
      // Mock command execution failure
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockRejectedValue({
          message: 'Command failed',
          details: 'Error message'
        }),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Command failed',
        details: 'Error message'
      });
    });
  });
});