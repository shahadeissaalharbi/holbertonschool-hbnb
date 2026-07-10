#!/usr/bin/python3
"""Defines the User class"""
import re
from models.base_model import BaseModel


class User(BaseModel):
    """Represents a user of the HBnB application"""
    def __init__(self, first_name, last_name, email, password, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.is_admin = is_admin
        
    @property
    def first_name(self):
        """get the first name
        """
        return self._first_name
    
    @first_name.setter
    def first_name(self, value):
        """Validate and set the first name
        """
        if not value or not isinstance(value, str) or value > 50:
            raise ValueError("First name must be string and under 50 characters")
        self._first_name = value
      
    
    @property
    def last_name(self):
        """get the last name
        """
        return self._last_name
    
    @last_name.setter
    def last_name(self, value):
        """Validate and set the last name
        """
        if not value or not isinstance(value, str) or value > 50:
            raise ValueError("Last name must be string and under 50 characters")
        self._last_name = value
        
    @property
    def email(self):
        """get email
        """
        return self.email
    
    @email.setter
    def email(self, value):
        """Validate and set the email
        """
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not value or not re.match(pattern, value):
            raise ValueError("email must be a valid email address")
        self._email = value
        
    @property
    def password(self):
        """get the password"""
        return self._password

    @password.setter
    def password(self, value):
        """Validate and set the password"""
        if not value or len(value) < 6:
            raise ValueError(
                "password is required, minimum 6 characters")
        self._password = value
    
    @property
    def is_admin(self):
        """Get the admin status"""
        return self._is_admin

    @is_admin.setter
    def is_admin(self, value):
        """Validate and set the admin status"""
        if not isinstance(value, bool):
            raise ValueError("is_admin must be a boolean")
        self._is_admin = value
    
    
       
       
        

        
     
        
    