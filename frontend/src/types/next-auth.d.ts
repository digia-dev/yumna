import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Extent standard session user
   */
  interface Session {
    user: {
      id: string;
      role: string;
      familyId?: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  /**
   * Extent standard user
   */
  interface User extends DefaultUser {
    role: string;
    familyId?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extent standard JWT
   */
  interface JWT {
    id: string;
    role: string;
    familyId?: string | null;
    accessToken?: string;
  }
}
