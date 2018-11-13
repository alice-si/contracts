#!/usr/bin/env bash

image_name=gcr.io/donations-218312/alice-contracts

docker build -t $image_name .
docker push $image_name
