#!/usr/bin/python3
"""Defines the PlaceAmenity class"""
from app.models.base_model import BaseModel


class PlaceAmenity(BaseModel):
    """Represents the link between a Place and an Amenity"""

    def __init__(self, place_id, amenity_id):
        """Initialize a new PlaceAmenity instance"""
        super().__init__()
        self.place_id = place_id
        self.amenity_id = amenity_id