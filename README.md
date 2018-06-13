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
curl --user "dashboard:secret" http://localhost:8080/api/stats/login_time_frame?from=1451692800&to=1459555200 | jq .
```

### Testing

```
python -m pytest ./server/
```