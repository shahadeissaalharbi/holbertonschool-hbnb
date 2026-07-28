from flask import Flask
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)
    api = Api(app, version='1.0', title='HBnB API',
              description='HBnB Application API', doc='/api/v1/')

    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.api.v1.users import api as users_ns
    api.add_namespace(users_ns, path='/api/v1/users')

    from app.api.v1.amenities import api as amenities_ns
    api.add_namespace(amenities_ns, path='/api/v1/amenities')

    from app.api.v1.places import api as places_ns
    api.add_namespace(places_ns, path='/api/v1/places')

    from app.api.v1.reviews import api as reviews_ns
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    from app.api.v1.auth import api as auth_ns
    api.add_namespace(auth_ns, path='/api/v1/auth')

    _seed_admin()

    return app


def _seed_admin():
    """Bootstrap the first admin user so admin-only endpoints are reachable."""
    from app.services import facade

    admin_email = "admin@hbnb.io"
    if facade.get_user_by_email(admin_email):
        return  # already seeded, don't duplicate on reloader/re-import

    admin_data = {
        "first_name": "Admin",
        "last_name": "User",
        "email": admin_email,
        "password": "admin1234",
        "is_admin": True
    }
    facade.create_user(admin_data)