'use strict';

//Dependencies
const handlebars = require('handlebars');
const Croppie = require('croppie');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

let instaImage = null;
let viewport;
let isProfile = false;
let isFeed = false;

//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));
const adjust = readFileSync(path.resolve(__dirname, './views/adjust.hbs'));
const profile = readFileSync(path.resolve(__dirname, './views/profile.hbs'));
const onboarding = readFileSync(
	path.resolve(__dirname, './views/onboarding.hbs')
);

// path to userprofile and feed
const outputDir = path.resolve(__dirname, '..', '..', 'output');
const userFile = path.resolve(outputDir, 'profile.json');
const feedFile = path.resolve(outputDir, 'feed.json');
const imagesDir = path.resolve(outputDir, 'assets', 'images');

if (fs.existsSync(userFile)) isProfile = true;
if (fs.existsSync(feedFile)) isFeed = true;

// parse existing feed if it exists else initialize it to empty array
const feedData = isFeed ? JSON.parse(fs.readFileSync(feedFile)) : [];
const currentPost = {};

window.onload = event => {
	// if profile already exists then allow user to directly add images
	isProfile ? changeView(uploader) : changeView(onboarding);
};

ipcRenderer.on('imgAdded', (event, arg) => {
	instaImage = arg;
	changeView(adjust);
});

const changeFilter = selectedFilter => {
	let canvas = document.getElementById('canvas');
	canvas.classList = '';
	canvas.classList.add(selectedFilter);

	// save currentPost filter
	currentPost.filter = selectedFilter;
};

const saveProfile = () => {
	const name = document.getElementById('name').value;
	const bio = document.getElementById('bio').value;

	const profile = {
		name,
		bio
	};

	fs.writeFileSync(userFile, JSON.stringify(profile, null, 4));

	changeView(uploader);
};

const showProfile = () => {
	currentPost.date = new Date();
	feedData.push(currentPost);

	fs.writeFileSync(feedFile, JSON.stringify(feedData));

	changeView(profile);
};

const imgUpload = () => {
	ipcRenderer.send('getImage');
};

const addFilters = () => {
	document.getElementById('view').removeAttribute('class');
	viewport.result({ type: 'base64', size: 'original' }).then(newImage => {
		// generate random name/id for cropped image
		const seed = crypto.randomBytes(20);

		const uniqueName = crypto
			.createHash('sha1')
			.update(seed)
			.digest('hex');

		const imagePath = path.resolve(imagesDir, uniqueName + '.png');

		// save the cropped image
		const imageDataURI = newImage.replace(/^data:image\/png;base64,/, '');
		fs.writeFileSync(imagePath, imageDataURI, 'base64');

		currentPost.imagePath = imagePath;

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
