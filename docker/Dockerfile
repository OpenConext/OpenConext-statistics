FROM python:3.6-slim-buster
WORKDIR /app
COPY requirements ./requirements
RUN pip install -r ./requirements/test.txt
COPY --from=node:20-slim /usr/local/bin /usr/local/bin
COPY --from=node:20-slim /opt /opt
COPY --from=node:20-slim /usr/local/lib/node_modules /usr/local/lib/node_modules


