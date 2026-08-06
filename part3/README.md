# HBnB Evolution — Part 3: Authentication & Database Integration

A Flask-based REST API for an Airbnb-style booking platform. This part of the project moves the backend off in-memory storage and onto a persistent SQLite database (MySQL-ready for production), and adds JWT authentication with role-based access control.

## What's in this part

- **JWT authentication** via Flask-JWT-Extended — users log in and receive an access token used to authenticate subsequent requests.
- **Role-based access control** — an `is_admin` flag on the User model gates admin-only endpoints and enforces ownership checks (e.g. only a review's author can edit or delete it).
- **SQLAlchemy ORM models** — User, Place, Review, and Amenity, including a `Place ↔ Amenity` many-to-many relationship via an association table, and foreign-key relationships for `User → Place` and `User/Place → Review`.
- **Persistent storage** — SQLite for development (`instance/development.db`), with the app configured to swap in MySQL for production.

## Project structure

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

## Entity-relationship diagram

<img width="1086" height="1600" alt="image" src="https://github.com/user-attachments/assets/c4b84682-7bab-48df-a698-442ceb1555ce" />


*(Diagram generated with mermaid.js — see `ERDiagram.md` for the source.)*

**Entities**

| Entity | Description |
|---|---|
| `USER` | id, name, email, password (hashed), `is_admin` |
| `PLACE` | id, title, price, latitude, longtitude; linked to owner via `owner_id` |
| `REVIEW` | id, text, rating; linked to both `user_id` and `place_id` |
| `AMENITY` | id, name |
| `PLACE_AMENITY` | junction table linking places and amenities |

**Relationships**

- `USER → PLACE`: one user can own multiple places (1:N)
- `USER → REVIEW`: one user can write multiple reviews (1:N)
- `PLACE → REVIEW`: one place can receive multiple reviews (1:N)
- `PLACE ↔ AMENITY`: many-to-many (N:M), joined via `PLACE_AMENITY`

## Getting started

### Environment setup

The app reads database credentials and secret keys from environment variables. Copy the example file to `.env`:

```bash
cp .env.example .env
```

For grading/checker purposes, the project uses a fixed development database user and password:

```
# .env
DATABASE_URL=mysql+pymysql://hbnb_user:nn123456@localhost/hbnb_dev_db
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here
```

**Database credentials:**
- **password:** `nn123456`

Use these to connect to the development database when testing or checking the project.

```bash
# install dependencies
pip install -r requirements.txt

# initialize the database
flask shell
>>> from app import db
>>> db.create_all()
>>> exit()

# run the app
python run.py
```

The API is served at `http://127.0.0.1:5000/api/v1/`.

### Seeded admin account

To test admin-only endpoints without a chicken-and-egg problem (you need an admin to create the first admin), the database is seeded with a default admin user on setup:

- **email:** `admin@hbnb.io`
- **password:** `admin1234`

Use this account to obtain an admin JWT and bootstrap any additional admin users you need.

## Authenticating

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

## Example endpoints

| Method | Endpoint | Auth required | Notes |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | No | Returns a JWT |
| `GET` | `/api/v1/places/` | No | List all places |
| `GET` | `/api/v1/places/<place_id>` | No | Place details |
| `POST` | `/api/v1/places/` | Yes | Create a place |
| `PUT` | `/api/v1/places/<place_id>` | Yes (owner) | Update own place; returns 403 otherwise |
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

## Testing

Automated unit tests live under `tests/`. Test isolation between cases is handled with a `facade.reset()` call to clear state between runs.

```bash
python -m unittest discover tests
```

Manual/integration testing was also done with cURL against a running instance — see the endpoint table above for the shapes of the main requests.

## Notes on implementation

- The `Place ↔ Amenity` many-to-many relationship uses an association proxy pattern rather than exposing the join table directly in the API.
- JWT setup requires `jwt.init_app(app)` to be called during app initialization — easy to miss, and the API silently fails to validate tokens without it.
- The `GET /api/v1/places/<place_id>/reviews` route is registered under the `places` blueprint/namespace rather than `reviews`, since reviews are scoped to a place in the URL.

## Resources

- [Flask-JWT-Extended docs](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy docs](https://docs.sqlalchemy.org/)
- [Flask docs](https://flask.palletsprojects.com/)
- [Mermaid.js docs](https://mermaid.js.org/)

### Document Authors and Contributors

- Lama Almazroa - [@l44mz](https://github.com/l44mz)
- Noura Alotibi - [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi - [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)

---

