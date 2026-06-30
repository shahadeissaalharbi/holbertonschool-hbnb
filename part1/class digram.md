This UML class diagram represents the Business Logic layer of the HBnB application, showing the core entities (`User`, `Place`, `Review`, `Amenity`) and their relationships, with shared attributes inherited from `BaseModel`.

<img width="1337" height="811" alt="Class digram" src="https://github.com/user-attachments/assets/42801651-8797-4306-8428-3d4638ffc42a" />

**BaseModel** – base class providing shared `id`, timestamps, and CRUD operations.

**User** – platform user with personal info; can own places and write reviews.

**Place** – a listed property with details (price, location); linked to an owner, reviews, and amenities.

**Review** – feedback from a user on a place, with rating and comment.

**Amenity** – a feature/service (e.g., Wi-Fi) that can be offered by multiple places.


- **Inheritance**: `User`, `Place`, `Review`, `Amenity` all inherit from `BaseModel`.
- **User → Place**: a user owns multiple places (1 to many).
- **User → Review**: a user writes multiple reviews (1 to many).
- **Place → Review**: a place receives multiple reviews (1 to many).
- **Place ↔ Amenity**: many-to-many, a place can have several amenities and an amenity can belong to several places.




