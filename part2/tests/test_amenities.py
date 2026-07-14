"""
Unit tests for the Amenity endpoints (/api/v1/amenities/).

Run with:
    python -m unittest test_amenities.py -v
or:
    pytest test_amenities.py -v
"""

import unittest
from app import create_app


class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_amenity(self):
        response = self.client.post('/api/v1/amenities/', json={
            "name": "Wi-Fi"
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], "Wi-Fi")

    def test_create_amenity_missing_name(self):
        response = self.client.post('/api/v1/amenities/', json={
            "name": ""
        })
        self.assertEqual(response.status_code, 400)

    def test_create_amenity_name_too_long(self):
        response = self.client.post('/api/v1/amenities/', json={
            "name": "A" * 300
        })
        self.assertEqual(response.status_code, 400)

    def test_get_all_amenities(self):
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json(), list)

    def test_get_amenity_by_id(self):
        create = self.client.post('/api/v1/amenities/', json={
            "name": "Pool"
        })
        amenity_id = create.get_json()["id"]

        response = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Pool")

    def test_get_amenity_not_found(self):
        response = self.client.get('/api/v1/amenities/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_update_amenity(self):
        create = self.client.post('/api/v1/amenities/', json={
            "name": "Gym"
        })
        amenity_id = create.get_json()["id"]

        response = self.client.put(f'/api/v1/amenities/{amenity_id}', json={
            "name": "Fitness Center"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Fitness Center")

    def test_update_amenity_not_found(self):
        response = self.client.put('/api/v1/amenities/nonexistent-id', json={
            "name": "Ghost Amenity"
        })
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()