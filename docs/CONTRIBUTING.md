\# Contributing to Syncro Platform



Welcome to the Syncro project 👋  

This document explains how new collaborators should work on this repository.



---



\## 1. First-time Setup



\### Clone the repository

```bash

git clone https://github.com/<repo-owner>/syncro-platform.git

cd syncro-platform

Pull latest changes before starting work
git pull origin main

2. Project Structure

/frontend → Frontend (React / Next.js)

/backend → Backend API (Node + Express)

/database → SQL schemas and seed data

/docs → Documentation (DO NOT delete files)

Only work inside the folder assigned to you.

3. How to Work on Features

Make sure you are on main

git checkout main
git pull origin main


Create a new branch

git checkout -b feature/your-feature-name


Example:

git checkout -b feature/rfp-creation


Work only on your assigned feature

4. Committing Rules

Commit small changes

Use clear messages

Good commit messages:

Add RFP creation API

Create bid submission form

Fix validation for login

Bad commit messages:

update

changes

final

Commit example:

git add .
git commit -m "Add bid submission endpoint"

5. Pushing Your Work

Push your branch:

git push origin feature/your-feature-name


Then create a Pull Request on GitHub.

6. What NOT to Do

❌ Do NOT push:

node_modules

.env files

passwords or API keys

❌ Do NOT push directly to main without review
❌ Do NOT delete files in /docs

7. Need Help?

Ask the team lead before:

Merging to main

Making large structural changes

Happy coding 🚀


---

## ❌ What NOT to copy

Do **NOT** copy:
- The words **“Copy code”**
- The label **`md`**
- Any instructions outside the code block

Only copy the **actual Markdown text** above.

---

## ✅ After copying (don’t skip this)

1. **Save** the file  
2. Close Notepad  
3. In terminal, run:
```bat
git status


You should see:

new file: docs/CONTRIBUTING.md


Then commit and push:

git add docs/CONTRIBUTING.md
git commit -m "Add contributing guide for collaborators"
git push origin main




