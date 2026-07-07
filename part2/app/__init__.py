from flask import Flask
from flask_restx import Api

def create_app():
    app = Flask(name)
    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/api/v1/')
    return app
