'use strict';

//Dependencies
const handlebars = require('handlebars');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

let instaImage = null;
//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));

window.onload = event => {
	changeView(uploader);
};
ipcRenderer.on('imgAdded', (event, arg) => {
	instaImage = arg;
	changeView(editor);
});
const changeFilter = selectedFilter => {
	let canvas = document.getElementById('canvas');
	canvas.classList = '';
	canvas.classList.add(selectedFilter);
};

const imgUpload = () => {
	ipcRenderer.send('getImage');
};

const changeView = view => {
	const template = handlebars.compile(view, { strict: true });
	const result = template({ filters: filters, instaImage: instaImage });
	document.getElementById('view').innerHTML = result;
};
