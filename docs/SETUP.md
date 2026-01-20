\# Syncro – Local Setup Guide



This guide explains how to set up and run Syncro on your local machine.



---



\## Prerequisites



\- Node.js (LTS)

\- Git

\- PostgreSQL

\- Code editor (VS Code recommended)



---



\## 1. Clone the Repository



```bash

git clone https://github.com/<repo-owner>/syncro-platform.git

cd syncro-platform

2\. Backend Setup

cd backend

npm install

npm run dev

3\. Frontend Setup

Open a new terminal:



cd frontend

npm install

npm start

4\. Database Setup

Create a PostgreSQL database called syncro



Run the SQL script in database/schema.sql



5\. Environment Variables

Create a .env file in /backend (DO NOT commit this):



DATABASE\_URL=postgresql://user:password@localhost:5432/syncro

Done 🎉

You should now be able to access the app locally.





Save and close.



\### Commit and push

```bat

git add docs/SETUP.md

git commit -m "Add local setup guide for collaborators"

git push origin main

