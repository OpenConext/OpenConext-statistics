import logging
from functools import wraps

from flask import Blueprint, jsonify, current_app, request as current_request, session, g as request_context
from werkzeug.exceptions import HTTPException, Unauthorized

base_api = Blueprint("base_api", __name__, url_prefix="/")

whitelisting = ["health", "api/users/me", "/api/stats/public"]


def auth_filter(config):
    url = current_request.base_url

    if "user" in session:
        return

    is_whitelisted_url = False
    for u in whitelisting:
        if u in url:
            is_whitelisted_url = True

    auth = current_request.authorization
    is_authorized_api_call = bool(auth and len(
        list(filter(lambda user: user.name == auth.username and user.password == auth.password, config.api_users))) > 0)

    if not (is_whitelisted_url or is_authorized_api_call):
        raise Unauthorized(description="Invalid username or password")

    request_context.is_authorized_api_call = is_authorized_api_call


def _add_custom_header(response):
    response.headers.set("x-session-alive", "true")
    response.headers["server"] = ""


def json_endpoint(f):
    @wraps(f)
    def json(*args, **kwargs):
        try:
            auth_filter(current_app.app_config)
            body, status = f(*args, **kwargs)
            response = jsonify(body)
            _add_custom_header(response)
            return response, status
        except Exception as e:
            response = jsonify(message=e.description if isinstance(e, HTTPException) else str(e))
            logging.getLogger().exception("Message")
            response.status_code = e.code if isinstance(e, HTTPException) else 500
            _add_custom_header(response)
            if response.status_code == 401:
                response.headers.set("WWW-Authenticate", "Basic realm=\"Please login\"")
            return response

    return json


@base_api.route("/health", strict_slashes=False)
@json_endpoint
def health():
    return {"status": "UP"}, 200
