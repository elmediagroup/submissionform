(function () {
  "use strict";

  // --- EmailJS configuration -------------------------------------------------
  // Create a free account at https://www.emailjs.com, connect an email service,
  // create a template, then paste the three values below.
  // The public key is designed to be visible in the browser; restrict it to
  // this site's domain in the EmailJS dashboard (see README.md).
  var EMAILJS = {
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID",
    publicKey: "YOUR_PUBLIC_KEY"
  };
  // ---------------------------------------------------------------------------

  var PROPOSAL_URL = "https://elmediagroup.github.io/submissionform/docs/Committee-proposal.pdf";
  var SUBJECT = "Proposal: digital notice boards for our building";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    return Object.keys(EMAILJS).every(function (k) {
      return EMAILJS[k] && EMAILJS[k].indexOf("YOUR_") !== 0;
    });
  }

  function buildBody(name, from) {
    var body = el.message.value.trim();
    if (el.link.checked) {
      body += "\n\nProposal document: " + PROPOSAL_URL;
    }
    return body + "\n\nRegards,\n" + name + "\n" + from;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Bots fill the hidden field; pretend success and send nothing.
    if (el.honeypot.value) {
      setStatus("Thank you, your email has been sent.", "ok");
      return;
    }

    if (!validate()) {
      setStatus("Please complete the highlighted fields with valid details.", "error");
      return;
    }

    if (!isConfigured()) {
      setStatus("Email sending is not set up yet. Please contact the site owner.", "error");
      return;
    }

    var name = el.name.value.trim();
    var from = el.from.value.trim();

    sendBtn.disabled = true;
    setStatus("Sending...", "");

    fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: EMAILJS.templateId,
        user_id: EMAILJS.publicKey,
        template_params: {
          to_email: el.to.value.trim(),
          from_name: name,
          reply_to: from,
          subject: SUBJECT,
          message: buildBody(name, from)
        }
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
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
