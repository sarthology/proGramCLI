const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const dir = path.resolve(__dirname, '..', '..', 'program');
const homedir = os.homedir();
const outputDir = path.resolve(homedir, 'program');

fs.copySync(dir, outputDir);
