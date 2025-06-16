# Agile Demo · Agile Development Showcase Project (Live Demo Available)

> 🚀 A full-stack web project demonstrating the iterative process of Agile development. From static prototypes to a complete database-integrated backend, this project is deployed live on an AWS EC2 server.

---

## 🌐 Live Demo

👉 [Agile Demo](http://18.163.159.136:3000/)

- **Cycle1**— Static HTML prototype (no backend)
- **Cycle2** — Interactive pages with basic routing (Express)
- **Cycle3** — Fully functional backend with Node.js & MySQL

⚠️ *If the demo is temporarily unavailable, a demo video or screenshots can be provided upon request.*

---

## ⚠️ Important Note on Project Purpose

While this project takes the form of a basic online beverage shop, it is **not** intended to showcase a polished commercial product or reflect the full extent of my web application development skills.

Instead, this Agile Demo serves as a technical artifact to demonstrate:

- My **understanding of Agile development** through staged iterations,
- My ability to **work with Docker** for environment management,
- And most importantly, my capability to **deploy web applications to the cloud** using **AWS EC2**.

Please evaluate this project primarily as an Agile and DevOps showcase, rather than as a standalone e-commerce application.

---

## 🔹 Key Highlights (Great for Recruiters)

✅ **Agile Development in Action**: Evolved from the [7780\_assignment2\_code](https://github.com/icy1225/7780_assignment2_code) learning project, this demo reflects principles like iterative delivery, rapid feedback, and continuous improvement.\
✅ **Full-Stack Implementation**: Covers frontend (HTML/CSS/JS), backend (Node.js/Express), and database (MySQL).\
✅ **Dockerized Deployment**: Entire environment is containerized via Docker Compose for consistent builds.\
✅ **Cloud-Ready**: Successfully deployed to AWS EC2, showcasing independent deployment and server setup capability.\
✅ **Structured Iteration**: Clear demonstration of three development stages, ideal for communicating technical growth and project thinking.

---

## 🪜 Project Structure

```
agileDemo/
├── assets/                 # Static images used in all HTML cycles
│   └── images/
│       └── pics/
│           ├── home_pics/         # Homepage visuals
│           └── product_pics/      # Product-related visuals (by category)
├── docker-compose.yml      # Defines multi-container setup (Node + MySQL)
├── Dockerfile              # Node.js app container configuration
├── index.js                # Main Express server handling routing and static serving
├── mysql/
│   └── init/               # MySQL initialization scripts
│       ├── 01_create_db.sql
│       ├── 02_create_table.sql
│       └── 03_create_user.sql
├── package.json            # Node dependencies and metadata
├── public/
│   └── css/                # Public stylesheets served by Express
│       ├── cycle3Style.css
│       └── homePageStyle.css
├── test/
│   └── MysqlConnectTest.js # Dev script for verifying DB connection
├── views/                  # All frontend HTML files for 3 development cycles
│   ├── Cycle1/             # Initial static pages (no backend)
│   ├── Cycle2/             # Basic page routing via Express
│   ├── Cycle3/             # Fully integrated with MySQL backend
│   └── homePage.html       # Project landing page, introducing all 3 cycles
└── README.md

```

---

## 🔄 Iteration Breakdown

| Phase   | Tech Stack           | Description                          |
| ------- | -------------------- | ------------------------------------ |
| Cycle 1 | HTML + CSS           | UI prototype, layout and structure   |
| Cycle 2 | JavaScript + Express | Page logic and client-server routing |
| Cycle 3 | Node.js + MySQL      | Backend logic with data persistence  |

---

## ⚙️ Quick Start Guide

### Run Locally

```bash
git clone https://github.com/Marcus-Kwong/agileDemo.git
cd agileDemo
docker-compose up --build
```

Access locally:

- `http://localhost:3000/cycle1/`
- `http://localhost:3000/cycle2/`
- `http://localhost:3000/cycle3/`

### Deploy to AWS EC2

- Launch a Ubuntu-based EC2 instance
- Install Docker and Docker Compose
- Upload the project and run the above commands
- Open port 3000 in the security group to allow public access

---

If you're a hiring manager or developer interested in my workflow or deployment process, feel free to explore the source code or reach out for a detailed walkthrough.

