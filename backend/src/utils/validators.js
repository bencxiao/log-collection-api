const path = require("path");
const DEFAULT_LOG_DIR = '/var/log';

class LogParameterValidator {
  static validateLines(lines) {
    const numLines = parseInt(lines);
    if (isNaN(numLines) || numLines <= 0) {
      return {
        isValid: false,
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number'
        }
      };
    } else if (numLines > 1000) {
      return {
        isValid: false,
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number and less than 1000'
        }
      };
    }
    return {
      isValid: true,
      value: numLines
    };
  }

  static validateLogFile(logFile) {
    // Allowing for subdirectories path, max file name length is 255 characters
    const validFileNameRegex = /^(?:[a-zA-Z0-9_ .\-\/]+\/)*[a-zA-Z0-9_ .-]{0,255}$/;

    // Treating empty or space as a default value, fall back to large_log.log
    if (!logFile || logFile.trim() === '') {
      return {
        isValid: true,
        value: '/var/log/large_log.log'
      };
    }    
    
    if (!validFileNameRegex.test(logFile)) {
      return {
        isValid: false,
        error: {
          message: 'Log file parameter is invalid',
          details: 'Log file must be a valid file path'
        }
      };
    }

    // Check if the log file is within the default log directory /var/log
    const resolvedPath = path.posix.resolve(DEFAULT_LOG_DIR, logFile.trim());
    if (!resolvedPath.startsWith(DEFAULT_LOG_DIR)) {
      return {
        isValid: false,
        error: {
          message: 'Log file parameter is invalid',
          details: 'Resolved path is not within the default log directory'
        }
      };
    }

    return {
      isValid: true,
      value: resolvedPath
    };
  }

  static validateKeyword(keyword) {
    // Allowing for alphanumeric characters, spaces, and common punctuation (._-:), and be between 2 and 100 characters
    const validKeywordRegex = /^[a-zA-Z0-9_\- .:]{2,100}$/;
    if (!keyword || keyword.trim() === '') {
      return {
        isValid: true,
        value: ''
      };
    }

    const trimmedKeyword = keyword.trim();

    if (!validKeywordRegex.test(trimmedKeyword)) {
      return {
        isValid: false,
        error: {
          message: 'Keyword parameter is invalid',
          details: 'Keyword must contain only alphanumeric characters, spaces, and common punctuation (._-:), and be between 1 and 100 characters'
        }
      };
    } 
    return {
      isValid: true,
      value: trimmedKeyword
    };
  }
}

module.exports = LogParameterValidator; 