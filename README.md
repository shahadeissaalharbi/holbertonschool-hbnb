HBnB Evolution — Technical Documentation & Full-Stack SpecificationHBnB Evolution is an enterprise-grade short-term rental marketplace platform. The project spans architectural design, RESTful API development, object-relational mapping with persistent storage, JWT-based authentication with role-based access control (RBAC), and a responsive static web client interface.Executive SummaryThe platform is designed following a Decoupled Three-Layer Architecture Pattern (Presentation, Business Logic, and Persistence) to guarantee modular separation, maintain strict domain boundary conditions, and support operational scalability.Phase 1 (Architecture & UML): System domain modeling using UML Package, Class, and Sequence diagrams.Phase 2 (Core Domain & API): Object-oriented business model definitions, validation logic, and Flask-RESTx API routing managed via the Facade pattern.Phase 3 (Authentication & Relational Database): MySQL/SQLite integration via SQLAlchemy ORM, cryptographic password hashing, and JWT authorization rules.Phase 4 (Web Client): Static, responsive client-side user interface (HTML5, CSS3, Vanilla JavaScript) utilizing native asynchronous Fetch API integrations.Architecture & Layering Model+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|    Web Client (HTML/CSS/JS)  <--->  Flask RESTful API (Endpoints)    |
+-----------------------------------│-----------------------------------+
                                    │
                         Unidirectional Facade Signals
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                        BUSINESS LOGIC LAYER                           |
|       [HBnBFacade] Broker  --->  [User] [Place] [Review] [Amenity]    |
+-----------------------------------│-----------------------------------+
                                    │
                     Database Operations Abstraction
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                         PERSISTENCE LAYER                             |
|       [SQLAlchemy Repository Engine]  --->  [SQLite / MySQL DB]       |
+-----------------------------------------------------------------------+
Layer ResponsibilitiesPresentation Layer: Captures network interactions, enforces URI routing, marshals incoming payloads, evaluates client authentication status, and returns structured JSON HTTP payloads.Business Logic Layer: Centralized analytical engine managing entity lifecycles, evaluating validation invariants, and enforcing data model integrity through property setters.Persistence Layer: Abstracts database connections and raw I/O transactions using the Repository Pattern via SQLAlchemy ORM mapping.Project Directory Treehbnb/
├── part1/                          # Architectural Design & Diagrams
│   ├── README.md
│   ├── Package Diagram.md
│   ├── class diagram.md
│   └── Sequence Diagrams.md
│
├── part2/                          # In-Memory Core & API Prototype
│   ├── app/
│   │   ├── api/v1/                 # Flask-RESTx API Endpoints
│   │   ├── models/                 # Domain Entity Interfaces
│   │   ├── services/facade.py      # Domain Structural Broker
│   │   └── persistence/            # Memory Repositories
│   ├── tests/                      # Automated Model & API Unit Tests
│   └── run.py
│
├── part3/                          # Production API, Database & Auth
│   ├── app/
│   │   ├── api/v1/                 # Auth & Resource Controllers
│   │   ├── models/                 # SQLAlchemy ORM Data Models
│   │   ├── persistence/            # DB Repository Scripts
│   │   └── services/facade.py      # Extended Domain Facade
│   ├── instance/development.db     # Development SQLite Database
│   ├── tests/                      # Automated Integration Unit Tests
│   ├── Dockerfile
│   └── run.py
│
└── part4/base_model/               # Front-End Client Application
    ├── css/                        # Shared & Page Layout Stylesheets
    ├── js/                         # Vanilla JS Controller Scripts
    ├── images/                     # System Icons & Assets
    ├── home.html                   # Platform Landing Page
    ├── index.html                  # Marketplace Index & Dynamic Price Filter
    ├── place.html                  # Listing Details & Reviews View
    ├── add_place.html              # Listing Creation Form
    ├── add_review.html             # Star-Rating Review Submission Form
    ├── login.html                  # JWT Authentication Ingress
    └── register.html               # User Creation Page (Admin Restricted)
Domain Data Model & Entity RelationsEntity Schema SummaryEntityAttributesBusiness Invariants & ConstraintsBaseModelid (UUIDv4), created_at, updated_atAbstract primary key interface enforcing globally unique UUIDs and lifecycle timestamp updates.Userfirst_name, last_name, email, password, is_adminemail must be unique and follow valid formatting. Passwords are salted and hashed upon initialization.Placetitle, description, price, latitude, longitude, owner_idprice $\ge 0$; latitude range $[-90.0, 90.0]$; longitude range $[-180.0, 180.0]$. Linked to owner (User).Reviewtext, rating, place_id, user_idrating bounded by integer values $[1, 5]$. Foreign key relations enforce valid Place and User associations.Amenityname, descriptionname is mandatory and cannot be empty or null.Relational CardinalityUser $\rightarrow$ Place: One-to-Many ($1:N$). A user can own multiple property listings.User $\rightarrow$ Review: One-to-Many ($1:N$). A user can write multiple reviews.Place $\rightarrow$ Review: One-to-Many ($1:N$). A property listing can accumulate multiple reviews.Place $\leftrightarrow$ Amenity: Many-to-Many ($N:M$). Mapped via the explicit association junction entity PLACE_AMENITY.API Documentation & Auth SpecificationsMain EndpointsMethodURI EndpointAuthenticationAccess ConstraintsPOST/api/v1/auth/loginNonePublic ingress endpoint returning a signed JWT access token.GET/api/v1/places/NoneReturns filtered array list of active property listings.GET/api/v1/places/<id>NoneDelivers full property object details including amenities and reviews.POST/api/v1/places/RequiredAuthenticated account holders can create property listings.PUT/api/v1/places/<id>RequiredReserved strictly for property listing owners (owner_id) or Admins.POST/api/v1/reviews/RequiredAuthenticated users can post property reviews.DELETE/api/v1/reviews/<id>RequiredReserved strictly for review authors (user_id) or Admins.POST/api/v1/users/RequiredAdministrative privilege required (is_admin: true).POST/api/v1/amenities/RequiredAdministrative privilege required (is_admin: true).Local Setup & Container DeploymentLocal Environment SetupClone the repository and enter backend directory:Bashcd part3
Create and activate Python virtual environment:Bashpython3 -m venv venv
source venv/bin/activate
Install dependencies:Bashpip install -r requirements.txt
Initialize database schema and seed default admin account:Bashflask shell
Pythonfrom app import db
db.create_all()
exit()
Start backend API server:Bashpython3 run.py
(Server starts at [http://127.0.0.1:5000/api/v1/](http://127.0.0.1:5000/api/v1/))Docker DeploymentTo build and launch the backend service using Docker:Bash# Build the Docker image
docker build -t hbnb-api .

# Run the container mapping host port 5000
docker run -p 5000:5000 hbnb-api
Client Application AccessTo execute the front-end client, host the part4/base_model/ static files over a local web server:Bashcd part4/base_model
python3 -m http.server 8000
Access the marketplace interface in your browser at:http://localhost:8000/home.htmlDefault Admin CredentialsEmail: admin@hbnb.ioPassword: admin1234Quality Assurance & Automated TestingAutomated test cases validate domain integrity, data boundaries, and API authorization checks across all layers using Python's native unittest runner.Execute the test suites across the repository components:Bash# Run backend model and API unit tests
python3 -m unittest discover tests
Test Coverage ScenariosDomain Invariants: Verification of coordinate ranges, non-negative pricing validation, and rating boundary checks ($1$ to $5$).Access Control: Asserting HTTP 403 Forbidden errors when non-authorized user tokens attempt payload updates against resources owned by external accounts.Authentication Integrity: Validating access rejection with HTTP 401 Unauthorized for expired or missing JWT bearer header structures.Authors & AcknowledgmentsThis platform is developed as part of the Holberton Academy Software Engineering Curriculum.Lama Almazroa — @l44mzNoura Alotibi — @nnnsss12Shahad Alharbi — @shahadeissaalharbi
