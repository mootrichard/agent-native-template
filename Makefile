SHELL := /usr/bin/env bash

.PHONY: install dev test validate docs-lint

install:
	./scripts/install-deps.sh

dev:
	./scripts/dev.sh

test:
	./scripts/test.sh

validate:
	./scripts/validate.sh

docs-lint:
	./scripts/validate-docs.sh
