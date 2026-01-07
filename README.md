# AI-Based-Cyber-Security-Threats-Prediction-AI-Agent

## 🔍 Project Statement: 
The project aims to develop agentic AI that acts as tireless guardians of network security. These AI agents will autonomously monitor network traffic, detect anomalies, and respond to cyber threats in real time without constant human oversight. This approach could significantly enhance an organization's security posture and free up human experts to focus on more complex security challenges.

## 🎯 Outcomes:

 * Autonomous monitoring of network traffic for enhanced security.
 * Real-time detection and response to cyber threats.
 * Reduction in the workload of human security experts.
 * Improved overall organizational resilience against digital threats.

## ⚙️ Instructions

### Prerequisites
- Node.js installed
- Python installed
- Supabase account
- Git installed
- Npcap installed

### Quick Start (Windows)
1. Run `start.bat` to launch both backend and frontend services.

### Manual Setup

#### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
AI-Driven-Cybersecurity-Threat-Prediction-Platform/
├── backend/                 # Python FastAPI Backend
│   ├── src/                 # Source code (main.py, routers, services)
│   ├── requirements.txt     # Python dependencies
│   └── schema.sql           # Database schema
├── frontend/                # React Vite Frontend(TypeScript)
│   ├── src/                 # Source code
│   ├── package.json         # JS dependencies
│   └── vite.config.ts       # Vite configuration
├── Architecture.png         # System Architecture Diagram
├── Model_Research.pdf       # Research documentation
├── Python_Task.ipynb        # Python analysis notebook
├── SQL_Task.ipynb           # SQL analysis notebook
└── start.bat                # Quick start script
```

## 📹 Video Demonstration: 

https://github.com/user-attachments/assets/56250874-302c-41d3-b3dd-169b59c413bf

## 🚀 Deployment Link:

[CyberSpy](https://cyberspy-jet.vercel.app/)

