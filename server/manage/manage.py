import requests
from flask import current_app


def _auth():
    manage = current_app.app_config.manage
    return manage.user, manage.password


def _data(entity_type, requested_fields=[]):
    with requests.Session() as s:
        providers = s.post(f"{current_app.app_config.manage.url}/manage/api/internal/search/saml20_{entity_type}",
                           json={"REQUESTED_ATTRIBUTES": requested_fields}, auth=_auth()).json()
        result = []
        for provider in providers:
            if "data" in provider:
                data_ = provider["data"]
                metadata = data_["metaDataFields"] if "metaDataFields" in data_ else {}
                entity_id = data_["entityid"]
                res = {"id": entity_id,
                       "state": data_["state"],
                       "manage_id": provider["_id"],
                       "name_en": metadata["name:en"] if "name:en" in metadata else entity_id,
                       "name_nl": metadata["name:nl"] if "name:nl" in metadata else entity_id,
                       "present_in_manage": True}
                for field in requested_fields:
                    sub = field[len("metaDataFields."):]
                    if sub in metadata:
                        res[field.replace("metaDataFields.", "")] = metadata[sub]
                result.append(res)
        return result


def service_providers():
    return _data("sp")


def identity_providers():
    return _data("idp", ["metaDataFields.coin:institution_type"])


def connected_identity_providers():
    return _data("idp", ["metaDataFields.coin:publish_in_edugain", "metaDataFields.coin:guest_qualifier",
                         "metaDataFields.coin:institution_type"])
