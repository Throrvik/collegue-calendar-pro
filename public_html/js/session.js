async function fetchSession() {
  try {
    const res = await fetch("/api/session.php", { credentials: "include" });
    const data = await res.json();
    return data.ok ? data.user : null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const userInfo = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");
  const friendsLink = document.getElementById("friends-link");
  const logoutBtn = document.getElementById("logout-btn");

  const user = await fetchSession();

  if (user) {
    if (userInfo) userInfo.textContent = user.name ? `Innlogget som ${user.name}` : "Innlogget";
    if (loginLink) loginLink.style.display = "none";
    if (friendsLink) friendsLink.style.display = "";
    if (logoutBtn) {
      logoutBtn.style.display = "";
      logoutBtn.addEventListener("click", async () => {
        await fetch("/api/logout.php", { method: "POST", credentials: "include" });
        sessionStorage.removeItem("user");
        window.location.reload();
      });
    }
  } else {
    if (loginLink) loginLink.style.display = "";
    if (friendsLink) friendsLink.style.display = "none";
    if (userInfo) userInfo.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
