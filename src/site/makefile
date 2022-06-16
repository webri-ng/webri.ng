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

DIST_DIR := ./dist

.PHONY: clean

all:
	npm run build && \
	cp ./package.json ${DIST_DIR} && \
	cp -r ./static ${DIST_DIR} && \
	cp -r ./template ${DIST_DIR} && \
	cp -r ./api/view ${DIST_DIR}/api/view

clean:
	rm -rf ${DIST_DIR}/*

site_style:
	sassc --style=expanded ./site.scss ./static/site.css
