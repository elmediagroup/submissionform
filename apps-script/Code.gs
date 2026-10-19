/**
 * Receives the submission form POST and sends the email from the Google
 * account that owns this script. Deploy as a Web app (see ../README.md).
 *
 * Nothing secret lives in this file; credentials stay in your Google account.
 */

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

  var footer = "\n\n---\nSent via the Elevate Media Group submission form on behalf of " +
    name + " <" + from + ">. Reply to this email to respond to them directly.";

  var options = {
    to: to,
    replyTo: from,
    name: name + " via Elevate Media Group",
    subject: SUBJECT,
    body: message + footer
  };
  if (COPY_TO) options.bcc = COPY_TO;

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
