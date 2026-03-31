import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  BoardCreatePayload,
  BoardCreateResponse,
  BoardListResponse,
} from "./types";

export async function getBoards(teamId: string) {
  const response = await axiosInstance.get<ApiResponse<BoardListResponse>>(
    `/teams/${teamId}/boards`,
  );

  return response.data.data;
}

export async function createBoard(teamId: string, request: BoardCreatePayload) {
  const response = await axiosInstance.post<ApiResponse<BoardCreateResponse>>(
    `/teams/${teamId}/boards`,
    request,
  );

  return response.data.data;
}
