---
layout: home
title: Syncro – Universal Reverse Auction Marketplace
repository-name: e22-co2060-Syncro
---

# Syncro – Universal Reverse Auction Marketplace

## Team

- E/22/052 – K.H.D.M. Bimsara  
- E/22/419 – R.G.S.T. Weerasekara  
- E/22/058 – M.M.T. Cooray  
- E/22/121 – W.A.N. Gunathilaka

---

## Table of Contents

1. Introduction  
2. Solution Architecture  
3. Software Designs  
4. Testing  
5. Conclusion  
6. Links  

---

## 1. Introduction

In traditional e-commerce systems, buyers must manually search for products or services across multiple platforms. This results in high search cost, inefficient comparison, and fragmented communication.

Syncro solves this problem using a **Reverse Auction model**. Clients post structured Requests for Proposals (RFPs), and verified sellers submit competitive bids in real-time.

This system reduces search friction, improves price transparency, and enables high-intent business matching.

---

## 2. Solution Architecture

### High-Level Architecture

Syncro follows a three-layer architecture:

- **Frontend (Next.js / React)**  
- **Backend API (FastAPI – Python)**  
- **Database (PostgreSQL)**  

Real-time communication is handled using **WebSockets**.

### Architecture Diagram

(Add your system architecture diagram image here later)

---

## 3. Software Designs

### 3.1 Database Design

Main Entities:
- Users
- Profiles
- Requests (RFP)
- Bids
- Orders
- Commission

(Insert ER Diagram image here)

---

### 3.2 Backend Design

- REST API endpoints for authentication, RFP creation, bidding
- JWT-based authentication
- Role-based access control

---

### 3.3 Frontend Design

- Dual-role dashboard
- RFP creation form
- Bid comparison table
- Real-time updates

---

## 4. Testing

### Functional Testing
- User registration/login tested
- RFP posting validated
- Bid submission verified

### Integration Testing
- Frontend to backend API tested
- Database transactions validated

### Performance Testing
- Multiple bid submissions simulated

---

## 5. Conclusion

Syncro successfully implements a dual-role reverse auction marketplace. The system reduces procurement friction and demonstrates scalable marketplace design.

### Future Improvements
- AI-based intelligent RFP extraction
- Escrow payment integration
- Mobile app version
- Advanced seller verification

---

## 6. Links

- <a href="https://github.com/cepdnaclk/e22-co2060-Syncro" target="_blank">Project Repository</a>
- <a href="https://cepdnaclk.github.io/e22-co2060-Syncro" target="_blank">Project Page</a>

---

Department of Computer Engineering  
University of Peradeniya
