# HBnB Evolution

HBnB Evolution is a full-stack, Airbnb-style short-term rental marketplace built in four progressive stages: architectural design, business logic and API implementation, authentication and database integration, and a vanilla JavaScript web client. This README consolidates all four parts of the project into a single, comprehensive reference.

## Table of Contents

- [Project Overview](#project-overview)
- [Part 1 — Technical Documentation and Architectural Blueprint](#part-1--technical-documentation-and-architectural-blueprint)
- [Part 2 — Business Logic and API](#part-2--business-logic-and-api)
- [Part 3 — Authentication and Database Integration](#part-3--authentication-and-database-integration)
- [Part 4 — Simple Web Client](#part-4--simple-web-client)
- [Full Repository Structure](#full-repository-structure)
- [Getting Started (End to End)](#getting-started-end-to-end)
- [Authors and Contributors](#authors-and-contributors)

---

## Project Overview

HBnB Evolution is an enterprise-grade short-term rental marketplace supporting user profiles, property listings, amenity grouping, and review feedback. The project is organized into four parts that build on one another:

| Part | Focus | Key Deliverables |
|---|---|---|
| **Part 1** | Architecture & Design | Package diagram, class diagram, sequence diagrams |
| **Part 2** | Business Logic & API | Python model classes, Facade pattern, Flask REST API (in-memory storage) |
| **Part 3** | Auth & Persistence | JWT authentication, role-based access control, SQLAlchemy ORM, SQLite/MySQL |
| **Part 4** | Web Client | HTML/CSS/vanilla JS front end consuming the Flask API |

The application follows a strict **three-layer architecture** throughout every part:

```
Presentation Layer  →  Business Logic Layer  →  Persistence Layer
 (API / Services)        (Facade → Models)        (Repositories / DB)
```

A **Facade pattern** sits between the Presentation and Business Logic layers so that API routes never touch model internals directly, and the internal domain code can evolve without breaking public-facing controllers.

---

## Part 1 — Technical Documentation and Architectural Blueprint

Part 1 is the conceptual, logical, and physical design phase of the system. It defines the layered architecture, class layout, and request sequence flows that all later parts implement.

### Repository Layout (Part 1)

```
hbnb/
└── part1/
    ├── README.md
    ├── Package Diagram.md
    ├── class diagram.md
    └── Sequence Diagrams.md
```

### High-Level Architecture

The application implements a **Decoupled Three-Layer Architecture**:

- **Presentation Layer (Services & API)** — the ingress gateway. Handles client requests, URI routing, payload marshalling, and standardized HTTP responses.
- **Business Logic Layer (Models Core)** — the central engine. Holds entity structures, enforces business rules, evaluates attribute invariants, and defines model behaviors.
- **Persistence Layer (Database & Repositories)** — abstracts state persistence. Handles reads/writes and manages connections via generic repository interfaces.

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
|            [Services Package]    |    [API Package]         |
+------------------------------+------------------------------+
                               |
                               | Unidirectional Facade Signals
                               v
+-------------------------------------------------------------+
|                    BUSINESS LOGIC LAYER                      |
|  [BaseModel]  [User]  [Place]  [Amenity]  [Review] Packages  |
+------------------------------+------------------------------+
                               |
                               | Database Operations Abstraction
                               v
+-------------------------------------------------------------+
|                      PERSISTENCE LAYER                       |
|          [Database Engine]   |   [Repositories]              |
+-------------------------------------------------------------+
```

**Why a Facade?**
- **Decoupling** — internal domain code can be optimized or restructured without breaking REST controllers.
- **Unified interface** — API controllers call single, simple facade operations instead of orchestrating multiple objects directly.

### Domain Class Layout

#### BaseModel (abstract base)
- `id` (UUIDv4), `created_at`, `updated_at`
- `create()`, `update()`, `delete()`

#### User
- Public: `first_name`, `last_name`, `email`
- Private: `password` (hashed), `_is_admin()`
- Associations: 1-to-many with `Place`, 1-to-many with `Review`

#### Place
- Public: `title`, `description`, `price`, `latitude`, `longitude`
- Methods: `list_amenities()`, `list_place()`
- Associations: 1-to-many with `Review`, many-to-many with `Amenity`

#### Review
- `place_id`, `user_id`, `rating` (1–5, validated), `comment`

#### Amenity
- `name`, `description`
- Method: `list_amenities()`

### API Sequence Flows

Four core use cases were modeled end-to-end, from client request through the Facade and Business Logic layer to Persistence and back:

1. **User Registration** (`POST /api/v1/users`) — validate data → check email uniqueness → hash password → generate UUID → save → return sanitized (password-free) user with `201 Created`.
2. **Place Creation** (`POST /api/v1/places`) — validate data → verify owner exists → validate price/coordinate bounds → generate UUID → save → return `201 Created`.
3. **Review Submission** (`POST /api/v1/reviews`) — validate data → verify place exists, user exists, and no duplicate review → validate rating (1–5) → save → return `201 Created`.
4. **Fetching Places** (`GET /api/v1/places`) — parse filters → sanitize input → query repository → serialize results → return `200 OK`.

### Architectural Integrity Rules

- **Cryptographic isolation** — passwords are hashed immediately in the business layer; plaintext credentials are never logged or passed to the persistence layer.
- **Identity invariance** — all entities use UUIDv4 identifiers; auto-incrementing integer IDs are banned.
- **Decoupled serialization** — domain objects are never returned directly over the network; they are serialized into clean response models first.

---

## Part 2 — Business Logic and API

Part 2 implements the models and API defined in Part 1, using **in-memory storage** (no database yet).

### Objective

- Define core model classes: `User`, `Place`, `Review`, `Amenity`
- Implement per-attribute validation logic
- Build a Facade connecting the API layer to the business logic layer
- Expose CRUD operations via Flask endpoints
- Store objects in memory (persistence is added in Part 3)

### Architecture Recap

```
Presentation Layer (Flask API / endpoints)
        │
        ▼
Business Logic Layer (Facade → User, Place, Review, Amenity)
        │
        ▼
Persistence Layer (in-memory storage for now)
```

### Core Models

**User** — `first_name`, `last_name`, `email`, `is_admin`; validates required fields and email format.

**Place** — `title`, `description`, `price`, `latitude`, `longitude`, `owner` (a `User` object); holds lists of associated `Review` and `Amenity` objects (direct object references rather than foreign keys); validates price and coordinate ranges.

**Review** — `text`, `rating`, `place` (a `Place` object), `user` (a `User` object); validates rating range and required fields.

**Amenity** — `name`; validates that a name is provided.

All models use Python `@property` / `@<attr>.setter` pairs, so validation runs on every assignment, not just at creation.

### BaseModel

Shared by every entity:
- `id` — UUID4 string assigned on creation
- `created_at` / `updated_at` — automatic timestamps
- `save()` — updates `updated_at` on change
- `to_dict()` — dictionary representation

### Example Usage

```python
from app.models.user import User

user = User(first_name="John", last_name="Doe", email="john@example.com")
user.email = "not-an-email"  # raises ValueError
```

```python
from app.models.place import Place

place = Place(title="Cozy Apartment", description="Near the beach",
              price=120.0, latitude=24.7136, longitude=46.6753, owner=user)
place.add_review(review)
place.add_amenity(amenity)
```

```python
from app.models.review import Review

review = Review(text="Great stay, very clean!", rating=5, place=place, user=user)
```

```python
from app.models.amenity import Amenity

wifi = Amenity(name="Wi-Fi")
```

### Facade

Single entry point between the API and the Business Logic layer:

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

### Project Structure (Part 2)

```
part2/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       ├── amenities.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── facade.py
│   ├── persistence/
│       ├── __init__.py
│       ├── repository.py
├── tests/
│   ├── __init__.py
│   ├── test_amenities.py
│   ├── test_places.py
│   ├── test_reviews.py
│   ├── test_users.py
├── run.py
├── config.py
├── requirements.txt
├── README.md
```

### Setup

```bash
cd part2
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

The Flask development server starts on `http://127.0.0.1:5000` by default.

### API Endpoints

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

### Validation Rules

Validation happens in the Business Logic Layer, so invalid data never reaches persistence.

- **User** — `first_name`, `last_name` required and non-empty; `email` must match a valid format.
- **Place** — `title` required; `price` required and positive; `latitude` between -90 and 90; `longitude` between -180 and 180.
- **Review** — `text` required; rating required, 1–5; `user_id`/`place_id` must reference existing records.
- **Amenity** — `name` required, non-empty.

### Testing

Manual black-box testing (cURL / Swagger) plus automated `unittest` suites cover both positive and negative scenarios.

**Valid user creation:**

```bash
curl -X POST "http://127.0.0.1:5000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com"}'
```

Expected `201 Created`:

```json
{
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
}
```

**Invalid user creation** returns `400 Bad Request` with `{"error": "Invalid input data"}`.

The same valid/invalid pattern is applied to `Place`, `Review`, and `Amenity` endpoints, covering boundary testing (out-of-range coordinates, negative prices), missing required fields, and 404s for non-existent resource IDs.

Swagger docs (auto-generated by Flask-RESTx) are available at `http://127.0.0.1:5000/api/v1/`.

Run automated tests with:

```bash
python3 -m unittest discover tests
```

**Testing report summary:**

| Endpoint | Input | Expected | Actual | Result |
|---|---|---|---|---|
| `POST /api/v1/users/` | Valid user data | `201` | `201` | ✅ Pass |
| `POST /api/v1/users/` | Empty names, invalid email | `400` | `400` | ✅ Pass |
| `POST /api/v1/places/` | Valid place data | `201` | `201` | ✅ Pass |
| `POST /api/v1/places/` | Negative price | `400` | `400` | ✅ Pass |
| `POST /api/v1/places/` | Latitude out of range | `400` | `400` | ✅ Pass |
| `POST /api/v1/reviews/` | Valid review data | `201` | `201` | ✅ Pass |
| `POST /api/v1/reviews/` | Non-existent user/place | `400` | `400` | ✅ Pass |
| `GET /api/v1/users/<id>` | Non-existent id | `404` | `404` | ✅ Pass |
| `POST /api/v1/amenities/` | Empty name | `400` | `400` | ✅ Pass |

### Design Notes (Part 2)

- Data is stored in memory only; a real database arrives in Part 3.
- Relationships (owner, review's place/user) are direct object references rather than ID-based foreign keys, per the task specification.
- The Facade isolates the API from internal model structure, easing the later swap to persistent storage.

---

## Part 3 — Authentication and Database Integration

Part 3 moves the backend off in-memory storage and onto a persistent SQLite database (MySQL-ready for production), and adds JWT authentication with role-based access control.

### What's New in Part 3

- **JWT authentication** via Flask-JWT-Extended — login returns an access token used on subsequent requests.
- **Role-based access control** — an `is_admin` flag on `User` gates admin-only endpoints and enforces ownership checks (e.g., only a review's author may edit or delete it).
- **SQLAlchemy ORM models** — `User`, `Place`, `Review`, `Amenity`, including a `Place ↔ Amenity` many-to-many relationship via an association table, and foreign keys for `User → Place` and `User/Place → Review`.
- **Persistent storage** — SQLite for development (`instance/development.db`), configured to swap in MySQL for production.

### Project Structure (Part 3)

```
part3/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   └── v1/
│   │       ├── amenities.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       ├── auth.py
│   │       ├── protected.py
│   │       └── users.py
│   ├── models/
│   │   ├── base_model.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   │   └── place_amenity.py
│   ├── persistence/
│   │   ├── repository.py
│   │   ├── user_repository.py
│   │   ├── SQLAlchemyRepository.py
│   │   ├── SQLScripts.sql
│   │   └── data.sql
│   └── services/
│       ├── facade.py
│       └── __init__.py
│
├── instance/
│   └── development.db
├── tests/
│   ├── test_models/
│   │   ├── test_user.py
│   │   └── __init__.py
│   ├── test_amenities.py
│   ├── test_places.py
│   ├── test_reviews.py
│   └── test_users.py
├── config.py
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── run.py
├── .gitignore
└── ERDiagram.md
```

### Entity-Relationship Diagram

Generated with mermaid.js (source in `ERDiagram.md`).

| Entity | Description |
|---|---|
| `USER` | id, name, email, password (hashed), `is_admin` |
| `PLACE` | id, title, price, latitude, longitude; linked to owner via `owner_id` |
| `REVIEW` | id, text, rating; linked to both `user_id` and `place_id` |
| `AMENITY` | id, name |
| `PLACE_AMENITY` | junction table linking places and amenities |

**Relationships**
- `USER → PLACE`: one user can own multiple places (1:N)
- `USER → REVIEW`: one user can write multiple reviews (1:N)
- `PLACE → REVIEW`: one place can receive multiple reviews (1:N)
- `PLACE ↔ AMENITY`: many-to-many (N:M), via `PLACE_AMENITY`

### Database Testing — CRUD (MySQL)

```bash
mysql -u root
```

```sql
CREATE DATABASE hbnb_data;
USE hbnb_data;
SOURCE SQLScripts.sql;
SHOW TABLES;
SELECT * FROM User;
SELECT * FROM Place;
SELECT * FROM Reviews;
SELECT * FROM Amenity;
SELECT * FROM Place_Amenity;
```

Update:

```sql
UPDATE User SET first_name = 'Updated' WHERE id = 'user_id';
SELECT * FROM User WHERE id = 'user_id';
```

Insert:

```sql
INSERT INTO users (user_id, first_name, last_name, email, password)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'John', 'Doe', 'john.doe@example.com', 'password123');
```

Delete:

```sql
DELETE FROM User WHERE id = 'user_id';
SELECT * FROM User WHERE id = 'user_id';  -- empty result confirms deletion
```

**CRUD testing summary:**

| Operation | MySQL Command | Result |
|---|---|---|
| **Create** | `CREATE DATABASE hbnb_data;` | Database created |
| **Read** | `SELECT`, `SHOW TABLES` | Data retrieved |
| **Update** | `UPDATE ... SET ...` | Records modified |
| **Insert** | `INSERT INTO ...` | Records inserted |
| **Delete** | `DELETE FROM ...` | Records removed |

### Running Part 3

```bash
pip install -r requirements.txt

flask shell
>>> from app import db
>>> db.create_all()
>>> exit()

python run.py
```

The API is served at `http://127.0.0.1:5000/api/v1/`.

### Seeded Admin Account

A default admin user is seeded on setup to bootstrap admin-only actions:

- **email:** `admin@hbnb.io`
- **password:** `admin1234`

### Authenticating

Log in:

```bash
curl -X POST "http://127.0.0.1:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hbnb.io", "password": "admin1234"}'
```

Response:

```json
{ "access_token": "<jwt_token>" }
```

Access a protected endpoint:

```bash
curl -X GET "http://127.0.0.1:5000/api/v1/protected" \
  -H "Authorization: Bearer <jwt_token>"
```

### API Endpoints (Part 3)

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

**Unauthorized action example:**

```bash
curl -X PUT "http://127.0.0.1:5000/api/v1/places/<place_id>" \
  -d '{"title": "Updated Place"}' \
  -H "Authorization: Bearer <a_different_users_token>" \
  -H "Content-Type: application/json"
```

```json
{ "error": "Unauthorized action" }
```

### Testing (Part 3)

Automated tests live under `tests/`; test isolation between cases uses `facade.reset()`.

```bash
python -m unittest discover tests
```

Manual/integration testing was also performed with cURL against a running instance.

### Implementation Notes

- The `Place ↔ Amenity` many-to-many relationship uses an association proxy pattern rather than exposing the join table directly in the API.
- JWT setup requires `jwt.init_app(app)` during app initialization — easy to miss, and the API silently fails to validate tokens without it.
- `GET /api/v1/places/<place_id>/reviews` is registered under the `places` blueprint/namespace rather than `reviews`, since reviews are scoped to a place in the URL.

### Running with Docker

**Dockerfile:**

```dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 5000

CMD ["python", "run.py"]
```

Build and run:

```bash
docker build -t my-app .
docker run -p 5000:5000 my-app
```

Access at `http://localhost:5000`.

### Resources

- [Flask-JWT-Extended docs](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy docs](https://docs.sqlalchemy.org/)
- [Flask docs](https://flask.palletsprojects.com/)
- [Mermaid.js docs](https://mermaid.js.org/)

---

## Part 4 — Simple Web Client

A front-end web client built with **HTML5, CSS3, and vanilla JavaScript (ES6)** — no framework, no build step. It consumes the Flask REST API from Parts 2/3 to browse places, view place details, log in, and submit reviews entirely client-side.

### What's in Part 4

- **Places list** — fetches and renders all places, with a client-side max-price filter.
- **Place details** — fetches a place plus its reviews, renders an image gallery, host/price/description/amenities, and the review list.
- **Authentication** — JWT-based login; the token is stored in a cookie and read on every page to toggle auth-dependent UI.
- **Review submission** — an authenticated-only form with an interactive star-rating widget.
- **Review deletion** — review authors can delete their own reviews from the place details page.
- **Account registration** — a complete registration form UI (not yet wired to the API — see [Known Issues](#known-issues)).

### Project Structure (Part 4)

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

### Client Architecture

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

`script.js` centralizes shared helpers (API base URL, cookie/URL utilities) so each page script stays focused on its own logic.

### Pages & Features

1. **`home.html`** — Static marketing landing page (hero, feature cards, "How it works," CTA banner). No API calls.
2. **`index.html`** — Places list. `checkAuthentication()` reads the `token` cookie to toggle the login button; `fetchPlaces()` calls `GET /places/`; `displayPlaces()` renders cards with a "View Details" link; a client-side price filter (10 / 50 / 100 / all) filters rendered cards with no extra request.
3. **`login.html`** — `loginUser()` posts to `/auth/login`; on success the `access_token` is stored in a `token` cookie (`max-age=86400`) and the browser redirects to `index.html`; on failure the API's error message is displayed.
4. **`register.html`** — Fully built and HTML-validated form (first/last name, email, password, confirm password), but `register_script.js` currently only logs a warning — **not yet wired** to a `POST /users/` (or `/auth/register`) call.
5. **`place.html`** — Fetches place details and reviews in parallel (`GET /places/<id>`, `GET /places/<id>/reviews`); renders an image gallery, host, price, description, amenities, and reviews; shows a delete button only on the current user's own reviews (ownership determined by decoding the JWT client-side); `deleteReview()` sends `DELETE /reviews/<id>` after confirmation.
6. **`add_review.html`** — Requires authentication (redirects to `index.html` if no token); reads `placeId` from the URL and fetches the place title; implements a click/hover 5-star rating widget; submits `POST /reviews/` with `{ text, rating, place_id }` and a bearer token; on success, stores a message in `sessionStorage` and redirects to the place details page.

### Authentication (Client-Side)

| Aspect | Implementation |
|---|---|
| Token storage | Browser cookie named `token` (not `localStorage`/`sessionStorage`) |
| Token read | `getCookie('token')` in `js/script.js`, used on every page |
| Token lifetime | `max-age=86400` (1 day), set at login |
| Protected page | `add_review.html` — redirects to `index.html` if no token |
| Conditionally-gated UI | Login button visibility, "Add a Review" section, per-review delete button |
| Identifying the current user | JWT payload decoded client-side (`getUserIdFromToken()`), compared against a review's `user_id` |

### Setup & Run

Prerequisite: the Part 2/Part 3 Flask API running locally (this client has no backend of its own).

```bash
# 1. Start the API (from the part2/ or part3/ directory)
python run.py
# → serves http://127.0.0.1:5000/api/v1

# 2. Serve the client (from inside base_model/)
cd base_model
python3 -m http.server 8000
# → open http://localhost:8000/home.html
```

The API base URL is hardcoded in `js/script.js`:

```js
const API_URL = 'http://127.0.0.1:5000/api/v1';
```

Update this constant if the API runs on a different host or port. Opening the HTML files directly via `file://` also works for quick checks, but a local static server is recommended so relative paths and CORS behave the same as in production.

### API Endpoints Used (Client)

| Method | Endpoint | Auth required | Used by |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | `login_script.js` |
| `GET` | `/api/v1/places/` | No | `places_script.js` |
| `GET` | `/api/v1/places/<place_id>` | No | `place_details_script.js`, `add_review_script.js` |
| `GET` | `/api/v1/places/<place_id>/reviews` | No | `place_details_script.js` |
| `POST` | `/api/v1/reviews/` | Yes | `add_review_script.js` |
| `DELETE` | `/api/v1/reviews/<review_id>` | Yes (author) | `place_details_script.js` |

### Tech Notes

- No external libraries or frameworks — pure HTML/CSS/vanilla JS (ES6), consistent with the rest of the HBnB stack.
- Every CSS file includes a `@media (max-width: 600px)` block for basic responsiveness.
- Colors, radii, and shadows are centralized as CSS custom properties (`:root` in `styles.css`) and reused across page-specific stylesheets.
- `script.js` is dependency-free and loaded before every page script.

### Known Issues

- The registration form (`register.html`) is fully built and validated on the client but is **not yet connected to the API** — submitting it currently only logs a console warning.

### Resources

- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN — Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [jwt.io — JWT debugger](https://jwt.io/)
- [Flask docs](https://flask.palletsprojects.com/)

---

## Full Repository Structure

```
hbnb/
├── part1/                      # Architecture & design documentation
│   ├── README.md
│   ├── Package Diagram.md
│   ├── class diagram.md
│   └── Sequence Diagrams.md
│
├── part2/                      # Business logic & API (in-memory storage)
│   ├── app/
│   │   ├── api/v1/              (users, places, reviews, amenities)
│   │   ├── models/               (user, place, review, amenity)
│   │   ├── services/facade.py
│   │   └── persistence/repository.py
│   ├── tests/
│   ├── run.py
│   ├── config.py
│   └── requirements.txt
│
├── part3/                      # Auth & persistent database
│   ├── app/
│   │   ├── api/v1/              (users, places, reviews, amenities, auth, protected)
│   │   ├── models/               (base_model, user, place, review, amenity, place_amenity)
│   │   ├── persistence/          (repository, user_repository, SQLAlchemyRepository, SQL scripts)
│   │   └── services/facade.py
│   ├── instance/development.db
│   ├── tests/
│   ├── Dockerfile
│   ├── run.py
│   ├── config.py
│   ├── ERDiagram.md
│   └── requirements.txt
│
└── part4/ (base_model/)        # Vanilla JS web client
    ├── css/
    ├── images/
    ├── js/
    ├── home.html
    ├── index.html
    ├── login.html
    ├── register.html
    ├── place.html
    └── add_review.html
```

---

## Getting Started (End to End)

To run the complete stack locally (API from Part 3 plus the Part 4 client):

```bash
# 1. Set up and start the API (Part 3)
cd part3
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

flask shell
>>> from app import db
>>> db.create_all()
>>> exit()

python run.py
# → API running at http://127.0.0.1:5000/api/v1

# 2. In a separate terminal, serve the web client (Part 4)
cd base_model
python3 -m http.server 8000
# → open http://localhost:8000/home.html
```

Log in with the seeded admin account (`admin@hbnb.io` / `admin1234`) or register a new user directly via the API to explore places, submit reviews, and test role-based access.

---

## Authors and Contributors

- Lama Almazroa — [@l44mz](https://github.com/l44mz)
- Noura Alotibi — [@nnnsss12](https://github.com/nnnsss12)
- SHAHAD ALHARBI — [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)

*Built as part of Holberton Academy.*
