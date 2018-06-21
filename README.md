# OpenConext-Statistics

This project contains the Statistics API to retrieve OpenConext login information.

### [System Requirements](#system-requirements)

- Python 3.6.x
- InfluxDB v1.5.x


### [Getting started](#getting-started)

Create a virtual environment:
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements/test.txt
```
Ensure InfluxDb is running and run the Python server:
```
PROFILE=local python -m server
```
### [API](#api)

See the [Wiki](https://github.com/OpenConext/OpenConext-statistics/wiki) for the API documentation.

### [Testing](#testing)

To run all tests:
```
pytest
```
To generate coverage reports:
```
pytest --cov=server --cov-report html:htmlcov server/test
open htmlcov/index.html
```
