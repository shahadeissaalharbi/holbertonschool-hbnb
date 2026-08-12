from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('reviews', description='Review operations')

review_model = api.model('Review', {
    'text': fields.String(required=True, description='Content of the review'),
    'rating': fields.Integer(required=True, description='Rating from 1 to 5'),
    'place_id': fields.String(required=True, description='ID of the place being reviewed')
})

review_update_model = api.model('ReviewUpdate', {
    'text': fields.String(description='Content of the review'),
    'rating': fields.Integer(description='Rating from 1 to 5')
})


@api.route('/')
class ReviewList(Resource):
    @jwt_required()
    @api.expect(review_model, validate=True)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data or missing user/place')
    def post(self):
        """Create a new review (authenticated user only)"""
        current_user_id = get_jwt_identity()
        review_data = api.payload

        place = facade.get_place(review_data['place_id'])
        if not place:
            return {'error': 'Place not found'}, 404

        # Can't review your own place
        if place.owner.id == current_user_id:
            return {'error': 'You cannot review your own place'}, 400

        # Can't review the same place twice
        existing_reviews = facade.get_reviews_by_place(review_data['place_id'])
        if any(r.user.id == current_user_id for r in existing_reviews):
            return {'error': 'You have already reviewed this place'}, 400

        review_data['user_id'] = current_user_id  # force ownership server-side

        try:
            new_review = facade.create_review(review_data)
        except ValueError as e:
            return {'error': str(e)}, 400

        return {
            'id': new_review.id,
            'text': new_review.text,
            'rating': new_review.rating,
            'user_id': new_review.user.id,
            'place_id': new_review.place.id
        }, 201

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        return [{
            'id': r.id,
            'text': r.text,
            'rating': r.rating
        } for r in reviews], 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        return {
            'id': review.id,
            'text': review.text,
            'rating': review.rating,
            'user': {'id': review.user.id, 'first_name': review.user.first_name},
            'place': {'id': review.place.id, 'title': review.place.title}
        }, 200

    @jwt_required()
    @api.expect(review_update_model, validate=True)
    @api.response(200, 'Review successfully updated')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def put(self, review_id):
        """Update review details (author or admin only)"""
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if not is_admin and review.user.id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        review_data = api.payload
        try:
            updated_review = facade.update_review(review_id, review_data)
        except ValueError as e:
            return {'error': str(e)}, 400

        return {
            'id': updated_review.id,
            'text': updated_review.text,
            'rating': updated_review.rating
        }, 200

    @jwt_required()
    @api.response(200, 'Review successfully deleted')
    @api.response(404, 'Review not found')
    @api.response(403, 'Unauthorized action')
    def delete(self, review_id):
        """Delete a review (author or admin only)"""
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if not is_admin and review.user.id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        facade.delete_review(review_id)
        return {'message': 'Review successfully deleted'}, 200