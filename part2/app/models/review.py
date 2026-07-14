#!/usr/bin/python3
"""Defines the Review class"""
from models.base_model import BaseModel
from models.user import User
from models.place import Place

class Review(BaseModel):
    """Represents a review left by a user for a place"""

    def __init__(self, rating, text, place, user):
        """Initialize a new Review instance"""
        super().__init__()
        self.rating = rating
        self.text = text
        self.place = place
        self.user = user

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
    def text(self):
        """Get the text"""
        return self._text

    @text.setter
    def text(self, value):
        """Validate and set the text"""
        if not value:
            raise ValueError("text is required")
        self._text = value
        
    
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