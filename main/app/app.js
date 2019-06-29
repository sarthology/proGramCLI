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
let viewport, profileAdjust;
//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));
const adjust = readFileSync(path.resolve(__dirname, './views/adjust.hbs'));
const onboarding = readFileSync(
	path.resolve(__dirname, './views/onboarding.hbs')
);
const initialize = readFileSync(
	path.resolve(__dirname, './views/initialize.hbs')
);

window.onload = event => {
	changeView(onboarding);
};

ipcRenderer.on('imgAdded', (event, arg) => {
	instaImage = arg;
	changeView(adjust);
});

ipcRenderer.on('profileAdded', (event, arg) => {
	document.getElementsByClassName('upload')[0].style = 'display:none';
	document.getElementById('adjustProfile').style = 'display:block';
	profileAdjust = new Croppie(document.getElementById('adjustProfile'), {
		url: arg,
		enableOrientation: true,
		viewport: {
			width: 150,
			height: 150,
			type: 'circle'
		}
	});
});

const changeFilter = selectedFilter => {
	let canvas = document.getElementById('canvas');
	canvas.classList = '';
	canvas.classList.add(selectedFilter);
};

const saveProfile = () => {
	profileAdjust.result({ type: 'base64', size: 'original' }).then(newImage => {
		let profileImage = newImage;
		console.log(profileImage);
		changeView(uploader);
	});
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

const uploadProfile = () => {
	ipcRenderer.send('uploadProfile');
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
