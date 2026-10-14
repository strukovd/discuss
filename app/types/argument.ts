export type ArgumentSide = 'for' | 'against';
export type DiscussionArgument = {
	key: string;
	roomKey: string;
	discussionKey: string;
	side: ArgumentSide;
	title: string;
	description: string;
	source: string;
	author: string;
	createdAt: string;
};
export type CreateArgumentPayload = Pick<DiscussionArgument, 'side' | 'title' | 'description' | 'source'>;
