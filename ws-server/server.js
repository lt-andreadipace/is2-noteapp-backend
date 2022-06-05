#!/usr/bin/env node

const WebSocket = require('ws');
const urlParser = require('url');
const setupWSConnection = require('./utils.js').setupWSConnection; 

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', setupWSConnection);

const serverHandleUpgrade = (request, socket, head) => {
  const handleAuth = ws => {
    try {
      let url = request.url;
      let urlparsed = urlParser.parse(url, true);
      let auth = urlparsed.query.auth;
      let roomName = url.slice(1).split('?')[0];
      if (auth == undefined) {
        throw(new Error("Auth failed"));
      }
      //TODO: check user jwt
      //TODO: check if document is valid
    }
    catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.emit('connection', ws, request);
  }
  
  wss.handleUpgrade(request, socket, head, handleAuth);
}

module.exports.handleUpgrade = serverHandleUpgrade;
