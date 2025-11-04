# Open

http://localhost:3000

npm install express express-handlebars sequelize sqlite3 body-parser multer express-validator bcryptjs uuid helmet cookie-parser jsonwebtoken

For production, set a strong JWT_SECRET.

Demo users

student@example.com / student123
tutor@example.com / tutor123
admin@example.com / admin123

(Users are seeded in memory in app.js. Passwords use bcryptjs.)

---------------------------------------------------------------------------------------

# Login (two ways)

1 - Cookie session (browser style)

Go to: http://localhost:3000/auth/login
Keep “Use cookie session (httpOnly)” checked
Sign in with any user (student, tutor, admin)
Server sets an httpOnly cookie (short TTL) and redirects to /my/sessions
Use this mode if you’re just clicking around in the browser
Logout: http://localhost:3000/auth/logout

Why: httpOnly cookie means JS on the page can’t read the token.

2 - Stateless / Bearer (API style)

Go to: http://localhost:3000/auth/login
Uncheck “Use cookie session”
Sign in → the page will show the raw JWT and an example with curl
Copy the token and call protected routes like this:

# student area
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/my/sessions

# admin area
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/admin/overview

Why: this mode is good to prove that the backend accepts Authorization headers, not only cookies.

---------------------------------------------------------------------------------------

# What RBAC means here

RBAC = Role-Based Access Control → only who has the right role can open certain pages.

# In this project we have 3 roles:

student → normal user, can see “My Sessions”
tutor → manages tutor side
admin → sees admin overview

# Routes and who can see them

/ → public (home with project objective + tech highlights + quick links)
/auth/login → public
/my/sessions → any logged user (student / tutor / admin)
/tutor/slots → must be logged in AND role=tutor
/admin/overview → must be logged in AND role=admin

# In code this is done with:

app.get("/my/sessions", requireAuth, ...);
app.get("/tutor/slots", requireAuth, requireRole("tutor"), ...);
app.get("/admin/overview", requireAuth, requireRole("admin"), ...);

So:

no token → 403 (friendly error page)
token with wrong role → 403
token ok + role ok → page loads

---------------------------------------------------------------------------------------

Pages included

# Home (/)

shows the project objective:

“Provide a simple way for students to book tutoring sessions by subject and time, while tutors manage their availability and the system prevents double-booking.”

shows tech highlights:

“My Sessions” area for students
“Tutor” area for tutors to manage availability (to be completed by the teammate)
“Admin” area for light oversight
JWT auth with roles
quick links to /auth/login, /my/sessions, /tutor/slots, /admin/overview

# Login (/auth/login)

form with email + password
checkbox to choose cookie or Bearer
if Bearer: shows token and curl

# My Sessions (/my/sessions)

protected
right now shows placeholder “no sessions yet” (booking will be added later)

# Tutor area (/tutor/slots)
protected
only role tutor
currently a placeholder page (this is where tutor will create availability slots)

# Admin area (/admin/overview)

protected
only role admin
placeholder for simple admin view / upcoming sessions

# Errors

unknown route → 404 view
unhandled error → 500 view
forbidden (no auth / wrong role) → 403 view

---------------------------------------------------------------------------------------

# CSS / UI

There is a simple stylesheet in public/css/styles.css to make the app look organized (dark header, cards, badges).
This CSS is optional. The backend (auth + RBAC) does not depend on this file.

# Troubleshooting

403 on /tutor/slots or /admin/overview

you’re logged in as the wrong role
try with tutor@example.com or admin@example.com

Token shown on multiple lines in the browser

copy it carefully (no spaces, no quotes)
use in Authorization: Bearer <TOKEN>

“Set a strong JWT_SECRET in production.” in the console
that’s just a reminder; in class we can use the default
