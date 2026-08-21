# HBnB Evolution — Part 4: Simple Web Client

A front-end web client for the HBnB Evolution booking platform, built with **HTML5, CSS3, and vanilla JavaScript (ES6)**. It consumes the Flask REST API developed in Part 2/Part 3 to let users browse places, view place details, log in, and submit reviews — entirely client-side, with no framework or build step.

## What's in this part

- **Places list** — fetches and renders all places from the API, with a client-side max-price filter.
- **Place details** — fetches a single place plus its reviews, renders an image gallery, host/price/description/amenities, and the review list.
- **Authentication** — JWT-based login; the token is stored in a cookie and read on every page to toggle auth-dependent UI (login button, add-review section, delete-review button).
- **Review submission** — an authenticated-only form with an interactive star-rating widget, posting to the reviews endpoint.
- **Review deletion** — review authors can delete their own reviews directly from the place details page.
- **Account registration** — a complete registration form UI (not yet wired to the API — see [Known Issues](#known-issues--not-yet-complete)).

## Project Structure

```
base_model/
├── css/
│   ├── styles.css                 # Shared styles: header, footer, buttons, CSS variables
│   ├── home_styles.css            # Landing page (home.html)
│   ├── places_styles.css          # Places list (index.html)
│   ├── place_details_styles.css   # Place details page (place.html)
│   ├── forms_styles.css           # Shared form styles (login/register/add_review)
│   ├── add_review_styles.css      # Add-review page + star rating
│   └── register_styles.css        # Register page
├── images/
│   ├── logo.png
│   ├── icon.png
│   ├── icon_bath.png
│   ├── icon_bed.png
│   ├── icon_wifi.png
│   └── icon_trash.png
├── js/
│   ├── script.js                  # Shared config: API_URL, getCookie(), getPlaceIdFromURL()
│   ├── login_script.js            # Login logic
│   ├── register_script.js         # Register form (UI only — not yet connected to the API)
│   ├── places_script.js           # Fetch / render / filter places
│   ├── place_details_script.js    # Place details + reviews + delete review
│   └── add_review_script.js       # Submit a review with interactive star rating
├── home.html                      # Landing page
├── index.html                     # List of available places
├── login.html                     # Login page
├── register.html                  # Account creation page
├── place.html                     # Details of a specific place
└── add_review.html                # Add a review for a place
```

## Architecture Recap

The client is a static, multi-page site — there is no build tool, bundler, or SPA router. Each HTML page loads `js/script.js` first (shared helpers), followed by its own page-specific script:

```
Browser (static HTML/CSS/JS)
        │
        ▼
   js/script.js  →  API_URL, getCookie(), getPlaceIdFromURL()
        │
        ▼
Page script (places_script.js / login_script.js / place_details_script.js / add_review_script.js)
        │
        ▼
Flask REST API  (http://127.0.0.1:5000/api/v1)  ← Part 2 / Part 3
```

`script.js` centralizes the pieces every page needs (the API base URL and cookie/URL helpers) so page scripts stay focused on their own page's logic.

## Pages & Features

### 1. `home.html` — Landing Page
A static marketing landing page: hero section, hover-reveal feature cards, a "How it works" section, and a CTA banner. Makes no API calls.

### 2. `index.html` — Places List
- `checkAuthentication()` reads the `token` cookie on load and shows/hides the login button accordingly.
- `fetchPlaces()` calls `GET /places/` (adds an `Authorization` header when a token is present).
- `displayPlaces()` renders one card per place — background image, title, price, and a "View Details" link to `place.html?id=<id>`.
- The `#price-filter` select (10 / 50 / 100 / all) filters the rendered cards client-side via `filterPlacesByPrice()` — no additional API request.

### 3. `login.html` — Login
- `loginUser()` sends `POST /auth/login` with `email` and `password`.
- On success: the returned `access_token` is stored in a `token` cookie (`max-age=86400`, 1 day) and the browser redirects to `index.html`.
- On failure: `displayLoginError()` renders the API's error message (or a fallback) beneath the submit button.

### 4. `register.html` — Register
The form (first name, last name, email, password, confirm password) is fully built and validated in HTML (`required`, `minlength="8"`). `register_script.js` currently just intercepts the submit event with `console.warn('Register form submit is not implemented yet.')` — it is **not yet wired to a `POST /users/` (or `/auth/register`) call**.

### 5. `place.html` — Place Details
- `checkPlaceAuthentication()` checks the `token` cookie, toggles the "Add a Review" section, and points `#add-review-link` at `add_review.html?id=<placeId>`.
- `fetchPlaceDetails()` fetches, in parallel:
  - `GET /places/<id>` — title, owner, price, description, images, amenities
  - `GET /places/<id>/reviews` — the review list
- `displayPlaceDetails()` renders an image gallery, host name, price, description, and an amenities list.
- `displayReviews()` renders each review (reviewer first name if present, text, star rating) and, only for the current user's own reviews, a delete button. Ownership is determined by decoding the JWT payload client-side in `getUserIdFromToken()` and comparing it to `review.user_id`.
- `deleteReview()` sends `DELETE /reviews/<id>` after a confirmation prompt, then removes the review card from the DOM on success.

### 6. `add_review.html` — Add a Review
- Requires authentication: if no `token` cookie is present, the page redirects to `index.html` immediately.
- Reads `placeId` from the URL (`?id=`) and fetches the place's title via `GET /places/<id>` to populate the page heading.
- `setupStarRating()` implements a click/hover 5-star widget that writes the selected value into a hidden `#rating` input.
- On submit, the form validates that review text and a rating are both present, then calls `POST /reviews/` with `{ text, rating, place_id }` and an `Authorization: Bearer <token>` header.
- On success: the form resets, a success message is stashed in `sessionStorage`, and the browser redirects to `place.html?id=<placeId>`.
- On failure: an inline error message is shown below the form.

## Authentication

| Aspect | Implementation |
|---|---|
| Token storage | Browser cookie named `token` (not `localStorage`/`sessionStorage`) |
| Token read | `getCookie('token')` in `js/script.js`, used on every page |
| Token lifetime | Set with `max-age=86400` (1 day) at login |
| Protected page | `add_review.html` — redirects to `index.html` if no token |
| Conditionally-gated UI | Login button visibility, "Add a Review" section on `place.html`, delete button per review |
| Identifying the current user | JWT payload decoded client-side (`getUserIdFromToken()`) to compare against a review's `user_id` |

## Setup & Run

### Prerequisites
- The Part 2/Part 3 Flask API running locally (this client has no backend of its own).

### Steps

```bash
# 1. Start the API (from the part2/ or part3/ directory)
python run.py
# → serves http://127.0.0.1:5000/api/v1

# 2. Serve the client (from inside base_model/)
python3 -m http.server 8000
# → open http://localhost:8000/home.html
```

The API base URL is hardcoded in `js/script.js`:

```js
const API_URL = 'http://127.0.0.1:5000/api/v1';
```

Update this constant if the API runs on a different host or port. Opening the HTML files directly via `file://` also works for quick checks, but a local static server is recommended so relative paths and CORS behave the same as in production.

## API Endpoints Used

| Method | Endpoint | Auth required | Used by |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | `login_script.js` |
| `GET` | `/api/v1/places/` | No | `places_script.js` |
| `GET` | `/api/v1/places/<place_id>` | No | `place_details_script.js`, `add_review_script.js` |
| `GET` | `/api/v1/places/<place_id>/reviews` | No | `place_details_script.js` |
| `POST` | `/api/v1/reviews/` | Yes | `add_review_script.js` |
| `DELETE` | `/api/v1/reviews/<review_id>` | Yes (author) | `place_details_script.js` |

## Known Issues / Not Yet Complete

- **Registration is not connected to the API.** `register_script.js` only logs a warning on submit; no `fetch()` call is made.
- **Reviewer display name depends on API response shape.** `displayReviews()` reads `review.user.first_name`; if `GET /places/<id>/reviews` returns only a flat `user_id` (no nested `user` object), the UI falls back to "Anonymous".

## Tech Notes

- No external libraries or frameworks — pure HTML/CSS/vanilla JS (ES6), same constraint as the rest of the HBnB project stack.
- Every CSS file includes a `@media (max-width: 600px)` block for basic responsiveness.
- Colors, radii, and shadows are centralized as CSS custom properties (`:root` in `styles.css`) and reused across all page-specific stylesheets.
- `script.js` is intentionally dependency-free and loaded before every page script, since `API_URL`, `getCookie()`, and `getPlaceIdFromURL()` are shared across all pages.

## Resources

- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN — Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [jwt.io — JWT debugger](https://jwt.io/)
- [Flask docs](https://flask.palletsprojects.com/)

### Document Authors and Contributors

- Lama Almazroa - [@l44mz](https://github.com/l44mz)
- Noura Alotibi - [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi - [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)
