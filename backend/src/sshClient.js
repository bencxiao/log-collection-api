const { Client } = require('ssh2');

class SSHClient {
  constructor(config) {
    this.client = new Client();
    this.config = config;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client
        .on('ready', () => {
          console.log('SSH Connection established');
          resolve();
        })
        .on('error', (err) => {
          console.error('SSH Connection error:', err);
          reject(err);
        })
        .connect(this.config);
    });
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let output = '';
        let errorOutput = '';

        // Both data retrieved and stderr from the command are collected as success results
        stream
          .on('data', (data) => {
            output += data.toString();
          })
          .stderr.on('data', (data) => {
            errorOutput += data.toString();
          })
          .on('close', (code) => {
            resolve({
              code,
              output,
              errorOutput
            });
          });
      });
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      this.client.end();
      this.client.on('end', () => {
        console.log('SSH Connection closed');
        resolve();
      });
    });
  }
}

module.exports = SSHClient; 