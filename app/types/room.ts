export type Room = { key: string; name: string; createdAt: string };
export type RoomSession = { roomKey: string; guestName: string };
export type CreateRoomPayload = { name: string; key?: string; password: string; guestName: string };
export type JoinRoomPayload = { key: string; password: string; guestName: string };
export type DiscussionDecision = {
	summary: string;
	reason: string;
	author: string;
	createdAt: string;
};
export type ResolveDiscussionPayload = Pick<DiscussionDecision, 'summary' | 'reason'>;
export type Discussion = {
	key: string;
	roomKey: string;
	title: string;
	description: string;
	status: 'active' | 'resolved' | 'archived';
	decision?: DiscussionDecision;
	argumentsFor: number;
	argumentsAgainst: number;
};
