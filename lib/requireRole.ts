import { getUserFromToken } from './api';

export function requireRole(allowedRoles: string[]) {
  const user = getUserFromToken();
  if (!user || !allowedRoles.includes(user.role)) {
    window.location.href = '/dashboard';
  }
}
