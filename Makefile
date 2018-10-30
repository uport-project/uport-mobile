IMAGENAME := uport-android
SHELL := /bin/bash

build-image:
	docker build -t $(IMAGENAME) .

run-build:
	docker run --rm -v $(shell pwd):/opt/app $(IMAGENAME) ./gradlew assembleDebug

run-tests:
	docker run --rm -v $(shell pwd):/opt/app $(IMAGENAME) npm run test

release-debug-apk: build-image run-tests run-build
