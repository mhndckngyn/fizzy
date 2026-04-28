import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  Comment,
  CreateCommentRequest,
  DeleteCommentRequest,
  EditCommentRequest,
  GetCommentsResponse,
} from "./types";

export async function getComments({
  teamId,
  cardId,
}: {
  teamId: string;
  cardId: string;
}): Promise<GetCommentsResponse> {
  const response = await axiosInstance.get<ApiResponse<GetCommentsResponse>>(
    `/api/teams/${teamId}/cards/${cardId}/comments`,
  );
  return response.data.data;
}

export async function createComment({
  teamId,
  cardId,
  body,
}: CreateCommentRequest): Promise<Comment> {
  const response = await axiosInstance.post<ApiResponse<Comment>>(
    `/api/teams/${teamId}/cards/${cardId}/comments`,
    { body },
  );
  return response.data.data;
}

export async function editComment({
  teamId,
  commentId,
  body,
}: EditCommentRequest): Promise<Comment> {
  const response = await axiosInstance.put<ApiResponse<Comment>>(
    `/api/teams/${teamId}/comments/${commentId}`,
    { body },
  );
  return response.data.data;
}

export async function deleteComment({
  teamId,
  commentId,
}: DeleteCommentRequest): Promise<void> {
  await axiosInstance.delete(`/api/teams/${teamId}/comments/${commentId}`);
}
