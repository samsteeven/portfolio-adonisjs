export enum UserRole {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.VISITOR]: 'Visiteur',
}

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800',
  [UserRole.VISITOR]: 'bg-blue-100 text-blue-800',
}
