(function () {
  "use strict";

  // Paste the Web app URL from Google Apps Script here (see README.md).
  // It is a public endpoint, not a secret; limits are enforced server-side.
  var WEB_APP_URL = "YOUR_WEB_APP_URL";

  var PROPOSAL_URL = "https://elmediagroup.github.io/submissionform/docs/Committee-proposal.pdf";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var ERRORS = {
    rate_limited: "Too many emails have been sent to or from these addresses recently. Please try again later.",
    quota: "We can't send any more emails right now. Please try again tomorrow."
  };

  var form = document.getElementById("proposal-form");
  var status = document.getElementById("status");
  var sendBtn = document.getElementById("send");
  var el = {
    name: document.getElementById("name"),
    from: document.getElementById("from"),
    to: document.getElementById("to"),
    message: document.getElementById("message"),
    link: document.getElementById("include-link"),
    honeypot: document.getElementById("website")
  };

  function setStatus(text, type) {
    status.textContent = text;
    status.className = type || "";
  }

  function validate() {
    var checks = [
      { el: el.name, ok: el.name.value.trim() !== "" },
      { el: el.from, ok: EMAIL_RE.test(el.from.value.trim()) },
      { el: el.to, ok: EMAIL_RE.test(el.to.value.trim()) },
      { el: el.message, ok: el.message.value.trim() !== "" }
    ];
    var firstBad = null;
    checks.forEach(function (c) {
      c.el.classList.toggle("invalid", !c.ok);
      if (!c.ok && !firstBad) firstBad = c.el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function isConfigured() {
    return WEB_APP_URL.indexOf("https://script.google.com/") === 0;
  }

  function buildMessage() {
    var body = el.message.value.trim();
    if (el.link.checked) {
      body += "\n\nProposal document: " + PROPOSAL_URL;
    }
    return body + "\n\nRegards,\n" + el.name.value.trim() + "\n" + el.from.value.trim();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      setStatus("Please complete the highlighted fields with valid details.", "error");
      return;
    }

    if (!isConfigured()) {
      setStatus("Email sending is not set up yet. Please contact the site owner.", "error");
      return;
    }

    sendBtn.disabled = true;
    setStatus("Sending...", "");

    // URL-encoded body = a "simple" request, so no CORS preflight is needed.
    var data = new URLSearchParams({
      name: el.name.value.trim(),
      from: el.from.value.trim(),
      to: el.to.value.trim(),
      message: buildMessage(),
      website: el.honeypot.value
    });

    fetch(WEB_APP_URL, { method: "POST", body: data })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (result) {
        if (!result.ok) {
          setStatus(ERRORS[result.error] || "Sorry, the email could not be sent. Please check the details and try again.", "error");
          return;
        }
        setStatus("Thank you, your email has been sent to the committee.", "ok");
        form.reset();
      })
      .catch(function () {
        setStatus("Sorry, the email could not be sent. Please try again later.", "error");
      })
      .then(function () {
        sendBtn.disabled = false;
      });
  });
})();
