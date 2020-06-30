#####################################################################
#  Copyright (c) 2020, AJXS.
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

.PHONY: mock-services

mock-services:
	docker-compose --project-name "webri.ng" --file "docker-compose.yml" up

mock-services-down:
	docker-compose --project-name "webri.ng" --file "docker-compose.yml" down
