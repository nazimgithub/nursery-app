export interface Child {
  id: number;
  name: string;
}

export interface CheckIn {
  id: number;
  room_id: number;
  child_id: number;
  child?: Child;
  checked_in_at: string;
  checked_out_at: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

export interface CheckInPayload {
  child_id: number;
}

export interface Room {
  id: number;
  name: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
