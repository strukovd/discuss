import type { Discussion, ResolveDiscussionPayload } from '~/types/room';
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
	async resolve(roomKey: string, key: string, body: ResolveDiscussionPayload): Promise<Discussion> {
		const database = readDatabase();
		const session = readSession(roomKey);
		if (!session) throw new Error('Сначала войдите в комнату.');
		const discussion = database.discussions.find(item => item.roomKey === roomKey && item.key === key);
		if (!discussion) throw new Error('Обсуждение не найдено.');
		if (discussion.status === 'archived' || discussion.decision) throw new Error('Итог уже зафиксирован или обсуждение находится в архиве.');
		const summary = body.summary.trim();
		const reason = body.reason.trim();
		if (!summary || !reason) throw new Error('Запишите решение и его обоснование.');
		if (summary.length > 1000 || reason.length > 5000) throw new Error('Решение — до 1000 символов, обоснование — до 5000.');
		discussion.decision = { summary, reason, author: session.guestName, createdAt: new Date().toISOString() };
		discussion.status = 'resolved';
		writeDatabase(database);
		return discussions.fetchOne(roomKey, key);
	},
	async archive(roomKey: string, key: string): Promise<Discussion> {
		const database = readDatabase();
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		const discussion = database.discussions.find(item => item.roomKey === roomKey && item.key === key);
		if (!discussion) throw new Error('Обсуждение не найдено.');
		if (discussion.status !== 'resolved' || !discussion.decision) throw new Error('Перед архивированием зафиксируйте решение и его обоснование.');
		discussion.status = 'archived';
		writeDatabase(database);
		return discussions.fetchOne(roomKey, key);
	},
	async restore(roomKey: string, key: string): Promise<Discussion> {
		const database = readDatabase();
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		const discussion = database.discussions.find(item => item.roomKey === roomKey && item.key === key);
		if (!discussion) throw new Error('Обсуждение не найдено.');
		if (discussion.status !== 'archived') throw new Error('Обсуждение не находится в архиве.');
		discussion.status = 'resolved';
		writeDatabase(database);
		return discussions.fetchOne(roomKey, key);
	},
};
