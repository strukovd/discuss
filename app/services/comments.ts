import type { ArgumentComment } from '~/types/comment';
import { readDatabase, readSession, writeDatabase } from './mocks/database';

export const argumentComments = {
	async counts(roomKey: string, discussionKey: string): Promise<Record<string, number>> {
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		const counts: Record<string, number> = {};
		for (const comment of readDatabase().comments) {
			if (comment.roomKey === roomKey && comment.discussionKey === discussionKey) counts[comment.argumentKey] = (counts[comment.argumentKey] ?? 0) + 1;
		}
		return counts;
	},
	async fetch(roomKey: string, discussionKey: string, argumentKey: string): Promise<ArgumentComment[]> {
		if (!readSession(roomKey)) throw new Error('Сначала войдите в комнату.');
		const database = readDatabase();
		if (!database.arguments.some(item => item.roomKey === roomKey && item.discussionKey === discussionKey && item.key === argumentKey)) throw new Error('Аргумент не найден.');
		return database.comments.filter(item => item.roomKey === roomKey && item.discussionKey === discussionKey && item.argumentKey === argumentKey)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	},
	async create(roomKey: string, discussionKey: string, argumentKey: string, body: { text: string }): Promise<ArgumentComment> {
		const database = readDatabase();
		const session = readSession(roomKey);
		if (!session) throw new Error('Сначала войдите в комнату.');
		const discussion = database.discussions.find(item => item.roomKey === roomKey && item.key === discussionKey);
		if (!discussion || !database.arguments.some(item => item.roomKey === roomKey && item.discussionKey === discussionKey && item.key === argumentKey)) throw new Error('Аргумент не найден.');
		if (discussion.status !== 'active') throw new Error('Обсуждение завершено. Новые реплики добавлять нельзя.');
		const text = body.text.trim();
		if (!text) throw new Error('Напишите реплику.');
		if (text.length > 2000) throw new Error('Реплика должна быть не длиннее 2000 символов.');
		const comment: ArgumentComment = { key: crypto.randomUUID(), roomKey, discussionKey, argumentKey, text, author: session.guestName, createdAt: new Date().toISOString() };
		writeDatabase({ ...database, comments: [...database.comments, comment] });
		return comment;
	},
};
