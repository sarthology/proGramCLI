const { app, BrowserWindow } = require('electron');
const path = require('path');

const main = path.join(__dirname, '..', 'main', 'app/index.html');

function createWindow() {
	let win = new BrowserWindow({
		width: 400,
		height: 800,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.loadFile(main);
}

app.on('ready', createWindow);
