from flask_jwt_extended import jwt_required, get_jwt_identity
@api.route('/protected')
class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
         """A protected endpoint that requires a valid JWT token"""
         print("jwt------")
         print(get_jwt_identity())
         current_user = get_jwt_identity() 
         return {'message': f'Hello, user {current_user}'}, 200