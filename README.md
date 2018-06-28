# OpenConext-Statistics
[![Build Status](https://travis-ci.org/OpenConext/OpenConext-statistics.svg)](https://travis-ci.org/OpenConext/OpenConext-statistics)
[![codecov.io](https://codecov.io/github/OpenConext/OpenConext-statistics/coverage.svg)](https://codecov.io/github/OpenConext/OpenConext-statistics)

This project contains the Statistics API to retrieve OpenConext login information.

### [Overview Requirements](#system-requirements)

- Python 3.6.x
- InfluxDB v1.5.x
- Yarn 1.7


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
The GUI can be started with:
```
cd client
yarn start
```
To create a GUI production build:
```
yarn build
```
Currently this issues the `The bundle size is significantly larger than recommended.` warning .
The bundle analyze confirms this:
```
yarn analyze
```
The 2.75 MB `plotly.js` dependency is the cause of this and reducing the file size is an open issue.

### [API](#api)

See the [Wiki](https://github.com/OpenConext/OpenConext-statistics/wiki) for the API documentation.

### [Testing](#testing)

To run all Python tests:
```
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
