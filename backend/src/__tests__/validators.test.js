const LogParameterValidator = require('../utils/validators');

describe('LogParameterValidator', () => {
  describe('validateLines', () => {
    test('should validate valid line numbers', () => {
      const result = LogParameterValidator.validateLines('100');
      expect(result).toEqual({
        isValid: true,
        value: 100
      });
    });

    it('should handle invalid line numbers', () => {
      const result = LogParameterValidator.validateLines('invalid');
      expect(result).toEqual({
        isValid: false,
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number'
        }
      });
    });

    it('should handle decimal number, truncate to integer', () => {
      const result = LogParameterValidator.validateLines('3.5');
      expect(result).toEqual({
        isValid: true,
        value: 3
      });
    });

    it('should handle negative line numbers', () => {
      const result = LogParameterValidator.validateLines('-10');
      expect(result).toEqual({
        isValid: false,
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number'
        }
      });
    });

    it('should handle line numbers greater than 1000', () => {
      const result = LogParameterValidator.validateLines('1001');
      expect(result).toEqual({
        isValid: false, 
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number and less than 1000'
        }
      });
    });
  });

  describe('validateLogFile', () => {
    test('should validate valid log file paths', () => {
      const validPaths = [
        'test.log',
        'application.log',
        'large_log.log',
        'large-log.log',
        'large log.log',
      ];

      validPaths.forEach(path => {
        const result = LogParameterValidator.validateLogFile(path);

        expect(result).toEqual({
          isValid: true,
          value: path
        });
      });
    });

    test('should use default log file when none provided', () => {
      const result = LogParameterValidator.validateLogFile('');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('large_log.log');
    });

    test('should reject invalid file names', () => {
      const invalidPaths = [
        '../test.log', // Path traversal
        '/root/test.log', // Absolute path
        'test\0.log', // Null byte
        'a'.repeat(256) + '.log', // Too long
        '; rm -rf *', // Command injection
        'log*.log' // wildcard
      ];

      invalidPaths.forEach(path => {
        const result = LogParameterValidator.validateLogFile(path);

        expect(result).toEqual({
          isValid: false,
          error: {
            message: 'Log file parameter is invalid',
            details: 'Log file must be a valid file path'
          }
        });
      });
    });
  });

  describe('validateKeyword', () => {
    test('should validate valid keywords', () => {
      const validKeywords = [
        'error', // Valid keyword
        'TEST', // Valid keyword
        'test-123', // Valid keyword with hyphen
        '2025-03-11 20:59:59.662', // Valid keyword with date and time,
        '  2025-03-11 20:59:59.662  ' // Valid keyword with date and time, only trim front and back whitespace
      ];

      validKeywords.forEach(keyword => {
        const result = LogParameterValidator.validateKeyword(keyword);
        expect(result).toEqual({
          isValid: true,
          value: keyword.trim()
        });

        console.log(result);
      });
    });

    test('should handle empty or undefined keywords', () => {
      const emptyKeywords = [
        '',
        null,
        undefined
      ];

      emptyKeywords.forEach(keyword => {
        const result = LogParameterValidator.validateKeyword(keyword);
        expect(result).toEqual({
          isValid: true,
          value: ''
        });
      });
    });

    test('should reject invalid keywords', () => {
      const invalidKeywords = [
        '1', // Too short
        'a'.repeat(101), // Too long
        'error!', // Special characters
        'error; rm -rf * ', // Special characters and command injection
        'error && rm -rf *' // Special characters and command injection
      ];

      invalidKeywords.forEach(keyword => {
        const result = LogParameterValidator.validateKeyword(keyword);
        expect(result).toEqual({
          isValid: false,
          error: {
            message: 'Keyword parameter is invalid',
            details: 'Keyword must contain only alphanumeric characters, spaces, and common punctuation (._-:), and be between 1 and 100 characters'
          }
        });
      });
    });
  });
}); 