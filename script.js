(function () {
  "use strict";

  var PROPOSAL_URL = "https://elmediagroup.github.io/submissionform/docs/Committee-proposal.pdf";

  var form = document.getElementById("proposal-form");
  var status = document.getElementById("status");
  var el = {
    name: document.getElementById("name"),
    from: document.getElementById("from"),
    to: document.getElementById("to"),
    building: document.getElementById("building"),
    message: document.getElementById("message"),
    link: document.getElementById("include-link")
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      setStatus("Please complete the highlighted fields with valid details.", "error");
      return;
    }

    var name = el.name.value.trim();
    var from = el.from.value.trim();
    var building = el.building.value.trim();

    var subject = "Proposal: digital notice boards" + (building ? " for " + building : "");

    var body = el.message.value.trim();
    if (el.link.checked) {
      body += "\n\nProposal document: " + PROPOSAL_URL;
    }
    body += "\n\nRegards,\n" + name + (building ? "\n" + building : "") + "\n" + from;

    var href = "mailto:" + encodeURIComponent(el.to.value.trim()) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    setStatus("Opening your email program. If nothing opens, check that you have a default email app set up.", "ok");
    window.location.href = href;
  });
})();

