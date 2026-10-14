import type { CreateRoomPayload, JoinRoomPayload, Room, RoomSession } from '~/types/room';
import { readDatabase, readSession, saveSession, writeDatabase } from './mocks/database';

export const rooms = {
	async create(body: CreateRoomPayload): Promise<Room> {
		const database = readDatabase();
		const key = body.key?.trim() || crypto.randomUUID();
		if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(key)) throw new Error('Некорректный ключ комнаты.');
		if (!body.name.trim() || !body.password || !body.guestName.trim()) throw new Error('Заполните название, пароль и имя.');
		if (database.rooms.some(room => room.key === key)) throw new Error('Этот ключ уже занят. Выберите другой.');
		const room: Room = { key, name: body.name.trim(), createdAt: new Date().toISOString() };
		writeDatabase({ ...database, rooms: [...database.rooms, { ...room, password: body.password }] });
		saveSession({ roomKey: key, guestName: body.guestName.trim() });
		return room;
	},
	async join(body: JoinRoomPayload): Promise<Room> {
		const room = readDatabase().rooms.find(item => item.key === body.key.trim());
		if (!room || room.password !== body.password) throw new Error('Комната не найдена или пароль неверный.');
		if (!body.guestName.trim()) throw new Error('Укажите имя.');
		saveSession({ roomKey: room.key, guestName: body.guestName.trim() });
		return { key: room.key, name: room.name, createdAt: room.createdAt };
	},
	async fetch(key: string): Promise<{ room: Room; session: RoomSession }> {
		const room = readDatabase().rooms.find(item => item.key === key);
		const session = readSession(key);
		if (!room || !session) throw new Error('Войдите в комнату с её паролем.');
		return { room: { key: room.key, name: room.name, createdAt: room.createdAt }, session };
	},
};
