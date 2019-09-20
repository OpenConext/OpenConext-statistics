import json
import logging

from flask import Blueprint, request as current_request, session, current_app

from server.api.base import json_endpoint

user_api = Blueprint("user_api", __name__, url_prefix="/api/users")


@user_api.route("/me", strict_slashes=False)
@json_endpoint
def me():
    sub = current_request.headers.get("Oidc-Claim-Sub")
    config_data = {"supported_language_codes": current_app.app_config.supported_language_codes,
                   "product": current_app.app_config.product, "manage_url": current_app.app_config.manage.url,
                   "base_url": current_app.app_config.base_url,
                   "feature_high_scores": current_app.app_config.feature.high_scores}
    if sub:
        user = {"uid": sub, "guest": False, **config_data}
        session["user"] = user
        return user, 200

    if "user" in session:
        return session["user"], 200

    if current_app.app_config.profile == "local":
        user = {"uid": "uid", "display_name": "John Doe", "guest": False, **config_data}
        session["user"] = user
        return user, 200

    user = {"uid": "anonymous", "guest": True, **config_data}
    session["user"] = user
    return user, 200


@user_api.route("/logout", strict_slashes=False)
@json_endpoint
def logout():
    if session:
        session.pop("user", None)

    return {}, 200


@user_api.route("/error", methods=["POST"], strict_slashes=False)
@json_endpoint
def error():
    logging.getLogger().exception(json.dumps(current_request.json))
    return {}, 201
