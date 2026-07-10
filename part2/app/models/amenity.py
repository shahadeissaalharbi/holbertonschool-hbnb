#!/usr/bin/python3
"""Defines the Amenity class"""
from models.base_model import BaseModel


class Amenity(BaseModel):
    """Represents an amenity that can be linked to a place"""

    def __init__(self, name, description=""):
        """Initialize a new Amenity instance"""
        super().__init__()
        self.name = name
        self.description = description

    @property
    def name(self):
        """Get the amenity name"""
        return self._name

    @name.setter
    def name(self, value):
        """Validate and set the amenity name"""
        if not value or len(value) > 50:
            raise ValueError(
                "name is required, max 50 characters")
        self._name = value