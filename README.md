# Amey Thakare: Portfolio

## Preview it

Double-click **`start.command`**. It starts a local server and opens the site in your browser.
(Opening `index.html` directly will not work, because browsers block local pages from reading `data.json`.)

## Edit the content

Everything on the page comes from **`data.json`**. Edit it, save, refresh the browser. No code changes needed.

| To change | Edit in `data.json` |
|---|---|
| Name, headline, summary, email, LinkedIn, GitHub, phone, photo, resume file, the Now/Before lines | `profile` |
| Section titles and intros | `sections` |
| The four target roles, their headlines and proof points | `roles` |
| The big numbers under the hero | `stats` |
| The slides in the "30-second overview" | `overview` |
| Jobs and bullets | `experience` |
| Case study cards and their popups | `projects` |
| Skill groups | `skills` |
| Clubs and leadership | `leadership` |
| Degrees | `education` |
| Award cards | `honors` |
| Certifications, languages | `certifications`, `languages` |

### Add a project

Copy one block inside `"projects": [ ... ]`, paste it after a comma, and change the values:

```json
{
  "title": "Project name",
  "context": "Course · Client type",
  "period": "Jan 2027 – Mar 2027",
  "status": "In progress",
  "summary": "One sentence shown on the card.",
  "bullets": ["What you did, with a **bold number** if you have one"],
  "metrics": [{ "value": "30%", "label": "what the number means" }],
  "flow": ["Step one", "Step two", "Step three", "Outcome"],
  "tags": ["SQL", "Power BI"],
  "roles": ["program", "data"],
  "link": "https://github.com/..."
}
```

The card shows the summary, tags and the first metric. Clicking it opens the popup with the bullets, all metrics and the flow.

`status`, `metrics`, `flow`, `tags`, `roles` and `link` are all optional. Leave `link` as `""` if there is nothing to link to.

### Add a job or a position

Add a block to `"experience"` (a new company) or to a company's `"positions"` (a new title at the same company). Each bullet is `{ "text": "...", "roles": [...] }`, or just a plain `"string"`.

### Things to know

- **Role tags.** `"roles": ["program", "project", "product", "data"]` decides what stays highlighted when a visitor picks a role. The ids must match the `id` values in the `roles` list. Items with no `roles` are never dimmed.
- **Emphasis.** Inside any text, `**text**` is bold and `*text*` is italic and accent-colored.
- **Role links.** Add `?role=program`, `?role=project`, `?role=product` or `?role=data` to the URL to open the site already tailored to that role. Useful when sending the link to a recruiter for a specific job.
- **Photo and resume.** Replace the files in `assets/`, or point `profile.headshot` and `profile.resumeFile` at new file names.
- **Empty sections disappear.** Delete all items from a list (leave `[]`) and that section and its nav link are hidden.
- **JSON is strict.** Commas between items, no comma after the last one, double quotes only. If the page shows an error after an edit, it tells you what the parser tripped on.

## Put it online

The text that shows when the link is shared (LinkedIn, Slack, search results) is in the `<meta>` tags at the top of `index.html`, since link previews cannot read `data.json`. Update it there if your headline changes, and change `og:image` to a full `https://` address once you know your domain.

The folder is a plain static site. Upload it as-is to GitHub Pages, Netlify (drag and drop the folder), or Vercel. You do not need `start.command` or this README online.

Your phone number is shown in the contact section and is in the resume PDF. Set `profile.phone` to `""` if you would rather not publish it.
