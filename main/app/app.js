'use strict';

//Dependencies
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const rawdata = fs.readFileSync(
	path.resolve(__dirname, './assets/data/filters.json')
);
const filters = JSON.parse(rawdata);

const readFileSync = require('./util/readFileSync');

//Views
const editor = readFileSync(path.resolve(__dirname, './views/editor.hbs'));

window.onload = event => {
	const template = handlebars.compile(editor, { strict: true });
	const result = template({ filters: filters });
	document.getElementById('view').innerHTML = result;
};

const changeFilter = selectedFilter => {
	let canvas = document.getElementById('canvas');
	canvas.classList = '';
	canvas.classList.add(selectedFilter);
};
