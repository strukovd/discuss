import type { CreateArgumentPayload, DiscussionArgument } from '~/types/argument';
import { readDatabase, readSession, writeDatabase } from './mocks/database';

export const discussionArguments = {
	async fetch(roomKey: string, discussionKey: string): Promise<DiscussionArgument[]> {
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		return readDatabase().arguments.filter(item => item.roomKey === roomKey && item.discussionKey === discussionKey);
	},
	async create(roomKey: string, discussionKey: string, body: CreateArgumentPayload): Promise<DiscussionArgument> {
		const database = readDatabase();
		const session = readSession(roomKey);
		if (!session) throw new Error('Сначала войдите в комнату.');
		const discussion = database.discussions.find(item => item.roomKey === roomKey && item.key === discussionKey);
		if (!discussion) throw new Error('Обсуждение не найдено.');
		if (discussion.status !== 'active') throw new Error('Это обсуждение завершено. Добавлять аргументы нельзя.');
		if (!body.title.trim()) throw new Error('Сформулируйте аргумент.');
		if (body.side !== 'for' && body.side !== 'against') throw new Error('Выберите сторону аргумента.');
		const source = body.source.trim();
		if (source) {
			try {
				const url = new URL(source);
				if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
			} catch {
				throw new Error('Источник должен быть ссылкой с https:// или http://.');
			}
		}
		const argument: DiscussionArgument = { ...body, title: body.title.trim(), description: body.description.trim(), source, key: crypto.randomUUID(), roomKey, discussionKey, author: session.guestName, createdAt: new Date().toISOString() };
		writeDatabase({ ...database, arguments: [...database.arguments, argument] });
		return argument;
	},
};
