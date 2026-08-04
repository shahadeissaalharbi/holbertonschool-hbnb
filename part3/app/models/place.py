#!/usr/bin/python3
"""Defines the Place class"""
from app import db
from sqlalchemy.orm import validates, relationship
from app.models.base_model import BaseModel


# Association table for the Many-to-Many relationship
# between Place and Amenity
place_amenity = db.Table(
    'place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'),
               primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'),
               primary_key=True)
)


class Place(BaseModel):
    """Represents a place that can be listed and reviewed"""
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    # Foreign key to User (One-to-Many: User -> Place)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'),
                         nullable=False)

    # Relationships
    reviews = relationship('Review', backref='place', lazy=True,
                            cascade='all, delete-orphan')
    amenities = relationship('Amenity', secondary=place_amenity,
                              lazy='subquery',
                              backref=db.backref('places', lazy=True))

    def __init__(self, title, description, price, latitude, longitude,
                 user_id):
        """Initialize a new Place instance"""
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.user_id = user_id

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