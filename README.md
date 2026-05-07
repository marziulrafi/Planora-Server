# Planora Backend

Planora Backend is the server-side application powering the Planora event management platform.

It handles authentication, event management, invitations, participant workflows, payment processing, reviews, and admin moderation using a scalable REST API architecture.

## Live Links
🔗 [Backend API](https://planora-server-mozw.onrender.com/)

🔗 [Frontend](http://planora-smoky.vercel.app/)

🔗 [Frontend Repository](https://github.com/marziulrafi/Planora)

## Features

- Better Auth Authentication
- Role-Based Authorization
- Event CRUD Operations
- Public & Private Event Workflows
- Invitation Management System
- Participant Approval & Ban System
- Stripe Payment Integration
- Reviews & Ratings API
- Admin Moderation APIs
- Secure REST API
- PostgreSQL Database Integration
- Prisma ORM

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Better Auth
- Stripe

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/marziulrafi/Planora-Server
```

### Navigate to Project

```bash
cd planora-server
```

### Install Dependencies

```bash
pnpm install
```

### Setup Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=YOUR_DATABASE_URL

BETTER_AUTH_SECRET=YOUR_SECRET
BETTER_AUTH_URL=http://localhost:5000

CLIENT_URL=http://localhost:3000

STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### Generate Prisma Client

```bash
pnpm prisma generate
```

### Run Database Migration

```bash
pnpm prisma migrate dev
```

### Run Development Server

```bash
pnpm dev
```

Backend will run on:

```bash
http://localhost:5000
```

### Build for Production

```bash
pnpm build
pnpm start
```
