const { app, BrowserWindow } = require('electron');
const path = require('path');

const main = path.join(__dirname, '..', 'main', 'app/index.html');

function createWindow() {
	let win = new BrowserWindow({
		title: 'Parista',
		width: 400,
		height: 700,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.loadFile(main);
}

app.on('ready', createWindow);
