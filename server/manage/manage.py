import requests
from flask import current_app


def _auth():
    manage = current_app.app_config.manage
    return manage.user, manage.password


def _data(entity_type):
    with requests.Session() as s:
        response = s.post(f"{current_app.app_config.manage.url}/manage/api/internal/search/saml20_{entity_type}",
                          json={}, auth=_auth())
        result = []
        for provider in response.json():
            metadata = provider["metaDataFields"] if "metaDataFields" in provider else {}
            entity_id = provider["data"]["entityid"]
            result.append({
                "id": entity_id,
                "status": provider["data"]["state"],
                "name_en": metadata["name:en"] if "name:en" in metadata else entity_id,
                "name_nl": metadata["name:nl"] if "name:nl" in metadata else entity_id
            })
        return result


def service_providers():
    return _data("sp")


def identity_providers():
    return _data("idp")
