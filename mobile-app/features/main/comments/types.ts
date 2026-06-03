export type Comment = {
  commentId: string;
  body: string;
  creatorName: string;
  creatorMemberId: string;
  createdAt: string;
  editedAt: string | null;
  isOwner: boolean;
};
