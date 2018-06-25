from flask import Blueprint

from server.api.base import json_endpoint

user_api = Blueprint("user_api", __name__, url_prefix="/api/users")


@user_api.route("/me", strict_slashes=False)
@json_endpoint
def me():
    return {"uid": "uid", "display_name": "John Doe", "guest": False, "product": "OpenConext"}, 200


@user_api.route("/configuration", strict_slashes=False)
@json_endpoint
def configuration():
    return {"product": "OpenConext", "guest": False}, 200


@user_api.route("/logout", strict_slashes=False)
@json_endpoint
def service_provider_tags():
    return {}, 200


@user_api.route("/error", strict_slashes=False)
@json_endpoint
def error():
    return {}, 200
