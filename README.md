# EL Media Submission Form

Static page hosted on GitHub Pages. A resident fills in the form and a small Google Apps Script web app sends the email to their committee. No email program, no server to run, and no credentials in this repo.

- Live URL: https://elmediagroup.github.io/submissionform/
- Repo: https://github.com/elmediagroup/submissionform

## How it works

1. The page (`index.html`, `styles.css`, `script.js`) validates the form and POSTs it to the Apps Script web app (`WEB_APP_URL` in `script.js`).
2. The script (`apps-script/Code.gs`) validates again, applies the rate limits, and sends the email with `MailApp`:
   - **To:** the committee email entered by the resident
   - **Sender name and reply-to:** the resident's name and email address
   - **Body:** exactly the message the resident wrote, plus the sign-off added by the page
   - **Attachment:** `docs/Committee-proposal.pdf`, when the checkbox is ticked (the script downloads it from the published site)
   - **BCC:** a copy to `COPY_TO` (set to `""` to disable)
3. The page shows a success or error message from the script's JSON reply.

The technical "From" address is always the Google account that owns the script. Gmail does not allow a script to send as an arbitrary address, and doing so would fail spam checks (SPF, DKIM, DMARC).

## Why Apps Script and not SMTP?

Browsers cannot open SMTP connections, and putting a Google SMTP password in the page would expose it to every visitor. Apps Script runs on Google's servers under your account, so the page only needs a public web app URL.

## One-time setup (about 5 minutes)

Use the Google account the emails should be sent **from**.

1. Go to https://script.google.com and click **New project**. Name it `EL Media submission form`.
2. Replace the contents of `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs). Adjust `COPY_TO`, `SUBJECT` and the limits if you like.
3. In the editor, select `doGet` and click **Run**. Approve the permission prompts (send email, and connect to an external service for the PDF). On the "Google hasn't verified this app" screen choose **Advanced > Go to project**.
4. Click **Deploy > New deployment > Select type (gear) > Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`). Opening it in a browser should show `{"ok":true,...}`.
6. Paste it into `WEB_APP_URL` at the top of `script.js`, then commit and push.

## Making changes

- **Page changes** (`index.html`, `styles.css`, `script.js`): commit and push to `main`; GitHub Pages updates in about a minute. When you change `script.js` or `styles.css`, bump the `?v=` number on their tags in `index.html` so browsers do not use a cached copy. A stale `script.js` against a newer `index.html` makes the form hang on "Sending...".
- **Script changes** (`apps-script/Code.gs`): editing the file in this repo does not change the live script. Paste it into the Apps Script project, then use **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy**. The URL stays the same. If you added a new permission (for example the PDF download), run `doGet` once in the editor first to approve it.
- **Proposal PDF**: replace `docs/Committee-proposal.pdf` and push. The page link and the email attachment both use that file.

## Limits and abuse protection

All set at the top of `apps-script/Code.gs`:

| Setting | Default | Meaning |
|---|---|---|
| `MAX_PER_SENDER_PER_HOUR` | 3 | Sends per resident email address per hour |
| `MAX_PER_RECIPIENT_PER_6H` | 2 | Sends per committee email address per 6 hours |
| `MAX_MESSAGE_LENGTH` | 5000 | Maximum message characters |

- Counts are kept in Apps Script's script cache, which holds values for at most 6 hours. That is why the committee limit is per 6 hours, not per day.
- A hidden honeypot field catches simple bots; their submissions are silently ignored.
- The script also stops when Google's daily sending quota is nearly used: about 100 emails/day on free Gmail, about 1,500/day on Google Workspace.
- If abuse appears, tighten the limits in `Code.gs` or add reCAPTCHA.

**Testing tip:** repeated tests with the same addresses hit the limits and the page shows "Too many emails have been sent to or from these addresses recently." Wait it out, use different addresses, or temporarily raise the limits (and lower them again before going live).

## Security notes

- The web app URL is a public endpoint, not a secret. Never put a GitHub token or Google password in this repo.
- `patcode.md` (a GitHub token) is git-ignored and must never be committed. Rotate the token if it has been shared. A new fine-grained token needs Contents read/write on this repo only.
- The email text comes from the visitor. The script sends it as plain text only and strips line breaks from the name and addresses.

## Project files

```
index.html                 the form
styles.css                 styling (Elevate Media look)
script.js                  validation + submit to the web app
apps-script/Code.gs        server-side sender (paste into Google Apps Script)
docs/                      proposal PDF and logos, published on the site
PLAN.md                    project plan and change log
```
