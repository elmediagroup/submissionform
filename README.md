# EL Media Submission Form

Static page hosted on GitHub Pages. Residents fill in the form and the email is sent from EL Media's Google account by a small Google Apps Script web app (no email program needed, no server to run, no credentials in this repo).

Live URL: https://elmediagroup.github.io/submissionform/

## Why Apps Script and not SMTP?

Browsers cannot open SMTP connections, and putting a Google SMTP password in the page would expose it to every visitor. Apps Script runs on Google's servers under your account, so the page only needs a public web app URL.

## One-time setup (about 5 minutes)

Use the Google account the emails should be sent **from** (a shared EL Media Gmail / Google Workspace account is ideal).

1. Go to https://script.google.com and click **New project**. Name it `EL Media submission form`.
2. Replace the contents of `Code.gs` with the contents of [`apps-script/Code.gs`](apps-script/Code.gs) in this repo. Adjust `COPY_TO` (BCC copy of every lead, `""` to disable) and the limits if you like.
3. Click **Deploy > New deployment > Select type (gear) > Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy** and approve the permission prompts (the script needs to send email as you; on the "Google hasn't verified this app" screen choose **Advanced > Go to project**).
4. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`). Opening it in a browser should show `{"ok":true,...}`.
5. Paste it into `WEB_APP_URL` at the top of `script.js`, then commit and push.

If you change `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the same URL serves the updated code.

## Limits and abuse protection

- Sends from your Google account: about 100 emails/day on a free Gmail account, about 1,500/day on Google Workspace.
- The script limits each resident email address to 3 sends per hour and each committee address to 2 per 6 hours, ignores submissions that fill the hidden honeypot field, and caps the message length. The email shows the resident's name as the sender and uses the resident's address as reply-to; no extra text is added to the body.
- Replies from committees go to the resident; Philip gets a BCC copy.
- If abuse appears, tighten the limits in `Code.gs` or add reCAPTCHA.

## Notes

- The web app URL is a public endpoint, not a secret. Never put a GitHub token or Google password in this repo.
- The proposal PDF lives in `docs/` and is linked from the form and the email.
