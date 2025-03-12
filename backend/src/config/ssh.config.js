const fs = require('fs');
const path = require('path');

const sshConfig = [{
  host: 'ec2-35-85-38-21.us-west-2.compute.amazonaws.com', 
  port: 22,
  username: 'ec2-user',  
  privateKey: fs.readFileSync(path.join(__dirname, '../../ec2-key.pem')),
  readyTimeout: 5000,
},
{
  host: 'ec2-54-191-0-147.us-west-2.compute.amazonaws.com', 
  port: 22,
  username: 'ec2-user',  
  privateKey: fs.readFileSync(path.join(__dirname, '../../ec2-key.pem')),
  readyTimeout: 5000,
}];

module.exports = sshConfig; 