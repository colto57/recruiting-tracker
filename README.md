# Recruiting Website Tracker

This is a lightweight personal recruiting dashboard for:

- Consulting
- Data Science Consulting
- Private Equity

It helps track:

- Networking chats (who, when, industry, notes)
- Job applications (role, links, date applied, status)
- Case study practice
- Daily data science topics
- SQL practice
- LeetCode practice

## Run Locally

Because this app uses browser APIs (`fetch`, `localStorage`, file import/export), run it with a simple local web server instead of opening the file directly.

In PowerShell from this folder:

```powershell
python -m http.server 8080
```

Then open:

`http://localhost:8080`

## Connect to GitHub

Use the **GitHub Sync** card in the app.

1. Create a GitHub Personal Access Token (classic) with `repo` scope.
2. Enter:
   - GitHub username
   - repo name
   - branch (usually `main`)
   - file path (default: `data/recruiting_tracker.json`)
   - token
3. Click **Save Data to GitHub** to push your tracker snapshot.
4. Click **Load Data from GitHub** to restore from repo.

## Data and Privacy Notes

- Tracker data and GitHub settings are stored in your browser `localStorage`.
- The token is used only for API requests from your browser to GitHub.
- If you use shared machines, click **Clear Saved GitHub Settings** when done.


