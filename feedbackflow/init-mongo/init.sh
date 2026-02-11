#!/bin/bash
echo "Importing feedback.json into MongoDB..."
mongoimport --username root --password rootpassword --authenticationDatabase admin --db feedback --collection feedback --file /docker-entrypoint-initdb.d/feedback.json --jsonArray