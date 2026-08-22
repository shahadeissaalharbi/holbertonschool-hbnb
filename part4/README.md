# HBnB Evolution — Part 4: Simple Web Client

This is Part 4 of the HBnB Evolution project. It builds on the RESTful API and
authentication system implemented in Part 3 by adding a **static front-end
client** — a set of HTML, CSS, and vanilla JavaScript pages that consume the
API and provide an interactive, browser-based experience for guests, hosts,
and administrators.

## Objective

Implement the **client-side interface** of the HBnB application using
**HTML5, CSS3, and vanilla JavaScript (no frameworks)**, and connect it to
the back-end API built in previous parts:

- Design and build the core pages: landing page, places listing, place
  details, login, add place, add review, and add user (admin).
- Implement client-side authentication using a JWT stored in a cookie.
- Dynamically fetch and render data from the API using the Fetch API (AJAX),
  without reloading the page.
- Apply role-based UI logic (e.g., showing/hiding the "Add Place", "Add
  Review", and "Admin" links depending on login state and admin status).
- Ensure the interface is responsive and usable across desktop and mobile
  viewports.

## Architecture Recap

The client is a purely static front-end that talks to the Part 3 API over
HTTP:

```
Browser (HTML/CSS/JS)
        │
        │  fetch() — JSON over HTTPS/HTTP
        ▼
Presentation Layer (Flask API / /api/v1/...)
        │
        ▼
Business Logic Layer (Facade → User, Place, Review, Amenity)
        │
        ▼
Persistence Layer (SQLite / MySQL)
```

The client never talks to the database directly — every read or write goes
through the documented REST endpoints, with the JWT access token attached to
protected requests via the `Authorization: Bearer <token>` header.

## Project Structure

```
part4/
└── base_model/
    ├── css/
    │   ├── styles.css               # Shared styles (variables, header, footer, buttons)
    │   ├── home_styles.css          # Landing page (hero, features, steps, CTA banner)
    │   ├── admin_nav_styles.css     # "Admin" dropdown in the navigation bar
    │   ├── forms_styles.css         # Shared form layout (login, register, add_place, add_review)
    │   ├── register_styles.css      # Success/error messages on the add-user form
    │   ├── places_styles.css        # Places grid + price filter (index page)
    │   ├── place_details_styles.css # Place details page + reviews section
    │   └── add_review_styles.css    # Add-review page (star rating widget)
    │
    ├── images/                      # Icons (wifi, bed, bath, trash), logo, favicon
    │
    ├── js/
    │   ├── script.js                 # Shared config/helpers: API_URL, cookies, nav/auth state, admin visibility
    │   ├── login_script.js           # Login logic (POST /auth/login), stores JWT in a cookie
    │   ├── register_script.js        # Add-user form (admin only), POST /users/
    │   ├── places_script.js          # Fetches and renders all places, price filter (index page)
    │   ├── add_place_script.js       # Add-place form (fetches amenities), POST /places/
    │   ├── place_details_script.js   # Fetches a place + its reviews, renders gallery, deletes reviews
    │   └── add_review_script.js      # Submits a new review (text + star rating), POST /reviews/
    │
    ├── home.html        # Landing page
    ├── index.html        # List of all available places, with price filter
    ├── place.html         # Details of a single place + its reviews
    ├── add_place.html     # Form to create a new place (requires login)
    ├── add_review.html    # Form to submit a review for a place (requires login)
    ├── login.html         # Login form
    └── register.html       # Form to add a new user (admin only)
```

## Pages Overview

### `home.html` — Landing Page
Marketing-style landing page with a hero section, a "Why book with Vibe"
features grid, a "How it works" steps section, and a call-to-action banner
linking into the places listing.

### `index.html` — Places List
Fetches `GET /api/v1/places/` on load and renders each place as a card
(title, price per night, and a "View Details" link). Includes a client-side
**max-price filter** (`$10 / $50 / $100 / All`) that shows/hides cards
without an additional network request.

### `place.html` — Place Details
Reads the place `id` from the URL query string and fetches:
- `GET /api/v1/places/<id>` — title, description, price, owner, amenities,
  and photo gallery.
- `GET /api/v1/places/<id>/reviews` — the list of reviews for that place.

Reviews are rendered with the reviewer's name, star rating, and comment.
If the logged-in user authored a review, a delete button is shown, calling
`DELETE /api/v1/reviews/<id>`. The "Add a Review" link/section is only shown
to authenticated users.

### `add_place.html` — Add Place
A form (title, description, price, latitude/longitude, main photo URL,
additional photo URLs, amenities) that:
- Loads available amenities via `GET /api/v1/amenities/` and renders them as
  checkboxes.
- Submits the new listing via `POST /api/v1/places/` with the JWT attached.
- Is hidden behind an access message for unauthenticated visitors.

### `add_review.html` — Add Review
A form with a free-text review field and an interactive **5-star rating
widget** built with plain buttons and JavaScript (no external library).
Submits via `POST /api/v1/reviews/` and redirects back to `place.html` on
success.

### `login.html` — Login
Submits credentials to `POST /api/v1/auth/login`, stores the returned
`access_token` in a `token` cookie (`max-age=86400`, 24 hours), and redirects
to `home.html`.

### `register.html` — Add User (Admin only)
Only rendered for users whose JWT payload contains `is_admin: true` (decoded
client-side); everyone else sees an explanatory access message instead of
the form. Submits to `POST /api/v1/users/` with the admin's token attached.

## Client-Side Authentication

- On login, the JWT returned by the API is stored in a cookie:
  `document.cookie = "token=<jwt>; path=/; max-age=86400"`.
- `script.js` exposes `getCookie(name)` to read it back on every page.
- The JWT payload is decoded client-side (base64) purely to read the
  `is_admin` claim and toggle UI elements (nav links, forms). This is a
  **UX convenience only** — the server independently re-validates the token
  and the admin claim on every protected request; the client never trusts
  its own decoding for authorization.
- `refreshNavState()` runs on `DOMContentLoaded` and again on the
  `pageshow` event (to handle the browser's back/forward cache) to keep
  Login/Logout, Admin, and Add Place links in sync with the current
  session.

## API Endpoints Used by the Client

| Method | Endpoint | Auth required | Used in |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | `login.html` |
| `GET` | `/api/v1/places/` | No | `index.html` |
| `GET` | `/api/v1/places/<id>` | No | `place.html` |
| `POST` | `/api/v1/places/` | Yes | `add_place.html` |
| `GET` | `/api/v1/places/<id>/reviews` | No | `place.html` |
| `POST` | `/api/v1/reviews/` | Yes | `add_review.html` |
| `DELETE` | `/api/v1/reviews/<id>` | Yes (author) | `place.html` |
| `GET` | `/api/v1/amenities/` | No | `add_place.html` |
| `POST` | `/api/v1/users/` | Yes (admin) | `register.html` |
| `GET` | `/api/v1/users/<id>` | Yes | `place.html` (resolving a reviewer's name) |

## Setup

### Prerequisites

- A running instance of the Part 3 back-end API (Flask), reachable at
  `http://127.0.0.1:5000/api/v1` by default.
- Any modern web browser.
- (Optional) Python, for serving the static files over HTTP instead of
  `file://`.

### Configuration

The API base URL is defined in one place, `js/script.js`:

```js
const API_URL = 'http://127.0.0.1:5000/api/v1';
```

Update this value if your API is hosted elsewhere before deploying.

### Running the Client

**Option 1 — open directly in the browser**

```bash
open base_model/home.html
```

**Option 2 — serve over a local HTTP server (recommended)**

```bash
cd base_model
python3 -m http.server 8000
```

Then visit `http://localhost:8000/home.html`.

### Seeded Admin Account

To test the admin-only `register.html` page, log in with the admin account
seeded by the Part 3 back-end:

- **email:** `admin@hbnb.io`
- **password:** `admin1234`

## Manual Testing Checklist

The client was manually tested against a running Part 3 API instance for the
following flows:

| Flow | Steps | Expected result |
|---|---|---|
| Anonymous browsing | Open `index.html` without logging in | Places load; "Add Place" and "Admin" links stay hidden |
| Price filter | Select `$50` from the filter dropdown | Only places priced $50 or below remain visible |
| Login | Submit valid credentials on `login.html` | Redirected to `home.html`; Login link replaced by Logout |
| Login failure | Submit invalid credentials | Inline error message shown, no redirect |
| View place details | Click "View Details" on a place card | Gallery, host, price, description, amenities, and reviews render |
| Add a review | Log in, open a place, submit a review | Redirected back to `place.html`; new review appears |
| Delete own review | Click the trash icon on a review you authored | Confirmation prompt, then the review is removed |
| Add a place | Log in, fill out `add_place.html`, submit | Redirected to the new place's `place.html?id=<id>` |
| Admin add-user | Log in as admin, open `register.html`, submit | New user created, redirected to `home.html` |
| Non-admin blocked | Log in as a non-admin, open `register.html` | Access message shown instead of the form |
| Session expiry | Call a protected endpoint with an expired/invalid token | User redirected to `login.html` |

## Notes on Implementation

- The client uses **cookies**, not `localStorage`, to persist the JWT, so
  the token survives full page reloads across every page (each page is a
  separate load, not a single-page app).
- `place.html` fetches the place and its reviews **in parallel** with
  `Promise.all` to minimize perceived load time.
- Reviewer names are resolved from the review payload first (`review.user`,
  `review.user_name`, etc.) and fall back to a `GET /users/<id>` call only
  when the review response doesn't already include a display name.
- Amenity icons are matched by keyword (e.g. `pool`, `air conditioning`)
  with a generic fallback icon (`icon_bath.png`) if no specific image is
  found for a given amenity name, so newly added amenities never render a
  broken image.
- `add_place.html` currently references `images/logo.png`, while the rest of
  the pages reference `images/logo.svg` — worth unifying in a follow-up
  cleanup pass.
- The API base URL (`http://127.0.0.1:5000/api/v1`) is a development
  default and must be updated before any production deployment.

## Resources

- [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN — Document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [JWT.io — Introduction to JSON Web Tokens](https://jwt.io/introduction)
- [Flask-JWT-Extended docs](https://flask-jwt-extended.readthedocs.io/)

### Document Authors and Contributors

- Lama Almazroa - [@l44mz](https://github.com/l44mz)
- Noura Alotibi - [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi - [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)
