# HBnB Project — Part 3: Enhanced Backend with Authentication and Database Integration

Welcome to Part 3 of the **HBnB Project**, where the backend of the application is extended by introducing **user authentication**, **authorization**, and **database integration** using **SQLAlchemy** and **SQLite** for development. Later, **MySQL** is configured for production environments. In this part, the backend is secured, persistent storage is introduced, and the application is prepared for a scalable, real-world deployment.

## Objectives of the Project

1. **Authentication and Authorization**: Implement JWT-based user authentication using **Flask-JWT-Extended** and role-based access control with the `is_admin` attribute for specific endpoints.
2. **Database Integration**: Replace in-memory storage with **SQLite** for development using **SQLAlchemy** as the ORM and prepare for **MySQL** for production.
3. **CRUD Operations with Database Persistence**: Refactor all CRUD operations to interact with a persistent database.
4. **Database Design and Visualization**: Design the database schema using **mermaid.js** and ensure all relationships between entities are correctly mapped.
5. **Data Consistency and Validation**: Ensure that data validation and constraints are properly enforced in the models.

## Learning Objectives

By the end of this part:
- **JWT authentication** is implemented to secure the API and manage user sessions.
- **Role-based access control** is enforced to restrict access based on user roles (regular users vs. administrators).
- In-memory repositories are replaced with a **SQLite-based persistence layer** using **SQLAlchemy** for development, with **MySQL** configured for production.
- A **relational database schema** is designed and visualized using **mermaid.js** to handle relationships between users, places, reviews, and amenities.
- The backend is secure, scalable, and provides reliable data storage for production environments.

## Project Context

In the previous parts of the project, in-memory storage was used, which is ideal for prototyping but insufficient for production environments. In Part 3, the application transitions to **SQLite**, a lightweight relational database, for development, while preparing the system for **MySQL** in production. This provides hands-on experience with real-world database systems, allowing the application to scale effectively.

Additionally, **JWT-based authentication** secures the API, ensuring that only authenticated users can interact with certain endpoints. Role-based access control enforces restrictions based on the user's privileges (regular users vs. administrators).

## Project Resources

- **JWT Authentication**: [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/en/stable/)
- **SQLAlchemy ORM**: [SQLAlchemy Documentation](https://docs.sqlalchemy.org/en/20/)
- **SQLite**: [SQLite Documentation](https://sqlite.org/docs.html)
- **MySQL**: [MySQL Documentation](https://dev.mysql.com/doc/)
- **Flask Documentation**: [Flask Official Documentation](https://flask.palletsprojects.com/en/2.0.x/)
- **Mermaid.js for ER Diagrams**: [Mermaid.js Documentation](https://mermaid-js.github.io/mermaid/#/)
- **Flask-Bcrypt Documentation**: [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/en/latest/)
- **Testing REST APIs with cURL**: [Everything cURL](https://everything.curl.dev/)

## Structure of the Project

In this part of the project, the tasks are organized in a way that builds progressively towards a complete, secure, and database-backed backend system:

0. **Modify the Application Factory to Include the Configuration**: Update `create_app()` to receive a configuration object (following the Application Factory pattern), defaulting to `config.DevelopmentConfig`.
1. **Modify the User Model to Include Password**: Store passwords securely using bcrypt and update the user registration logic. The password is never returned in `GET` requests.
2. **Implement JWT Authentication**: Secure the API using JWT tokens, ensuring only authenticated users can access protected endpoints. Tokens embed the user's `id` and `is_admin` claim.
3. **Implement Authorization for Specific Endpoints**: Enforce ownership rules on places and reviews — users can only modify what they own, cannot review their own place, and cannot review the same place twice. Public `GET` endpoints remain open.
4. **Implement Administrator Access Endpoints**: Restrict user creation/modification and amenity management to admins (`is_admin`), who also bypass ownership restrictions on places and reviews.
5. **Implement SQLAlchemy Repository**: Introduce `SQLAlchemyRepository`, implementing the existing repository interface, and refactor the Facade to use it (model mapping and DB initialization follow in the next task).
6. **Map the User Entity to SQLAlchemy Model**: Map `BaseModel` and `User` to SQLAlchemy models, implement `UserRepository` (with `get_user_by_email`), and refactor the Facade accordingly.
7. **Map the Place, Review, and Amenity Entities**: Map the core attributes of `Place`, `Review`, and `Amenity` to SQLAlchemy models, without relationships yet.
8. **Map Relationships Between Entities Using SQLAlchemy**: Define one-to-many relationships (`User`↔`Place`, `User`↔`Review`, `Place`↔`Review`) and the many-to-many relationship (`Place`↔`Amenity`) using `ForeignKey`, `relationship()`, and `backref`.
9. **SQL Scripts for Table Generation and Initial Data**: Write raw SQL scripts to generate the full schema (`User`, `Place`, `Review`, `Amenity`, `Place_Amenity`) and insert initial data — an administrator user and a set of starter amenities.
10. **Generate Database Diagrams**: Use **mermaid.js** to create ER diagrams representing the `User`, `Place`, `Review`, `Amenity`, and `Place_Amenity` tables and their relationships.

Each task is carefully designed to build on previous work and ensure the system transitions smoothly from development to production readiness.

---

By the end of Part 3, the backend not only stores data in a persistent and secure database but also ensures that only authorized users can access and modify specific data. Industry-standard authentication and database management practices, crucial for real-world web applications, are implemented throughout.



---

## Project Structure
