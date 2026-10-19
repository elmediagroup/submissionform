# EL Media Submission Form â€“ Project Plan

## 1. Goal
Build a very simple submission form for EL Media Group, a marketing company that deploys notification screens. Host it for free on GitHub.

- Repo: https://github.com/elmediagroup/submissionform.git
- Hosting: GitHub Pages (static, free)

## 2. Scope
**In scope**
- A single-page web form (HTML/CSS/vanilla JS, no build step)
- Client-side validation and a confirmation message
- Delivery of submissions to EL Media (see section 5)

**Out of scope (for now)**
- User accounts / login
- Admin dashboard
- Custom backend server

## 3. Security notes (read first)
- The GitHub Personal Access Token (PAT) is stored in plain text in `patcode.md`. **It must never be committed or pushed.**
  - Add `patcode.md` to `.gitignore` before the first `git add`.
  - Because the token has already been shared in plain text (including in this chat), consider rotating it once setup is done.
  - Use a fine-grained PAT scoped only to the `submissionform` repo (Contents: read/write, Pages as needed).
- **Never put the PAT in the form's JavaScript.** GitHub Pages is public; anything in client code is visible to every visitor.
- The PAT is only for us (developers) to push code to the repo.

## 4. Proposed structure
```
submissionform/
â”œâ”€â”€ index.html      # the form
â”œâ”€â”€ styles.css      # styling
â”œâ”€â”€ script.js       # validation + submit handler
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ Committee-proposal.pdf   # proposal, published on the site
â”œâ”€â”€ README.md       # usage / deployment notes
â”œâ”€â”€ PLAN.md         # this document
â””â”€â”€ .gitignore      # includes patcode.md
```

## 5. Key decision: where do submissions go?
GitHub Pages only serves static files, so it cannot receive form data by itself. Options:

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **A. Form service (Formspree, Web3Forms, Getform)** | Free tier | Simplest; emails submissions; spam protection | Third-party dependency; free-tier limits |
| **B. Google Apps Script â†’ Google Sheet** | Free | Submissions land in a spreadsheet | Slightly more setup |
| **C. `mailto:` link** | Free | Zero setup | Unreliable, relies on user's mail client |
| **D. GitHub Issues via serverless proxy** | Free (needs proxy) | Submissions tracked in repo | Needs a proxy to hide the token; more complex |

**Recommendation:** Option A (or B if they want a spreadsheet). Decision: _TBD_.

## 6. Form fields (draft â€“ to confirm)
- Name
- From: Email
- To: Committee Email:
- Message (multi line text field). 
- Prepopulate text field with:"Dear Committee members. I would like the committee to consider a proposal for digital notice boards in our lobby and lift areas. The screens could improve how building notices, maintenance updates and committee information are shared with residents, while also creating an annual revenue stream that may support building and maintenance works.

Depending on the number of floors and number of screens we can potentially see thousands of dollars be added to our bottom line. 

Can you please reach out to philip@elevatemediagroup.com.au for a detailed quote and add his proposal to the agenda of the next committee meeting?"
- Checkbox: "Include link to the proposal document in the email"
  - `mailto:` cannot attach files, so the checkbox appends a public link to the document in the email body.
  - The document is published on the site (GitHub Pages) from the `/docs` folder so people can **view and download it before sending**.
  - The page shows a "View / download proposal" link next to the checkbox.
  - Public URL (once live): `https://elmediagroup.github.io/submissionform/docs/Committee-proposal.pdf`
  - It is a PDF, so browsers can preview it in-page or in a new tab, and users can download it.
- Submit button (opens the user's email client with To / Subject / Body prefilled)

_Confirm the actual fields with EL Media._

## 7. Steps
1. [x] Confirm form fields and submission destination (section 5/6)
   - [x] Proposal PDF created and placed in `/docs` (`Committee-proposal.pdf`)
2. [x] Initialise local git repo in `elsubmissionform/`, add `.gitignore` (with `patcode.md`)
3. [x] Connect remote `https://github.com/elmediagroup/submissionform.git` using the PAT
4. [x] Build `index.html`, `styles.css`, `script.js`
5. [x] Submission via `mailto:` (no backend needed)
6. [x] Test locally (validation, success/error states, mobile layout)
7. [x] Push to `main` (this also publishes the `/docs` proposal files)
8. [ ] Enable GitHub Pages (Settings â†’ Pages â†’ deploy from `main` / root)
9. [ ] Test the live URL (`https://elmediagroup.github.io/submissionform/`)
10. [ ] Rotate the PAT and hand over documentation

## 8. Open questions
- Repo is public
- Branding: logo, colours, fonts? Get it from: https://www.elevatemediagroup.com.au/
- Proposal PDF reviewed: no confidential client data. Public pricing ($300â€“$800+ per screen/year) is already in it; the email message says "thousands of dollars", so confirm the wording is consistent.


## 9. Change log
| Date | Change |
|---|---|
| _initial_ | Plan created |
| _update_ | Proposal document in `/docs` to be published on the site and linked from the email |
| _update_ | PDF supplied (`docs/Committee-proposal.pdf`); `.docx` removed; plan updated |
| _update_ | Form built (mailto approach, building name field added), pushed to main. Pages must be enabled manually: PAT lacks Pages permission |

