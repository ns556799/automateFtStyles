const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function readFiles(dir, processFile) {
	// read directory
	fs.readdir(dir, (error, fileNames) => {
		if (error) throw error;

		fileNames.forEach((filename) => {
			// get current file name
			const name = path.parse(filename).name;
			// get current file extension
			const ext = path.parse(filename).ext;
			// get current file path
			const filepath = path.resolve(dir, filename);

			// get information about the file
			fs.stat(filepath, function (error, stat) {
				if (error) throw error;

				// check if the current path is a file or a folder
				const isFile = stat.isFile();

				// exclude folders
				if (isFile && ext === '.html') {
					try {
						console.log(filepath);
						const editPromise = new Promise((resolve, reject) => {
							let data = fs.readFileSync(filepath, 'utf8');

							// Replace base tag
							if (data.includes('https://ft-bc-cms.herokuapp.com/')) {
								data = data.replace('https://ft-bc-cms.herokuapp.com/', '');
							}

							// Replace CSS
							if (
								data.includes(
									'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-header@^8.0.2,o-fonts@^4.0.2,o-fonts-assets@^1.4.0,o-footer@^7.0.2,o-cookie-message@^5.0.5, o-grid@^5.2.7, o-typography@^6.4.4'
								)
							) {
								data = data.replace(
									'https://www.ft.com/__origami/service/build/v2/bundles/css?modules=o-header@^8.0.2,o-fonts@^4.0.2,o-fonts-assets@^1.4.0,o-footer@^7.0.2,o-cookie-message@^5.0.5, o-grid@^5.2.7, o-typography@^6.4.4',
									'https://ft.com/partnercontent/cms/ftStyle.css'
								);
							}

							// Replace JS
							if (
								data.includes(
									'https://www.ft.com/__origami/service/build/v2/bundles/js?modules=o-grid@^4.3.3,o-header@^7.2.9,o-footer@^6.0.2,o-typography@^5.1.1,o-colors@^4.1.1,o-tooltip@^3.1.1,o-tracking,o-viewport,o-fonts@^3.0.1,o-video@^4.1.2,o-share@^6.0.1,o-toggle@^1.1.10,o-cookie-message@^4.7.3'
								)
							) {
								data = data.replace(
									'https://www.ft.com/__origami/service/build/v2/bundles/js?modules=o-grid@^4.3.3,o-header@^7.2.9,o-footer@^6.0.2,o-typography@^5.1.1,o-colors@^4.1.1,o-tooltip@^3.1.1,o-tracking,o-viewport,o-fonts@^3.0.1,o-video@^4.1.2,o-share@^6.0.1,o-toggle@^1.1.10,o-cookie-message@^4.7.3',
									'https://ft.com/partnercontent/cms/ftStyle.js'
								);
							}

							const $ = cheerio.load(data);
							$('base').remove();
							$('.o-header__drawer').appendTo($('body'));
							return resolve($.html());
						});

						editPromise.then((d) => {
							fs.writeFile(filepath, d, 'utf-8', function (err, d) {
								if (err) throw err;
								console.log('Done!');
							});
						});
					} catch (err) {
						console.log(err);
					}
					// callback, do something with the file
					processFile(filepath, name, ext, stat);
				}
			});
		});
	});
}

readFiles(`./${process.argv[2]}`, (filepath, name, ext, stat) => {
	console.log('DONE');
});
