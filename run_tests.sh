#!/bin/bash
# Script pour lancer les tests
# Les tests nettoient automatiquement la DB avant chaque test

set -e

echo "🧪 Lancement des tests..."
docker-compose exec -T api pytest tests/ -v --cov=app --cov-report=term-missing "$@"

echo ""
echo "✅ Tests terminés!"
echo "📊 Couverture de code générée dans htmlcov/index.html"
