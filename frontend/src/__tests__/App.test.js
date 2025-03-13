import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('renders log collection form', () => {
    render(<App />);
    
    expect(screen.getByText('Log Collection Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText(/Log File:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Keyword Filter:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Lines:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fetch Logs/i })).toBeInTheDocument();
  });

  test('shows default values in form fields', () => {
    render(<App />);
    
    const logFileInput = screen.getByLabelText(/Log File:/i);
    const keywordInput = screen.getByLabelText(/Keyword Filter:/i);
    const linesInput = screen.getByLabelText(/Number of Lines:/i);

    // Check for default values displayed in the input fields
    expect(logFileInput.value).toBe('large_log.log');
    expect(keywordInput.value).toBe('');
    expect(linesInput.value).toBe('100');
  });

  test('handles user input correctly', async () => {
    render(<App />);
    
    const logFileInput = screen.getByLabelText(/Log File:/i);
    const keywordInput = screen.getByLabelText(/Keyword Filter:/i);
    const linesInput = screen.getByLabelText(/Number of Lines:/i);

    await userEvent.clear(logFileInput);
    await userEvent.type(logFileInput, 'test.log');
    await userEvent.clear(keywordInput);
    await userEvent.type(keywordInput, 'error');
    await userEvent.clear(linesInput);
    await userEvent.type(linesInput, '50');

    expect(logFileInput.value).toBe('test.log');
    expect(keywordInput.value).toBe('error');
    expect(linesInput.value).toBe('50');
  });

  test('displays successful log results', async () => {
    const mockResponse = {
      success: true,
      logFile: 'test.log',
      lines: 50,
      results: [
        {
          instance: 'server1',
          success: true,
          logs: 'Log line 1\nLog line 2',
          error: '',
          details: null
        }
      ]
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(<App />);
    
    const fetchButton = screen.getByRole('button', { name: /Fetch Logs/i });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/server1/)).toBeInTheDocument();
      expect(screen.getByText(/Log line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Log line 2/)).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    const errorMessage = 'Failed to fetch logs';
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: errorMessage
        })
      })
    );

    render(<App />);
    
    const fetchButton = screen.getByRole('button', { name: /Fetch Logs/i });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test('displays partial server failures correctly', async () => {
    const mockResponse = {
      success: true,
      logFile: 'test.log',
      lines: 50,
      results: [
        {
          instance: 'server1',
          success: true,
          logs: 'Success log',
          error: '',
          details: null
        },
        {
          instance: 'server2',
          success: false,
          logs: null,
          error: 'Connection failed',
          details: 'Timeout'
        }
      ]
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(<App />);
    
    const fetchButton = screen.getByRole('button', { name: /Fetch Logs/i });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('server1')).toBeInTheDocument();
      expect(screen.getByText('Success log')).toBeInTheDocument();
      
      expect(screen.getByText('server2')).toBeInTheDocument();
      expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
      expect(screen.getByText('Details: Timeout')).toBeInTheDocument();
    });
  });
}); 