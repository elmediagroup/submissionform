# EL Media Submission Form

Static page hosted on GitHub Pages. Residents fill in the form and the page sends the email directly through [EmailJS](https://www.emailjs.com) (no email program needed, no backend).

Live URL: https://elmediagroup.github.io/submissionform/

## One-time EmailJS setup (free plan: 200 emails/month)

1. Sign up at https://www.emailjs.com.
2. **Email Services** > Add New Service > connect the mailbox the emails should be sent from (e.g. a Gmail or Outlook account for EL Media). Copy the **Service ID**.
3. **Email Templates** > Create New Template, with:
   - **To Email:** `{{to_email}}`
   - **Reply To:** `{{reply_to}}`
   - **From Name:** `{{from_name}}`
   - **Subject:** `{{subject}}`
   - **Content:** `{{message}}`
   - **Bcc:** `philip@elevatemediagroup.com.au` (optional, gives Philip a copy of every lead)

   Copy the **Template ID**.
4. **Account > General** > copy the **Public Key**.
5. **Account > Security** > restrict allowed origins to `https://elmediagroup.github.io` so the key can't be used from other sites.
6. Paste the three values into the `EMAILJS` block at the top of `script.js`, then commit and push.

The public key is meant to be visible in browser code. Never put a GitHub token or an EmailJS private key in this repo.

## Notes

- Emails are sent from the mailbox connected in EmailJS; the resident's address is set as Reply-To.
- Spam protection: a hidden honeypot field plus EmailJS rate limits. Add EmailJS's reCAPTCHA option if abuse appears.
- The proposal PDF lives in `docs/` and is linked from the form and the email.
