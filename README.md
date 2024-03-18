# OpenConext-Statistics
[![Build Status](https://travis-ci.org/OpenConext/OpenConext-statistics.svg)](https://travis-ci.org/OpenConext/OpenConext-statistics)
[![codecov.io](https://codecov.io/github/OpenConext/OpenConext-statistics/coverage.svg)](https://codecov.io/github/OpenConext/OpenConext-statistics)

This project contains the Statistics API to retrieve OpenConext login information.

### [Overview Requirements](#system-requirements)

<<<<<<< HEAD
- Python 3.9.x
=======
- Python 3.6.x
>>>>>>> feature/docker_compose
- InfluxDB v1.8.x
- Yarn 1.7+
- node

### [Getting started](#getting-started)

<<<<<<< HEAD
A docker-compose environment is available. You need to replace the following line:
```
"proxy": "http://localhost:8080",
```
with
```
"proxy": "http://python:8080",
```
when running with docker. Start the docker containers with
=======
A docker-compose environment is available. 
>>>>>>> feature/docker_compose
```
docker-compose up
```
If you need to rerun pip, you can rebuild the python service container
```
docker-compose build python
```


Create a virtual environment:
```
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r ./requirements/test.txt
```
Ensure InfluxDb is running and run the Python server:
```
PROFILE=local python -m server
```
influx v1 shell


The GUI can be started with:
```
cd client
yarn start
```
To create a GUI production build to be deployed:
```
yarn build
```
To analyze the bundle:
```
yarn analyze
```

### [API](#api)

See the [Wiki](https://github.com/OpenConext/OpenConext-statistics/wiki) for the API documentation.

### [Testing](#testing)

To run all Python tests:
```
flake8 server
pytest server
```
To generate coverage reports:
```
pytest --cov=server --cov-report html:htmlcov server/test
open htmlcov/index.html
```
To run all JavaScript tests:
```
cd client
yarn test
```
Or to run all the tests and do not watch:
```
cd client
CI=true yarn test
```
