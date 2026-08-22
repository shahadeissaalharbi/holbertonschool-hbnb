# HBnB Evolution

HBnB Evolution is a full-stack, Airbnb-style short-term rental marketplace built in four progressive parts as a Holberton School project. It starts as a technical design blueprint, grows into an in-memory business logic layer with a REST API, adds authentication and persistent database storage, and finishes with a static front-end client that consumes the API.

| Part | Focus | Key additions |
|---|---|---|
| [Part 1](#part-1--technical-documentation--architectural-blueprint) | Technical documentation & architectural blueprint | Package diagram, class diagram, sequence diagrams |
| [Part 2](#part-2--business-logic-and-api) | Business logic and API | Core model classes, Facade pattern, in-memory CRUD API |
| [Part 3](#part-3--authentication--database-integration) | Authentication & database integration | JWT auth, role-based access control, SQLAlchemy ORM, SQLite/MySQL persistence |
| [Part 4](#part-4--simple-web-client) | Simple web client | HTML5/CSS3/vanilla JS front end, JWT-in-cookie auth, dynamic API-driven UI |

Each part builds directly on the one before it, following the same layered architecture end to end:

```
Presentation Layer (Flask API / Client)
        │
        ▼
Business Logic Layer (Facade → User, Place, Review, Amenity)
        │
        ▼
Persistence Layer (in-memory → SQLite/MySQL)
```

---

## Part 1 — Technical Documentation & Architectural Blueprint

The comprehensive technical blueprint and architectural specification for the platform. It synthesizes the conceptual, logical, and physical design phases, giving implementation teams a single reference for layer separation, data boundaries, and operational workflows.

### Repository structure

```
hbnb/
└── part1/
    ├── README.md
    ├── Package Diagram.md
    ├── class diagram.md
    └── Sequence Diagrams.md
```

- **part1/** — root container for the Phase 1 design deliverables
- **README.md** — this design document
- **Package Diagram.md** — high-level layered software boundaries and design patterns
- **class diagram.md** — object-oriented entity layout for the Business Logic layer (properties, constraints, cardinalities)
- **Sequence Diagrams.md** — execution sequence charts for the major platform workflows

### Architecture: three decoupled layers

- **Presentation Layer (Services & API)** — the application's entry point. Handles client requests, URI routing, payload marshalling, and returns standardized HTTP responses.
- **Business Logic Layer (Models)** — the core of the platform. Holds the data entities, enforces business rules and attribute invariants, and defines model behavior.
- **Persistence Layer (Database & Repositories)** — abstracts all state persistence. Handles reads/writes and manages connections via generic data-access interfaces.

### Facade pattern

A Facade sits between the Presentation and Business Logic layers so API controllers call simple, unified operations instead of orchestrating multiple objects directly:

```
PRESENTATION LAYER  (Services / API)
        │  Facade signal
        ▼
BUSINESS LOGIC LAYER  (BaseModel, User, Place, Amenity, Review)
        │  Persistence abstraction
        ▼
PERSISTENCE LAYER  (Database Engine / Repositories)
```

This decouples the domain code from the public REST controllers (internal changes don't break the API) and gives controllers one unified interface instead of multi-object initialization chains.

### Core domain classes

**BaseModel** — the base class every entity inherits from.
- Attributes: `id` (UUIDv4), `created_at`, `updated_at`
- Methods: `create()`, `update()`, `delete()`

**User** — manages accounts, admin access, and credentials.
- Public: `first_name`, `last_name`, `email`
- Private: `password`; private method `_is_admin()`
- Associations: 1-to-many with Place (ownership), 1-to-many with Review

**Place** — a property listing.
- Attributes: `title`, `description`, `price`, `latitude`, `longitude`
- Methods: `list_amenities()`, `list_place()`
- Associations: 1-to-many with Review, many-to-many with Amenity

**Review** — links a User's feedback to a Place.
- Attributes: `place_id`, `user_id`, `rating` (1–5), `comment`

**Amenity** — a feature or service attached to one or more places.
- Attributes: `name`, `description`
- Method: `list_amenities()`

### Key request flows

**1. User registration — `POST /api/v1/users`**
1. Client sends a POST request with user data.
2. Presentation layer forwards it to the Facade via `validate_user_data(data)`.
3. Business layer validates field completeness.
4. `check_email_exists(email)` confirms the email is unique.
5. Password is hashed via `hash_password(password)`.
6. `generate_uuid()` and creation timestamps are set.
7. `save_user(user_object)` persists the record.
8. The password is stripped and the public profile is returned.
9. API responds `201 Created`.

**2. Place creation — `POST /api/v1/places`**
1. Client POSTs property data.
2. Facade validates via `validate_place_data(data)`.
3. `check_user_exists(owner_id)` confirms the owner is registered.
4. Numeric bounds are checked (`price >= 0`, valid lat/long ranges).
5. UUID and timestamps are generated.
6. `save_place(place_object)` persists the record.
7. The place object is returned; API responds `201 Created`.

**3. Review submission — `POST /api/v1/reviews`**
1. Client POSTs a review payload.
2. Facade validates via `validate_review_data(data)`.
3. Relational checks: `check_place_exists`, `check_user_exists`, `check_duplicate_review`.
4. `validate_rating(1-5)` is enforced.
5. UUID/timestamps assigned, then `save_review(review_object)`.
6. API responds `201 Created` with the review.

**4. Fetching places — `GET /api/v1/places`**
1. Client GETs with filters, e.g. `?price_max=100&latitude=x&longitude=y`.
2. Facade delegates via `get_places(filters)`.
3. Filter parameters are checked to block injection.
4. `query_places(filters)` is run against the persistence layer.
5. Matching rows are collected and serialized into application models.
6. API responds `200 OK` with the collection.

### Architectural integrity rules

- **Cryptographic isolation** — passwords are hashed immediately in the business layer; plaintext credentials are never logged or passed to the persistence driver.
- **Identity invariance** — all entities use UUIDv4 identifiers; auto-incrementing integer IDs are not used.
- **Decoupled serialization** — entities are never piped directly to the network response; they're translated through serialization functions in the business logic layer.

---

## Part 2 — Business Logic and API

Implements the Business Logic Layer and the Presentation Layer (API) defined in Part 1: the core model classes, a Facade connecting the API to them, and Flask endpoints exposing basic CRUD. Data is stored **in memory** — persistence is added in Part 3.

### Core models

All models use Python `@property`/setter pairs so invalid data is rejected on every assignment, not just at creation.

**User** — `first_name`, `last_name`, `email`, `is_admin`; validates required fields and email format.

**Place** — `title`, `description`, `price`, `latitude`, `longitude`, `owner` (a `User` object); holds lists of `Review` and `Amenity` objects (direct references, per the task spec, not foreign keys); validates price and coordinate ranges.

**Review** — `text`, `rating`, `place` (a `Place`), `user` (a `User`); validates rating range and required fields.

**Amenity** — `name`; validates that a name is provided.

**BaseModel** (shared by all entities) provides `id` (UUID4), `created_at`/`updated_at`, `save()`, and `to_dict()`.

Example usage:

```python
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

user = User(first_name="John", last_name="Doe", email="john@example.com")
place = Place(title="Cozy Apartment", description="Near the beach",
              price=120.0, latitude=24.7136, longitude=46.6753, owner=user)
place.add_review(review)
place.add_amenity(amenity)
review = Review(text="Great stay, very clean!", rating=5, place=place, user=user)
wifi = Amenity(name="Wi-Fi")
```

### Facade

The single entry point between the API and the business logic layer, so routes never touch model internals directly:

```python
from app.services.facade import HBnBFacade

facade = HBnBFacade()

new_user = facade.create_user({
    "first_name": "John", "last_name": "Doe", "email": "john@example.com"
})
new_place = facade.create_place({
    "title": "Cozy Apartment", "price": 120.0,
    "latitude": 24.7136, "longitude": 46.6753, "owner_id": new_user.id
})
all_places = facade.get_all_places()
```

### Project structure

```
part2/
├── app/
│   ├── api/v1/            # users.py, places.py, reviews.py, amenities.py
│   ├── models/             # user.py, place.py, review.py, amenity.py
│   ├── services/facade.py
│   └── persistence/repository.py
├── tests/
├── run.py
├── config.py
└── requirements.txt
```

### Setup

```bash
cd part2
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

The API starts at `http://127.0.0.1:5000` by default.

### API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/users/` | Create a new user |
| GET | `/api/v1/users/` | List all users |
| GET | `/api/v1/users/<id>` | Get a specific user |
| PUT | `/api/v1/users/<id>` | Update a user |
| POST | `/api/v1/places/` | Create a new place |
| GET | `/api/v1/places/` | List all places |
| GET | `/api/v1/places/<id>` | Get a specific place |
| PUT | `/api/v1/places/<id>` | Update a place |
| POST | `/api/v1/reviews/` | Create a new review |
| GET | `/api/v1/reviews/` | List all reviews |
| GET | `/api/v1/reviews/<id>` | Get a specific review |
| PUT | `/api/v1/reviews/<id>` | Update a review |
| DELETE | `/api/v1/reviews/<id>` | Delete a review |
| POST | `/api/v1/amenities/` | Create a new amenity |
| GET | `/api/v1/amenities/` | List all amenities |
| GET | `/api/v1/amenities/<id>` | Get a specific amenity |
| PUT | `/api/v1/amenities/<id>` | Update an amenity |

### Validation rules

- **User**: `first_name`, `last_name` required; `email` required, valid format
- **Place**: `title` required; `price` positive; `latitude` between -90 and 90; `longitude` between -180 and 180
- **Review**: `text` required; `rating` between 1 and 5; `user_id`/`place_id` must reference existing records
- **Amenity**: `name` required

### Testing

Each endpoint was tested both manually (cURL / Swagger) and with automated `unittest` tests, covering valid input, invalid input, boundary values, missing required fields, and non-existent IDs (`404`).

```bash
python3 -m unittest discover tests
```

Swagger docs (auto-generated by Flask-RESTx) are available at `http://127.0.0.1:5000/api/v1/`.

Testing summary:

| Endpoint | Input | Expected | Result |
|---|---|---|---|
| `POST /api/v1/users/` | Valid user data | `201 Created` | ✅ Pass |
| `POST /api/v1/users/` | Empty names, invalid email | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/places/` | Valid place data | `201 Created` | ✅ Pass |
| `POST /api/v1/places/` | Negative `price` | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/places/` | `latitude` out of range | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/reviews/` | Valid review data | `201 Created` | ✅ Pass |
| `POST /api/v1/reviews/` | Non-existent `user_id`/`place_id` | `400 Bad Request` | ✅ Pass |
| `GET /api/v1/users/<id>` | Non-existent `id` | `404 Not Found` | ✅ Pass |
| `POST /api/v1/amenities/` | Empty `name` | `400 Bad Request` | ✅ Pass |

---

## Part 3 — Authentication & Database Integration

Moves the backend off in-memory storage onto persistent SQLite (MySQL-ready for production) and adds JWT authentication with role-based access control.

### What's new in this part

- **JWT authentication** via Flask-JWT-Extended — login returns an access token used on subsequent requests.
- **Role-based access control** — an `is_admin` flag on `User` gates admin-only endpoints and enforces ownership checks (e.g. only a review's author can edit/delete it).
- **SQLAlchemy ORM models** — `User`, `Place`, `Review`, `Amenity`, including a `Place ↔ Amenity` many-to-many association table and FK relationships for `User → Place` and `User/Place → Review`.
- **Persistent storage** — SQLite for development (`instance/development.db`), configured to swap in MySQL for production.

### Project structure

```
part3/
├── app/
│   ├── api/v1/           # amenities.py, places.py, reviews.py, auth.py, protected.py, users.py
│   ├── models/            # base_model.py, user.py, place.py, review.py, amenity.py, place_amenity.py
│   ├── persistence/       # repository.py, user_repository.py, SQLAlchemyRepository.py, SQLScripts.sql, data.sql
│   └── services/facade.py
├── instance/development.db
├── tests/
├── config.py
├── requirements.txt
├── Dockerfile
├── run.py
└── ERDiagram.md
```

### Entities and relationships

| Entity | Description |
|---|---|
| `USER` | id, name, email, password (hashed), `is_admin` |
| `PLACE` | id, title, price, latitude, longitude; linked to owner via `owner_id` |
| `REVIEW` | id, text, rating; linked to `user_id` and `place_id` |
| `AMENITY` | id, name |
| `PLACE_AMENITY` | junction table linking places and amenities |

- `USER → PLACE`: one user can own multiple places (1:N)
- `USER → REVIEW`: one user can write multiple reviews (1:N)
- `PLACE → REVIEW`: one place can receive multiple reviews (1:N)
- `PLACE ↔ AMENITY`: many-to-many (N:M) via `PLACE_AMENITY`

(Full ER diagram generated with Mermaid.js — see `ERDiagram.md`.)

### Setup

```bash
pip install -r requirements.txt

flask shell
>>> from app import db
>>> db.create_all()
>>> exit()

python run.py
```

The API is served at `http://127.0.0.1:5000/api/v1/`.

### Seeded admin account

To bootstrap admin-only endpoints, the database is seeded with a default admin:

- **email:** `admin@hbnb.io`
- **password:** `admin1234`

### Authenticating

**Log in:**

```bash
curl -X POST "http://127.0.0.1:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hbnb.io", "password": "admin1234"}'
```

Response:

```json
{ "access_token": "<jwt_token>" }
```

**Access a protected endpoint:**

```bash
curl -X GET "http://127.0.0.1:5000/api/v1/protected" \
  -H "Authorization: Bearer <jwt_token>"
```

### API endpoints

| Method | Endpoint | Auth required | Notes |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | Returns a JWT |
| `GET` | `/api/v1/places/` | No | List all places |
| `GET` | `/api/v1/places/<place_id>` | No | Place details |
| `POST` | `/api/v1/places/` | Yes | Create a place |
| `PUT` | `/api/v1/places/<place_id>` | Yes (owner) | Update own place; `403` otherwise |
| `POST` | `/api/v1/places/<place_id>/reviews` | Yes | Create a review for a place |
| `PUT` | `/api/v1/reviews/<review_id>` | Yes (author) | Update own review |
| `DELETE` | `/api/v1/reviews/<review_id>` | Yes (author) | Delete own review |
| `POST` | `/api/v1/users/` | Yes (admin) | Create a user |
| `PUT` | `/api/v1/users/<user_id>` | Yes (admin or self) | Update a user |
| `POST` | `/api/v1/amenities/` | Yes (admin) | Create an amenity |
| `PUT` | `/api/v1/amenities/<amenity_id>` | Yes (admin) | Update an amenity |

Unauthorized action example:

```bash
curl -X PUT "http://127.0.0.1:5000/api/v1/places/<place_id>" \
  -d '{"title": "Updated Place"}' \
  -H "Authorization: Bearer <a_different_users_token>" \
  -H "Content-Type: application/json"
```

```json
{ "error": "Unauthorized action" }
```

### Database testing — CRUD (MySQL)

The database layer was verified against MySQL to confirm the `hbnb_data` schema and CRUD operations work correctly.

```sql
-- Connect and create the database
mysql -u root
CREATE DATABASE hbnb_data;
USE hbnb_data;
SOURCE SQLScripts.sql;

-- Read
SHOW TABLES;
SELECT * FROM User;
SELECT * FROM Place;
SELECT * FROM Reviews;
SELECT * FROM Amenity;
SELECT * FROM Place_Amenity;

-- Update
UPDATE User SET first_name = 'Updated' WHERE id = 'user_id';
SELECT * FROM User WHERE id = 'user_id';

-- Insert
INSERT INTO users (user_id, first_name, last_name, email, password)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'John', 'Doe',
        'john.doe@example.com', 'password123');

-- Delete
DELETE FROM User WHERE id = 'user_id';
SELECT * FROM User WHERE id = 'user_id';  -- empty result confirms deletion
```

| Operation | MySQL Command | Result |
|---|---|---|
| Create | `CREATE DATABASE hbnb_data;` | Database created |
| Read | `SELECT`, `SHOW TABLES` | Data retrieved |
| Update | `UPDATE ... SET ...` | Records modified |
| Insert | `INSERT INTO ...` | Records inserted |
| Delete | `DELETE FROM ...` | Records removed |

### Testing

```bash
python -m unittest discover tests
```

Test isolation between cases uses a `facade.reset()` call. Manual/integration testing was also done with cURL against a running instance.

### Implementation notes

- The `Place ↔ Amenity` many-to-many relationship uses an association proxy pattern rather than exposing the join table directly in the API.
- JWT setup requires `jwt.init_app(app)` during app initialization — easy to miss, and the API silently fails to validate tokens without it.
- `GET /api/v1/places/<place_id>/reviews` is registered under the `places` blueprint since reviews are scoped to a place in the URL.

### Running with Docker

```bash
# From the project root
docker build -t my-app .
docker run -p 5000:5000 my-app
```

The Dockerfile uses a lightweight `python:3.10-slim` base image, installs dependencies from `requirements.txt`, copies the app code, exposes port `5000`, and runs `run.py` as the entry point. Access the app at `http://localhost:5000`.

---

## Part 4 — Simple Web Client

Adds a static front-end client — HTML, CSS, and vanilla JavaScript (no frameworks) — that consumes the Part 3 API and provides an interactive, browser-based experience for guests, hosts, and admins.

### Objective

- Core pages: landing, places listing, place details, login, add place, add review, and add user (admin).
- Client-side authentication using a JWT stored in a cookie.
- Dynamic fetch/render of API data with the Fetch API (AJAX), without page reloads.
- Role-based UI logic (show/hide "Add Place", "Add Review", "Admin" links based on login state and admin status).
- Responsive across desktop and mobile viewports.

### Architecture recap

```
Browser (HTML/CSS/JS)
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

The client is purely static — it never talks to the database directly. Every read/write goes through the documented REST endpoints, with the JWT attached to protected requests via `Authorization: Bearer <token>`.

### Project structure

```
part4/
└── base_model/
    ├── css/
    │   ├── styles.css               # Shared styles (variables, header, footer, buttons)
    │   ├── home_styles.css          # Landing page
    │   ├── admin_nav_styles.css     # "Admin" dropdown
    │   ├── forms_styles.css         # Shared form layout
    │   ├── register_styles.css      # Success/error messages, add-user form
    │   ├── places_styles.css        # Places grid + price filter
    │   ├── place_details_styles.css # Place details + reviews
    │   └── add_review_styles.css    # Add-review star rating widget
    ├── images/                      # Icons, logo, favicon
    ├── js/
    │   ├── script.js                 # Shared config/helpers: API_URL, cookies, nav/auth state
    │   ├── login_script.js           # Login logic, stores JWT in a cookie
    │   ├── register_script.js        # Add-user form (admin only)
    │   ├── places_script.js          # Fetch/render all places, price filter
    │   ├── add_place_script.js       # Add-place form (fetches amenities)
    │   ├── place_details_script.js   # Fetch place + reviews, gallery, delete reviews
    │   └── add_review_script.js      # Submit a new review (text + star rating)
    ├── home.html          # Landing page
    ├── index.html          # List of all available places, with price filter
    ├── place.html           # Details of a single place + its reviews
    ├── add_place.html       # Form to create a new place (requires login)
    ├── add_review.html      # Form to submit a review (requires login)
    ├── login.html            # Login form
    └── register.html          # Form to add a new user (admin only)
```

### Pages overview

- **`home.html`** — Marketing-style landing page: hero, "Why book with Vibe" features grid, "How it works" steps, CTA banner linking to the places listing.
- **`index.html`** — Fetches `GET /api/v1/places/` on load and renders each place as a card (title, price/night, "View Details" link). Includes a client-side max-price filter (`$10 / $50 / $100 / All`) with no extra network requests.
- **`place.html`** — Reads the place `id` from the URL query string and fetches `GET /api/v1/places/<id>` and `GET /api/v1/places/<id>/reviews`. Reviews show reviewer name, star rating, and comment; a delete button appears for reviews the logged-in user authored (`DELETE /api/v1/reviews/<id>`). The "Add a Review" section is only shown to authenticated users.
- **`add_place.html`** — Loads amenities via `GET /api/v1/amenities/` as checkboxes, submits via `POST /api/v1/places/` with the JWT attached; hidden behind an access message for unauthenticated visitors.
- **`add_review.html`** — Free-text review field plus an interactive 5-star rating widget built with plain buttons and JS. Submits via `POST /api/v1/reviews/` and redirects to `place.html` on success.
- **`login.html`** — Submits credentials to `POST /api/v1/auth/login`, stores the returned `access_token` in a `token` cookie (`max-age=86400`, 24 hours), redirects to `home.html`.
- **`register.html`** (admin only) — Rendered only for users whose JWT payload has `is_admin: true` (decoded client-side); everyone else sees an access message. Submits to `POST /api/v1/users/` with the admin's token.

### Client-side authentication

- On login, the JWT is stored in a cookie: `document.cookie = "token=<jwt>; path=/; max-age=86400"`.
- `script.js` exposes `getCookie(name)` to read it back on every page.
- The JWT payload is decoded client-side (base64) purely to read the `is_admin` claim and toggle UI elements. This is a **UX convenience only** — the server independently re-validates the token and the admin claim on every protected request.
- `refreshNavState()` runs on `DOMContentLoaded` and on the `pageshow` event (for the browser's back/forward cache) to keep Login/Logout, Admin, and Add Place links in sync with the session.

### API endpoints used by the client

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

### Setup

**Prerequisites:** a running Part 3 back-end API (Flask), reachable at `http://127.0.0.1:5000/api/v1` by default; any modern browser; Python is optional, for serving the static files over HTTP instead of `file://`.

**Configuration** — the API base URL is defined in one place, `js/script.js`:

```js
const API_URL = 'http://127.0.0.1:5000/api/v1';
```

Update this before deploying elsewhere.

**Running the client**

Option 1 — open directly in the browser:

```bash
open base_model/home.html
```

Option 2 — serve over a local HTTP server (recommended):

```bash
cd base_model
python3 -m http.server 8000
```

Then visit `http://localhost:8000/home.html`.

### Seeded admin account

To test `register.html`, log in with the admin account seeded by the Part 3 back end:

- **email:** `admin@hbnb.io`
- **password:** `admin1234`

### Manual testing checklist

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

### Implementation notes

- The client uses **cookies**, not `localStorage`, to persist the JWT, since each page load is a separate load (not a single-page app).
- `place.html` fetches the place and its reviews **in parallel** with `Promise.all` to minimize perceived load time.
- Reviewer names are resolved from the review payload first (`review.user`, `review.user_name`, etc.) and fall back to `GET /users/<id>` only when needed.
- Amenity icons are matched by keyword (e.g. `pool`, `air conditioning`) with a generic fallback icon (`icon_bath.png`) so newly added amenities never render a broken image.
- `add_place.html` currently references `images/logo.png` while other pages reference `images/logo.svg` — worth unifying in a follow-up cleanup pass.
- The API base URL (`http://127.0.0.1:5000/api/v1`) is a development default and must be updated before any production deployment.

---

## Resources

- [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN — Document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [JWT.io — Introduction to JSON Web Tokens](https://jwt.io/introduction)
- [Flask-JWT-Extended docs](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy docs](https://docs.sqlalchemy.org/)
- [Flask docs](https://flask.palletsprojects.com/)
- [Mermaid.js docs](https://mermaid.js.org/)

## Document Authors and Contributors

This project was built as part of Holberton School / Holberton Academy.

- Lama Almazroa — [@l44mz](https://github.com/l44mz)
- Noura Alotibi — [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi — [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)
