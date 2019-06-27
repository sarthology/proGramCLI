#!/usr/bin/env node

const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const serverPath = path.join(__dirname, '../main/main.js');
const currentWorkingDir = path.resolve('./');
const homedir = os.homedir();
const config = path.resolve(homedir, '.programrc.json');

if (!fs.existsSync(config)) {
	fs.writeFileSync(
		config,
		JSON.stringify({
			programPath: currentWorkingDir
		})
	);
}

const args = [serverPath]
	.concat([].concat(process.argv).splice(2))
	.concat('--not-packaged=true');

const proc = spawn(electron, args, { stdio: 'inherit' });
proc.on('close', code => {
	process.exit(code);
});
