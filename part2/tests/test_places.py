"""
Unit tests for the Place endpoints (/api/v1/places/).

Run with:
    python -m unittest test_places.py -v
or:
    pytest test_places.py -v
"""

import unittest
from app import create_app


class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def _create_owner(self, email="owner.person@example.com"):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Owner",
            "last_name": "Person",
            "email": email
        })
        return response.get_json()["id"]

    def test_create_place(self):
        owner_id = self._create_owner()
        response = self.client.post('/api/v1/places/', json={
            "title": "Cozy Apartment",
            "description": "A nice place to stay",
            "price": 100.0,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "owner_id": owner_id,
            "amenities": []
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["title"], "Cozy Apartment")

    def test_create_place_missing_title(self):
        owner_id = self._create_owner("owner1@example.com")
        response = self.client.post('/api/v1/places/', json={
            "title": "",
            "description": "No title here",
            "price": 100.0,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "owner_id": owner_id,
            "amenities": []
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_negative_price(self):
        owner_id = self._create_owner("owner2@example.com")
        response = self.client.post('/api/v1/places/', json={
            "title": "Cheap Place",
            "description": "Too cheap",
            "price": -50.0,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "owner_id": owner_id,
            "amenities": []
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_latitude(self):
        owner_id = self._create_owner("owner3@example.com")
        response = self.client.post('/api/v1/places/', json={
            "title": "Out of Range",
            "description": "Bad latitude",
            "price": 100.0,
            "latitude": 999.0,
            "longitude": -122.4194,
            "owner_id": owner_id,
            "amenities": []
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_longitude(self):
        owner_id = self._create_owner("owner4@example.com")
        response = self.client.post('/api/v1/places/', json={
            "title": "Out of Range",
            "description": "Bad longitude",
            "price": 100.0,
            "latitude": 37.7749,
            "longitude": -999.0,
            "owner_id": owner_id,
            "amenities": []
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_owner(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "No Owner",
            "description": "Owner does not exist",
            "price": 100.0,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "owner_id": "nonexistent-owner-id",
            "amenities": []
        })
        self.assertEqual(response.status_code, 400)

    def test_get_all_places(self):
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json(), list)

    def test_get_place_by_id(self):
        owner_id = self._create_owner("owner5@example.com")
        create = self.client.post('/api/v1/places/', json={
            "title": "Lookup Place",
            "description": "Findable",
            "price": 75.0,
            "latitude": 10.0,
            "longitude": 10.0,
            "owner_id": owner_id,
            "amenities": []
        })
        place_id = create.get_json()["id"]

        response = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["id"], place_id)

    def test_get_place_not_found(self):
        response = self.client.get('/api/v1/places/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_update_place(self):
        owner_id = self._create_owner("owner6@example.com")
        create = self.client.post('/api/v1/places/', json={
            "title": "Old Title",
            "description": "Before update",
            "price": 60.0,
            "latitude": 5.0,
            "longitude": 5.0,
            "owner_id": owner_id,
            "amenities": []
        })
        place_id = create.get_json()["id"]

        response = self.client.put(f'/api/v1/places/{place_id}', json={
            "title": "New Title"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["title"], "New Title")

    def test_update_place_not_found(self):
        response = self.client.put('/api/v1/places/nonexistent-id', json={
            "title": "Ghost Place"
        })
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()