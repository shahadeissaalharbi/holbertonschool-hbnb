#!/usr/bin/python3
"""Defines the Review class"""
from app import db
from sqlalchemy.orm import validates
from app.models.base_model import BaseModel


class Review(BaseModel):
    """Represents a review left by a user for a place"""
    __tablename__ = 'Review'

    text = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    # Foreign keys
    user_id = db.Column(db.String(36), db.ForeignKey('Users.id'),
                         nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey('Place.id'),
                          nullable=False)

    def __init__(self, text, rating, user_id, place_id):
        """Initialize a new Review instance"""
        super().__init__()
        self.text = text
        self.rating = rating
        self.user_id = user_id
        self.place_id = place_id

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