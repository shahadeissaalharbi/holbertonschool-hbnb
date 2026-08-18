#!/usr/bin/python3
"""Defines the PlaceAmenity class"""
from app import db
from app.models.base_model import BaseModel


class PlaceAmenity(BaseModel):
    """Represents the link between a Place and an Amenity"""
    __tablename__ = 'Place_Amenity'

    place_id = db.Column(db.String(36), db.ForeignKey('Place.id'), nullable=False)
    amenity_id = db.Column(db.String(36), db.ForeignKey('Amenity.id'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('place_id', 'amenity_id', name='unique_place_amenity'),
    )

    def __init__(self, place_id, amenity_id):
        """Initialize a new PlaceAmenity instance"""
        super().__init__()
        self.place_id = place_id
        self.amenity_id = amenity_id