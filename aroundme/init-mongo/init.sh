#!/bin/bash
echo "Importing places.json into MongoDB..."
mongoimport --username root --password rootpassword --authenticationDatabase admin --db places --collection places --file /docker-entrypoint-initdb.d/places_paris.json --jsonArray