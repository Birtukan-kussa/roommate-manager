# Roommate Management System

A full-stack web app to help roommates manage shared responsibilities — chores, cleaning/cooking schedules, shared expenses, and a shopping list.

## Team
This project is a group assignment shared between 3 students.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Apollo Client
- **Backend**: Express, GraphQL (express-graphql), MongoDB (Mongoose)
- **Dev tools**: nodemon, dotenv, cors

## Project Structure

Next _project/
├── my-app/          # Frontend (Next.js)
├── todo-backend/    # Backend (Express + GraphQL + MongoDB)
└── README.md         # This file

## Features (Planned / In Progress)
- [x] Roommates — add, edit, delete roommates
- [ ] Chores — assign chores to roommates, set status (Not Started / In Progress / Completed), due dates, recurring schedule (Daily/Weekly/Monthly)
- [ ] Expenses — log shared expenses, split cost between roommates, track who paid
- [ ] Shopping List — shared list roommates can add to and check off
- [ ] Login / Signup — user authentication (not yet implemented)

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`)
- npm

### 1. Clone the repo
```powershell
git clone <repo-url>
cd Next_project
```

### 2. Backend Setup (`todo-backend/`)

```powershell
cd todo-backend
npm install
```

Create a `.env` file in `todo-backend/` with:

PORT=9000
MONGO_URL=mongodb://localhost:27017/roommate-manager
NODE_ENV=development

Run the backend:
```powershell
npm run dev
```

Backend GraphQL API will be available at: `http://localhost:9000/graphql`

#### Backend Folder Structure

todo-backend/
├── server/
│   ├── config/
│   │   └── db.js
│   └── index.js
├── models/
│   ├── Roommate.js
│   ├── Chore.js
│   ├── Expense.js
│   └── ShoppingItem.js
├── schema/
│   └── schema.js
├── .env
└── package.json

### 3. Frontend Setup (`my-app/`)

```powershell
cd my-app
npm install
```

Run the frontend:
```powershell
npm run dev
```

Frontend will be available at: `http://localhost:3000`

#### Frontend Folder Structure (key files)

my-app/
├── src/
│   ├── app/
│   │   ├── roommates/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   ├── componets/
│   │   └── roommates/
│   │       ├── AddRoommateForm.tsx
│   │       ├── RoommateItem.tsx
│   │       └── RoommateList.tsx
│   ├── graphql/
│   │   ├── roommateQueries.ts
│   │   └── roommateMutations.ts
│   └── lib/
│       ├── apolloClient.ts
│       └── ApolloWrapper.tsx

### 4. Running the Full App
Open two terminals:

**Terminal 1 — Backend:**
```powershell
cd todo-backend
npm run dev
```

**Terminal 2 — Frontend:**
```powershell
cd my-app
npm run dev
```

Then visit `http://localhost:3000` in your browser.

---

## Data Models

### Roommate
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | optional |
| color | String | hex color for UI, default `#3498db` |
| createdAt | Date | auto-set |

### Chore
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | optional |
| status | Enum | `Not Started`, `In Progress`, `Completed` |
| assignedTo | Roommate ref | who's responsible |
| dueDate | Date | optional |
| recurring | Enum | `None`, `Daily`, `Weekly`, `Monthly` |

### Expense
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| amount | Number | required |
| paidBy | Roommate ref | required |
| splitBetween | [Roommate ref] | who shares the cost (equal split) |
| date | Date | auto-set |

### ShoppingItem
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| addedBy | Roommate ref | optional |
| purchased | Boolean | default `false` |

---

## Notes for Contributors
- CORS is enabled on the backend (`app.use(cors())`) to allow requests from the frontend's different port.
- Make sure MongoDB is running locally before starting the backend.
- GraphQL schema, queries, and mutations should stay in sync between `todo-backend/schema/schema.js` and the frontend's `src/graphql/` files.
- Follow the existing pattern (queries/mutations separated per feature, components split into `List`, `Item`, `AddForm`) when adding new features.
