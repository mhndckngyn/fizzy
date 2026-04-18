import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  CardMoveRequest,
  CardMoveToColumnRequest,
  CardsGetByBoardRequest,
  CardsGetByBoardResponse,
} from "./types";

export async function getCardsByBoard({
  teamId,
  boardId,
}: CardsGetByBoardRequest) {
  const response = await axiosInstance.get<
    ApiResponse<CardsGetByBoardResponse>
  >(`/api/teams/${teamId}/boards/${boardId}/cards`);

  return response.data.data;
}

// --- Move Cards ---
export async function moveCardToMaybe({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.post<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/move/maybe`,
  );
  return response.data.data;
}

export async function moveCardToNotNow({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.post<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/move/not-now`,
  );
  return response.data.data;
}

export async function moveCardToDone({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.post<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/move/done`,
  );
  return response.data.data;
}

export async function moveCardToUserColumn({
  teamId,
  boardId,
  cardId,
  columnId,
}: CardMoveToColumnRequest) {
  const response = await axiosInstance.post<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
  );
  return response.data.data;
}
