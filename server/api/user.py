import json
import logging

from flask import Blueprint, request, session, current_app

from server.api.base import json_endpoint

user_api = Blueprint("user_api", __name__, url_prefix="/api/users")


@user_api.route("/me", strict_slashes=False)
@json_endpoint
def me():
    if "user" in session:
        return session["user"], 200

    name_id = request.headers.get("name-id")
    if name_id:
        user = {"uid": name_id, "display_name": request.headers.get("name-id"), "guest": False,
                "product": current_app.app_config.product}
        session["user"] = user
        return user, 200

    if current_app.app_config.profile == "local":
        user = {"uid": "uid", "display_name": "John Doe", "guest": False, "product": "OpenConext"}
        session["user"] = user
        return user, 200

    return {"uid": "anonymous", "guest": True}, 200


@user_api.route("/logout", strict_slashes=False)
@json_endpoint
def logout():
    if session:
        session.clear()
    return {}, 200


@user_api.route("/error", methods=["POST"], strict_slashes=False)
@json_endpoint
def error():
    logging.getLogger("user_api").exception(json.dumps(request.json))
    return {}, 201
