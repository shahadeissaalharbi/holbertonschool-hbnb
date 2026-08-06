#!/usr/bin/python3
"""Defines the BaseModel class"""
from app import db
import uuid
from datetime import datetime


class BaseModel(db.Model):
    """Base class that defines common attributes/methods
    for other classes
    """
    __abstract__ = True  # This ensures SQLAlchemy does not create a table for BaseModel

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, *args, **kwargs):
        """Initialize BaseModel attributes"""
        super().__init__(*args, **kwargs)
        if 'id' not in kwargs:
            self.id = str(uuid.uuid4())
        if 'created_at' not in kwargs:
            self.created_at = datetime.utcnow()
        if 'updated_at' not in kwargs:
            self.updated_at = datetime.utcnow()

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()

    def update(self, data):
        """Update the attributes of the object based on the provided dictionary"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()  # Update the updated_at timestamp

    def create(self):
        """Create/register a new instance
        (calls save to set initial timestamps)
        """
        self.save()

    def delete(self):
        """Delete the current instance
        (placeholder for persistence layer removal)
        """
        del self