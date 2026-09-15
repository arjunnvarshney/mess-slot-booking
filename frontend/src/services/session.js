export function tokenFor(role) {
  return (
    sessionStorage.getItem(role + "Token") ||
    localStorage.getItem(role + "Token")
  );
}
export function clearSession() {
  for (const role of ["admin", "student"]) {
    sessionStorage.removeItem(role + "Token");
    localStorage.removeItem(role + "Token");
  }
}
export function saveSession(role, token, remember) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(role + "Token", token);
}
export function logout() {
  clearSession();
  window.location.assign("/");
}
