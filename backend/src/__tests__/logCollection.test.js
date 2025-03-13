const request = require('supertest');
const express = require('express');
const SSHClient = require('../sshClient');

// Mock SSHClient
jest.mock('../sshClient');
jest.mock('../config/ssh.config', () => [
  { 
    host: 'server1.example.com',
    port: 22,
    username: 'testuser',
    privateKey: 'testkey',
    readyTimeout: 5000
  },
  {
    host: 'server2.example.com',
    port: 22,
    username: 'testuser',
    privateKey: 'testkey',
    readyTimeout: 5000
  }
]);

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
    it('should collect logs from all servers using default parameters', async () => {
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
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,  // Default value
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'test log content',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: 'test log content',
            error: '',
            details: null
          }
        ]
      });
    });

    it('should collect logs from specified log file', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 0,
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
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'specific log content',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: 'specific log content',
            error: '',
            details: null
          }
        ]
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo tail -n 100 \"/var/log/large_log.log\" | tac'
      );
    });

    it('should filter logs by keyWord when provided', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 0,
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
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'filtered log content with ERROR',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: 'filtered log content with ERROR',
            error: '',
            details: null
          }
        ]
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo grep -i "ERROR" \"/var/log/large_log.log\" | tail -n 100 | tac'
      );
    });

    it('should respect custom line number parameter', async () => {
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockResolvedValue({
          code: 0,
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
        lines: 50,  // Default value
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'last 50 lines of logs',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: 'last 50 lines of logs',
            error: '',
            details: null
          }
        ]
      });

      expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(
        'sudo tail -n 50 \"/var/log/large_log.log\" | tac'
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
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,  // Default value
        results: [
          {
            instance: 'server1.example.com',
            success: false,
            logs: null,
            error: 'Connection failed',
            details: 'Error message'
          },
          {
            instance: 'server2.example.com',
            success: false,
            logs: null,
            error: 'Connection failed',
            details: 'Error message'
          }
        ]
      });
    });

    it('should handle unexpectedcommand execution errors', async () => {
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
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,  // Default value
        results: [
          {
            instance: 'server1.example.com',
            success: false,
            logs: null,
            error: 'Command failed',
            details: 'Error message'
          },
          {
            instance: 'server2.example.com',
            success: false,
            logs: null,
            error: 'Command failed',
            details: 'Error message'
          }
        ]
      });
    });

    it('should handle file not found errors on one server', async () => {
      let callCount = 0;
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              code: 0,
              output: 'server1 logs',
              errorOutput: ''
            });
          }
          return Promise.resolve({
            code: 0,
            output: '',
            errorOutput: `Error: grep: /var/log/large_log.log: No such file or directory`
          });
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'server1 logs',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: '',
            error: `Error: grep: /var/log/large_log.log: No such file or directory`,
            details: null
          }
        ]
      });

      // Verify command was called twice (once for each server)
      expect(mockSSHClient.executeCommand).toHaveBeenCalledTimes(2);
    });

    it('should handle file not found errors on both servers', async () => {
      let callCount = 0;
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            code: 0,
            output: '',
            errorOutput: `Error: grep: /var/log/large_log.log: No such file or directory`
          });
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: '',
            error: `Error: grep: /var/log/large_log.log: No such file or directory`,
            details: null
          },
          {
            instance: 'server2.example.com',
            success: true,
            logs: '',
            error: `Error: grep: /var/log/large_log.log: No such file or directory`,
            details: null
          }
        ]
      });

      // Verify command was called twice (once for each server)
      expect(mockSSHClient.executeCommand).toHaveBeenCalledTimes(2);
    });

    it('should handle partial server failures', async () => {
      let callCount = 0;
      const mockSSHClient = {
        connect: jest.fn().mockResolvedValue(),
        executeCommand: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              code: 0,
              output: 'server1 logs',
              errorOutput: ''
            });
          }
          return Promise.reject({
            message: 'Command failed',
            details: 'Permission denied'
          });
        }),
        disconnect: jest.fn().mockResolvedValue()
      };

      SSHClient.mockImplementation(() => mockSSHClient);

      const response = await request(app).get('/logs/collect');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        logFile: 'large_log.log',
        keyWord: null,
        lines: 100,
        results: [
          {
            instance: 'server1.example.com',
            success: true,
            logs: 'server1 logs',
            error: '',
            details: null
          },
          {
            instance: 'server2.example.com',
            success: false,
            logs: null,
            error: 'Command failed',
            details: 'Permission denied'
          }
        ]
      });

      // Verify command was called twice (once for each server)
      expect(mockSSHClient.executeCommand).toHaveBeenCalledTimes(2);
    });
  });
});