
import { Role } from "@/types/role.type";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}