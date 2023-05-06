import { chat } from './openAi.js';
import { checkUserSession, currentSessionConsole, getText } from './utils.js';
import { code } from 'telegraf/format';
import {
	REQUEST_GONE,
	BLOCK_MESSAGE,
	BLACK_LIST_IDS,
	roles,
	voiceText,
} from './constants.js';

export const textHandler = async (context) => {
	const userId = String(context.from.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(code(BLOCK_MESSAGE));
		return;
	}
	context.session = checkUserSession(context.session, userId);

	const { message, session, from } = context;
	session[userId].push({ role: roles.USER, content: message.text });

	await context.reply(code(REQUEST_GONE));
	const response = await chat(session[userId]);

	session[userId].push({
		role: roles.ASSISTANT,
		content: response.content,
	});

	await context.reply(response.content);
	currentSessionConsole(session, from.first_name, from?.last_name);
};

export const voiceHandler = async (context) => {
	const userId = String(context.message.from.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(code(BLOCK_MESSAGE));
		return;
	}
	context.session = checkUserSession(context.session, userId);
	await context.reply(code(voiceText.TRANSCRIPTION));
	const { message, telegram, session, from } = context;
	const text = await getText(message, telegram, userId);

	if (!text) {
		await context.reply(code(voiceText.UNCLEAR));
		return;
	}
	await context.reply(code(`${voiceText.RECEIVED} ${text}`));

	session[userId].push({ role: roles.USER, content: text });

	await context.reply(code(REQUEST_GONE));
	const response = await chat(session[userId]);

	session[userId].push({
		role: roles.ASSISTANT,
		content: response.content,
	});

	await context.reply(response.content);
	currentSessionConsole(session, from.first_name, from?.last_name);
};
