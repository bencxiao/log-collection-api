const express = require('express');
const SSHClient = require('./sshClient');
const sshConfig = require('./config/ssh.config');

function configureApp(app) {
  app.use(express.json());

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Log collection endpoint
  app.get('/logs/collect', async (req, res) => {
    const { logFile = '/var/log' } = req.query;

    const sshClient = new SSHClient();
    
    try {
      // Connect to the remote server using config
      console.log('Connecting to EC2 instance...');
      await sshClient.connect(sshConfig);
      console.log('Successfully connected to EC2');

      // Execute command to read logs
      const command = `sudo tail -n 1000 ${logFile}`;
      const result = await sshClient.executeCommand(command);
      
      // Disconnect after command execution
      await sshClient.disconnect();

      // Return the results
      res.json({
        success: true,
        logFile,
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
        details: 'Make sure your EC2 instance is running and the security group allows inbound SSH (port 22)'
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