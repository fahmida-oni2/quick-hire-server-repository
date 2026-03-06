# QuickHire — Backend API

RESTful API server for the **QuickHire** job board application, built with **Node.js**, **Express.js**, and **MongoDB Atlas**.

---

## 🔗 Links

| | Link |
|---|---|
| **Live API** | https://quickhire-server-sigma.vercel.app |
| **Frontend Repository** | https://github.com/fahmida-oni2/quick-hire-client-repository |
| **Frontend Live** | https://quickhire-rho.vercel.app |

---

## 🛠️ Tech Stack

| | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas |
| Hosting | Vercel |

---

## ⚙️ API Endpoints

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | Get all jobs |
| GET | `/jobs/:id` | Get single job by ID |
| POST | `/jobs` | Create a new job |
| DELETE | `/jobs/:id` | Delete a job by ID |
| GET | `/featured-jobs` | Get featured jobs (Design, Marketing, Technology) |
| GET | `/latest-jobs` | Get 8 most recent jobs |
| GET | `/my-jobs?email=` | Get jobs posted by a specific user |

#### Query Filters for `GET /jobs`
```
/jobs?title=developer        → search by title (case-insensitive)
/jobs?location=new york      → search by location
/jobs?category=Engineering   → filter by category
/jobs?email=user@email.com   → filter by poster email
```

### Applications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/applications` | Submit a job application |
| GET | `/applications` | Get all applications |
| GET | `/applications?company=Google` | Filter applications by company |

---

## 🗄️ Data Models

### Job
```json
{
  "_id": "ObjectId",
  "title": "string (min 3 chars)",
  "company": "string (min 2 chars)",
  "location": "string",
  "category": "Engineering | Technology | Business | Design | Marketing | Finance | Sales | Human Resources | Other",
  "jobType": "Full Time | Part Time | Remote | Internship | Contract | Freelance",
  "description": "string (min 20 chars)",
  "postedByEmail": "valid email",
  "postedByName": "string",
  "created_at": "Date"
}
```

### Application
```json
{
  "_id": "ObjectId",
  "jobId": "valid ObjectId",
  "jobTitle": "string",
  "company": "string",
  "name": "string (min 2 chars)",
  "email": "valid email",
  "resumeLink": "valid URL",
  "coverNote": "string (min 10 chars)",
  "appliedAt": "Date"
}
```

---

## ✅ Validation Rules

All endpoints include server-side validation. Invalid requests return:
```json
{
  "success": false,
  "errors": ["error message 1", "error message 2"]
}
```

| Field | Rule |
|---|---|
| `title` | Required, min 3 characters |
| `company` | Required, min 2 characters |
| `email` | Required, valid email format |
| `resumeLink` | Required, valid URL (http/https) |
| `coverNote` | Required, min 10 characters |
| `jobId` | Required, valid 24-char MongoDB ObjectId |
| `category` | Must match allowed values |
| `jobType` | Must match allowed values |

---

## 🚀 Running Locally

### Prerequisites
- Node.js installed
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quickhire-server.git
cd quickhire-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
```

### 4. Start the server

```bash
npm start
# Server runs on http://localhost:3000
```

### Available Scripts

```bash
npm start       # Start with node
npm run dev     # Start with nodemon (hot reload)
```

---

## 🌐 Deploying to Vercel

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Go to **Settings → Environment Variables** and add:

```
DB_USERNAME = your_mongodb_username
DB_PASSWORD = your_mongodb_password
```

4. Make sure `vercel.json` exists in the root:

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.js" }
  ]
}
```

5. Deploy ✓

---

## 📌 Notes

- `.env` is excluded from version control via `.gitignore`
- MongoDB connection uses the `hire-db` database
- Collections: `jobs`, `applications`
