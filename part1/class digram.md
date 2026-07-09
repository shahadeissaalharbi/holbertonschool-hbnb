## Class Diagram

This UML class diagram represents the Business Logic layer of the HBnB application, showing the core entities (`User`, `Place`, `Review`, `Amenity`) and their relationships, with shared attributes inherited from `BaseModel`.

classDiagram
    class BaseModel {
        +UUID4 id
        +DateTime created_at
        +DateTime updated_at
        +create()
        +update()
        +delete()
    }

    class User {
        +String first_name
        +String last_name
        +String email
        +String password
        +Boolean is_admin
    }

    class Place {
        +String title
        +String description
        +Float price
        +Float latitude
        +Float longitude
        +UUID4 owner_id
        +list_amenities()
    }

    class Review {
        +Integer rating
        +String comment
        +UUID4 place_id
        +UUID4 user_id
    }

    class Amenity {
        +String name
        +String description
    }

    class PlaceAmenity {
        +UUID4 place_id
        +UUID4 amenity_id
    }

    BaseModel <|-- User
    BaseModel <|-- Place
    BaseModel <|-- Review
    BaseModel <|-- Amenity
    BaseModel <|-- PlaceAmenity

    User "1" --> "0..*" Place : owns
    User "1" --> "0..*" Review : writes
    Place "1" --> "0..*" Review : receives

    Place "1" --> "0..*" PlaceAmenity : has
    Amenity "1" --> "0..*" PlaceAmenity : used in


**BaseModel** – base class providing shared `id`, timestamps, and CRUD operations.

**User** – platform user with personal info; can own places and write reviews.

**Place** – a listed property with details (price, location); linked to an owner, reviews, and amenities.

**Review** – feedback from a user on a place, with rating and comment.

**Amenity** – a feature/service (e.g., Wi-Fi) that can be offered by multiple places.


- **Inheritance**: `User`, `Place`, `Review`, `Amenity` all inherit from `BaseModel`.
- **Composition**: between `User` and `Review`, `Place` and `Review`, `Amenity` and `Place`
- **Association**: `User`, `Place`
- **User → Place**: a user owns zero or multiple places (0 to many).
- **User → Review**: a user writes zero or multiple reviews (0 to many).
- **Place → Review**: a place receives multiple reviews (1 to many).
- **Place ↔ Amenity**: many-to-many, a place can have several amenities and an amenity can belong to several places.




