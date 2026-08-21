#!/usr/bin/python3
"""Unit tests for the Review model"""
import unittest
from app.models.user import User
from app.models.place import Place
from app.models.review import Review


class TestReview(unittest.TestCase):
    """Test cases for Review creation and validation"""

    def setUp(self):
        self.owner = User(first_name="Alice", last_name="Owner",
                           email="alice@example.com")
        self.guest = User(first_name="Bob", last_name="Guest",
                           email="bob@example.com")
        self.place = Place(title="Cabin", description="Nice", price=50,
                            latitude=10.0, longitude=10.0, owner=self.owner)

    def test_create_valid_review(self):
        review = Review(rating=5, text="Great stay!",
                         place=self.place, user=self.guest)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.text, "Great stay!")
        self.assertEqual(review.place, self.place)
        self.assertEqual(review.user, self.guest)

    def test_invalid_rating_too_low(self):
        with self.assertRaises(ValueError):
            Review(rating=0, text="Bad", place=self.place, user=self.guest)

    def test_invalid_rating_too_high(self):
        with self.assertRaises(ValueError):
            Review(rating=6, text="Bad", place=self.place, user=self.guest)

    def test_invalid_rating_not_int(self):
        with self.assertRaises(ValueError):
            Review(rating="five", text="Bad", place=self.place, user=self.guest)

    def test_invalid_text_empty(self):
        with self.assertRaises(ValueError):
            Review(rating=5, text="", place=self.place, user=self.guest)

    def test_invalid_place_not_place_instance(self):
        with self.assertRaises(ValueError):
            Review(rating=5, text="Great!", place="not_a_place", user=self.guest)

    def test_invalid_user_not_user_instance(self):
        with self.assertRaises(ValueError):
            Review(rating=5, text="Great!", place=self.place, user="not_a_user")


if __name__ == "__main__":
    unittest.main()
