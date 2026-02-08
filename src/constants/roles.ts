import { Role } from "@/types";

export const Roles: Record<Role, string> = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
} as const;

