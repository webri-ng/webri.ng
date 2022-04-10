DIST_DIR := ./dist

.PHONY: clean

all:
	npm run build && \
	cp ./package.json ${DIST_DIR} && \
	cp -r ./static ${DIST_DIR}

clean:
	rm -rf ${DIST_DIR}/*
