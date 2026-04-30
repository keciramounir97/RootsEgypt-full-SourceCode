declare global {
  namespace Express {
    interface User {
      id: number;
      userId?: number;
      email: string;
      role_id?: number;
      roleId?: number;
      role?: number | string;
      roleName?: string;
    }
  }
}

export {};
