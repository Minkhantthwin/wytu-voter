# WYTU King & Queen Voting System

A web-based voting application for CEIT Fresher Welcome 2025, allowing students to vote for King and Queen candidates.

## 🎯 Features

- **Public Voting Interface** - Simple, mobile-responsive voting page
- **Admin Dashboard** - Manage candidates, view results, and control voting
- **Real-time Results** - Live vote counting and statistics
- **Anti-Fraud Protection** - IP + Cookie-based duplicate vote prevention
- **Photo Management** - Upload and display candidate photos
- **Settings Control** - Toggle voting status and results announcement

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + TailwindCSS + Shadcn/ui
- **Backend:** Node.js + Express
- **Database:** MySQL + Prisma ORM
- **Authentication:** JWT for admin access
- **File Upload:** Multer for candidate photos

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wytu-voter
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/wytu_voting"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

5. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed initial data (creates admin + sample candidates)
npx prisma db seed
```

## 🎮 Running the Application

### Development Mode

**Start backend server:**
```bash
npm run dev
```
Server runs on `http://localhost:3000`

**Start frontend dev server** (in another terminal):
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Mode

**Build frontend:**
```bash
cd client
npm run build
```

**Start backend:**
```bash
npm start
```

## 👤 Default Admin Credentials

After seeding the database:
- **Email:** `admin@wytu.com`
- **Password:** `admin123`

⚠️ **Change this password immediately after first login!**

## 📁 Project Structure

```
wytu-voter/
├── server.js                 # Express server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Seed script
├── src/
│   ├── routes/              # API endpoints
│   │   ├── admin.js         # Admin authentication
│   │   ├── candidates.js    # Candidate management
│   │   ├── vote.js          # Voting logic
│   │   ├── results.js       # Results & statistics
│   │   ├── settings.js      # App settings
│   │   ├── check.js         # Vote status check
│   │   └── upload.js        # Photo upload
│   ├── utils/
│   │   ├── prisma.js        # Prisma client
│   │   └── auth.js          # JWT middleware
│   └── config/
│       └── swagger.js       # API documentation
├── public/
│   └── uploads/
│       └── candidates/      # Candidate photos
└── client/                   # React frontend
    ├── src/
    │   ├── pages/           # Page components
    │   │   ├── VotingPage.jsx
    │   │   ├── PublicResultsPage.jsx
    │   │   └── admin/       # Admin pages
    │   ├── components/      # Reusable components
    │   ├── context/         # React context
    │   └── lib/
    │       └── api.js       # API client
    └── public/
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/candidates` - Get all candidates
- `POST /api/vote` - Submit vote
- `GET /api/check` - Check if user has voted
- `GET /api/results` - Get voting results
- `GET /api/settings/voting-open` - Check if voting is open
- `GET /api/settings/results-announced` - Check if results are public

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get admin profile
- `PUT /api/admin/password` - Change password
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate
- `POST /api/upload` - Upload candidate photo
- `GET /api/settings` - Get all settings
- `PUT /api/settings/voting-open` - Toggle voting status
- `PUT /api/settings/results-announced` - Toggle results visibility

## 📚 API Documentation

Swagger UI available at: `http://localhost:3000/api-docs`

## 🗄️ Database Schema

**Admin** - Admin users with JWT authentication

**Candidate** - King/Queen candidates with photos and vote counts

**Vote** - Vote records with IP + Cookie tracking

**Setting** - Application settings (voting status, results visibility)

## 🛡️ Security Features

- **JWT Authentication** for admin routes
- **IP + Cookie tracking** to prevent duplicate votes
- **Password hashing** with bcrypt
- **CORS protection**
- **SQL injection prevention** via Prisma ORM

## 🔧 Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Re-seed database
npx prisma db seed

# Check Prisma schema
npx prisma validate
```

## 📱 Pages

### Public
- **`/`** - Voting page (select King & Queen)
- **`/results`** - Public results page (when announced)

### Admin
- **`/admin/login`** - Admin login
- **`/admin/dashboard`** - Control panel
- **`/admin/candidates`** - Manage candidates
- **`/admin/results`** - View detailed results
- **`/admin/stats`** - Quick statistics

## 🎨 Design System

Built with **Shadcn/ui** components:
- Button, Card, Input, Label
- Dialog, Skeleton
- Responsive design with TailwindCSS
- Custom color scheme for WYTU branding

## 📝 License

ISC

## 👨‍💻 Author

Min Khant Thwin

---

**Need help?** Check the API documentation at `/api-docs` or review the code structure in [`Structure.md`](Structure.md)