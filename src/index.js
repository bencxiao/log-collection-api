const express = require('express');
const SSHClient = require('./sshClient');
const sshConfig = require('./config/ssh.config');
const LogParameterValidator = require('./utils/validators');

function configureApp(app) {
  app.use(express.json());

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Log collection endpoint
  app.get('/logs/collect', async (req, res) => {
    const { logFile = '/var/log/large_log.log', keyWord, lines = 100 } = req.query;
    
    // Validate lines parameter
    const lineValidation = LogParameterValidator.validateLines(lines);
    if (!lineValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: lineValidation.error.message,
        details: lineValidation.error.details
      });
    }

    const sshClient = new SSHClient();
    
    try {
      console.log('Connecting to EC2 instance...');
      await sshClient.connect(sshConfig);
      console.log('Successfully connected to EC2');

      // Build command to get logs
      let command;
      if (keyWord) {
        // Get all matching lines first, then take the last N lines
        command = `sudo cat ${logFile} | grep -i "${keyWord}" | tail -n ${lineValidation.value}`;
      } else {
        // Get all lines first, then take the last N lines
        command = `sudo cat ${logFile} | tail -n ${lineValidation.value}`;
      }

      const result = await sshClient.executeCommand(command);
      await sshClient.disconnect();

      res.json({
        success: true,
        logFile,
        keyWord: keyWord || null,
        lines: lineValidation.value,
        logs: result.output,
        error: result.errorOutput,
        instance: sshConfig.host
      });
    } catch (error) {
      console.error('Error collecting logs:', error);
      // Handle any errors
      res.status(500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
  });

  return app;
}

// Only start the server if this file is run directly
if (require.main === module) {
  const app = express();
  const port = process.env.PORT || 3000;
  
  configureApp(app);
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = configureApp; 