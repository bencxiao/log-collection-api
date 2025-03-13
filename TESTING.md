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

#### Log File Validation
- Valid cases:
  - Simple filenames (test.log)
  - Files with underscores/hyphens
  - Empty string (defaults to 'large_log.log')
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