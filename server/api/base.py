import logging
from functools import wraps

from flask import Blueprint, jsonify, current_app, request as current_request
from werkzeug.exceptions import HTTPException, Unauthorized

base_api = Blueprint("base_api", __name__, url_prefix="/")


def auth_filter(config):
    # Allow Cross-Origin Resource Sharing calls and health checks
    if current_request.method == "OPTIONS" or current_request.base_url.endswith("health"):
        return

    auth = current_request.authorization
    if not auth or len(list(filter(lambda user: user.name == auth.username and user.password == auth.password,
                                   config.api_users))) == 0:
        raise Unauthorized(description="Invalid username or password")


def json_endpoint(f):
    @wraps(f)
    def json(*args, **kwargs):
        try:
            auth_filter(current_app.influx_config)
            body, status = f(*args, **kwargs)
            return jsonify(body), status
        except Exception as e:
            response = jsonify(message=e.description if isinstance(e, HTTPException) else str(e))
            logging.getLogger().exception("Message")
            response.status_code = e.code if isinstance(e, HTTPException) else 500
            if response.status_code == 401:
                response.headers.set("WWW-Authenticate", "Basic realm=\"Please login\"")
            return response

    return json


@base_api.route("/health", strict_slashes=False)
@json_endpoint
def health():
    return {"status": "UP"}, 200
