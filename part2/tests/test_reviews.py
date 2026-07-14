"""
Unit tests for the Review endpoints (/api/v1/reviews/).

Run with:
    python -m unittest test_reviews.py -v
or:
    pytest test_reviews.py -v
"""

import unittest
from app import create_app


class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def _create_user(self, email="reviewer@example.com"):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Rev",
            "last_name": "Iewer",
            "email": email
        })
        return response.get_json()["id"]

    def _create_place(self, owner_id):
        response = self.client.post('/api/v1/places/', json={
            "title": "Reviewable Place",
            "description": "Ready for reviews",
            "price": 80.0,
            "latitude": 1.0,
            "longitude": 1.0,
            "owner_id": owner_id,
            "amenities": []
        })
        return response.get_json()["id"]

    def test_create_review(self):
        owner_id = self._create_user("owner2@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest@example.com")

        response = self.client.post('/api/v1/reviews/', json={
            "text": "Great stay, highly recommended!",
            "rating": 5,
            "user_id": user_id,
            "place_id": place_id
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["rating"], 5)

    def test_create_review_missing_text(self):
        owner_id = self._create_user("owner3@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest2@example.com")

        response = self.client.post('/api/v1/reviews/', json={
            "text": "",
            "rating": 4,
            "user_id": user_id,
            "place_id": place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_rating(self):
        owner_id = self._create_user("owner4@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest3@example.com")

        response = self.client.post('/api/v1/reviews/', json={
            "text": "Rating out of range",
            "rating": 10,
            "user_id": user_id,
            "place_id": place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_user(self):
        owner_id = self._create_user("owner5@example.com")
        place_id = self._create_place(owner_id)

        response = self.client.post('/api/v1/reviews/', json={
            "text": "No such user",
            "rating": 3,
            "user_id": "nonexistent-user-id",
            "place_id": place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_place(self):
        user_id = self._create_user("guest4@example.com")

        response = self.client.post('/api/v1/reviews/', json={
            "text": "No such place",
            "rating": 3,
            "user_id": user_id,
            "place_id": "nonexistent-place-id"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_all_reviews(self):
        response = self.client.get('/api/v1/reviews/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json(), list)

    def test_get_review_by_id(self):
        owner_id = self._create_user("owner6@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest5@example.com")

        create = self.client.post('/api/v1/reviews/', json={
            "text": "Findable review",
            "rating": 4,
            "user_id": user_id,
            "place_id": place_id
        })
        review_id = create.get_json()["id"]

        response = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["id"], review_id)

    def test_get_review_not_found(self):
        response = self.client.get('/api/v1/reviews/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_update_review(self):
        owner_id = self._create_user("owner7@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest6@example.com")

        create = self.client.post('/api/v1/reviews/', json={
            "text": "Before update",
            "rating": 2,
            "user_id": user_id,
            "place_id": place_id
        })
        review_id = create.get_json()["id"]

        response = self.client.put(f'/api/v1/reviews/{review_id}', json={
            "text": "After update",
            "rating": 5
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["text"], "After update")

    def test_update_review_not_found(self):
        response = self.client.put('/api/v1/reviews/nonexistent-id', json={
            "text": "Ghost review"
        })
        self.assertEqual(response.status_code, 404)

    def test_delete_review(self):
        owner_id = self._create_user("owner8@example.com")
        place_id = self._create_place(owner_id)
        user_id = self._create_user("guest7@example.com")

        create = self.client.post('/api/v1/reviews/', json={
            "text": "To be deleted",
            "rating": 1,
            "user_id": user_id,
            "place_id": place_id
        })
        review_id = create.get_json()["id"]

        response = self.client.delete(f'/api/v1/reviews/{review_id}')
        self.assertEqual(response.status_code, 200)

        follow_up = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(follow_up.status_code, 404)

    def test_delete_review_not_found(self):
        response = self.client.delete('/api/v1/reviews/nonexistent-id')
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()