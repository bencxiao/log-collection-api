# Testing Documentation

## Overview

This document outlines the testing implementation for the Log Collection project. The project uses Jest as the testing framework for both backend and frontend components.

## Backend Testing

### Log Collection API Tests (`src/__tests__/logCollection.test.js`)

#### Health Check Endpoint
```javascript
GET /health
- Returns 200 status code
- Returns { status: 'ok' }
```

#### Log Collection Endpoint
```javascript
GET /logs/collect
```

Test cases cover:
- Default parameters (100 lines, large_log.log)
- Custom log file specification
- Keyword filtering
- Line number limits
- Error handling for invalid parameters
- Partial server failures
- SSH connection errors
- Remote command execution errors
- Partial server returning file not found 


### Validator Tests (`src/__tests__/validators.test.js`)

Tests for the `LogParameterValidator` class that handles input validation.

#### Line Number Validation
- Valid cases:
  - Positive integers (1-1000)
  - Decimal numbers (truncated to integer)
- Invalid cases:
  - Negative numbers
  - Non-numeric values
  - Numbers > 1000

#### Log File Name Validation
- Valid cases:
  - Simple filenames (test.log)
  - Files with underscores/hyphens
  - Empty string (defaults to 'large_log.log')
  - File name with valid subdirectory path
  - File name with extra trimmable spaces
- Invalid cases:
  - Path traversal attempts (../test.log)
  - Absolute paths (/root/test.log)
  - Null byte
  - Names > 255 characters
  - Command injection attempts
  - Wildcard

#### Keyword Validation
- Valid cases:
  - Alphanumeric strings
  - Timestamps (2025-03-11 20:59:59.662)
  - Empty/null/undefined (treated as no filter)
  - Whitespace (trimmed)
- Invalid cases:
  - Too short string < 2 characters
  - Too long string > 100 characters
  - Special characters
  - Command injection attempts

### Running Backend Tests

```bash
cd backend
npm test                     # Run all tests
npm test -- --coverage      # Run tests with coverage report
npm test -- --watch        # Run in watch mode
npm test -- path/to/test.js # Run specific test file
```

## Frontend Testing

### Component Tests (`src/__tests__/App.test.js`)

Tests for the React App component using React Testing Library and Jest.

#### Basic Rendering Tests
- Tested basic component render

#### Form Interaction Tests
- Default values:
  - Log File: 'large_log.log'
  - Keyword Filter: '' (empty)
  - Number of Lines: '100'
- User input handling for all fields
- Form submission behavior

#### API Integration Tests
- Successful log fetching

#### Error Handling Tests
- API error responses

#### Partial Success Tests
- Mixed success/failure responses

### Running Frontend Tests

```bash
cd frontend
npm test                    # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage report
```

## Current integration testing environment

### Servers
Two EC2 t2.xlarge on AWS us-west-2 region

### Access the servers
1. Open an SSH client.
2. Locate your private key file. The key used to launch this instance is ec2-key.pem
3. Run this command, if necessary, to ensure your key is not publicly viewable.
chmod 400 "ec2-key.pem"
4. Connect to your instance using its Public DNS:
ec2-54-191-0-147.us-west-2.compute.amazonaws.com/ec2-35-85-38-21.us-west-2.compute.amazonaws.com

### Private key file
pem file is attached in ./backend/ec2-key.pem

### Sample log files
#### ec2-54-191-0-147.us-west-2.compute.amazonaws.com Server
'/var/log/large log.log' 1.1G

#### Sample log:

```bash
[2025-03-11 20:58:00.422] DEBUG - alice: File uploaded successfully
[2025-03-11 20:58:00.418] DEBUG - bob: Resource not found
[2025-03-11 20:58:00.415] DEBUG - eve: Failed to connect to database
[2025-03-11 20:58:00.412] ERROR - dave: User logged in successfully
[2025-03-11 20:58:00.410] ERROR - dave: Session expired due to inactivity
[2025-03-11 20:58:00.408] WARN - alice: Session expired due to inactivity
[2025-03-11 20:58:00.405] ERROR - charlie: Session expired due to inactivity
[2025-03-11 20:58:00.402] WARN - bob: Session expired due to inactivity
[2025-03-11 20:58:00.398] INFO - frank: Payment transaction completed
[2025-03-11 20:58:00.396] WARN - alice: Server response time exceeded threshold
[2025-03-11 20:58:00.393] ERROR - dave: User logged out
[2025-03-11 20:58:00.390] WARN - alice: Server response time exceeded threshold
[2025-03-11 20:58:00.387] ERROR - eve: Access denied for unauthorized user
[2025-03-11 20:58:00.384] DEBUG - bob: File uploaded successfully
[2025-03-11 20:58:00.381] WARN - dave: File uploaded successfully
[2025-03-11 20:58:00.379] DEBUG - bob: User logged in successfully
[2025-03-11 20:58:00.376] WARN - frank: Failed to connect to database
[2025-03-11 20:58:00.373] WARN - bob: Failed to connect to database
[2025-03-11 20:58:00.370] DEBUG - bob: Failed to connect to database
```

#### ec2-35-85-38-21.us-west-2.compute.amazonaws.com Server

'/var/log/large_log.log' 1.1G

#### Sample log:

```bash
[2025-03-11 20:59:59.684] ERROR - alice: Session expired due to inactivity
[2025-03-11 20:59:59.680] DEBUG - eve: User logged out
[2025-03-11 20:59:59.678] ERROR - eve: Invalid input detected
[2025-03-11 20:59:59.674] ERROR - alice: Payment transaction completed
[2025-03-11 20:59:59.669] DEBUG - dave: Session expired due to inactivity
[2025-03-11 20:59:59.665] WARN - alice: File uploaded successfully
[2025-03-11 20:59:59.662] DEBUG - frank: Access denied for unauthorized user
[2025-03-11 20:59:59.659] INFO - bob: Payment transaction completed
[2025-03-11 20:59:59.656] ERROR - bob: Session expired due to inactivity
[2025-03-11 20:59:59.653] ERROR - bob: Invalid input detected
[2025-03-11 20:59:59.649] WARN - eve: Session expired due to inactivity
[2025-03-11 20:59:59.646] ERROR - alice: Session expired due to inactivity
[2025-03-11 20:59:59.642] WARN - alice: Server response time exceeded threshold
[2025-03-11 20:59:59.639] WARN - eve: Resource not found
[2025-03-11 20:59:59.635] DEBUG - frank: User logged out
[2025-03-11 20:59:59.632] INFO - frank: Failed to connect to database
[2025-03-11 20:59:59.630] ERROR - alice: Session expired due to inactivity
```