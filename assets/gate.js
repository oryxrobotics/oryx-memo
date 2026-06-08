/*
 * Oryx Investment Memo — password gate. Same system as the strategy portal.
 * The confidential content ships only as ciphertext (assets/data.enc.js); this
 * screen takes a password, derives an AES-256-GCM key with PBKDF2-SHA256, and
 * decrypts in the browser. Wrong password = nothing to read. Used only in the
 * deployed (encrypted) build; the dev build loads plaintext data.js directly.
 */
(function () {
  "use strict";
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  function toTop() {
    var h = document.documentElement, prev = h.style.scrollBehavior;
    h.style.scrollBehavior = "auto"; window.scrollTo(0, 0); h.style.scrollBehavior = prev;
  }
  var ENC = window.ORYX_MEMO_ENC;
  if (!ENC) return; // plaintext build — nothing to gate

  function b64ToBytes(s) {
    var bin = atob(s), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }

  async function decrypt(password) {
    var enc = new TextEncoder();
    var baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64ToBytes(ENC.salt), iterations: ENC.iter, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(ENC.iv) }, key, b64ToBytes(ENC.ct));
    return new TextDecoder().decode(plain);
  }

  function reveal(json) {
    window.ORYX_MEMO = JSON.parse(json);
    var ov = document.getElementById("gate");
    if (ov) ov.parentNode.removeChild(ov);
    document.body.style.overflow = "";
    if (typeof window.__oryxMount === "function") window.__oryxMount();
    toTop(); requestAnimationFrame(toTop); setTimeout(toTop, 80);
  }

  function buildOverlay() {
    var ov = document.createElement("div");
    ov.id = "gate";
    ov.innerHTML =
      '<div class="gate-card">' +
        '<div class="gate-lock" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
        '<div class="gate-word">Investment Memo</div>' +
        '<div class="gate-title">Confidential — Oryx Robotics</div>' +
        '<div class="gate-sub">Enter the access password to continue.</div>' +
        '<form id="gate-form" autocomplete="off">' +
          '<input id="gate-pw" type="password" placeholder="Access password" autocomplete="off" autofocus />' +
          '<button id="gate-go" type="submit">Unlock</button>' +
          '<div id="gate-err" class="gate-err"></div>' +
        "</form>" +
        '<div class="gate-foot">Confidential · do not share</div>' +
      "</div>";
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";

    var form = document.getElementById("gate-form");
    var input = document.getElementById("gate-pw");
    var btn = document.getElementById("gate-go");
    var err = document.getElementById("gate-err");

    async function attempt(pw, silent) {
      err.textContent = "";
      btn.disabled = true;
      btn.textContent = "Unlocking…";
      try {
        var json = await decrypt(pw);
        try { sessionStorage.setItem("oryx_memo_pw", pw); } catch (e) {}
        reveal(json);
      } catch (e) {
        btn.disabled = false;
        btn.textContent = "Unlock";
        if (!silent) {
          err.textContent = "Incorrect password.";
          input.value = "";
          input.focus();
          try { sessionStorage.removeItem("oryx_memo_pw"); } catch (e2) {}
        }
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value) attempt(input.value, false);
    });

    var saved = null;
    try { saved = sessionStorage.getItem("oryx_memo_pw"); } catch (e) {}
    if (saved) attempt(saved, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildOverlay);
  } else {
    buildOverlay();
  }
})();
