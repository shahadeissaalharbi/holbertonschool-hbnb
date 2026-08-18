#!/usr/bin/python3
"""Defines the Amenity class"""
from app import db
from sqlalchemy.orm import validates
from app.models.base_model import BaseModel


class Amenity(BaseModel):
    """Represents an amenity that can be linked to a place"""
    __tablename__ = 'Amenity'

    name = db.Column(db.String(50), nullable=False)

    def __init__(self, name):
        """Initialize a new Amenity instance"""
        super().__init__()
        self.name = name

    @validates('name')
    def validate_name(self, key, value):
        """Validate and set the amenity name"""
        if not value or len(value) > 50:
            raise ValueError(
                "name is required, max 50 characters")
        return value