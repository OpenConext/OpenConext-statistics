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

See the [Wiki]() for the API documentation.

### Testing

To run all tests:
```
pytest
```
To generate coverage reports:
```
pytest --cov=server --cov-report html:htmlcov server/test
open htmlcov/index.html
```
