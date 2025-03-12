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
  });

  describe('validateLogFile', () => {
    test('should validate valid log file paths', () => {
      const validPaths = [
        'test.log',
        'application.log',
        'large_log.log'
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
        'a'.repeat(256) + '.log' // Too long
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
        'error',
        'warning',
        'debug123',
        'TEST'
      ];

      validKeywords.forEach(keyword => {
        const result = LogParameterValidator.validateKeyword(keyword);
        expect(result).toEqual({
          isValid: true,
          value: keyword
        });
      });
    });

    test('should use default keyword when none provided', () => {
      const result = LogParameterValidator.validateKeyword('');
      expect(result).toEqual({
        isValid: false,
        error: {
          message: 'Keyword parameter is invalid',
          details: 'Keyword must be a valid text string'
        }
      });
    });

    test('should reject invalid keywords', () => {
      const invalidKeywords = [
        'error!',
        'error@',
        'error 123',
        'error\n'
      ];

      invalidKeywords.forEach(keyword => {
        const result = LogParameterValidator.validateKeyword(keyword);
        expect(result).toEqual({
          isValid: false,
          error: {
            message: 'Keyword parameter is invalid',
            details: 'Keyword must be a valid text string'
          }
        });
      });
    });
  });
}); 