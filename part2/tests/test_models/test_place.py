#!/usr/bin/python3
"""Unit tests for the Place model"""
import unittest
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity
from app.models.review import Review


class TestPlace(unittest.TestCase):
    """Test cases for Place creation, validation, and relationships"""

    def setUp(self):
        self.owner = User(first_name="Alice", last_name="Owner",
                           email="alice@example.com")

    def test_create_valid_place(self):
        place = Place(title="Cozy Cabin", description="A nice cabin",
                       price=100.0, latitude=45.0, longitude=-122.0,
                       owner=self.owner)
        self.assertEqual(place.title, "Cozy Cabin")
        self.assertEqual(place.price, 100.0)
        self.assertEqual(place.owner, self.owner)
        self.assertEqual(place.reviews, [])
        self.assertEqual(place.amenities, [])

    def test_create_place_with_amenities(self):
        wifi = Amenity(name="Wi-Fi")
        place = Place(title="Cabin", description="Nice", price=50,
                       latitude=10.0, longitude=10.0, owner=self.owner,
                       amenities=[wifi])
        self.assertIn(wifi, place.amenities)

    def test_invalid_title_empty(self):
        with self.assertRaises(ValueError):
            Place(title="", description="Nice", price=50,
                  latitude=10.0, longitude=10.0, owner=self.owner)

    def test_invalid_title_too_long(self):
        with self.assertRaises(ValueError):
            Place(title="a" * 101, description="Nice", price=50,
                  latitude=10.0, longitude=10.0, owner=self.owner)

    def test_invalid_price_zero(self):
        with self.assertRaises(ValueError):
            Place(title="Cabin", description="Nice", price=0,
                  latitude=10.0, longitude=10.0, owner=self.owner)

    def test_invalid_price_negative(self):
        with self.assertRaises(ValueError):
            Place(title="Cabin", description="Nice", price=-10,
                  latitude=10.0, longitude=10.0, owner=self.owner)

    def test_invalid_latitude_out_of_range(self):
        with self.assertRaises(ValueError):
            Place(title="Cabin", description="Nice", price=50,
                  latitude=100.0, longitude=10.0, owner=self.owner)

    def test_invalid_longitude_out_of_range(self):
        with self.assertRaises(ValueError):
            Place(title="Cabin", description="Nice", price=50,
                  latitude=10.0, longitude=200.0, owner=self.owner)

    def test_invalid_owner_not_user_instance(self):
        with self.assertRaises(ValueError):
            Place(title="Cabin", description="Nice", price=50,
                  latitude=10.0, longitude=10.0, owner="not_a_user")

    def test_add_review_relationship(self):
        place = Place(title="Cabin", description="Nice", price=50,
                      latitude=10.0, longitude=10.0, owner=self.owner)
        reviewer = User(first_name="Bob", last_name="Guest",
                         email="bob@example.com")
        review = Review(rating=5, text="Great stay!", place=place, user=reviewer)
        place.add_review(review)
        self.assertIn(review, place.reviews)
        self.assertEqual(len(place.reviews), 1)

    def test_add_amenity_relationship(self):
        place = Place(title="Cabin", description="Nice", price=50,
                      latitude=10.0, longitude=10.0, owner=self.owner)
        wifi = Amenity(name="Wi-Fi")
        place.add_amenity(wifi)
        self.assertIn(wifi, place.amenities)


if __name__ == "__main__":
    unittest.main()
