import { Configuration, OpenAIApi } from 'openai';
import config from 'config';
import { createReadStream } from 'fs';
import { removeFile } from './utils.js';

const openAi = new OpenAIApi(
	new Configuration({ apiKey: config.get('OPENAI_KEY') })
);

export async function chat(messages) {
	try {
		const response = await openAi.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages,
		});

		return response.data.choices[0].message;
	} catch (e) {
		console.log('Error openAI chat', e.message);
	}
}

export async function transcription(filePath) {
	try {
		const response = await openAi.createTranscription(
			createReadStream(filePath),
			'whisper-1'
		);

		removeFile(filePath);

		return response.data.text;
	} catch (e) {
		console.log('Error openAI transcription', e.message);
	}
}
