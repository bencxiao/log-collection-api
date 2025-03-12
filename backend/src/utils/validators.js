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
    }
    return {
      isValid: true,
      value: numLines
    };
  }

  static validateLogFile(logFile) {
    const validFileNameRegex = /^(?!.*[\/\0])[\s\S]{1,255}$/;

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
      value: logFile || 'large_log.log'
    };
  }

  static validateKeyword(keyword) {
    const validKeywordRegex = /^[a-zA-Z0-9]+$/;

    if (!validKeywordRegex.test(keyword)) {
      return {
        isValid: false,
        error: {
          message: 'Keyword parameter is invalid',
          details: 'Keyword must be a valid text string'
        }
      };
    } 
    return {
      isValid: true,
      value: keyword || 'error'
    };
  }
}

module.exports = LogParameterValidator; 