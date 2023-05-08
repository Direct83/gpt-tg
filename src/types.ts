import { CreateChatCompletionRequest } from 'openai';
import { TelegrafContext } from 'telegraf-ts';

export interface TGSessionItems {
	[key: string]: CreateChatCompletionRequest['messages'];
}

export interface TGSession {
	session: TGSessionItems;
}

export type TGContext = TelegrafContext & TGSession;
