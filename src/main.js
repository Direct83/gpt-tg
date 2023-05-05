import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openAi } from './openAi.js';
import { checkUserSession, currentSessionConsole } from './utils.js';
import {
	TEXT_ERROR,
	WAITING_MESSAGE,
	REQUEST_GONE,
	BLOCK_MESSAGE,
	BLACK_LIST_IDS,
	voiceText,
	telegramCommandText,
} from './constants.js';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command(telegramCommandText.CLEAR_CONTEXT, async (context) => {
	const userId = context.from.id;
	context.session = { ...context.session, [userId]: [] };

	await context.reply(WAITING_MESSAGE);
});

bot.command(telegramCommandText.START, async (context) => {
	const userId = context.from.id;
	context.session = { ...context.session, [userId]: [] };

	await context.reply(WAITING_MESSAGE);
});

bot.on(message('voice'), async (context) => {
	const userId = String(context.message.from.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(code(BLOCK_MESSAGE));
		return;
	}
	context.session = checkUserSession(context.session, userId);

	try {
		await context.reply(code(voiceText.TRANSCRIPTION));
		const { message, telegram, session, from } = context;
		const { href } = await telegram.getFileLink(message.voice.file_id);
		const oggPath = await ogg.create(href, userId);
		const mp3Path = await ogg.toMp3(oggPath, userId);
		const text = await openAi.transcription(mp3Path);
		if (!text) {
			await context.reply(code(voiceText.UNCLEAR));
			return;
		}
		await context.reply(code(`${voiceText.RECEIVED} ${text}`));

		session[userId].push({ role: openAi.roles.USER, content: text });

		await context.reply(code(REQUEST_GONE));
		const response = await openAi.chat(session[userId]);

		session[userId].push({
			role: openAi.roles.ASSISTANT,
			content: response.content,
		});

		await context.reply(response.content);
		currentSessionConsole(session, from.first_name, from?.last_name);
	} catch (e) {
		await context.reply(code(TEXT_ERROR));
		console.log(`Error voice message ${e}`);
	}
});

bot.on(message('text'), async (context) => {
	const userId = String(context.from.id);
	if (BLACK_LIST_IDS.includes(userId)) {
		await context.reply(code(BLOCK_MESSAGE));
		return;
	}
	context.session = checkUserSession(context.session, userId);

	try {
		const { message, session, from } = context;
		session[userId].push({ role: openAi.roles.USER, content: message.text });

		await context.reply(code(REQUEST_GONE));
		const response = await openAi.chat(session[userId]);

		session[userId].push({
			role: openAi.roles.ASSISTANT,
			content: response.content,
		});

		await context.reply(response.content);
		currentSessionConsole(session, from.first_name, from?.last_name);
	} catch (e) {
		await context.reply(code(TEXT_ERROR));
		console.log(`Error text message ${e}`);
	}
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
