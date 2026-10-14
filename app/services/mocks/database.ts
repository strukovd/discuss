import type { Discussion, Room, RoomSession } from '~/types/room';

type MockDatabase = { rooms: (Room & { password: string })[]; discussions: Discussion[] };
const storageKey = 'discuss:mock:v1';
const sessionKey = 'discuss:sessions:v1';

// Только локальный прототип: данные и пароли доступны в браузере, это не авторизация.
export function readDatabase(): MockDatabase {
	const saved = localStorage.getItem(storageKey);
	if (saved) return JSON.parse(saved);
	return {
		rooms: [{ key: 'team-demo', name: 'Идеи нашей команды', password: 'discuss', createdAt: '2026-10-14T00:00:00Z' }],
		discussions: [
			{ key: 'weekly-demo', roomKey: 'team-demo', title: 'Проводить короткое демо каждую неделю', description: 'Делиться результатами работы и получать обратную связь от команды.', status: 'active', argumentsFor: 4, argumentsAgainst: 2 },
			{ key: 'knowledge-base', roomKey: 'team-demo', title: 'Собрать общую базу знаний', description: 'Хранить полезные материалы и решения в одном месте.', status: 'active', argumentsFor: 6, argumentsAgainst: 1 },
			{ key: 'meeting-free', roomKey: 'team-demo', title: 'Один день без встреч', description: 'Выделить среду для работы, которая требует сосредоточенности.', status: 'resolved', argumentsFor: 5, argumentsAgainst: 3 },
			{ key: 'old-format', roomKey: 'team-demo', title: 'Изменить формат ретроспективы', description: 'Попробовали новый формат и сохранили итоги обсуждения.', status: 'archived', argumentsFor: 3, argumentsAgainst: 2 },
		],
	};
}

export function writeDatabase(database: MockDatabase) {
	localStorage.setItem(storageKey, JSON.stringify(database));
}

export function readSession(key: string): RoomSession | null {
	const sessions: RoomSession[] = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
	return sessions.find(session => session.roomKey === key) ?? null;
}

export function saveSession(session: RoomSession) {
	const sessions: RoomSession[] = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
	sessionStorage.setItem(sessionKey, JSON.stringify([...sessions.filter(item => item.roomKey !== session.roomKey), session]));
}
