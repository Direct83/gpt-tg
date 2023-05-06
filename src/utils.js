import { unlink } from 'fs/promises';
import { WAITING_MESSAGE } from './constants.js';
import { create, toMp3 } from './oggToMp3.js';
import { transcription } from './openAi.js';

export async function removeFile(path) {
	try {
		await unlink(path);
	} catch (e) {
		console.log('Error removeFile', e.message);
	}
}

export const checkUserSession = (session, userId) => {
	if (!session) {
		session = {};
	}

	session[userId] = session[userId] || [];

	return session;
};

export const currentSessionConsole = (session, firstName, lastName) => {
	const lastNameText = lastName ? ' ' + lastName : '';
	console.log(`currentSession: ${firstName}${lastNameText}`, session);
};

export const newContext = async (context) => {
	const userId = context.from.id;
	context.session = { ...context.session, [userId]: [] };

	await context.reply(WAITING_MESSAGE);
};

export const getText = async (message, telegram, userId) => {
	const { href } = await telegram.getFileLink(message.voice.file_id);
	const oggPath = await create(href, userId);
	const mp3Path = await toMp3(oggPath, userId);
	const text = await transcription(mp3Path);
	return text;
};
