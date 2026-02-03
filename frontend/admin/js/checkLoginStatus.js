window.addEventListener("DOMContentLoaded", function () {
  fetch("/api/session/status", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.loggedIn) {
        window.location.href = "/login";
        return;
      }
      // Only show page after auth passes.
      document.body.style.display = "";
    })
    .catch((err) => {
      console.error("Session check failed", err);
      window.location.href = "/login";
    });
});