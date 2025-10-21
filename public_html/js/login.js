document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const errors = document.getElementById("error-messages");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errors) errors.textContent = "";

    const email = document.getElementById("email")?.value?.trim() || "";
    const password = document.getElementById("password")?.value || "";

    try {
      const res = await fetch("/backend/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Innlogging feilet");

      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (err) {
      if (errors) errors.textContent = String(err.message || err);
    }
  });
});
