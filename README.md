# OpenConext-Statistics

This project contains the Statistics API to retrieve login information from InfluxDB

### Getting started

Create a virtual environment:
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements/test.txt
```

### API

```
curl --user "dashboard:secret" "http://localhost:8080/api/stats/identity_providers" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/service_providers" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_time_frame?to=1459555200&from=1451692800" | jq .
curl --user "dashboard:secret" "http://localhost:8080/api/stats/login_time_frame?to=1459555200&from=1451692800&idp_entity_id=https%3A%2F%2Fidentity-provider%2FZETJV3YA3IXWCXF&sp_entity_id=https%3A%2F%2Fservice-provider%2FZOOL5OIJBRAN6QG" | jq .
```

### Testing

```
python -m pytest ./server/
```