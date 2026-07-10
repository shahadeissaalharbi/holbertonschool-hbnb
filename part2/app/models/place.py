#!/usr/bin/python3
"""Defines the Place class"""
from models.base_model import BaseModel


class Place(BaseModel):
    """Represents a place that can be listed and reviewed"""

    def __init__(self, title, description, price,
                 latitude, longitude, owner_id):
        """Initialize a new Place instance"""
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner_id = owner_id

    @property
    def title(self):
        """Get the title"""
        return self._title

    @title.setter
    def title(self, value):
        """Validate and set the title"""
        if not value or len(value) > 100:
            raise ValueError(
                "title is required, max 100 characters")
        self._title = value

    @property
    def price(self):
        """Get the price"""
        return self._price

    @price.setter
    def price(self, value):
        """Validate and set the price"""
        if value <= 0:
            raise ValueError("price must be a positive value")
        self._price = float(value)

    @property
    def latitude(self):
        """Get the latitude"""
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        """Validate and set the latitude"""
        if not (-90.0 <= value <= 90.0):
            raise ValueError("latitude must be between -90 and 90")
        self._latitude = float(value)

    @property
    def longitude(self):
        """Get the longitude"""
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        """Validate and set the longitude"""
        if not (-180.0 <= value <= 180.0):
            raise ValueError("longitude must be between -180 and 180")
        self._longitude = float(value)

    def list_amenities(self, place_amenities):
        """Return all PlaceAmenity entries linked to this place"""
        return [pa for pa in place_amenities if pa.place_id == self.id]