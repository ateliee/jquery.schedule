.PHONY: help up down restart logs shell build install test lint lint-fix stylelint stylelint-fix npm-build

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker compose build

up: ## Start development server in background
	docker compose up -d

down: ## Stop and remove containers
	docker compose down

restart: ## Restart containers
	docker compose restart

logs: ## Follow container logs
	docker compose logs -f

shell: ## Access container shell
	docker compose run --rm app sh

install: ## Install npm dependencies
	docker compose run --rm app npm install

test: ## Run all lint tests (eslint & stylelint)
	docker compose run --rm app npm test

lint: ## Run ESLint
	docker compose run --rm app npm run lint

lint-fix: ## Fix ESLint issues
	docker compose run --rm app npm run lint:fix

stylelint: ## Run Stylelint
	docker compose run --rm app npm run stylelint

stylelint-fix: ## Fix Stylelint issues
	docker compose run --rm app npm run stylelint:fix

npm-build: ## Build distribution files (dist/)
	docker compose run --rm app npm run build
