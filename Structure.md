# Wytu Voting - Project Structure

> A simple King & Queen voting app for school's fresher welcome (~200 users)

## Tech Stack

- **Frontend:** React + Shadcn/ui + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL + Prisma ORM
- **Vote Tracking:** Cookie + IP Address

---

## 📁 Directory Structure

```
wytu-voting/
├── server.js              # Express server entry point
├── package.json
├── .env                   # Environment variables
├── .gitignore
├── ReadMe.md
├── Structure.md
│
├── prisma/
│   ├── schema.prisma      # Prisma schema definition
│   └── seed.js            # Database seed script
│
├── public/
│   └── uploads/
│       └── candidates/    # Candidate photos stored locally
│           ├── king1.jpg
│           ├── king2.jpg
│           └── queen1.jpg
│
├── client/                # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── components.json    # Shadcn/ui config
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── lib/
│       │   └── utils.js   # Shadcn/ui utilities
│       ├── components/
│       │   ├── ui/        # Shadcn/ui components
│       │   │   ├── button.jsx
│       │   │   ├── card.jsx
│       │   │   └── ...
│       │   ├── CandidateCard.jsx
│       │   ├── VotingForm.jsx
│       │   └── ResultsChart.jsx
│       └── pages/
│           ├── VotingPage.jsx
│           ├── ResultsPage.jsx
│           └── admin/
│               ├── LoginPage.jsx
│               ├── DashboardPage.jsx
│               └── CandidatesPage.jsx
│
└── src/
    ├── routes/
    │   ├── vote.js        # POST /api/vote
    │   ├── candidates.js  # GET /api/candidates
    │   ├── results.js     # GET /api/results
    │   ├── upload.js      # POST /api/upload (for candidate photos)
    │   └── admin.js       # Admin authentication routes
    │
    └── utils/
        ├── prisma.js      # Prisma client instance
        └── auth.js        # JWT auth utilities & middleware
```

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Admin {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("admins")
}

model Candidate {
  id        Int      @id @default(autoincrement())
  name      String
  photoUrl  String?  @map("photo_url")
  category  Category
  voteCount Int      @default(0) @map("vote_count")
  
  kingVotes  Vote[] @relation("KingVotes")
  queenVotes Vote[] @relation("QueenVotes")

  @@map("candidates")
}

model Vote {
  id        Int      @id @default(autoincrement())
  ipAddress String   @map("ip_address")
  cookieId  String   @map("cookie_id")
  kingId    Int?     @map("king_id")
  queenId   Int?     @map("queen_id")
  votedAt   DateTime @default(now()) @map("voted_at")

  king  Candidate? @relation("KingVotes", fields: [kingId], references: [id])
  queen Candidate? @relation("QueenVotes", fields: [queenId], references: [id])

  @@unique([ipAddress, cookieId])
  @@map("votes")
}

enum Category {
  king
  queen
}
```

---

## 🔌 API Endpoints

### Public Endpoints
| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| GET    | `/`             | Serve voting page              |
| GET    | `/results`      | Serve results page             |
| GET    | `/api/candidates` | Get all candidates           |
| GET    | `/api/results`  | Get vote counts                |
| POST   | `/api/vote`     | Submit vote (king_id, queen_id)|
| GET    | `/api/check`    | Check if user already voted    |
| GET    | `/uploads/candidates/:filename` | Serve candidate photos |

### Admin Endpoints (JWT Protected)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | `/api/admin/login`    | Admin login (returns JWT)      |
| POST   | `/api/admin/register` | Register new admin (protected) |
| GET    | `/api/admin/me`       | Get current admin profile      |
| PUT    | `/api/admin/password` | Change admin password          |
| POST   | `/api/candidates`     | Create new candidate           |
| PUT    | `/api/candidates/:id` | Update candidate               |
| DELETE | `/api/candidates/:id` | Delete candidate               |
| POST   | `/api/upload`         | Upload candidate photo         |

---

## 🍪 Vote Tracking Logic

```
1. On page load:
   - Generate unique cookie_id if not exists
   - Check /api/check with cookie + IP
   - If voted → show "Already voted" message

2. On vote submit:
   - Send POST /api/vote with king_id, queen_id
   - Server validates cookie_id + IP not in votes table
   - If new → insert vote & increment candidate vote_count
   - If duplicate → reject with 403
```

---

## 📦 Dependencies

### Backend (root package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^6.1.0",
    "cookie-parser": "^1.4.6",
    "uuid": "^9.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "prisma": "^6.1.0"
  }
}
```

### Frontend (client/package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 🚀 Quick Start

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your MySQL connection string

# Initialize Prisma and create database
npx prisma generate
npx prisma db push

# Seed database with candidates
npx prisma db seed

# Start backend server
npm run server

# Start frontend dev server (in another terminal)
cd client && npm run dev

# Visit http://localhost:5173
```

---

## 📝 Environment Variables (.env)

```env
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/wytu_voting"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

---

## 👤 Default Admin Credentials

After running `npm run db:seed`, a default admin is created:
- **Email:** admin@wytu.com
- **Password:** admin123

⚠️ **Change this password immediately after first login!**

---

## ✅ Features

- [x] Single-page voting UI
- [x] King & Queen selection
- [x] Cookie + IP duplicate prevention
- [x] Real-time results page
- [x] Mobile responsive (Tailwind)
- [x] No authentication required

---

## 🛡️ Anti-Cheating Measures

1. **Cookie ID** - Unique per browser
2. **IP Address** - Unique per network
3. **Combined check** - Both must be unique to vote again
4. **Rate limiting** - Optional Express middleware

---

## 📊 Expected Scale

- **Users:** ~200 concurrent voters
- **Database:** MySQL handles this easily with Prisma ORM
- **Server:** Single Node.js instance sufficient
- **Frontend:** React SPA with Vite for fast development
