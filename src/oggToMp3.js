import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
ffmpeg.setFfmpegPath(installer.path);

export function toMp3(input, output) {
	try {
		const outputPath = resolve(dirname(input), `${output}.mp3`);
		return new Promise((resolve, reject) => {
			ffmpeg(input)
				.inputOption('-t 30')
				.output(outputPath)
				.on('end', () => {
					removeFile(input);
					resolve(outputPath);
				})
				.on('error', (err) => reject(err.message))
				.run();
		});
	} catch (e) {
		console.log('Error toMp3', e.message);
	}
}

export async function create(url, fileName) {
	try {
		const oggPath = resolve(__dirname, '../voices', `${fileName}.ogg`);
		const response = await axios({
			method: 'get',
			url,
			responseType: 'stream',
		});

		return new Promise((resolve) => {
			const stream = createWriteStream(oggPath);
			response.data.pipe(stream);
			stream.on('finish', () => resolve(oggPath));
		});
	} catch (e) {
		console.log('Error ogg create', e.message);
	}
}