#! /usr/bin/env bash

set -e
set -x

# Let the DB start and create tables if they don't exist
python app/backend_pre_start.py

# Create initial data in DB (like admin user)
python app/initial_data.py
