#!/usr/bin/python3
"""Defines the User class"""
import re
from app.models.base_model import BaseModel
from app import db, bcrypt
from sqlalchemy.orm import validates, relationship


class User(BaseModel):
    """Represents a user of the HBnB application"""
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    places = relationship('Place', backref='owner', lazy=True,
                           cascade='all, delete-orphan')
    reviews = relationship('Review', backref='author', lazy=True,
                            cascade='all, delete-orphan')

    def __init__(self, first_name, last_name, email, password=None, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = None
        if password:
            self.hash_password(password)
        self.is_admin = is_admin

    @validates('first_name')
    def validate_first_name(self, key, value):
        """Validate and set the first name"""
        if not value or not isinstance(value, str) or len(value) > 50:
            raise ValueError("First name must be string and under 50 characters")
        return value

    @validates('last_name')
    def validate_last_name(self, key, value):
        """Validate and set the last name"""
        if not value or not isinstance(value, str) or len(value) > 50:
            raise ValueError("Last name must be string and under 50 characters")
        return value

    @validates('email')
    def validate_email(self, key, value):
        """Validate and set the email"""
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not value or not re.match(pattern, value):
            raise ValueError("email must be a valid email address")
        return value

    @validates('password')
    def validate_password(self, key, value):
        """Validate and set the password"""
        if value is None:
            return None
        if len(value) < 6:
            raise ValueError("password must be at least 6 characters")
        return value

    @validates('is_admin')
    def validate_is_admin(self, key, value):
        """Validate and set the admin status"""
        if not isinstance(value, bool):
            raise ValueError("is_admin must be a boolean")
        return value

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)