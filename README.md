# Syncro – Universal Reverse Auction Marketplace

**Course:** CO2060 – Second Year Project  
**University:** (University of Peradeniya)  
**Team:** CodeBuds  
**Project Type:** Full Stack Web Application  

---

## 1. Project Overview

Syncro is a dual-role marketplace platform that implements a Reverse Auction model.  
Instead of sellers listing products and waiting for buyers, clients post Requests for Proposals (RFPs) describing their needs. Sellers receive notifications based on their niche and submit competitive bids.

The system reduces buyer search cost and helps sellers reach high-intent customers efficiently.

---

## 2. Problem Statement

In traditional e-commerce:
- Buyers waste time searching across multiple platforms.
- Sellers spend money on passive marketing.
- No unified system allows real-time competitive responses to buyer needs.

Syncro bridges this discovery gap.

---

## 3. Core Features

### Phase 1 – Direct Marketplace
- User authentication (JWT)
- Dual-role accounts (Client / Seller)
- Seller storefront creation
- Direct order placement
- Real-time messaging (WebSockets)
- Intelligent RFP assistance (AI-guided input)

### Phase 2 – Reverse Auction
- Smart RFP posting system
- Seller lead feed
- Competitive bidding engine
- Real-time bid updates
- Commission calculation logic
- Intelligent RFP assistance (AI-guided input)

---

## 4. Technology Stack

Frontend:
- Next.js / React

Backend:
- FastAPI (Python)

Database:
- PostgreSQL

Real-Time:
- Socket.io / WebSockets

---

## 5. Repository Structure

- code: Contains the source code for the FastAPI backend and React/Next.js frontend.
- database: Holds the PostgreSQL schema designs, ER diagrams, and initialization scripts.
- docs: Stores project documentation, including the proposal and design specifications.

---

## 6. How to Run Locally

To run the entire full-stack application (Frontend, Backend, and Database) at once, ensure Docker Desktop is running on your machine.

From the root repository directory (`SYNCRO-2YP`), run the following command:

```bash
docker-compose up -d --build
```

Once the containers are built and running, you can access the application at:
- **Frontend UI:** http://localhost:5173
- **Backend API Docs:** http://localhost:8000/docs
- **Database:** Connect via `localhost:5433` (User: `postgres`, Password: `syncro123`)
