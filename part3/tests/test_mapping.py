#!/usr/bin/python3
"""
Dedicated tests to verify SQLAlchemy relationships between
User, Place, Review, and Amenity.

Run with:
    flask shell < tests/test_relationships.py

or import and call run_all_tests() from inside `flask shell`.
"""
from app import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity


def cleanup():
    """Remove any leftover test data from previous runs."""
    Review.query.filter(Review.text.like("TEST_%")).delete(synchronize_session=False)
    Place.query.filter(Place.title.like("TEST_%")).delete(synchronize_session=False)
    Amenity.query.filter(Amenity.name.like("TEST_%")).delete(synchronize_session=False)
    User.query.filter(User.email.like("test_relationships_%")).delete(synchronize_session=False)
    db.session.commit()


def test_user_places():
    """Verify user.places returns the correct Place objects."""
    user = User(first_name="Test", last_name="Owner",
                email="test_relationships_owner@test.com",
                password="123456")
    db.session.add(user)
    db.session.commit()

    place1 = Place(title="TEST_Place1", description="desc", price=100,
                    latitude=10.0, longitude=10.0, user_id=user.id)
    place2 = Place(title="TEST_Place2", description="desc", price=200,
                    latitude=20.0, longitude=20.0, user_id=user.id)
    db.session.add_all([place1, place2])
    db.session.commit()

    assert place1 in user.places, "place1 should be in user.places"
    assert place2 in user.places, "place2 should be in user.places"
    assert len(user.places) == 2, f"Expected 2 places, got {len(user.places)}"
    assert place1.owner == user, "place1.owner should be the user (backref check)"

    print("PASS: test_user_places")
    return user, place1, place2


def test_place_reviews(user, place):
    """Verify place.reviews and user.reviews return the correct Review objects."""
    review1 = Review(text="TEST_Great place!", rating=5,
                      user_id=user.id, place_id=place.id)
    review2 = Review(text="TEST_Would visit again", rating=4,
                      user_id=user.id, place_id=place.id)
    db.session.add_all([review1, review2])
    db.session.commit()

    assert review1 in place.reviews, "review1 should be in place.reviews"
    assert review2 in place.reviews, "review2 should be in place.reviews"
    assert len(place.reviews) == 2, f"Expected 2 reviews, got {len(place.reviews)}"

    assert review1 in user.reviews, "review1 should be in user.reviews"
    assert review2 in user.reviews, "review2 should be in user.reviews"

    assert review1.place == place, "review1.place should equal place (backref check)"
    assert review1.author == user, "review1.author should equal user (backref check)"

    print("PASS: test_place_reviews")
    return review1, review2


def test_place_amenities(place):
    """Verify place.amenities and amenity.places (many-to-many)."""
    amenity1 = Amenity(name="TEST_WiFi")
    amenity2 = Amenity(name="TEST_Pool")
    db.session.add_all([amenity1, amenity2])
    db.session.commit()

    place.amenities.append(amenity1)
    place.amenities.append(amenity2)
    db.session.commit()

    assert amenity1 in place.amenities, "amenity1 should be in place.amenities"
    assert amenity2 in place.amenities, "amenity2 should be in place.amenities"
    assert len(place.amenities) == 2, f"Expected 2 amenities, got {len(place.amenities)}"

    assert place in amenity1.places, "place should be in amenity1.places"
    assert place in amenity2.places, "place should be in amenity2.places"

    print("PASS: test_place_amenities")
    return amenity1, amenity2


def test_data_integrity(user, place):
    """Re-fetch objects from a fresh query to confirm persistence, not just session cache."""
    db.session.expire_all()  # forces SQLAlchemy to reload from the DB, not memory

    fetched_user = User.query.get(user.id)
    fetched_place = Place.query.get(place.id)

    assert len(fetched_user.places) >= 1, "Persisted user should still have places"
    assert len(fetched_place.reviews) >= 1, "Persisted place should still have reviews"
    assert len(fetched_place.amenities) >= 1, "Persisted place should still have amenities"

    print("PASS: test_data_integrity")


def run_all_tests():
    print("Cleaning up old test data...")
    cleanup()

    print("Running relationship tests...\n")
    user, place1, place2 = test_user_places()
    test_place_reviews(user, place1)
    test_place_amenities(place1)
    test_data_integrity(user, place1)

    print("\nAll relationship tests passed successfully.")

    print("\nCleaning up test data...")
    cleanup()


if __name__ == "__main__":
    run_all_tests()