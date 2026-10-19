/**
 * Receives the submission form POST and sends the email to the committee
 * address entered by the resident, with the resident as the visible sender
 * (display name) and reply-to. Deploy as a Web app (see ../README.md).
 *
 * Note: the technical "From" address is always the Google account that owns
 * this script. Gmail does not let a script send as an arbitrary address
 * (that would be spoofing and would fail SPF/DKIM/DMARC checks).
 *
 * Nothing secret lives in this file; credentials stay in your Google account.
 */

var PDF_URL = "https://elmediagroup.github.io/submissionform/docs/Committee-proposal.pdf";
var PDF_NAME = "Committee-proposal.pdf";
var COPY_TO = "philip@elevatemediagroup.com.au"; // BCC on every email ("" to disable)
var SUBJECT = "Proposal: digital notice boards for our building";
var MAX_PER_SENDER_PER_HOUR = 3;   // same resident email address
var MAX_PER_RECIPIENT_PER_6H = 2;  // same committee email address (cache lifetime caps this at 6h)
var MAX_MESSAGE_LENGTH = 5000;

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (p.website) return json_({ ok: true });

  var name = clean_(p.name, 100);
  var from = clean_(p.from, 200).toLowerCase();
  var to = clean_(p.to, 200).toLowerCase();
  var message = String(p.message || "").trim();

  if (!name || !EMAIL_RE.test(from) || !EMAIL_RE.test(to) || !message) {
    return json_({ ok: false, error: "invalid" });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json_({ ok: false, error: "too_long" });
  }
  if (MailApp.getRemainingDailyQuota() < 2) {
    return json_({ ok: false, error: "quota" });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (limited_("s:" + from, MAX_PER_SENDER_PER_HOUR, 3600) ||
        limited_("r:" + to, MAX_PER_RECIPIENT_PER_6H, 21600)) {
      return json_({ ok: false, error: "rate_limited" });
    }
  } finally {
    lock.releaseLock();
  }

  // Sender shows as the resident's name; replies go to the resident's address.
  var options = {
    to: to,
    replyTo: from,
    name: name,
    subject: SUBJECT,
    body: message
  };
  if (COPY_TO) options.bcc = COPY_TO;

  if (p.attach) {
    try {
      var res = UrlFetchApp.fetch(PDF_URL, { muteHttpExceptions: true });
      if (res.getResponseCode() !== 200) throw new Error("HTTP " + res.getResponseCode());
      options.attachments = [res.getBlob().setName(PDF_NAME)];
    } catch (err) {
      return json_({ ok: false, error: "attachment_failed" });
    }
  }

  try {
    MailApp.sendEmail(options);
  } catch (err) {
    return json_({ ok: false, error: "send_failed" });
  }
  return json_({ ok: true });
}

// Opening the web app URL in a browser shows this, handy to confirm deployment.
function doGet() {
  return json_({ ok: true, service: "EL Media submission form" });
}

function clean_(value, max) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().substring(0, max);
}

// Counts events per key in the script cache (max cache lifetime is 6 hours).
function limited_(key, max, seconds) {
  var cache = CacheService.getScriptCache();
  var n = parseInt(cache.get(key) || "0", 10);
  if (n >= max) return true;
  cache.put(key, String(n + 1), seconds);
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
