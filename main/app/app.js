'use strict';

//Dependencies
const handlebars = require('handlebars');
const Croppie = require('croppie');
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const os = require('os');

// utils
const generator = require('./util/generator');

const homedir = os.homedir();
const config = path.resolve(homedir, '.programrc.json');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

const currentPost = {};
let instaImage = null;
let viewport, profileAdjust;
let filter = null;
let outputDir;

//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));
const uploader = readFileSync(path.resolve(__dirname, './views/uploader.hbs'));
const adjust = readFileSync(path.resolve(__dirname, './views/adjust.hbs'));
const finish = readFileSync(path.resolve(__dirname, './views/finish.hbs'));
const settings = readFileSync(path.resolve(__dirname, './views/settings.hbs'));
const onboarding = readFileSync(
	path.resolve(__dirname, './views/onboarding.hbs')
);
const generate = readFileSync(path.resolve(__dirname, './views/generate.hbs'));
const initialize = readFileSync(
	path.resolve(__dirname, './views/initialize.hbs')
);

window.onload = event => {
	if (fs.existsSync(config)) {
		outputDir = JSON.parse(fs.readFileSync(config)).programPath;

		const profile = path.resolve(outputDir, 'data', 'profile.json');
		fs.existsSync(profile) ? changeView(uploader) : changeView(onboarding);
	} else {
		changeView(initialize);
	}
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

ipcRenderer.on('directoryAdded', (event, dir) => {
	outputDir = path.resolve(dir, 'program');

	const source = path.resolve(__dirname, '..', '..', 'program');

	fs.copySync(source, outputDir);

	if (!fs.existsSync(config)) {
		fs.writeFileSync(
			config,
			JSON.stringify({
				programPath: outputDir
			})
		);
	}
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

		console.log(outputDir);
		const dataDir = path.resolve(outputDir, 'data');
		const imageDir = path.resolve(outputDir, 'assets', 'images');

		const userFile = path.resolve(dataDir, 'profile.json');
		const imagePath = path.resolve(imageDir, name + '.png');

		const relativePath = path.relative(outputDir, imagePath);

		if (!fs.existsSync(dataDir)) fs.ensureDirSync(dataDir);
		if (!fs.existsSync(imageDir)) fs.ensureDirSync(imageDir);

		const imageDataURI = newImage.replace(/^data:image\/png;base64,/, '');
		fs.writeFileSync(imagePath, imageDataURI, 'base64');

		const userData = {
			name,
			bio,
			profilePic: relativePath
		};

		fs.writeFileSync(userFile, JSON.stringify(userData, null, 4));

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

	const imageDir = path.resolve(outputDir, 'assets', 'images');

	const imagePath = path.resolve(imageDir, uniqueName + '.png');
	const feedFile = path.resolve(outputDir, 'data', 'feed.json');

	// load existing feed if it exists
	const feedData = fs.existsSync(feedFile)
		? JSON.parse(fs.readFileSync(feedFile))
		: [];

	// save the cropped image
	const imageDataURI = instaImage.replace(/^data:image\/png;base64,/, '');
	fs.writeFileSync(imagePath, imageDataURI, 'base64');

	currentPost.imagePath = path.relative(outputDir, imagePath);

	currentPost.date = new Date();
	feedData.push(currentPost);

	fs.writeFileSync(feedFile, JSON.stringify(feedData));

	changeView(generate);
};

const generateIndex = () => {
	const feedFile = path.resolve(outputDir, 'data', 'feed.json');
	const profileFile = path.resolve(outputDir, 'data', 'profile.json');
	const index = path.resolve(outputDir, 'index.html');

	const feedData = fs.readFileSync(feedFile);
	const profileData = fs.readFileSync(profileFile);

	const feed = JSON.parse(feedData);
	const profile = JSON.parse(profileData);

	const html = generator(profile, feed);

	fs.writeFileSync(index, html);
	changeView(finish);
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
	ipcRenderer.send('getDirectory');
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

const addMore = () => changeView(uploader);

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
