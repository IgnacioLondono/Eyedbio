export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  views: number;
  badges: string[];
  blockedAt: string | null;
  blockedReason: string | null;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  blockedUsers: number;
  admins: number;
  profileViews: number;
  links: number;
}
