import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import config from 'config';
import { createReadStream } from 'fs';
import { removeFile } from './utils';

const openAi = new OpenAIApi(
	new Configuration({ apiKey: config.get('OPENAI_KEY') })
);

export async function chat(messages: CreateChatCompletionRequest['messages']) {
	try {
		const response = await openAi.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages,
		});

		return response.data.choices[0].message;
	} catch (e) {
		if (e instanceof Error) {
			console.log('Error openAI chat: ', e.message);
		} else {
			console.log('Unknown error openAI chat: ', e);
		}
	}
}

export async function transcription(filePath: string) {
	try {
		const response = await openAi.createTranscription(
			createReadStream(filePath) as unknown as File,
			'whisper-1'
		);

		removeFile(filePath);

		return response.data.text;
	} catch (e) {
		if (e instanceof Error) {
			console.log('Error openAI transcription: ', e.message);
		} else {
			console.log('Unknown error openAI transcription: ', e);
		}
	}
}
