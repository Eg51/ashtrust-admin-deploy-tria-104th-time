// lib/auth.js
export function getUserFromRequest(request) {
  return {
    id: request.headers.get('x-user-id'),
    email: request.headers.get('x-user-email'),
    username: request.headers.get('x-user-username'),
    firstName: request.headers.get('x-user-firstName'),
    lastName: request.headers.get('x-user-lastName'),
    displayName: request.headers.get('x-user-displayName'),
    role: request.headers.get('x-user-role'),
  };
}