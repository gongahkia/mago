all:local

build:
	@echo "Building Docker Image..."
	@docker-compose -f docker/docker-compose.yml up --build

local:
	@echo "Running Local Build..."
	@npm run dev