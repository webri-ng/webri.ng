#####################################################################
#  Copyright (c) 2020, webri.ng.
#  This program is free software; you can redistribute it and/or modify it
#  under the terms of the GNU General Public License as published by the
#  Free Software Foundation; either version 3 of the License, or
#  (at your option) any later version.
#
#  Authors:
#     Anthony <ajxs [at] panoptic.online>
#####################################################################

.POSIX:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

.PHONY: mock-services mock-services-down database

DOCKER_COMPOSE_FILE := docker-compose.yml
DOCKER_PROJECT_NAME := webri_ng

mock-services:
	docker compose --project-name "${DOCKER_PROJECT_NAME}" --file "${DOCKER_COMPOSE_FILE}" up

mock-services-down:
	docker compose --project-name "${DOCKER_PROJECT_NAME}" --file "${DOCKER_COMPOSE_FILE}" down

database:
	./db/setup
