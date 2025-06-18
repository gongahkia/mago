all:local

build:
	@clear && echo "Building Docker Image..."
	@docker-compose -f docker/docker-compose.yml up --build

local:
	@clear && echo "Running Local Build..."
	@npm run dev