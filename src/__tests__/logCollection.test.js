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
          code: 0,
          output: 'test log content',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: '/var/log',
        logs: 'test log content',
        error: '',
        instance: expect.any(String)
      });
    });

    it('should collect logs from specified log file', async () => {
      // Mock successful log collection
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 0,
          output: 'specific log content',
          errorOutput: ''
        }),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app)
        .get('/logs/collect')
        .query({ logFile: 'large_log.log' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        logs: 'specific log content',
        error: '',
        instance: expect.any(String)
      });
    });

    it('should handle SSH connection errors', async () => {
      // Mock SSH connection failure
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Connection failed',
        details: expect.any(String)
      });
    });

    it('should handle command execution errors', async () => {
      // Mock command execution failure
      SSHClient.mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockRejectedValue(new Error('Command failed')),
        disconnect: jest.fn().mockResolvedValue()
      }));

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Command failed',
        details: expect.any(String)
      });
    });
  });
}); 