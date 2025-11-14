export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}
