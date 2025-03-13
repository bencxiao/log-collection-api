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
    const { logFile = 'large_log.log', keyWord, lines = 100 } = req.query;
    
    // Validate lines parameter
    const lineValidation = LogParameterValidator.validateLines(lines);
    if (!lineValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: lineValidation.error.message,
        details: lineValidation.error.details
      });
    }

    // Validate logFile parameter
    const logFileValidation = LogParameterValidator.validateLogFile(logFile);
    if (!logFileValidation.isValid) {
      return res.status(400).json({
        success: false, 
        error: logFileValidation.error.message,
        details: logFileValidation.error.details
      });
    }

    // Validate keyWord parameter
    const keyWordValidation = LogParameterValidator.validateKeyword(keyWord);
    if (!keyWordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: keyWordValidation.error.message, 
        details: keyWordValidation.error.details
      });
    }

    // Create SSH clients for each server
    const clients = sshConfig.map(config => new SSHClient(config));

    // Construct the command with all the parameters, logFile, keyWord and lines
    let command = `sudo `;
    if (keyWordValidation.value !== '') {
      // If keyWord is provided, use grep to filter the logs
        command += `grep -i "${keyWordValidation.value}" "/var/log/${logFileValidation.value}" | tail -n ${lineValidation.value} | tac`;
    } else {
        // If no keyWord is provided, use tail to get the last n lines of the log file
        command += `tail -n ${lineValidation.value} "/var/log/${logFileValidation.value}" | tac`;
    }

    console.log('Executing command:', command);
    try {
      // Execute command on all servers
      const results = await Promise.all(
        clients.map(async (client, index) => {
          try {
            await client.connect();
            const result = await client.executeCommand(command);
            const success = result.errorOutput === '';
            return {
              instance: sshConfig[index].host,
              success: success,
              logs: result.output,
              error: result.errorOutput,
              details: null
            };
          } catch (error) {
            return {
              instance: sshConfig[index].host,
              success: false,
              logs: null,
              error: error.message,
              details: error.details
            };
          }
        })
      );

      // Check if any server was successful
      const anySuccess = results.some(result => result.success);

      res.status(anySuccess ? 200 : 500).json({
        success: anySuccess,
        logFile,
        keyWord: keyWord || null,
        lines: lineValidation.value,
        results: results
      });
    } catch (error) {
      console.error('Error collecting logs:', error);
      // Handle any errors
      res.status(500).json({
        success: false,
        error: error.message,
        details: error.details
      });
    } finally {
        // Disconnect all clients
      await Promise.all(
        clients.map(client => 
          client.disconnect().catch(err => console.error('Disconnect error:', err))
        )
      );
    }
  });

  return app;
}

// Only start the server if this file is run directly, not imported, it will not run in tests
if (require.main === module) {
  const app = express();
  const port = process.env.PORT || 3000;
  
  configureApp(app);
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = configureApp; 