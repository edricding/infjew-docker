// ç»å½æé®äºä»¶çå¬
const loginSubmitBtn = document.getElementById("login-submit-btn");

function handleLogin() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    console.log("è¯·è¾å¥ç¨æ·ååå¯ç ?);
    return;
  }

  fetch("/api/AuthLogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ð åè®¸æºå¸¦ cookie
    body: JSON.stringify({ username: username, password: password }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response data:", data);
      if (data.success) {
        console.log("Login successful");
        window.location.href = "https://dashboard.infjew.com";
      } else {
        console.log("Error:", data.message);
        document.getElementById("login-username").value = "";
        document.getElementById("login-password").value = "";
      }
    })
    .catch((err) => {
      console.error("Login error:", err);
    });
}

if (loginSubmitBtn) {
  // ç¹å»æé®è§¦å
  loginSubmitBtn.addEventListener("click", handleLogin);

  // æä¸åè½¦ä¹è§¦åï¼çå¬è¾å¥æ¡ï¼
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");

  [usernameInput, passwordInput].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          handleLogin();
        }
      });
    }
  });
}

// ç»åºæé®äºä»¶çå¬
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    fetch("/api/AuthLogout", {
      method: "POST", // ä½¿ç¨ POST æ¹æ³
      headers: {
        "Content-Type": "application/json", // è®¾ç½®è¯·æ±å¤´ï¼æå®åå®¹æ ¼å¼ä¸?JSON
      },
      credentials: "include", // ð åè®¸æºå¸¦ cookie
    })
      .then((response) => response.json()) // è§£æ JSON ååº
      .then((data) => {
        if (data.success) {
          console.log("Logout successful");
          window.location.href = "/login";
          // è¿éå¯ä»¥æ¸é¤åç«¯çç¨æ·ç¶æï¼ä¾å¦å é¤å­å¨ç?token ææ¸ç©ºç¨æ·ä¿¡æ?
        } else {
          console.log("Error:", data.message);
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
      });
  });
}
