import { chat } from './openAi';
import { checkUserSession, currentSessionConsole, getText } from './utils';
import {
	REQUEST_GONE,
	BLOCK_MESSAGE,
	BLACK_LIST_IDS,
	voiceText,
	TEXT_UNDEFINED,
} from './constants';
import { TGContext } from './types';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

export const textHandler = async (context: TGContext) => {
	const userId = String(context.from?.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(BLOCK_MESSAGE);
		return;
	}
	context.session = checkUserSession(context.session, userId);

	const { message, session, from } = context;

	if (!message?.text) {
		await context.reply(TEXT_UNDEFINED);
		return;
	}

	session[userId].push({
		role: ChatCompletionRequestMessageRoleEnum.User,
		content: message.text,
	});

	await context.reply(REQUEST_GONE);
	const response = await chat(session[userId]);

	session[userId].push({
		role: ChatCompletionRequestMessageRoleEnum.Assistant,
		content: response!.content,
	});

	await context.reply(response?.content ?? '');
	currentSessionConsole(session, from?.first_name, from?.last_name);
};

export const voiceHandler = async (context: TGContext) => {
	const userId = String(context.message?.from?.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(BLOCK_MESSAGE);
		return;
	}
	context.session = checkUserSession(context.session, userId);
	await context.reply(voiceText.TRANSCRIPTION);
	const { message, telegram, session, from } = context;

	const text = await getText(telegram, userId, message);

	if (!text) {
		await context.reply(voiceText.UNCLEAR);
		return;
	}
	await context.reply(`${voiceText.RECEIVED} ${text}`);

	session[userId].push({
		role: ChatCompletionRequestMessageRoleEnum.User,
		content: text,
	});

	await context.reply(REQUEST_GONE);
	const response = await chat(session[userId]);

	session[userId].push({
		role: ChatCompletionRequestMessageRoleEnum.Assistant,
		content: response!.content,
	});

	await context.reply(response?.content ?? '');
	currentSessionConsole(session, from?.first_name, from?.last_name);
};
