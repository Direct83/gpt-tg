import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openAi } from './openAi.js';

const INITIAL_SESSION = {
	messages: [],
};

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('new', async (el) => {
	el.session = INITIAL_SESSION;
	await el.reply('Жду вашего сообщения');
});

bot.command('start', async (el) => {
	el.session = INITIAL_SESSION;
	await el.reply('Жду вашего сообщения');
});

bot.on(message('voice'), async (el) => {
	if (!el.session) {
		el.session = INITIAL_SESSION;
	}

	try {
		await el.reply(code('Запрос ушел, ждите'));
		const { message, telegram, session } = el;
		const { href } = await telegram.getFileLink(message.voice.file_id);
		const userId = String(message.from.id);
		const oggPath = await ogg.create(href, userId);
		const mp3Path = await ogg.toMp3(oggPath, userId);

		const text = await openAi.transcription(mp3Path);
		await el.reply(code(`Ваш запрос: ${text}`));

		session.messages.push({ role: openAi.roles.USER, content: text });

		const response = await openAi.chat(session.messages);

		el.session.messages.push({
			role: openAi.roles.ASSISTANT,
			content: response.content,
		});

		await el.reply(response.content);
	} catch (e) {
		console.log(`Error voice message ${e}`);
	}
});

bot.on(message('text'), async (el) => {
	if (!el.session) {
		el.session = INITIAL_SESSION;
	}

	try {
		await el.reply(code('Запрос ушел, ждите'));
		const { message, session } = el;

		session.messages.push({ role: openAi.roles.USER, content: message.text });

		const response = await openAi.chat(session.messages);

		el.session.messages.push({
			role: openAi.roles.ASSISTANT,
			content: response.content,
		});

		await el.reply(response.content);
	} catch (e) {
		console.log(`Error voice message ${e}`);
	}
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
