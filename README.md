# Student Dashboard — Vue.js

## Overview

Rebuild the student dashboard using **Vue.js** via CDN. Same features as the vanilla JS version, but with Vue's reactivity and directives.

---

## Prerequisites

- Your Django backend running at localhost:8000 (Docker or local)
- CORS enabled for localhost (CORS_ALLOW_ALL_ORIGINS = True  # just for testing, remove after)
- A browser (Chrome recommended)

---

## Files

| File | Purpose |
|---|---|
| `index.html` | HTML structure with Vue template TODOs |
| `style.css` | Basic styling started, cards/forms/responsive are TODOs |
| `app.js` | Vue app skeleton using Options API — implement all TODOs |

Open `index.html` directly in your browser.

---

## Requirements

### Auth
- Login form with v-model for username and password
- @submit.prevent to call handleLogin
- POST to /api/token/ to get JWT, store in localStorage
- Toggle login vs dashboard sections with v-if / isLoggedIn
- Logout clears localStorage and shows login again

### Student List
- Load students in mounted() with fetch and Authorization header
- Display with v-for showing name, email, grade
- Loading state with v-if/v-else while fetching
- Empty state when no students exist

### Add Student
- Form with v-model for name, email, grade, course ID
- @submit.prevent calls addStudent method
- After adding, reload the student list

### Delete
- Delete button on each card with @click
- Calls DELETE on the API
- Removes from the local students array

### Search
- Input with v-model bound to searchTerm
- computed filteredStudents filters by name (case-insensitive)
- Use filteredStudents in the v-for instead of students

---

## Vue Concepts Used

| Concept | Where |
|---|---|
| data() | All reactive state |
| methods | handleLogin, loadStudents, addStudent, deleteStudent |
| computed | filteredStudents |
| mounted() | Initial data fetch |
| v-if / v-else | Login vs dashboard, loading state |
| v-for | Student cards |
| v-model | All form inputs + search |
| @click | Delete button, logout |
| @submit.prevent | Login and add forms |

---

## Bonus Challenges

- [ ] **Edit student** — click a card to toggle an inline edit form
- [ ] **Sort** — buttons to sort students by name or grade
- [ ] **Course list** — fetch and display courses with student count
- [ ] **Error handling** — show messages for failed API calls or expired tokens
- [ ] **Composition API** — try rewriting the app using setup() and ref()

---

## When You're Done

```bash
git add .
git commit -m "Session 9: Student dashboard in Vue.js"
git push
```

**Next session**: Component architecture — break this into reusable components.
