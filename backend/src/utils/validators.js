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
}

module.exports = LogParameterValidator; 