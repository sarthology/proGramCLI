const { app, BrowserWindow } = require('electron');
const path = require('path');

const main = path.join(__dirname, '..', 'main', 'index.html');

function createWindow() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.loadFile(main);
}

app.on('ready', createWindow);
