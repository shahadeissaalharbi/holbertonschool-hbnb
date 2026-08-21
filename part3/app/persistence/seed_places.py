"""Seed sample places"""
from app import db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity

PLACES = [
    {
        "title": "Beautiful Beach House",
        "description": "A relaxing beach house with ocean views.",
        "price": 150.0,
        "latitude": 25.7617,
        "longitude": -80.1918,
        "images": [
            "https://images.unsplash.com/photo-1597475681177-809cfdc76cd2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1736194027664-aae2fe5e5c85?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1736194027607-84c5b27d54db?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0",
        ],
        "amenities": ["WiFi", "Swimming Pool", "Air Conditioning"],
    },
    {
        "title": "Cozy Cabin",
        "description": "A warm and cozy cabin retreat in the woods.",
        "price": 100.0,
        "latitude": 39.5501,
        "longitude": -105.7821,
        "images": [
            "https://plus.unsplash.com/premium_photo-1686090448517-2f692cc45187?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1686090449200-57266c6623a6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1686090450346-f418fff5486e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
        ],
        "amenities": ["WiFi"],
    },
    {
        "title": "Modern Apartment",
        "description": "A sleek modern apartment in the city center.",
        "price": 200.0,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "images": [
            "https://images.unsplash.com/photo-1737298336249-c051021a3050?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://images.unsplash.com/photo-1628592102751-ba83b0314276?q=80&w=2194&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://images.unsplash.com/photo-1612320743558-020669ff20e8?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0",
        ],
        "amenities": ["WiFi", "Swimming Pool", "Air Conditioning"],
    },
    {
        "title": "Lakeside Cottage",
        "description": "A peaceful cottage right on the lake.",
        "price": 85.0,
        "latitude": 44.2619,
        "longitude": -71.3033,
        "images": [
            "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1684506396899-ad9963e6a7bb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0",
            "https://plus.unsplash.com/premium_photo-1734543932018-e3454ad2daa4?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0",
        ],
        "amenities": ["WiFi", "Air Conditioning"],
    },
]


def _get_or_create_amenity(name):
    """Look up an Amenity by name, creating it if it doesn't exist yet"""
    amenity = Amenity.query.filter_by(name=name).first()
    if not amenity:
        amenity = Amenity(name=name)
        db.session.add(amenity)
        db.session.flush()  # assign an id without a full commit
    return amenity


def seed_places():
    """Insert sample places with images and amenities if they don't already exist"""
    owner = User.query.filter_by(email="admin@hbnb.io").first()
    if not owner:
        return  # admin not seeded yet, skip silently

    for entry in PLACES:
        if Place.query.filter_by(title=entry["title"]).first():
            continue  # already seeded

        place = Place(
            title=entry["title"],
            description=entry["description"],
            price=entry["price"],
            latitude=entry["latitude"],
            longitude=entry["longitude"],
            user_id=owner.id,
        )
        place.image_url = entry["images"][0]
        place.images = ",".join(entry["images"])

        db.session.add(place)

        for amenity_name in entry.get("amenities", []):
            amenity = _get_or_create_amenity(amenity_name)
            place.amenities.append(amenity)

    db.session.commit() 