import { Telegraf, session } from 'telegraf-ts';
import config from 'config';
import { newContext } from './utils';
import { TEXT_ERROR, telegramCommandText } from './constants';
import { textHandler, voiceHandler } from './messageHandlers';
import { TGContext } from './types';

const bot = new Telegraf<TGContext>(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command(telegramCommandText.CLEAR_CONTEXT, async (context) => {
	await newContext(context);
});

bot.command(telegramCommandText.START, async (context) => {
	await newContext(context);
});

bot.on('voice', async (context) => {
	try {
		await voiceHandler(context);
	} catch (e) {
		await context.reply(TEXT_ERROR);
		console.log(`Error voice message ${e}`);
	}
});

bot.on('text', async (context) => {
	try {
		await textHandler(context);
	} catch (e) {
		await context.reply(TEXT_ERROR);
		console.log(`Error text message ${e}`);
	}
});

bot.launch();

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
