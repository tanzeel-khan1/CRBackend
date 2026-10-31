# Ranvola Backend API

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
| `PLATFORM_ADMIN_EMAILS` | Comma-separated platform administrator emails for moderation access | _(optional)_ |

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Email a password reset OTP |
| POST | `/api/auth/reset-password` | Reset password using the email OTP |
| GET  | `/api/auth/me` | Get current user (protected) |

Password reset email delivery uses the same SMTP settings as other email features:
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `EMAIL_USER` / `EMAIL_PASS` (or
`SMTP_USER` / `SMTP_PASS`).

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
| GET/POST | `/api/feedback/public/:token` | Read client feedback form / submit feedback without an account |
| GET | `/api/feedback/public/company/:companyId` | List approved public feedback for a company |
| GET | `/api/feedback/admin/pending` | List feedback awaiting review (platform admin) |
| PATCH | `/api/feedback/admin/:id/status` | Approve or reject feedback (platform admin) |
| GET | `/api/trash` | List the signed-in user's soft-deleted items |
| POST | `/api/trash/:resource/:id/restore` | Restore an item from Trash |
| DELETE | `/api/trash/:resource/:id` | Permanently delete an item from Trash |

### Soft Delete

Delete actions move supported records to Trash instead of removing them immediately.
Active application queries automatically exclude trashed records. Users can restore
their own deleted records or permanently delete them from Trash. Permanently deleting
a company also removes its related records.

Before deploying, run `npm run migrate:soft-delete` once against the production
database. This updates the Business Plan unique index so a deleted section does not
block creating a replacement. Back up the database before running migrations.

### File Uploads
Files are stored in `backend/uploads/` and served at `/uploads/<filename>`.
