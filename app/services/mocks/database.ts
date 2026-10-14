import type { DiscussionArgument } from '~/types/argument';
import type { Discussion, Room, RoomSession } from '~/types/room';

type MockDatabase = { rooms: (Room & { password: string })[]; discussions: Discussion[]; arguments: DiscussionArgument[] };
const storageKey = 'discuss:mock:v1';
const sessionKey = 'discuss:sessions:v1';

// Только локальный прототип: данные и пароли доступны в браузере, это не авторизация.
const demoArguments: DiscussionArgument[] = [
	{ key: 'demo-feedback', roomKey: 'team-demo', discussionKey: 'weekly-demo', side: 'for', title: 'Обратная связь раньше, чем работа завершена', description: 'Короткое демо поможет замечать расхождения в ожиданиях каждую неделю, пока изменения ещё легко внести.', source: '', author: 'Мудрая Сова', createdAt: '2026-10-14T08:00:00Z' },
	{ key: 'demo-context', roomKey: 'team-demo', discussionKey: 'weekly-demo', side: 'for', title: 'Команда видит общую картину', description: 'Каждый сможет понять, что делают коллеги и где нужна помощь, без отдельных встреч по каждому направлению.', source: '', author: 'Хитрый Енот', createdAt: '2026-10-14T09:00:00Z' },
	{ key: 'demo-time', roomKey: 'team-demo', discussionKey: 'weekly-demo', side: 'against', title: 'Подготовка может отнимать слишком много времени', description: 'Если для каждого демо нужны слайды и репетиция, небольшая встреча превратится в дополнительную нагрузку.', source: '', author: 'Сонный Лис', createdAt: '2026-10-14T10:00:00Z' },
	{ key: 'demo-knowledge', roomKey: 'team-demo', discussionKey: 'knowledge-base', side: 'for', title: 'Проще найти причины прошлых решений', description: 'Новые участники смогут восстановить контекст без повторного обсуждения тех же вопросов.', source: '', author: 'Мудрая Сова', createdAt: '2026-10-14T08:00:00Z' },
	{ key: 'demo-maintenance', roomKey: 'team-demo', discussionKey: 'knowledge-base', side: 'against', title: 'Материалы нужно поддерживать актуальными', description: 'Без регулярного обновления база знаний может вводить команду в заблуждение.', source: '', author: 'Сонный Лис', createdAt: '2026-10-14T09:00:00Z' },
];

export function readDatabase(): MockDatabase {
	const saved = localStorage.getItem(storageKey);
	if (saved) {
		const database: MockDatabase = JSON.parse(saved);
		// Совместимость с комнатами, созданными до появления аргументов.
		return { ...database, arguments: database.arguments ?? demoArguments.filter(item => database.discussions.some(discussion => discussion.roomKey === item.roomKey && discussion.key === item.discussionKey)) };
	}
	return {
		arguments: demoArguments,
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
