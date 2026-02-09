;(function (window) {
  "use strict";

  var RECAPTCHA_SITE_KEY = "6LeLHmAsAAAAAIMDu4IcbDpVMrSn0QU4u0EyKHVr";
  var isRedirecting = false;
  var initialized = false;

  function showMsg(el, msg) {
    if (!el) {
      return;
    }

    if (!msg) {
      el.style.display = "none";
      el.textContent = "";
      return;
    }

    el.textContent = msg;
    el.style.display = "block";
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function redirectToDashboardOnce() {
    if (isRedirecting) {
      return;
    }

    isRedirecting = true;
    window.location.replace("/");
  }

  function checkSessionReadyOnce() {
    return fetch("/api/session/require", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(function (res) {
        return res.status === 204;
      })
      .catch(function () {
        return false;
      });
  }

  function redirectToDashboardWhenReady(maxAttempts, delayMs) {
    var maxTry = typeof maxAttempts === "number" ? maxAttempts : 8;
    var waitMs = typeof delayMs === "number" ? delayMs : 250;
    var attempt = 0;

    function loop() {
      return checkSessionReadyOnce().then(function (ready) {
        if (ready) {
          redirectToDashboardOnce();
          return true;
        }

        attempt += 1;
        if (attempt >= maxTry) {
          return false;
        }

        return delay(waitMs).then(loop);
      });
    }

    return loop();
  }

  function submitLogin(context) {
    var btn = context.btn;
    if (btn.disabled) {
      return;
    }

    showMsg(context.userMsgEl, "");
    showMsg(context.passMsgEl, "");
    showMsg(context.generalMsgEl, "");

    var username = (context.usernameEl.value || "").trim();
    var password = context.passwordEl.value || "";
    var hasError = false;

    if (!username) {
      showMsg(context.userMsgEl, "Please enter your username.");
      hasError = true;
    }
    if (!password) {
      showMsg(context.passMsgEl, "Please enter your password.");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    btn.disabled = true;

    if (!window.grecaptcha || typeof window.grecaptcha.ready !== "function") {
      showMsg(context.generalMsgEl, "reCAPTCHA not ready.");
      btn.disabled = false;
      return;
    }

    window.grecaptcha.ready(function () {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "login" })
        .then(function (token) {
          return fetch("/api/AuthLogin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              username: username,
              password: password,
              recaptchaToken: token,
            }),
          });
        })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.success) {
            return redirectToDashboardWhenReady(8, 250).then(function (redirected) {
              if (!redirected) {
                showMsg(context.generalMsgEl, "Login succeeded, but session is not ready. Please retry.");
              }
            });
          }

          showMsg(context.generalMsgEl, (data && data.message) || "Login failed");
        })
        .catch(function (err) {
          console.error("Login failed", err);
          showMsg(context.generalMsgEl, "Login failed");
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  }

  function initYear() {
    var yearEl = document.getElementById("login-current-year");
    if (!yearEl) {
      return;
    }
    yearEl.textContent = String(new Date().getFullYear());
  }

  function initLoginPage() {
    var btn = document.getElementById("login-submit-btn");
    var usernameEl = document.getElementById("login-username");
    var passwordEl = document.getElementById("login-password");
    var userMsgEl = document.getElementById("login-username-msg");
    var passMsgEl = document.getElementById("login-password-msg");
    var generalMsgEl = document.getElementById("login-general-msg");
    var loginForm = document.querySelector("form.needs-validation");

    if (!btn || !usernameEl || !passwordEl) {
      return;
    }

    var context = {
      btn: btn,
      usernameEl: usernameEl,
      passwordEl: passwordEl,
      userMsgEl: userMsgEl,
      passMsgEl: passMsgEl,
      generalMsgEl: generalMsgEl,
    };

    checkSessionReadyOnce().then(function (ready) {
      if (ready) {
        redirectToDashboardOnce();
      }
    });

    btn.addEventListener("click", function () {
      submitLogin(context);
    });

    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        submitLogin(context);
      });
    }

    passwordEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitLogin(context);
      }
    });
  }

  function initialize() {
    if (initialized) {
      return;
    }
    initialized = true;

    initYear();
    initLoginPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})(window);
