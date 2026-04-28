export type Comment = {
  commentId: string;
  body: string;
  creatorName: string;
  creatorMemberId: string;
  createdAt: string;
  editedAt: string | null;
  isOwner: boolean;
};

export type GetCommentsResponse = {
  comments: Comment[];
};

export type CreateCommentRequest = {
  teamId: string;
  cardId: string;
  body: string;
};

export type EditCommentRequest = {
  teamId: string;
  commentId: string;
  body: string;
};

export type DeleteCommentRequest = {
  teamId: string;
  commentId: string;
};
