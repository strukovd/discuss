import type { Discussion } from '~/types/room';
import { readDatabase, readSession, writeDatabase } from './mocks/database';

export const discussions = {
	async fetch(roomKey: string): Promise<Discussion[]> {
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		return readDatabase().discussions.filter(item => item.roomKey === roomKey);
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
