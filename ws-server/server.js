#!/usr/bin/env node

const WebSocket = require('ws');
const urlParser = require('url');
const setupWSConnection = require('./utils.js').setupWSConnection;
const jwt = require('jsonwebtoken');

const documentController = require('../controllers/shareController');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', setupWSConnection);

const serverHandleUpgrade = (request, socket, head) => {
	const handleAuth = async (ws) => {
		try {
			let url = request.url;
			url = url.split("/")[2];
			let urlparsed = urlParser.parse(url, true);
			let token = urlparsed.query.auth;
			if (token == undefined) {
				throw(new Error("Auth failed"));
			}
			// check if user token is valid
			let tokenResult = await jwt.verify(token, process.env.JWT_SECRET);

			// check if document is shared
			let room = url.split('?')[0].split(":");
			let userid = room[0], noteid = room[1];
			let document = await documentController.getSharedDoc(userid, noteid);
			if (document == false) {
				throw(new Error("Document not shared"));
			}
		}
		catch (error) {
			console.log(error);
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		wss.emit('connection', ws, request);
	}
	wss.handleUpgrade(request, socket, head, handleAuth);
}

module.exports.handleUpgrade = serverHandleUpgrade;
