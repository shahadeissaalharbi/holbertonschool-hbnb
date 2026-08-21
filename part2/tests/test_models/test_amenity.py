#!/usr/bin/python3
"""Unit tests for the Amenity model"""
import unittest
from app.models.amenity import Amenity


class TestAmenity(unittest.TestCase):
    """Test cases for Amenity creation and validation"""

    def test_create_valid_amenity(self):
        amenity = Amenity(name="Wi-Fi")
        self.assertEqual(amenity.name, "Wi-Fi")
        self.assertEqual(amenity.description, "")
        self.assertTrue(hasattr(amenity, "id"))

    def test_create_valid_amenity_with_description(self):
        amenity = Amenity(name="Pool", description="Outdoor heated pool")
        self.assertEqual(amenity.description, "Outdoor heated pool")

    def test_invalid_name_empty(self):
        with self.assertRaises(ValueError):
            Amenity(name="")

    def test_invalid_name_too_long(self):
        with self.assertRaises(ValueError):
            Amenity(name="a" * 51)


if __name__ == "__main__":
    unittest.main()
