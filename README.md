# Log Collection API

A Node.js service that provides centralized log collection from multiple servers via SSH. This package allows you to securely retrieve logs from multiple remote servers, with features like filtering, line limiting, and log file name filtering.

## Features

1. **Parallel Log Collection**
   - Simultaneously collects logs from multiple servers
   - Handles partial failures gracefully
   - Aggregates results from all servers

2. **Input Validation**
   - Validates line numbers (positive integer number less than 1000)
   - Sanitizes log file paths
   - Validates keyword filters

## Project Design and Infrastructure

### Architecture Overview

#### High-Level Overview
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend│     │ExpressJS Backend│     │  Remote Servers │
│   (Port: 3001)  │◄───►│   (Port: 3000)  │◄───►│  (SSH Access)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```


```
Project Structure
├── backend/
│   ├── src/
│   │   ├── index.js           # Express application entry point
│   │   ├── sshClient.js       # SSH connection handling
│   │   ├── utils/
│   │   │   └── validators.js  # Input validation logic
│   │   ├── config/
│   │   │   └── ssh.config.js  # SSH server configurations
│   │   └── __tests__/        # Test files
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.js           # Main React component
    │   ├── App.css          # Application styles
    │   ├── index.js        # React entry point
    │   └── __tests__/        # Test files
    └── package.json
```

## Running Frontend and Backend Applications

You'll need to run both the backend and frontend in separate terminal windows.

### Terminal 1 - Backend Server
```bash
cd backend
npm install    # Only needed first time
npm run dev    # Starts server on http://localhost:3000
```

### Terminal 2 - Frontend Application
```bash
cd frontend
npm install    # Only needed first time
npm run start-windows    # For Windows
# or
npm start              # For Mac/Linux
```

The frontend will be available at http://localhost:3001 and is configured to proxy API requests to the backend automatically.

## Configuration

Create a `config/ssh.config.js` file with your server configurations:

```javascript
module.exports = [
  {
    host: 'server1.example.com',
    port: 22,
    username: 'user',
    privateKey: '/path/to/private/key',
    readyTimeout: 5000
  },
  // Add more servers as needed
];
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the service.

**Response:**
```json
{
  "status": "ok"
}
```

### Collect Logs

```
GET /logs/collect
```

Collects logs from configured servers.

**Query Parameters:**

- `logFile` (optional): Path to the log file, subdirectories are allowed (default: '/var/log/large_log.log')
- `keyWord` (optional): Filter logs by keyword, length needs to be between 2 to 100.
- `lines` (optional): Number of lines to return (default: 100)

**Example Requests:**

Basic usage:
```
GET /logs/collect
```
This will get default log file (large_log.log in this setup), and get the latest 100 lines from the log file from all servers connected to.

With parameters:
```
GET /logs/collect?logFile=app.log&keyWord=ERROR&lines=50
```

**Success Response:**
```json
{
  "success": true,
  "logFile": "app.log",
  "keyWord": "ERROR",
  "lines": 50,
  "results": [
    {
      "instance": "server1.example.com",
      "success": true,
      "logs": "log content...",
      "error": "",
      "details": null
    },
    {
      "instance": "server2.example.com",
      "success": true,
      "logs": "log content...",
      "error": "",
      "details": null
    }
  ]
}
```

**Success Response, but partial server failure:**
```json
{
  "success": true,
  "logFile": "app.log",
  "keyWord": "ERROR",
  "lines": 50,
  "results": [
    {
      "instance": "server1.example.com",
      "success": true,
      "logs": "log content...",
      "error": "",
      "details": null
    },
    {
      "instance": "server2.example.com",
      "success": false,
      "logs": null,
      "error": "Command failed",
      "details": "Permission denied"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Usage Examples

### Filtered Logs with Line Limit
```bash
curl "http://localhost:3000/logs/collect?keyWord=ERROR&lines=50"
```

### Custom Log File
```bash
curl "http://localhost:3000/logs/collect?logFile=custom.log"
```

## Development

### Running Tests
```bash
npm test
```

## Future Improvements and Planned Features

### Backend Improvements

#### Feature Additions
- Support for multiple log files in a single request, currently only certain file under /var/log is supported
- Log aggregation across large fleet of servers. Using multiple log collector to search across large log fleets.
- Compressed log support