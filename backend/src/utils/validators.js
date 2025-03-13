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
    const validFileNameRegex = /^[a-zA-Z0-9_ .-]{0,255}$/;

    if (logFile === '') {
      return {
        isValid: true,
        value: 'large_log.log'
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
    return {
      isValid: true,
      value: logFile || 'large_log.log' // Default value if logFile is empty
    };
  }

  static validateKeyword(keyword) {
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