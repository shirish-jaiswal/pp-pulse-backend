export type ApiListResponse<T> = {
  success: true;
  api: string;
  count: number;
  data: T[];
  mode?: string;
};
