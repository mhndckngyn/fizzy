import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  ColumnChangePositionRequest,
  ColumnCreateRequest,
  ColumnCreateResponse,
  ColumnListRequest,
  ColumnListResponse,
  ColumnUpdateRequest,
} from "./types";

// --- Column CRUD ---

export async function getColumns({ teamId, boardId }: ColumnListRequest) {
  const response = await axiosInstance.get<ApiResponse<ColumnListResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/columns`,
  );

  return response.data.data;
}

export async function createColumn(request: ColumnCreateRequest) {
  const { teamId, boardId, ...payload } = request;

  const response = await axiosInstance.post<ApiResponse<ColumnCreateResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/columns`,
    payload,
  );

  return response.data.data;
}

export async function updateColumn(request: ColumnUpdateRequest) {
  const { teamId, boardId, columnId, ...payload } = request;

  const response = await axiosInstance.put<ApiResponse>(
    `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}`,
    payload,
  );

  return response.data.data;
}

export async function deleteColumn(
  teamId: string,
  boardId: string,
  columnId: string,
) {
  const response = await axiosInstance.delete<
    ApiResponse<{ success: boolean }>
  >(`/api/teams/${teamId}/boards/${boardId}/columns/${columnId}`);
  return response.data.data;
}

export async function changeColumnPosition({
  teamId,
  boardId,
  columnId,
  direction,
}: ColumnChangePositionRequest) {
  const url = `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}/${direction}`;

  const response = await axiosInstance.patch<ApiResponse>(url);

  return response.data.data;
}
