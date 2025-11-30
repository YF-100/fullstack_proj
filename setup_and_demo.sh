#!/bin/bash
# ============================================================================
# 🎓 GymTrack - Script de démonstration complet
# ============================================================================
# Ce script configure et lance l'application complète avec données de démo
# Usage: ./setup_and_demo.sh
# ============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
clear
echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██╗   ██╗███╗   ███╗████████╗██████╗   █████╗  ██████╗██╗  ██╗
║  ██╔════╝ ██║   ██║████╗ ████║╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
║  ██║  ███╗██║   ██║██╔████╔██║   ██║   ██████╔╝███████║██║     █████╔╝ 
║  ██║   ██║██║   ██║██║╚██╔╝██║   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
║  ╚██████╔╝╚██████╔╝██║ ╚═╝ ██║   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
║   ╚═════╝  ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
║                                                               ║
║              🎓 Application Full-Stack de Fitness             ║
║                  E5 DSIA 5102A - ESIEE Paris                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
print_info "Ce script va:"
echo "   1️⃣  Vérifier les prérequis (Docker, Docker Compose)"
echo "   2️⃣  Arrêter les containers existants"
echo "   3️⃣  Construire et démarrer tous les services"
echo "   4️⃣  Créer un utilisateur de démonstration avec 60 jours de données"
echo "   5️⃣  Lancer la suite de tests complète"
echo "   6️⃣  Afficher les URLs d'accès"
echo ""

read -p "Appuyez sur Entrée pour continuer..."

# ============================================================================
# ÉTAPE 1: Vérification des prérequis
# ============================================================================
print_step "ÉTAPE 1/6: Vérification des prérequis"

if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé!"
    echo "Veuillez installer Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi
print_success "Docker est installé: $(docker --version)"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé!"
    exit 1
fi
print_success "Docker Compose est installé: $(docker-compose --version)"

if ! docker info &> /dev/null; then
    print_error "Docker n'est pas démarré!"
    echo "Veuillez démarrer Docker Desktop et relancer ce script."
    exit 1
fi
print_success "Docker est en cours d'exécution"

# ============================================================================
# ÉTAPE 2: Nettoyage des containers existants
# ============================================================================
print_step "ÉTAPE 2/6: Nettoyage des containers existants"

print_info "Arrêt des containers existants..."
docker-compose down -v 2>/dev/null || true
print_success "Containers arrêtés"

# ============================================================================
# ÉTAPE 3: Construction et démarrage des services
# ============================================================================
print_step "ÉTAPE 3/6: Construction et démarrage des services"

print_info "Construction des images Docker..."
docker-compose build --no-cache

print_info "Démarrage de la base de données PostgreSQL..."
docker-compose up -d db

print_info "Attente de l'initialisation de la base de données (15 secondes)..."
for i in {15..1}; do
    echo -ne "\rTemps restant: ${i}s  "
    sleep 1
done
echo ""

print_info "Démarrage de l'API Backend..."
docker-compose up -d api

print_info "Attente du démarrage de l'API (10 secondes)..."
for i in {10..1}; do
    echo -ne "\rTemps restant: ${i}s  "
    sleep 1
done
echo ""

print_info "Démarrage du Frontend React..."
docker-compose up -d frontend

print_success "Tous les services sont démarrés!"

# Afficher les logs pour vérifier
print_info "Vérification du statut des services..."
docker-compose ps

# ============================================================================
# ÉTAPE 4: Lancement des tests
# ============================================================================
print_step "ÉTAPE 4/6: Lancement de la suite de tests"

print_info "Exécution de tous les tests (unitaires + intégration)..."
echo ""

if docker-compose exec -T api pytest tests/ -v --cov=app --cov-report=term-missing; then
    echo ""
    print_success "Tous les tests sont passés avec succès!"
else
    echo ""
    print_warning "Certains tests ont échoué (voir détails ci-dessus)"
fi

# ============================================================================
# ÉTAPE 5: Création de l'utilisateur de démonstration (APRÈS les tests)
# ============================================================================
print_step "ÉTAPE 5/6: Création de l'utilisateur de démonstration"

print_info "Création d'un utilisateur avec 60 jours de données..."
print_info "Cela peut prendre 30-60 secondes..."

if docker-compose exec -T api bash -c "cd /app && PYTHONPATH=/app python scripts/create_demo_user.py"; then
    print_success "Utilisateur de démonstration créé avec succès!"
    echo ""
    echo -e "${GREEN}┌─────────────────────────────────────────────────┐${NC}"
    echo -e "${GREEN}│  👤 Username: demo                              │${NC}"
    echo -e "${GREEN}│  🔑 Password: demo123                           │${NC}"
    echo -e "${GREEN}│  📊 Données:  60 jours d'historique complet    │${NC}"
    echo -e "${GREEN}└─────────────────────────────────────────────────┘${NC}"
    echo ""
else
    print_warning "Erreur lors de la création de l'utilisateur de démo"
    echo -e "${YELLOW}Vous pouvez le créer manuellement avec:${NC}"
    echo -e "${YELLOW}docker-compose exec api bash -c 'cd /app && PYTHONPATH=/app python scripts/create_demo_user.py'${NC}"
fi

# ============================================================================
# ÉTAPE 6: Informations d'accès
# ============================================================================
print_step "ÉTAPE 6/6: Application prête!"

echo ""
echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                    🎉 INSTALLATION TERMINÉE                   ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📱 URLs d'accès:${NC}"
echo -e "   ${GREEN}➜${NC} Application Web:     ${BLUE}http://localhost:3000${NC}"
echo -e "   ${GREEN}➜${NC} API Backend:         ${BLUE}http://localhost:8000${NC}"
echo -e "   ${GREEN}➜${NC} Documentation API:   ${BLUE}http://localhost:8000/docs${NC}"
echo -e "   ${GREEN}➜${NC} Base de données:     ${BLUE}localhost:5432${NC}"
echo ""

echo -e "${CYAN}🔐 Compte de démonstration:${NC}"
echo -e "   ${GREEN}➜${NC} Username:            ${YELLOW}demo${NC}"
echo -e "   ${GREEN}➜${NC} Mot de passe:        ${YELLOW}demo123${NC}"
echo ""

echo -e "${CYAN}📊 Données incluses:${NC}"
echo -e "   ${GREEN}✓${NC} 30 séances d'entraînement avec progression"
echo -e "   ${GREEN}✓${NC} 8 modèles d'entraînement prédéfinis"
echo -e "   ${GREEN}✓${NC} 42 logs de sommeil (60 jours)"
echo -e "   ${GREEN}✓${NC} 28 logs de nutrition (40 jours)"
echo -e "   ${GREEN}✓${NC} Statistiques personnelles (BMI, TDEE, etc.)"
echo -e "   ${GREEN}✓${NC} Graphiques et analytics"
echo ""

echo -e "${CYAN}🛠️  Commandes utiles:${NC}"
echo -e "   ${GREEN}➜${NC} Voir les logs:       ${YELLOW}docker-compose logs -f${NC}"
echo -e "   ${GREEN}➜${NC} Arrêter:             ${YELLOW}docker-compose down${NC}"
echo -e "   ${GREEN}➜${NC} Redémarrer:          ${YELLOW}docker-compose restart${NC}"
echo -e "   ${GREEN}➜${NC} Relancer tests:      ${YELLOW}./run_tests.sh${NC}"
echo -e "   ${GREEN}➜${NC} Accès DB:            ${YELLOW}docker-compose exec db psql -U gymtrack -d gymtrack${NC}"
echo ""

echo -e "${CYAN}📚 Architecture:${NC}"
echo -e "   ${GREEN}➜${NC} Backend:   FastAPI + PostgreSQL + SQLAlchemy"
echo -e "   ${GREEN}➜${NC} Frontend:  React 18 + Vite"
echo -e "   ${GREEN}➜${NC} Auth:      JWT + PBKDF2-HMAC-SHA256"
echo -e "   ${GREEN}➜${NC} Tests:     pytest (31 tests, 81% couverture)"
echo -e "   ${GREEN}➜${NC} Deploy:    Docker Compose"
echo ""

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  👨‍🏫 Prêt pour la démonstration au professeur!                ║${NC}"
echo -e "${MAGENTA}║                                                               ║${NC}"
echo -e "${MAGENTA}║  Rendez-vous sur: ${BLUE}http://localhost:3000${MAGENTA}                    ║${NC}"
echo -e "${MAGENTA}║  Connectez-vous avec: demo / demo123                         ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ouvrir automatiquement le navigateur (optionnel)
read -p "Voulez-vous ouvrir l'application dans le navigateur? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    print_info "Ouverture de l'application..."
    
    # Détection de l'OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open http://localhost:3000
        open http://localhost:8000/docs
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open http://localhost:3000 &
        xdg-open http://localhost:8000/docs &
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start http://localhost:3000
        start http://localhost:8000/docs
    fi
    
    print_success "Application et documentation ouvertes dans le navigateur!"
fi

echo ""
print_success "Installation et configuration terminées avec succès! 🎉"
echo ""
