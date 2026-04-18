import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  CardDetail,
  CardMoveRequest,
  CardMoveToColumnRequest,
  CardsGetByBoardRequest,
  CardsGetByBoardResponse,
  CardsMentionRequest,
  CardsMentionResponse,
  CreateCardRequest,
  CreateCardResponse,
  AssignCardRequest,
  AssignCardResponse,
  UpdateCardRequest,
  UpdateCardResponse,
  MoveCardToBoardRequest,
} from "./types";

export async function getCard({
  teamId,
  cardId,
}: {
  teamId: string;
  cardId: string;
}): Promise<CardDetail> {
  const response = await axiosInstance.get<ApiResponse<CardDetail>>(
    `/api/teams/${teamId}/cards/${cardId}`,
  );
  return response.data.data;
}

export async function getCardsByBoard({
  teamId,
  boardId,
}: CardsGetByBoardRequest) {
  const response = await axiosInstance.get<
    ApiResponse<CardsGetByBoardResponse>
  >(`/api/teams/${teamId}/boards/${boardId}/cards`);
  return response.data.data;
}

export async function getCardsForMention({ teamId }: CardsMentionRequest) {
  const response = await axiosInstance.get<ApiResponse<CardsMentionResponse>>(
    `/api/teams/${teamId}/cards`,
  );
  return response.data.data;
}

export async function createCard({
  teamId,
  boardId,
  title,
  body,
  assignedMemberIds,
}: CreateCardRequest) {
  const response = await axiosInstance.post<ApiResponse<CreateCardResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/cards`,
    { title, body, assignedMemberIds },
  );
  return response.data.data;
}

export async function updateCard({
  boardId,
  cardId,
  title,
  body,
}: UpdateCardRequest) {
  const response = await axiosInstance.put<ApiResponse<UpdateCardResponse>>(
    `/api/boards/${boardId}/cards/${cardId}`,
    { title, body },
  );
  return response.data.data;
}

export async function assignCard({
  boardId,
  cardId,
  memberId,
}: AssignCardRequest) {
  const response = await axiosInstance.post<ApiResponse<AssignCardResponse>>(
    `/api/boards/${boardId}/cards/${cardId}/assignments`,
    { memberId },
  );
  return response.data.data;
}

export async function unassignCard({
  boardId,
  cardId,
  memberId,
}: AssignCardRequest) {
  const response = await axiosInstance.delete<
    ApiResponse<{ success: boolean }>
  >(`/api/boards/${boardId}/cards/${cardId}/assignments/${memberId}`);
  return response.data.data;
}

export async function moveCardToMaybe({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/maybe`,
  );
  return response.data.data;
}

export async function moveCardToNotNow({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/not-now`,
  );
  return response.data.data;
}

export async function moveCardToDone({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/done`,
  );
  return response.data.data;
}

export async function moveCardToUserColumn({
  teamId,
  boardId,
  cardId,
  columnId,
}: CardMoveToColumnRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
  );
  return response.data.data;
}

export async function moveCardToBoard({
  boardId,
  cardId,
  targetBoardId,
}: MoveCardToBoardRequest): Promise<void> {
  await axiosInstance.put(`/api/boards/${boardId}/cards/${cardId}/board`, {
    targetBoardId,
  });
}
