export interface IRequestProps {
  url: string;
  progress?: (progress: number) => void;
}

export interface IResponse<T> {
  status: string;
  data: T | null;
  message: string;
}
