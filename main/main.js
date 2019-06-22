const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const main = path.join(__dirname, '..', 'main', 'app/index.html');
let win;
function createWindow() {
	win = new BrowserWindow({
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
ipcMain.on('getImage', (event, arg) => {
	dialog.showOpenDialog({ properties: ['openFile'] }, filePaths => {
		win.webContents.send('imgAdded', filePaths[0]);
	});
});
app.on('ready', createWindow);
