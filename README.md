sequenceDiagram
    autonumber
    participant Client
    participant API as API Layer
    participant BL as Business Logic
    participant DB as Database

    Client->>API: POST /api/v1/users (first_name, last_name, email, password)
    API->>BL: validate_user_data(data)
    BL->>BL: check required fields
    BL->>DB: check_email_exists(email)
    DB-->>BL: email not found
    BL->>BL: hash_password(password)
    BL->>BL: generate_uuid() & set timestamps
    BL->>DB: save_user(user_object)
    DB-->>BL: user saved successfully
    BL-->>API: return user_object (without password)
    API-->>Client: 201 Created (user data)
