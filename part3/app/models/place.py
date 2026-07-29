#!/usr/bin/python3
"""Defines the Place class"""
from app import db
from sqlalchemy.orm import validates
from app.models.base_model import BaseModel
from app.models.user import User


class Place(BaseModel):
    """Represents a place that can be listed and reviewed"""
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    def __init__(self, title, description, price,
                 latitude, longitude, owner, amenities=None):
        """Initialize a new Place instance"""
        
        super().__init__()
    
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []  # List to store related reviews
        self.amenities = amenities if amenities is not None else []

    @validates('title')
    def validate_title(self, key, value):
        """Validate and set the title"""
        if not value or len(value) > 100:
            raise ValueError(
                "title is required, max 100 characters")
        return value

    @validates('price')
    def validate_price(self, key, value):
        """Validate and set the price"""
        if value <= 0:
            raise ValueError("price must be a positive value")
        return float(value)

    @validates('latitude')
    def validate_latitude(self, key, value):
        """Validate and set the latitude"""
        if not (-90.0 <= value <= 90.0):
            raise ValueError("latitude must be between -90 and 90")
        return float(value)

    @validates('longitude')
    def validate_longitude(self, key, value):
        """Validate and set the longitude"""
        if not (-180.0 <= value <= 180.0):
            raise ValueError("longitude must be between -180 and 180")
        return float(value)

    def list_amenities(self, place_amenities):
        """Return all PlaceAmenity entries linked to this place"""
        return [pa for pa in place_amenities if pa.place_id == self.id]

    @property
    def owner(self):
        """Get the owner"""
        return self._owner

    @owner.setter
    def owner(self, value):
        """Validate and set the owner"""
        if not isinstance(value, User):
            raise ValueError("owner must be a valid User instance")
        self._owner = value

    def add_review(self, review):
        """Add a review to the place"""
        self.reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place"""
        self.amenities.append(amenity)