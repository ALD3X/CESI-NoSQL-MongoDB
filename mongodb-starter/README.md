# MongoDB Starter avec Docker (sans installation locale)

Ce projet est un **starter minimal** pour découvrir et utiliser **MongoDB**
**sans rien installer sur ta machine**, grâce à **Docker**.

---

## Prérequis

- Docker installé
- Docker Compose (inclus dans Docker Desktop)

Aucune installation de MongoDB ou mongosh sur la machine

---

## 📁 Structure du projet

.
├── docker-compose.yml
└── README.md

---

## Lancer MongoDB

Depuis la racine du projet :

docker compose up -d

MongoDB est maintenant disponible  
- Port : 27017  
- Données persistées via un volume Docker

---

## Vérifier que le conteneur tourne

docker ps

Tu dois voir le service `mongodb` actif.

---

## Accéder au Mongo Shell (mongosh)

### Sans installer mongosh localement
docker exec -it mongodb mongosh

### Avec authentification (si activée)
docker exec -it mongodb mongosh -u root -p rootpassword --authenticationDatabase admin

---

## Commandes MongoDB essentielles

Lister les bases :
show dbs

Utiliser / créer une base :
use testdb

Insérer un document :
db.users.insertOne({ name: "Alice", age: 25 })

Lire les documents :
db.users.find()

Supprimer des documents :
db.users.deleteMany({})

---

## Arrêter les conteneurs

docker compose down

Les données restent sauvegardées grâce au volume Docker.

---


