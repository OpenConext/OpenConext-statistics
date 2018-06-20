# OpenConext-Statistics

This project contains the Statistics API to retrieve login information from InfluxDB

### Getting started

Create a virtual environment:
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements/test.txt
```
And run the server module:
```
PROFILE=local python -m server
```
### API

The API has the following endpoints - all examples assume a running local app:

* http://localhost:8080/api/stats/first_login
* http://localhost:8080/api/stats/last_login
* http://localhost:8080/api/stats/service_providers
* http://localhost:8080/api/stats/identity_providers
* http://localhost:8080/api/stats/identity_providers/login_time_frame
* http://localhost:8080/api/stats/identity_providers/login_period

?idp_entity_id=http://idp_entity_id&sp_entity_id=http://sp_entity_id

The endpoints are secured with basic authentication. See the [config.yml](server/config/config.yml) for the pre-defined
users and passwords.

```
curl --user "dashboard:secret" "http://localhost:8080/api/stats/identity_providers" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/service_providers" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_time_frame?to=1459555200&from=1451692800" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_time_frame?to=1459555200&from=1457692800&idp_entity_id=https%3A%2F%2Fidentity-provider%2FZETJV3YA3IXWCXF&sp_entity_id=https%3A%2F%2Fservice-provider%2FZOOL5OIJBRAN6QG" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_time_frame?to=1459555200&from=1457692800&idp_entity_id=https://identity-provider/ZETJV3YA3IXWCXF" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_period?period=2017" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_period?period=2017m3&idp_entity_id=https%3A%2F%2Fidentity-provider%2FZETJV3YA3IXWCXF&sp_entity_id=https%3A%2F%2Fservice-provider%2FZOOL5OIJBRAN6QG" | jq .
```

### Testing

```
python -m pytest ./server/
```
Or simply
```
pytest
```