# Quick Teams — Seamless Team Formation & Collaboration

[![Live Demo](https://img.shields.io/badge/Live_Website-Render-informational?style=flat&logo=render&color=3b82f6)](https://quick-teams-web-app.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.14%2B-informational?logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Framework-informational?logo=flask)](https://flask.palletsprojects.com/)

**Quick Teams** is an elegant, highly customized platform built to solve the hardest part of hackathons: **finding the right teammates and organizing projects lightning-fast**. 

Recent major updates have transformed the platform into a true "Group Workspace" hub featuring advanced Team Rosters, relevance-based smart search, and a beautiful Unstop-inspired Flat UI.

---

## 🌟 Core Features

### 1. Robust Multi-Admin Team Engine
Gone are the days of random peer-to-peer chats. Teams are now formalized, controllable workspaces.
- **Create Dedicated Teams:** Build a team featuring a distinct **Name** and **Project Description/Pitch**.
- **Admin Control Panel:** The creator automatically holds an `[Admin]` badge. Admins can selectively promote other team members to administrators, or explicitly kick people out of the team to free up slots.
- **Specific Invites:** When browsing for talent, Admins use a clean interface to send invites specifically mapped to a single team they administer.

### 2. Relevance-Based Smart Search
Finding users is no longer a blind scroll. The backend powers a multi-word, case-insensitive scoring algorithm.
- Need a team member? Search something like: `"Java Python backend"`. 
- The algorithm tokenizes your query, checks user profiles, and awards points based on exact matching, partial matching, and direct ID hits, sorting the highest-scoring talent perfectly to the top of your radar.

### 3. Comprehensive User Profiles
Profiles now serve as true developer resumes.
- **About Me Pitch:** Write a mini-bio describing exactly what you want to build so Admins know why they should recruit you.
- **Skill Tokenization:** Skills are entered and displayed as pristine visual tags, not chunky text arrays. 
- **Availability Toggle:** Easily switch your status to "Looking for a team" or "Just browsing". Users who aren't actively searching won't aggressively clog up the global Match radar.

### 4. Flawless Modern UI/UX (Light & Dark Mode)
The entire aesthetic overhaul mimics high-tier professional developer platforms (like *Unstop*). 
- **Light Theme Default:** High legibility with crisp white backgrounds, soft card shadows, and vibrant orange/blue interface elements.
- **Native Dark Mode:** A powerful 🌓 toggle built right into the navigation bar dynamically swaps CSS Root variables across the entire application for coders running late-night sessions.
- **Toast Notifications:** Clean, slide-in flash alerts confirm all your database actions securely at the top right of the screen.

### 5. Private Live Team Chat
Every single team workspace comes directly bundled with an encrypted message board where members can rapidly dump links, exchange contact data, and brainstorm architectures.

---

## 🛠️ Technology Stack
- **Backend:** Python + Flask
- **Database Architecture:** SQLAlchemy (PostgreSQL on Production, SQLite locally)
- **Authentication:** Werkzeug Password Hashing + Flask-Login securely tracking User Sessions
- **Frontend Layer:** Semantic HTML5, Vanilla JavaScript DOM Manipulation, Advanced CSS3 custom properties & Flexbox grids

---

## 🚀 Live Environment
The project actively deploys via GitHub CI/CD continuous integration schemas to **Render**.

🌐 **Visit Live Application:** [Quick Teams Web App](https://quick-teams-web-app.onrender.com)

---

## 💻 Local Development Setup

We highly recommend utilizing a python virtual environment to build securely:

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/SHIV24116/Quick-Teams-web-app.git
   cd Quick-Teams-web-app
   ```

2. **Initialize Environment:**
   ```bash
   python -m venv venv
   
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Requirements:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   For local testing without PostgreSQL, use SQLite:
   ```bash
   $env:DATABASE_URL="sqlite:///app.db"  # Windows standard
   ```

5. **Start Flask Server:**
   ```bash
   python app.py
   ```
   *Note: Database tables and structural migrations securely autogenerate based on SQLAlchemy logic.*

---
*Built to help hackathon builders focus on what matters: the code.*
