#!/bin/bash

IMAGE_NAME=hitchedjukebox.server
CONTAINER_NAME=server.dev

docker stop ${CONTAINER_NAME}  
docker rm ${CONTAINER_NAME}

docker run \
    -d \
    -p 8085:8085 \
    --name ${CONTAINER_NAME} \
    -e "NODE_ENV=development" \
    -v `pwd`/server:/usr/code/server \
    ${IMAGE_NAME}:dev \
    /usr/code/dev_entry_point.sh 