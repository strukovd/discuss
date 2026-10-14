import type { Discussion } from '~/types/room';
import { readDatabase, readSession, writeDatabase } from './mocks/database';

export const discussions = {
	async fetch(roomKey: string): Promise<Discussion[]> {
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		const database = readDatabase();
		return database.discussions.filter(item => item.roomKey === roomKey).map(item => ({
			...item,
			argumentsFor: database.arguments.filter(argument => argument.roomKey === roomKey && argument.discussionKey === item.key && argument.side === 'for').length,
			argumentsAgainst: database.arguments.filter(argument => argument.roomKey === roomKey && argument.discussionKey === item.key && argument.side === 'against').length,
		}));
	},
	async fetchOne(roomKey: string, key: string): Promise<Discussion> {
		const discussion = (await discussions.fetch(roomKey)).find(item => item.key === key);
		if (!discussion) throw new Error('Обсуждение не найдено.');
		return discussion;
	},
	async create(roomKey: string, body: { title: string; description: string }): Promise<Discussion> {
		const database = readDatabase();
		if (!readSession(roomKey) || !database.rooms.some(room => room.key === roomKey)) throw new Error('Сначала войдите в комнату.');
		if (!body.title.trim()) throw new Error('Введите тему обсуждения.');
		const discussion: Discussion = { key: crypto.randomUUID(), roomKey, title: body.title.trim(), description: body.description.trim(), status: 'active', argumentsFor: 0, argumentsAgainst: 0 };
		writeDatabase({ ...database, discussions: [discussion, ...database.discussions] });
		return discussion;
	},
};
