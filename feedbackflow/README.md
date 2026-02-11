# TP NoSQL – FeedbackFlow

## Objectif du TP

Ce TP a pour objectif de vous faire comprendre et pratiquer concrètement le NoSQL à travers la réalisation d’une API backend simple mais réaliste, basée sur MongoDB et Node.js / Express.

À l’issue du TP, vous devrez être capables de justifier l’utilisation du NoSQL, de manipuler des documents MongoDB réels, et de comparer cette approche avec une base de données relationnelle classique.

---

## Contexte du projet

Vous développez FeedbackFlow, un système de collecte et de gestion de feedbacks utilisateurs pour un produit numérique (site web, application, service).

Les utilisateurs peuvent :
- envoyer des feedbacks (bug, idée, question, avis)
- enrichir leurs feedbacks avec des informations variables
- consulter les feedbacks existants
- interagir avec eux (commentaires, votes, changement de statut)

Il n’y a pas d’authentification complexe.
Un userId simulé (chaîne de caractères) suffit pour représenter un utilisateur.

---

## Technologies imposées

- MongoDB
- Node.js
- Express.js
- Docker (pour MongoDB)

Contraintes :
- aucune ressource payante
- pas de géolocalisation
- backend prioritaire (frontend minimal ou optionnel)

---

## Contraintes du projet

- Projet volontairement de petite envergure
- Réalisable en une journée maximum
- Réalisé en solo
- Accent mis sur la modélisation NoSQL et le CRUD

---

## Fonctionnalités attendues

L’API devra permettre de :

1. Créer un feedback utilisateur
2. Lister les feedbacks avec filtres
3. Consulter un feedback en détail
4. Modifier certaines informations d’un feedback
5. Supprimer un feedback
6. Ajouter et manipuler des données imbriquées :
   - commentaires
   - tags
   - votes
   - historique d’actions

Toutes les fonctionnalités devront être implémentées en utilisant MongoDB de manière pertinente.

---

## Problématique NoSQL

Les feedbacks ne possèdent pas tous la même structure :
- certains contiennent uniquement un message
- d’autres incluent des métadonnées techniques
- certains possèdent des commentaires ou un historique détaillé

Le modèle de données doit donc :
- accepter des documents hétérogènes
- évoluer sans migration complexe
- permettre des mises à jour partielles

---

## Apprentissages attendus

À la fin du TP, vous devrez être capables de :

- expliquer quand et pourquoi utiliser une base NoSQL
- concevoir un modèle orienté document
- manipuler des sous-documents et des tableaux imbriqués
- implémenter un CRUD complet avec MongoDB
- mettre en place une logique métier simple
- comparer implicitement NoSQL et SQL

---

## Déroulé pédagogique

Le TP sera réalisé étape par étape :

1. Analyse du besoin
2. Conception du modèle NoSQL
3. Mise en place de MongoDB avec Docker
4. Initialisation du projet Node.js / Express
5. Création de l’API REST
6. Implémentation du CRUD
7. Ajout de fonctionnalités illustrant la flexibilité du NoSQL
8. Analyse critique NoSQL vs SQL

---

## Rendu attendu

Un dépôt contenant :
- le code de l’API
- ce fichier README
- une API testable via Postman ou Insomnia
- une présentation de 10mn de votre proposition

Le projet doit fonctionner et le modèle de données doit être justifié.