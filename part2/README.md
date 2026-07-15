# HBnB - Part 2: Business Logic and API

This is Part 2 of the HBnB project. It builds on the architecture
and design defined in Part 1 by implementing the core business logic classes
and a Flask-based API that exposes them.

## Objective

Implement the **Business Logic Layer** and the **Presentation Layer** (API)
of the HBnB application:

- Define the core model classes: `User`, `Place`, `Review`, and `Amenity`
- Implement validation logic for each model's attributes
- Build a Facade that connects the API layer to the business logic layer
- Expose basic CRUD operations through Flask endpoints
- Store objects in memory (no database yet — persistence is handled in a
  later part)

## Architecture Recap

The application follows a layered design:

```
Presentation Layer (Flask API / endpoints)
        │
        ▼
Business Logic Layer (Facade → User, Place, Review, Amenity)
        │
        ▼
Persistence Layer (in-memory storage for now)
```

The **Facade pattern** sits between the API and the business logic classes,
giving the API a single, simplified interface and keeping model
implementation details out of the routes.

## Core Models

### User
- Attributes: `first_name`, `last_name`, `email`, `is_admin`
- Validates required fields and email format on creation/update

### Place
- Attributes: `title`, `description`, `price`, `latitude`, `longitude`,
  `owner` (a `User` object)
- Holds lists of associated `Review` and `Amenity` objects (object
  references, not foreign keys, per the task specification)
- Validates price and coordinate ranges

### Review
- Attributes: `text`, `rating`, `place` (a `Place` object), `user` (a `User`
  object)
- Validates rating range and required fields

### Amenity
- Attributes: `name`
- Validates that a name is provided

All models use Python `@property` / `@<attr>.setter` pairs to enforce
validation whenever an attribute is set, rather than validating only at
object creation.

## Business Logic Layer

The Business Logic Layer contains the core entities of the application and
enforces all validation rules. Each entity is implemented as a Python class
with `@property` / setter pairs so that invalid data is rejected the moment
it's assigned, not just at creation time.

### BaseModel

All entities inherit from a common `BaseModel`, which provides:

- `id` — a unique UUID4 string assigned on creation
- `created_at` / `updated_at` — timestamps tracked automatically
- `save()` — updates `updated_at` whenever the object changes
- `to_dict()` — returns a dictionary representation of the object

### User

**Responsibility:** Represents an account holder (guest, host, or admin).
Validates identity fields and controls admin privileges.

- Attributes: `first_name`, `last_name`, `email`, `is_admin`
- Validation: `first_name`/`last_name` required, `email` must be a valid
  format

```python
from app.models.user import User

user = User(first_name="John", last_name="Doe",
            email="john@example.com")

print(user.first_name)      # "John"
print(user.email)           # "John@example.com"

# Updating an attribute re-runs validation
user.email = "not-an-email"  # raises ValueError
```

### Place

**Responsibility:** Represents a property listing. Owns its location, price,
and links to the `User` who owns it, plus associated `Review` and `Amenity`
objects.

- Attributes: `title`, `description`, `price`, `latitude`, `longitude`,
  `owner`
- Validation: `price` must be positive, `latitude`/`longitude` must fall
  within valid geographic ranges

```python
from app.models.place import Place

place = Place(title="Cozy Apartment", description="Near the beach",
              price=120.0, latitude=24.7136, longitude=46.6753,
              owner=user)

place.add_review(review)      # associates a Review object
place.add_amenity(amenity)    # associates an Amenity object

print(place.owner.first_name)   # "Lama"
print(len(place.reviews))       # 1
```

### Review

**Responsibility:** Represents feedback left by a `User` for a `Place`.
Links both objects together and validates the rating.

- Attributes: `text`, `rating`, `place`, `user`
- Validation: `rating` must be an integer between 1 and 5

```python
from app.models.review import Review

review = Review(text="Great stay, very clean!", rating=5,
                 place=place, user=user)

print(review.rating)         # 5
print(review.place.title)    # "Cozy Apartment"
```

### Amenity

**Responsibility:** Represents a feature or service that can be attached to
one or more places (e.g., Wi-Fi, pool, parking).

- Attributes: `name`
- Validation: `name` is required and cannot be empty

```python
from app.models.amenity import Amenity

wifi = Amenity(name="Wi-Fi")
print(wifi.name)   # "Wi-Fi"
```

### Facade

**Responsibility:** Acts as the single entry point between the API
(Presentation layer) and the Business Logic layer, so routes never touch
model internals directly.

```python
from app.services.facade import HBnBFacade

facade = HBnBFacade()

new_user = facade.create_user({
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
})

new_place = facade.create_place({
    "title": "Cozy Apartment",
    "price": 120.0,
    "latitude": 24.7136,
    "longitude": 46.6753,
    "owner_id": new_user.id
})

all_places = facade.get_all_places()
```

## Project Structure

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
│   ├── test_amenities.py
│ ├── test_places.py
│ ├── test_reviews.py
│ ├── test_users.py
├── run.py
├── config.py
├── requirements.txt
├── README.md
```

## Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
cd part2

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the API

```bash
python3 run.py
```

By default, the Flask development server starts on `http://127.0.0.1:5000`.

## API Endpoints (Overview)

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



## Design Notes

- Data is stored **in memory** for this part; persistence with a real
  database is introduced in a later part of the project.
- Relationships between models (e.g., a `Place`'s owner, or a `Review`'s
  place and user) are represented as direct object references, following
  the task specification rather than the ID-based foreign-key approach
  shown in some UML diagrams.
- The Facade pattern isolates the API layer from the internal structure of
  the business logic layer, making it easier to swap the persistence
  mechanism later without changing the API.


## Testing and Validation
 
Each endpoint is validated at the model level and tested using both manual
black-box testing (cURL / Swagger) and automated unit tests.
 
### Validation Rules
 
Validation is enforced in the Business Logic Layer, so invalid data is
rejected before it ever reaches the persistence layer.
 
**User**
- `first_name` — required, cannot be empty
- `last_name` — required, cannot be empty
- `email` — required, must match a valid email format
**Place**
- `title` — required, cannot be empty
- `price` — required, must be a positive number
- `latitude` — must be between -90 and 90
- `longitude` — must be between -180 and 180
**Review**
- `text` — required, cannot be empty
- `user_id` — must reference an existing `User`
- `place_id` — must reference an existing `Place`
**Amenity**
- `name` — required, cannot be empty

### Manual Testing with cURL
 
Each endpoint was tested for both valid and invalid input. A couple of
representative examples:
 
**Create a valid user**
 
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  }'
```
 
Expected response — `201 Created`:
 
```json
{
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
}
```
 
**Create a user with invalid data**
 
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "",
    "last_name": "",
    "email": "invalid-email"
  }'
```
 
Expected response — `400 Bad Request`:
 
```json
{
    "error": "Invalid input data"
}
```
 
The same pattern (valid input vs. invalid input) was repeated across
`Place`, `Review`, and `Amenity` endpoints, covering:
 
- **Boundary testing** — e.g. `latitude`/`longitude` outside their valid
  ranges, negative `price` values
- **Required fields** — missing or empty required attributes
- **Error handling** — requesting a resource `id` that doesn't exist
  (expects `404 Not Found`)

### Swagger Documentation
 
Flask-RESTx automatically generates interactive API documentation from the
defined models and namespaces. It is used to confirm that each endpoint's
expected inputs, outputs, and status codes match what's documented, and to
run manual requests directly from the browser.
 
Available at:
 
```
http://127.0.0.1:5000/api/v1/
```
 
### Automated Unit Tests
 
Automated tests are written with Python's `unittest` framework and live in
the `tests/` directory. They cover both positive and negative scenarios for
every endpoint.
 
```python
import unittest
from app import create_app
 
 
class TestUserEndpoints(unittest.TestCase):
 
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
 
    def test_create_user(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)
 
    def test_create_user_invalid_data(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)
```
 
Run the full test suite with:
 
```bash
python3 -m unittest discover tests
```
 
### Testing Report
 
| Endpoint | Input | Expected | Actual | Result |
|---|---|---|---|---|
| `POST /api/v1/users/` | Valid user data | `201 Created` | `201 Created` | ✅ Pass |
| `POST /api/v1/users/` | Empty name fields, invalid email | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/places/` | Valid place data | `201 Created` | `201 Created` | ✅ Pass |
| `POST /api/v1/places/` | Negative `price` | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/places/` | `latitude` out of range (e.g. 120) | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
| `POST /api/v1/reviews/` | Valid review data | `201 Created` | `201 Created` | ✅ Pass |
| `POST /api/v1/reviews/` | Non-existent `user_id`/`place_id` | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
| `GET /api/v1/users/<id>` | Non-existent `id` | `404 Not Found` | `404 Not Found` | ✅ Pass |
| `POST /api/v1/amenities/` | Empty `name` | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
 

 
## 7. Document Identification and Project Authorship

- This project is built as a part of Holberton Academy

### Document Authors and Contributors

- Lama Almazroa - [@l44mz](https://github.com/l44mz)
- Noura Alotibi - [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi - [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)
