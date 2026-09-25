.PHONY: help up down restart logs shell test migrate seed

help:
	@echo "Mavjud buyruqlar:"
	@echo "  make up      - Barcha konteynerlarni ishga tushirish (background)"
	@echo "  make down    - Konteynerlarni to'xtatish va o'chirish"
	@echo "  make restart - Konteynerlarni qayta ishga tushirish"
	@echo "  make logs    - Barcha xizmatlar loglarini ko'rish"
	@echo "  make shell   - Backend konteyneriga kirish (bash)"
	@echo "  make migrate - Database migratsiyalarini ishga tushirish (Alembic)"
	@echo "  make seed    - Boshlang'ich ma'lumotlarni kiritish"
	@echo "  make test    - Testlarni ishga tushirish"

up:
	docker-compose -f docker-compose.yml up -d

down:
	docker-compose -f docker-compose.yml down

restart:
	docker-compose -f docker-compose.yml restart

logs:
	docker-compose -f docker-compose.yml logs -f

shell:
	docker exec -it qishloqmed_backend /bin/bash

migrate:
	docker exec -it qishloqmed_backend alembic upgrade head

seed:
	docker exec -it qishloqmed_db psql -U qishloqmed -d qishloqmed_db -f /docker-entrypoint-initdb.d/001_roles.sql
	docker exec -it qishloqmed_db psql -U qishloqmed -d qishloqmed_db -f /docker-entrypoint-initdb.d/002_symptoms.sql
	docker exec -it qishloqmed_db psql -U qishloqmed -d qishloqmed_db -f /docker-entrypoint-initdb.d/003_districts_villages.sql

test:
	docker exec -it qishloqmed_backend pytest
