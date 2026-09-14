# InvestorOS Backend API

Node.js + Express + MongoDB REST API.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET in .env
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/investoros` |
| `JWT_SECRET` | Secret for signing JWTs | _(required)_ |
| `PORT` | Port to listen on | `5000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user (protected) |

### Companies
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/companies` | List / Create |
| GET/PUT/DELETE | `/api/companies/:id` | Read / Update / Delete |

### Company-scoped Resources (replace `:cid` with company ID)
| Resource | Routes |
|----------|--------|
| Expenses | `/api/companies/:cid/expenses[/:id]` |
| Invoices | `/api/companies/:cid/invoices[/:id]` |
| Investors | `/api/companies/:cid/investors[/:id]` |
| Employees | `/api/companies/:cid/employees[/:id]` |
| Notes | `/api/companies/:cid/notes[/:id]` |
| Ideas | `/api/companies/:cid/ideas[/:id]` |
| Activities | `/api/companies/:cid/activities` |
| Documents | `/api/companies/:cid/documents[/:id]` |
| Doc Sections | `/api/companies/:cid/doc-sections[/:id]` |
| Passwords | `/api/companies/:cid/passwords[/:id]` |
| Chat | `/api/companies/:cid/chat[/:id]` |

### Standalone Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/notes` | Personal notes |
| GET/POST | `/api/activities` | All activities |
| GET/POST | `/api/chat` | Global chat |
| GET/POST | `/api/idea-comments` | Idea comments |
| GET/POST/PUT/DELETE | `/api/doc-sections[/:id]` | Doc sections |
| GET/POST/PUT/DELETE | `/api/hpcs[/:id]` | Company-scoped HPC initiatives |
| POST | `/api/upload` | Upload file (returns `{ file_url }`) |

### File Uploads
Files are stored in `backend/uploads/` and served at `/uploads/<filename>`.
