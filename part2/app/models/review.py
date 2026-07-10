#!/usr/bin/python3
"""Defines the Review class"""
from models.base_model import BaseModel


class Review(BaseModel):
    """Represents a review left by a user for a place"""

    def __init__(self, rating, comment, place_id, user_id):
        """Initialize a new Review instance"""
        super().__init__()
        self.rating = rating
        self.comment = comment
        self.place_id = place_id
        self.user_id = user_id

    @property
    def rating(self):
        """Get the rating"""
        return self._rating

    @rating.setter
    def rating(self, value):
        """Validate and set the rating"""
        if not isinstance(value, int) or not (1 <= value <= 5):
            raise ValueError("rating must be an integer between 1 and 5")
        self._rating = value

    @property
    def comment(self):
        """Get the comment"""
        return self._comment

    @comment.setter
    def comment(self, value):
        """Validate and set the comment"""
        if not value:
            raise ValueError("comment is required")
        self._comment = value