export type Room = { key: string; name: string; createdAt: string };
export type RoomSession = { roomKey: string; guestName: string };
export type CreateRoomPayload = { name: string; key?: string; password: string; guestName: string };
export type JoinRoomPayload = { key: string; password: string; guestName: string };
export type Discussion = {
	key: string;
	roomKey: string;
	title: string;
	description: string;
	status: 'active' | 'resolved' | 'archived';
	argumentsFor: number;
	argumentsAgainst: number;
};
