const LogParameterValidator = require('../utils/validators');

describe('LogParameterValidator', () => {
  describe('validateLines', () => {
    it('should validate valid line numbers', () => {
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

    it('should handle zero line numbers', () => {
      const result = LogParameterValidator.validateLines('0');
      expect(result).toEqual({
        isValid: false,
        error: {
          message: 'Invalid lines parameter',
          details: 'Lines must be a positive integer number'
        }
      });
    });

    it('should handle decimal line numbers', () => {
      const result = LogParameterValidator.validateLines('10.5');
      expect(result).toEqual({
        isValid: true,
        value: 10  // parseInt truncates decimals
      });
    });
  });
}); 