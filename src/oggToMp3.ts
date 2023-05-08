import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { removeFile } from './utils';

ffmpeg.setFfmpegPath(installer.path);

export function toMp3(input: string, output: string) {
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
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log('Error toMp3', e.message);
		} else {
			console.log('Unknown error toMp3', e);
		}
	}
}

export async function create(url: string, fileName: string) {
	try {
		const oggPath = resolve('./', './voices', `${fileName}.ogg`);
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
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log('Error ogg create', e.message);
		} else {
			console.log('Unknown error ogg create', e);
		}
	}
}
