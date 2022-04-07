#!/bin/bash
docker-compose down
cd backend-common_library
yarn && yarn build
cd ..
cd frontend
yarn && yarn build
cd ..
docker-compose up --build -d
./mongo-seed/import.sh