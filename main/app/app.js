'use strict';

//Dependencies
const handlebars = require('handlebars');
const Croppie = require('croppie');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

let instaImage = null;
let viewport, profileAdjust;
let filter = null;
let isProfile = false;
let isFeed = false;

//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));
const adjust = readFileSync(path.resolve(__dirname, './views/adjust.hbs'));
const onboarding = readFileSync(
	path.resolve(__dirname, './views/onboarding.hbs')
);
const generate = readFileSync(path.resolve(__dirname, './views/generate.hbs'));
const initialize = readFileSync(
	path.resolve(__dirname, './views/initialize.hbs')
);

// path to userprofile and feed
const outputDir = path.resolve(__dirname, '..', '..', 'output');
const userFile = path.resolve(outputDir, 'profile.json');
const feedFile = path.resolve(outputDir, 'feed.json');
const imagesDir = path.resolve(outputDir, 'assets', 'images');

if (!fs.existsSync(outputDir)) mkdirp.sync(imagesDir);

if (fs.existsSync(userFile)) isProfile = true;
if (fs.existsSync(feedFile)) isFeed = true;

// parse existing feed if it exists else initialize it to empty array
const feedData = isFeed ? JSON.parse(fs.readFileSync(feedFile)) : [];
const currentPost = {};

window.onload = event => {
	// if profile already exists then allow user to directly add images
	isProfile ? changeView(uploader) : changeView(initialize);
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
	filter = selectedFilter;

	// save currentPost filter
	currentPost.filter = selectedFilter;
};

const saveProfile = () => {
	profileAdjust.result({ type: 'base64', size: 'original' }).then(newImage => {
		let profileImage = newImage;

		const name = document.getElementById('name').value;
		const bio = document.getElementById('bio').value;

		const imagePath = path.resolve(imagesDir, name + '.png');
		const imageDataURI = newImage.replace(/^data:image\/png;base64,/, '');
		fs.writeFileSync(imagePath, imageDataURI, 'base64');

		const profile = {
			name,
			bio,
			profilePic: imagePath
		};

		fs.writeFileSync(userFile, JSON.stringify(profile, null, 4));

		changeView(uploader);
	});
};

const showProfile = () => {
	// generate random name/id for cropped image
	const seed = crypto.randomBytes(20);

	const uniqueName = crypto
		.createHash('sha1')
		.update(seed)
		.digest('hex');

	const imagePath = path.resolve(imagesDir, uniqueName + '.png');

	// save the cropped image
	const imageDataURI = instaImage.replace(/^data:image\/png;base64,/, '');
	fs.writeFileSync(imagePath, imageDataURI, 'base64');

	currentPost.imagePath = imagePath;

	currentPost.date = new Date();
	feedData.push(currentPost);

	fs.writeFileSync(feedFile, JSON.stringify(feedData));

	changeView(generate);
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

const onboardMe = () => {
	changeView(onboarding);
};
const goBackTo = page => {
	document.getElementById('view').removeAttribute('class');
	page === 'adjust' ? changeView(adjust) : changeView(uploader);
};

const changeView = view => {
	const template = handlebars.compile(view, { strict: true });
	const result = template({
		filters: filters,
		instaImage: instaImage,
		filter: filter
	});

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
