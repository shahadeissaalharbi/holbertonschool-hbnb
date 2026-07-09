# HBnB: Technical Documentation and Architectural Blueprint

This document serves as the comprehensive technical blueprint and architectural specification for the HBnB Evolution marketplace platform. It synthesizes the conceptual, logical, and physical design phases of the system, acting as a unified guide for implementation teams to maintain strict layer separation, solid data boundaries, and reliable operational workflows.

## 1. Project Introduction and Scope

The HBnB Evolution platform is designed as an enterprise-grade short-term rental marketplace enabling user profiling, dynamic property indexing, structured feature (amenity) grouping, and cross-referenced transactional feedback processing.

This documentation bridges the gap between early structural planning and low-level code implementation. It outlines systemic boundaries, class inheritances, structural modular dependencies, and runtime data flows, ensuring all implementation variants adhere strictly to software design best practices.

## 2. File and Repository Structure

The physical assets and design documentation artifacts are distributed across the repository following a clean modular structure. This layout ensures predictable navigation and clear decoupling between different design tasks:

```
hbnb/
└── part1/
    ├── README.md
    ├── Package Diagram.md
    ├── class diagram.md
    └── Sequence Diagrams.md
```

### Allocation of Deliverables

- **part1/**: The dedicated root container for Phase 1 architectural design deliverables.
- **README.md**: This master document, serving as the central explanatory guide and system documentation compiler.
- **package diagram**: Visual design specifications detailing the high-level layered software boundaries and design patterns.
- **class diagram**: Detailed object-oriented entities layout governing the Business Logic layer properties, constraints, and operational cardinalities.
- **sequence diagram**: Dynamic execution sequence charts mapping out request ingress paths across major platform workflows.

---

## 3. High-Level Architecture and Package Layout

The application relies on a strict implementation of a Decoupled Three-Layer Architecture Pattern. This architectural blueprint isolates functional responsibilities, guarantees horizontal system expandability, and safeguards the central business core from volatile peripheral structural changes.

### 3.1 Layered Framework Specifications

- **Presentation Layer (Services & API Packages)**: Functions as the primary application ingress gateway. It intercepts client-side transport execution streams, enforces uniform URI routing controls, acts as the payload marshalling agent, and delivers standardized HTTP responses back to calling clients.
- **Business Logic Layer (Models Core Package)**: Functions as the centralized analytical engine of the platform. It holds data entity structures, enforces business rules, evaluates attribute invariants, and defines model behaviors.
- **Persistence Layer (Database & Repositories Packages)**: Abstracts all state persistence lifecycles. It encapsulates state transformations, processes native persistence reads/writes, and manages connection engines via abstract generic data collection arrays.

### 3.2 Package Diagram Visual Representation

<img width="2411" height="5565" alt="HBnBFacade Domain Model Flow-2026-07-09-125456" src="https://github.com/user-attachments/assets/705a65c2-849b-4581-9be9-590baf55826d" />

### 3.3 Design Pattern Integration: Structural Facade Broker

To bridge structural state delivery from presentation routers into complex domain packages securely, the system introduces a dedicated Facade Pattern mediator interface.

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
|            [Services Package]    |    [API Package]         |
+------------------------------+------------------------------+
                               |
                               | Unidirectional Facade Signals
                               v
+-------------------------------------------------------------+
|                    BUSINESS LOGIC LAYER                     |
|  [BaseModel]  [User]  [Place]  [Amenity]  [Review] Packages |
+------------------------------+------------------------------+
                               |
                               | Database Operations Abstraction
                               v
+-------------------------------------------------------------+
|                      PERSISTENCE LAYER                      |
|          [Database Engine]   |   [Repositories]             |
+-------------------------------------------------------------+
```

#### Architectural Rationale

- **Decoupling Contracts**: The internal domain code may undergo optimization or schema adaptation without introducing breaking adjustments to public-facing REST controllers.
- **Unified Interface**: API controller classes invoke simple, singular unified operations from the facade broker instead of handling multi-object initialization chains.

---

## 4. Business Logic Layer Deep-Dive: Domain Class Layout

The architectural design for the underlying domain classes relies on strict object-oriented inheritance models, structured visibility parameters, and definitive relational dependencies.

### 4.1 Class Diagram Visual Representation

<img width="3181" height="5210" alt="image" src="https://github.com/user-attachments/assets/6db01d6f-7a2f-4527-bff7-0576316d7acd" />

### 4.2 Class Definitions and Variable Properties

#### 4.2.1 BaseModel (Abstract Base Interface Class)

**Description**: The master primitive class defining foundational lifecycle tracking values mandatory across every persistence element.

**Public Attributes:**
- `id`: UUIDv4 primary key format token. Establishes globally immutable unique identities.
- `created_at`: datetime object indicating initial creation runtime instantiation.
- `updated_at`: datetime object tracking active attribute variance changes over time.

**Public Methods:**
- `create()`: Instantiates memory mapping and anchors system creation timestamps.
- `update()`: Advances update metrics upon application state adjustment commits.
- `delete()`: Deallocates system state or flags records for logical soft deletion.

#### 4.2.2 User Class

**Description**: Manages user actor registration models, administrative access tracking, and security credential vectors.

**Public Attributes:**
- `first_name`: String. Primary identity identifier.
- `last_name`: String. Family identity descriptor.
- `email`: String. Globally unique communication lookup token.

**Private Attributes:**
- `password`: String. Encrypted security authentication credential block.

**Private Methods:**
- `_is_admin()`: Internal logic verifying authorization profiles for administrative state promotions.

**Associations**: Maps a 1-to-many (1 to *) ownership link to the Place collection and an identical 1-to-many (1 to *) transactional path toward the Review dataset.

#### 4.2.3 Place Class

**Description**: Models physical property assets, fiscal rates, and geospatial reference tracking variables.

**Public Attributes:**
- `title`: String. Market visibility moniker.
- `description`: String. Detailed rental arrangement statement.
- `price`: float. Monetary baseline price variable mapped per allocation cycle.
- `latitude`: float. Global map positioning spatial point.
- `longitude`: float. Global map positioning spatial point.

**Public Methods:**
- `list_amenities()`: Evaluates and emits a list array of associated amenity structures.
- `list_place()`: Resolves current structural state parameters for API consumption modules.

**Associations**: Establishes a 1-to-many (1 to *) composition path enclosing the Review table and a many-to-many (* to *) association mapping against the Amenity block.

#### 4.2.4 Review Class

**Description**: An intersection entity connecting customer identities with physical property spaces via qualitative scoring.

**Public Attributes:**
- `place_id`: Place class instance pointer. Maps reviews strictly to target structures.
- `user_id`: User class instance pointer. Attributes review authorship to a distinct identity profile.
- `rating`: Integer (with internal validation restrictions to enforce an explicit 1 to 5 score boundary).
- `comment`: String. Structural narrative block capturing individual text evaluation.

#### 4.2.5 Amenity Class

**Description**: Indexes separate individual space features (e.g., HVAC units, internet configurations).

**Public Attributes:**
- `name`: String. Unique terminology identifier for the asset.
- `description`: String. Detail text block defining feature scope rules.

**Public Methods:**
- `list_amenities()`: Streams data configurations back to systemic listing handlers.

---

## 5. API Interaction Sequence Flows

Runtime system execution and sequence flows across the architectural boundaries are detailed across four critical platform ingress use cases.

### 5.1 Use Case 1: User Registration (POST /api/v1/users)

<img width="6530" height="5125" alt="image" src="https://github.com/user-attachments/assets/14e0200f-5d5b-4cf6-a492-c564b11871d5" />


1. **Request Reception**: The Client targets the `/api/v1/users` ingress portal with an HTTP POST request carrying user data attributes.
2. **Facade Redirection**: The Presentation Layer captures the payload and dispatches it via `validate_user_data(data)` to the Business Logic facade.
3. **Internal Parsing**: The domain layer assesses attribute completeness rules via internal field validation checkpoints.
4. **Uniqueness Inquiry**: The Business Logic layer queries the persistence framework using `check_email_exists(email)` to assert system unique parameters.
5. **Security Isolation**: Once the repository confirms availability (email not found), the core framework intercepts the transparent credential string and runs `hash_password(password)` to ensure data isolation.
6. **Initialization**: The logic runs `generate_uuid()` and populates systemic lifecycle creation dates.
7. **Storage Execution**: The system commits the state entity via `save_user(user_object)` down to the Database layer.
8. **Sanitized Response**: The storage core signals successful integration. The business logic replicates the data block, discards password references, and returns the public profile properties up to the presentation gateway.
9. **Egress Handshake**: The API system completes the connection with an HTTP 201 Created payload.

### 5.2 Use Case 2: Place Creation (POST /api/v1/places)

<img width="7235" height="5125" alt="image" src="https://github.com/user-attachments/assets/36c5ec48-cb56-44d0-9295-84c0ee9ff46f" />


1. **Request Reception**: The Client targets the property route `/api/v1/places` with an HTTP POST query enclosing physical property definitions.
2. **Facade Redirection**: The Presentation Layer maps the incoming JSON array block into the core domain using `validate_place_data(data)`.
3. **Integrity Validation**: The Business Logic checks relation bounds via `check_user_exists(owner_id)` against the persistence layer to verify the property owner is a registered user.
4. **Boundary Checks**: Upon verification, the business module checks numerical field tolerances, verifying that `price >= 0` and spatial latitude/longitude adhere strictly to standard mapping coordinate bounds.
5. **Initialization**: The core issues an automated machine UUIDv4 identifier and binds relevant tracking timestamps.
6. **Storage Execution**: The application commits the asset state parameters using `save_place(place_object)`.
7. **Sanitized Response**: The persistence engine returns database execution success signals, and the domain model relays the structural `place_object` backward.
8. **Egress Handshake**: The system terminates processing by returning an HTTP 201 Created status statement to the calling client.

### 5.3 Use Case 3: Review Submission (POST /api/v1/reviews)

<img width="5878" height="8192" alt="image" src="https://github.com/user-attachments/assets/8bfed0ac-6978-4f6c-ae34-5bf0fb0a4071" />


1. **Request Reception**: The Client issues an HTTP POST transaction enclosing a review payload block targeting `/api/v1/reviews`.
2. **Facade Redirection**: The API infrastructure transitions execution variables into the facade handler using `validate_review_data(data)`.
3. **Relational Verifications**: The core model runs three sequential relational boundary investigations against persistence stores:
   - Asserts location presence via `check_place_exists(place_id)` → place found.
   - Asserts writer presence via `check_user_exists(user_id)` → user found.
   - Prevents transaction duplication via `check_duplicate_review(user_id, place_id)` → no duplicate found.
4. **Boundary Checks**: The logic executes a strict evaluation step to confirm the parameter complies with `validate_rating(1-5)` boundaries.
5. **Storage Execution**: Automated execution triggers apply machine identity identifiers and tracking timestamps before routing data into `save_review(review_object)`.
6. **Egress Handshake**: Database layers commit the transaction, and the system delivers an HTTP 201 Created response carrying the structural review representation.

### 5.4 Use Case 4: Fetching a List of Places (GET /api/v1/places)

<img width="5140" height="4645" alt="image" src="https://github.com/user-attachments/assets/052147f1-3a1f-403b-902c-e4ae0defec79" />


1. **Request Reception**: The Client launches an HTTP GET request to search the property indexes using conditional filters: `/api/v1/places?price_max=100&latitude=x&longitude=y`.
2. **Facade Redirection**: Presentation controllers capture the query and delegate filter parameters downward via `get_places(filters)`.
3. **Boundary Checks**: The business core evaluates string compliance via explicit parameter checking to block structural injection vectors.
4. **Storage Execution**: The system routes a structured data discovery command `query_places(filters)` directly to the persistence repositories.
5. **Collection Assembly**: The persistence layer indexes and extracts matching raw record data from the database.
6. **Object Serialization**: The Business Logic layer maps the rows through an internal format-and-serialize-places sequence loop to format raw schemas into clean application layer models.
7. **Egress Handshake**: The serialized data block outputs to the presentation controllers, which return an HTTP 200 OK network package containing the matching collection array.

---

## 6. Architectural Summary and Technical Integrity Notes

To achieve full operational compliance across implementation lifecycle stages, code changes must adhere strictly to the following technical rules:

- **Cryptographic Isolation**: Plaintext password elements must undergo hashing immediately within the initialization blocks of the business layer. Cleartext security tokens must never be logged or propagated down to database persistence drivers.
- **Identity Invariance**: All storage structures must employ pure `UUIDv4` formats for entity index values. Relational auto-incremental integer values are strictly banned to safeguard data integrity and eliminate predictability tracking vectors.
- **Decoupled Serialization Rules**: Core entity structures must never be directly piped through raw network response paths. Objects must be translated using data serialization functions inside the business logic layer to isolate database tables from public-facing client interface layouts.

---

## 7. Document Identification and Project Authorship

- This project is built as a part of Holberton Academy 

### Document Authors and Contributors

- Lama Almazroa - [@l44mz](https://github.com/l44mz)
- Noura Alotibi - [@nnnsss12](https://github.com/nnnsss12)
- Shahad Alharbi - [@shahadeissaalharbi](https://github.com/shahadeissaalharbi)


