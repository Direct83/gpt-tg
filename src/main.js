import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { newContext } from './utils.js';
import { TEXT_ERROR, telegramCommandText } from './constants.js';
import { textHandler, voiceHandler } from './messageHandlers.js';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command(telegramCommandText.CLEAR_CONTEXT, async (context) => {
	newContext(context);
});

bot.command(telegramCommandText.START, async (context) => {
	newContext(context);
});

bot.on(message('voice'), async (context) => {
	try {
		await voiceHandler(context);
	} catch (e) {
		await context.reply(code(TEXT_ERROR));
		console.log(`Error voice message ${e}`);
	}
});

bot.on(message('text'), async (context) => {
	try {
		await textHandler(context);
	} catch (e) {
		await context.reply(code(TEXT_ERROR));
		console.log(`Error text message ${e}`);
	}
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
