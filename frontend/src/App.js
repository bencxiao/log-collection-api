import React, { useState } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    logFile: 'large_log.log',
    keyWord: '',
    lines: 100
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lines') {
      const numValue = parseInt(value);
      if (numValue < 1) return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (formData.logFile) params.append('logFile', formData.logFile);
      if (formData.keyWord) params.append('keyWord', formData.keyWord);
      if (formData.lines) params.append('lines', formData.lines);

      console.log(`fetching logs with params: ${params.toString()}`);
      const response = await fetch(`/logs/collect?${params.toString()}`);
      const data = await response.json();

      console.log(`response: ${JSON.stringify(data)}`);
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch logs');
      }

      setLogs(data.results || []);
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Log Collection Dashboard</h1>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="control-panel">
          <div className="form-group">
            <label htmlFor="logFile">Log File:</label>
            <input
              type="text"
              id="logFile"
              name="logFile"
              value={formData.logFile}
              onChange={handleInputChange}
              placeholder="Enter log file path, subdirectories are allowed"
            />
          </div>

          <div className="form-group">
            <label htmlFor="keyWord">Keyword Filter:</label>
            <input
              type="text"
              id="keyWord"
              name="keyWord"
              value={formData.keyWord}
              onChange={handleInputChange}
              placeholder="Enter keyword to filter, length needs to be between 2 to 100"
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lines">Number of Lines:</label>
            <input
              type="number"
              id="lines"
              name="lines"
              value={formData.lines}
              onChange={handleInputChange}
              min="1"
              max="1000"
            />
          </div>

          <button 
            type="submit" 
            className="fetch-button"
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Fetch Logs'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div className="logs-container">
          {logs.map((serverLog, index) => (
            <div 
              key={serverLog.instance || index} 
              className={`server-log ${serverLog.success && serverLog.error === '' ? 'success' : 'failure'}`}
            >
              <h3>{serverLog.instance}</h3>
              {serverLog.success && serverLog.error === '' ? (
                <pre>{serverLog.logs}</pre>
              ) : (
                <div className="error-details">
                  <p>Error: {serverLog.error}</p>
                  {serverLog.details && <p>Details: {serverLog.details}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App; 
