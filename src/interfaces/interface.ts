export interface IContent<Type> {
  status: string;
  loading: boolean;
  content: Type;
  message: string;
  progress: number;
}
