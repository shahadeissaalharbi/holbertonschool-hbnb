#!/usr/bin/python3
"""Unit tests for the PlaceAmenity link model"""
import unittest
from app.models.place_amenity import PlaceAmenity


class TestPlaceAmenity(unittest.TestCase):
    """Test cases for PlaceAmenity creation"""

    def test_create_valid_place_amenity(self):
        link = PlaceAmenity(place_id="place-123", amenity_id="amenity-456")
        self.assertEqual(link.place_id, "place-123")
        self.assertEqual(link.amenity_id, "amenity-456")
        self.assertTrue(hasattr(link, "id"))


if __name__ == "__main__":
    unittest.main()
