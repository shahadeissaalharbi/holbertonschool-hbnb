## Class Diagram

This UML class diagram represents the Business Logic layer of the HBnB application, showing the core entities (`User`, `Place`, `Review`, `Amenity`) and their relationships, with shared attributes inherited from `BaseModel`.

<img width="3181" height="5210" alt="User-Place Review Ecosystem-2026-07-09-124902" src="https://github.com/user-attachments/assets/27d7b790-689a-4ea0-a26d-a328c78043fb" />


**BaseModel** – base class providing shared `id`, timestamps, and CRUD operations.

**User** – platform user with personal info; can own places and write reviews.

**Place** – a listed property with details (price, location); linked to an owner, reviews, and amenities.

**Review** – feedback from a user on a place, with rating and comment.

**Amenity** – a feature/service (e.g., Wi-Fi) that can be offered by multiple places.


- **Inheritance**: `User`, `Place`, `Review`, `Amenity`, and `PlaceAmenity` all inherit from `BaseModel`.
- **Association**: `User` and `Place`, `User` and `Review`, `Place` and `Review`, `Place` and `PlaceAmenity`, `Amenity` and `PlaceAmenity`.
- **User → Place**: a user owns zero or multiple places (0 to many).
- **User → Review**: a user writes zero or multiple reviews (0 to many).
- **Place → Review**: a place receives zero or multiple reviews (0 to many).
- **Place ↔ Amenity**: many-to-many, resolved through the `PlaceAmenity` join class — a place can be linked to several amenities and an amenity can belong to several places.



