-- ==========================================================
-- HBnB Initial Data
-- ==========================================================

-- Administrator User (password: admin1234 hashed with bcrypt)
INSERT INTO User (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$FtK8X8NqbKqwuqI48gj6je1jAybPzLZGAqIN6z.IPX9WE2IA.fCW6',
    TRUE
);

-- Initial Amenities
INSERT INTO Amenity (id, name)
VALUES
    ('c0bd7ab4-7e07-423c-9114-988e22724170', 'WiFi'),
    ('cc9e733f-4f64-4a98-83dc-6c15f4418961', 'Swimming Pool'),
    ('0761f93a-8f0f-433e-9fa2-a84475ffc2ad', 'Air Conditioning');