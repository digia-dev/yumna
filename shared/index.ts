export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'FAMILY_HEAD' | 'MEMBER';
}
