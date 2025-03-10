const fs = require('fs');
const path = require('path');

const sshConfig = {
  host: 'ec2-52-89-14-166.us-west-2.compute.amazonaws.com', 
  port: 22,
  username: 'ec2-user',  
  privateKey: fs.readFileSync(path.join(__dirname, '../../ec2-key.pem')),
  readyTimeout: 5000,
};

module.exports = sshConfig; 