export function isLoggedIn() {
  return localStorage.getItem("access_token") !== null
}
