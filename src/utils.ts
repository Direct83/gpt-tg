import { unlink } from 'fs/promises';
import { WAITING_MESSAGE } from './constants';
import { create, toMp3 } from './oggToMp3';
import { transcription } from './openAi';
import { TGContext, TGSessionItems } from './types';
import { Telegram, IncomingMessage } from 'telegraf-ts';

export async function removeFile(path: string) {
	try {
		await unlink(path);
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log('Error removeFile', e.message);
		} else {
			console.log('Unknown error removeFile', e);
		}
	}
}

export const checkUserSession = (session: TGSessionItems, userId: string) => {
	if (!session) {
		session = {};
	}

	session[userId] = session[userId] || [];

	return session;
};

export const currentSessionConsole = (
	session: TGSessionItems,
	firstName?: string,
	lastName?: string
) => {
	const lastNameText = lastName ? ' ' + lastName : '';
	console.log(`currentSession: ${firstName}${lastNameText}`, session);
};

export const newContext = async (context: TGContext) => {
	const userId = String(context.from?.id);
	context.session = { ...context.session, [userId]: [] };

	await context.reply(WAITING_MESSAGE);
};

export const getText = async (
	telegram: Telegram,
	userId: string,
	message?: IncomingMessage
) => {
	if (message?.voice) {
		const href = await telegram.getFileLink(message.voice.file_id);
		const oggPath = (await create(href, userId)) as string;
		const mp3Path = (await toMp3(oggPath, userId)) as string;
		const text = await transcription(mp3Path);

		return text;
	}

	return '';
};
