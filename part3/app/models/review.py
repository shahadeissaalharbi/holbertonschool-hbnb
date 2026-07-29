#!/usr/bin/python3
"""Defines the Review class"""
from app import db
from sqlalchemy.orm import validates
from app.models.base_model import BaseModel
from app.models.user import User
from app.models.place import Place


class Review(BaseModel):
    """Represents a review left by a user for a place"""
    __tablename__ = 'reviews'

    text = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    def __init__(self, rating, text, place, user):
        """Initialize a new Review instance"""
        super().__init__()
        self.rating = rating
        self.text = text
        self.place = place
        self.user = user

    @validates('rating')
    def validate_rating(self, key, value):
        """Validate and set the rating"""
        if not isinstance(value, int) or not (1 <= value <= 5):
            raise ValueError("rating must be an integer between 1 and 5")
        return value

    @validates('text')
    def validate_text(self, key, value):
        """Validate and set the text"""
        if not value:
            raise ValueError("text is required")
        return value

    @property
    def place(self):
        """Get the place being reviewed"""
        return self._place

    @place.setter
    def place(self, value):
        """Validate and set the place"""
        if not isinstance(value, Place):
            raise ValueError("place must be a valid Place instance")
        self._place = value

    @property
    def user(self):
        """Get the user who wrote the review"""
        return self._user

    @user.setter
    def user(self, value):
        """Validate and set the user"""
        if not isinstance(value, User):
            raise ValueError("user must be a valid User instance")
        self._user = value