# HBnB - Part 1

## Description

This project is the first part of the HBnB Evolution application, an AirBnB-like platform.
The goal of this part is to produce comprehensive technical documentation that will serve
as the blueprint for all subsequent implementation phases. No code is written here.
The deliverable is a set of UML diagrams and explanatory notes covering the system
architecture, business logic design, and API interaction flows.

---

## Application Overview

HBnB allows users to:
- Register and manage their profiles
- List properties (places) with details like price, location, and amenities
- Leave reviews with ratings and comments on places they have visited
- Browse and filter available places

All entities (User, Place, Review, Amenity) share a common base that provides
a unique UUID identifier and creation/update timestamps for auditing purposes.

---

## Tasks

### Task 0 - High-Level Package Diagram

Created a package diagram illustrating the three-layer architecture of the application
and how the layers communicate through the Facade pattern.

The three layers are:

- **Presentation Layer**: Handles all interaction with the client. Contains the REST API
  endpoints and service classes (UserService, PlaceService, ReviewService, AmenityService).
  This layer is responsible for receiving requests, validating input format, and returning
  HTTP responses.

- **Business Logic Layer**: Contains the core models (User, Place, Review, Amenity) and
  enforces all business rules. This layer decides what is valid and what is not, independent
  of how the data arrives or where it is stored.

- **Persistence Layer**: Responsible for storing and retrieving data. Provides repository
  classes (UserRepository, PlaceRepository, etc.) that abstract all database operations
  from the rest of the application.

The **Facade pattern** is represented by a single HBnBFacade interface that sits between
the Presentation Layer and the Business Logic Layer. This means the API never directly
instantiates or queries model objects, it always goes through the facade. This keeps the
layers decoupled and makes the system easier to maintain and test.

---

### Task 1 - Detailed Class Diagram for the Business Logic Layer

Created a class diagram showing the four core entities, their attributes, methods,
and relationships.

**BaseModel**
An abstract base class inherited by all entities. Provides:
- id (UUID4): unique identifier auto-generated on creation
- create_at (datetime): timestamp set at creation
- update_at (datetime): timestamp updated on every save
- create(), update(), delete() are utility methods

**User**
Represents a registered user of the platform. Key attributes include first name,
last name, email, password.
Methods cover registration, profile update, deletion, and admin.
A user can own multiple places and write multiple reviews.

**Place**
Represents a property listing. Stores a title, description, price, and geographic
coordinates (latitude and longitude). Each place is linked to its owner (User) via
an owner_id foreign key. A place can have many reviews and many amenities.
Methods cover creation, update, deletion, and listing associated amenities.

**Review**
Represents a user's evaluation of a place. Contains a numeric rating and a text comment,
linked to both a user_id and a place_id. A review cannot exist without both references.
Methods cover submission, update, and deletion.

**Amenity**
Represents a feature that can be associated with one or more places (e.g., Wi-Fi, pool,
parking). Amenities exist independently of any specific place, so the relationship between
Place and Amenity is an aggregation, not a composition.
Methods cover creation, update, deletion, and listing.

**Relationships**
- All entities inherit from BaseModel (generalization)
- User owns zero or more Places (one-to-many association)
- User writes zero or more Reviews (one-to-many association)
- Place receives zero or more Reviews (one-to-many association)
- Place has zero or more Amenities, and Amenities can belong to many Places (many-to-many aggregation)

---

### Task 2 - Sequence Diagrams for API Calls

Created four sequence diagrams showing the step-by-step flow of information between
the Presentation Layer, Business Logic Layer, and Persistence Layer for four key API calls.

**1. User Registration (POST /api/v1/users)**
The client submits registration data. The API validates the request format and calls
the facade. The Business Logic layer checks that the email is not already taken by
querying the database, then hashes the password, assigns a UUID and timestamps, and
saves the new user. A success response with the created user data is returned.

**2. Place Creation (POST /api/v1/places)**
The client submits place details along with an authentication token. The API authenticates
the user before proceeding. The facade passes the data to the Place model, which validates
business rules (e.g., price must be positive, coordinates must be in valid range), assigns
a UUID and timestamps, links the owner_id, and saves the record. The created place data
is returned with a 201 status.

**3. Review Submission (POST /api/v1/places/{place_id}/reviews)**
The client submits a rating and comment for a specific place. The API authenticates the
user. The facade first verifies that the target place exists, then passes the data to the
Review model. Business rules are enforced: the rating must be between 1 and 5, the comment
cannot be empty, and a user cannot review their own place. If valid, the review is saved
and returned with a 201 status.

**4. Fetching a List of Places (GET /api/v1/places)**
The client sends a GET request with optional query parameters (e.g., max price, amenity
filter). The API parses and sanitizes the parameters, then passes them to the facade.
The Business Logic layer translates the filters into a database query via the Persistence
Layer. The returned records are serialized (sensitive fields excluded) and returned to
the client as a list with a 200 status.

---

## File Structure

```
hbnb/
 part1/
	-README.md
	-package diagram
	-class diagram
	-sequence diagram
```

---

## Authors

- Lama Almazroa 
- Noura Alotibi
- Shahad Alharbi
