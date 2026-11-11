import apiClient from "./client";

import type { ApiResponse, CheckIn, CheckInPayload } from "../types";

export const checkInApi = {
  // Get current occupants of a room.
  getOccupants: async (roomId: number): Promise<CheckIn[]> => {
    const response = await apiClient.get<ApiResponse<CheckIn[]>>(
      `/rooms/${roomId}/occupants`,
    );

    return response.data.data;
  },

  // Check a child into a room.
  checkIn: async (
    roomId: number,
    payload: CheckInPayload,
  ): Promise<CheckIn> => {
    const response = await apiClient.post<ApiResponse<CheckIn>>(
      `/rooms/${roomId}/check-ins`,
      payload,
    );

    return response.data.data;
  },

  // Check a child out.
  checkOut: async (checkInId: number): Promise<CheckIn> => {
    const response = await apiClient.post<ApiResponse<CheckIn>>(
      `/check-ins/${checkInId}/check-out`,
    );

    return response.data.data;
  },
};
