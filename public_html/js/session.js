async function getSession() {
  try {
    const res = await fetch("/backend/session_status.php", { credentials: "include" });
    const data = await res.json();
    return data.ok ? data.user : null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getSession();
  const userInfo = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");

  if (user) {
    if (userInfo) userInfo.textContent = user.name ? `Innlogget som ${user.name}` : "Innlogget";
    if (loginLink) loginLink.style.display = "none";
  } else {
    if (loginLink) loginLink.style.display = "";
  }

  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await fetch("/backend/logout.php", { method: "POST", credentials: "include" });
    sessionStorage.removeItem("user");
    window.location.reload();
  });
});
