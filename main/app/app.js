'use strict';

//Dependencies
const handlebars = require('handlebars');
const Croppie = require('croppie');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

let instaImage = null;
let viewport;
//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));
const adjust = readFileSync(path.resolve(__dirname, './views/adjust.hbs'));
const profile = readFileSync(path.resolve(__dirname, './views/profile.hbs'));
const onboarding = readFileSync(
	path.resolve(__dirname, './views/onboarding.hbs')
);

window.onload = event => {
	changeView(onboarding);
};

ipcRenderer.on('imgAdded', (event, arg) => {
	instaImage = arg;
	changeView(adjust);
});

const changeFilter = selectedFilter => {
	let canvas = document.getElementById('canvas');
	canvas.classList = '';
	canvas.classList.add(selectedFilter);
};

const saveProfile = () => {
	changeView(uploader);
};

const showProfile = () => {
	changeView(profile);
};

const imgUpload = () => {
	ipcRenderer.send('getImage');
};

const addFilters = () => {
	document.getElementById('view').removeAttribute('class');
	viewport.result({ type: 'base64', size: 'original' }).then(newImage => {
		instaImage = newImage;
		changeView(editor);
	});
};
const goBackTo = page => {
	document.getElementById('view').removeAttribute('class');
	page === 'adjust' ? changeView(adjust) : changeView(uploader);
};
const changeView = view => {
	const template = handlebars.compile(view, { strict: true });
	const result = template({ filters: filters, instaImage: instaImage });
	document.getElementById('view').innerHTML = result;

	if (view === adjust) cropImage(instaImage);
};

const cropImage = () => {
	document.getElementById('view').setAttribute('class', 'darkBackground');
	viewport = new Croppie(document.getElementById('adjustImg'), {
		url: instaImage,
		showZoomer: false,
		enableOrientation: true,
		viewport: {
			width: 300,
			height: 300
		}
	});
};
const rotateImage = () => {
	viewport.rotate(90);
};
