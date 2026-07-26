#!/usr/bin/python3
"""Unit tests for the User model"""
import unittest
from app.models.user import User


class TestUser(unittest.TestCase):
    """Test cases for User creation, validation, and password handling"""

    def test_create_valid_user(self):
        user = User(first_name="John", last_name="Doe", email="john@example.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.email, "john@example.com")
        self.assertIsNone(user.password)
        self.assertFalse(user.is_admin)
        self.assertTrue(hasattr(user, "id"))

    def test_create_valid_admin_user(self):
        user = User(first_name="Jane", last_name="Admin",
                     email="jane@example.com", is_admin=True)
        self.assertTrue(user.is_admin)

    def test_invalid_first_name_empty(self):
        with self.assertRaises(ValueError):
            User(first_name="", last_name="Doe", email="john@example.com")

    def test_invalid_first_name_too_long(self):
        with self.assertRaises(ValueError):
            User(first_name="a" * 51, last_name="Doe", email="john@example.com")

    def test_invalid_first_name_not_string(self):
        with self.assertRaises(ValueError):
            User(first_name=123, last_name="Doe", email="john@example.com")

    def test_invalid_last_name_empty(self):
        with self.assertRaises(ValueError):
            User(first_name="John", last_name="", email="john@example.com")

    def test_invalid_email_format(self):
        with self.assertRaises(ValueError):
            User(first_name="John", last_name="Doe", email="not-an-email")

    def test_invalid_email_empty(self):
        with self.assertRaises(ValueError):
            User(first_name="John", last_name="Doe", email="")

    def test_invalid_password_too_short(self):
        with self.assertRaises(ValueError):
            User(first_name="John", last_name="Doe",
                 email="john@example.com", password="abc")

    def test_valid_password_none_allowed(self):
        user = User(first_name="John", last_name="Doe",
                     email="john@example.com", password=None)
        self.assertIsNone(user.password)

    def test_invalid_is_admin_not_bool(self):
        with self.assertRaises(ValueError):
            User(first_name="John", last_name="Doe",
                 email="john@example.com", is_admin="yes")


if __name__ == "__main__":
    unittest.main()
