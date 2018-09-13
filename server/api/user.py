import json
import logging

from flask import Blueprint, request as current_request, session, current_app

from server.api.base import json_endpoint

user_api = Blueprint("user_api", __name__, url_prefix="/api/users")


@user_api.route("/me", strict_slashes=False)
@json_endpoint
def me():
    logger = logging.getLogger("main")
    logger.info(f"Headers {current_request.headers}")

    sub = current_request.headers.get("OIDC_CLAIM_sub")
    if sub or "mod_auth_openidc_session" in current_request.cookies:
        user = {"uid": sub or "sub", "guest": False,
                "product": current_app.app_config.product, "manage_url": current_app.app_config.manage.url}
        session["user"] = user
        return user, 200

    if "user" in session:
        return session["user"], 200

    if current_app.app_config.profile == "local":
        user = {"uid": "uid", "display_name": "John Doe", "guest": False, "product": "OpenConext",
                "manage_url": current_app.app_config.manage.url}
        session["user"] = user
        return user, 200

    user = {"uid": "anonymous", "guest": True, "product": "OpenConext",
            "manage_url": current_app.app_config.manage.url}
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
    logging.getLogger("user_api").exception(json.dumps(current_request.json))
    return {}, 201
