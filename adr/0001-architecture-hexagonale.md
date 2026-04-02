# ADR 0001 - Architecture hexagonale

## Statut

Accepté

## Date

2026-03-30

---

## Contexte

Je développe une application web moderne composée :

* d’un frontend en React + TypeScript
* d’un backend en Node.js (Express) + TypeScript

Ce projet est une refonte complète d’une application existante développée lors de ma reconversion professionnelle.

L’ancien projet, basé sur une stack MEAN, m’a permis d’acquérir les bases du développement web, mais présente aujourd’hui plusieurs limites :

* dette technique importante
* architecture peu structurée
* difficulté à faire évoluer le code

👉 Ancien repository :
https://github.com/P-Jeremy/MEAN-DLG-project

Cette nouvelle version a pour objectif de repartir sur des bases solides, en appliquant les bonnes pratiques acquises depuis :

* architecture hexagonale
* TypeScript
* séparation claire des responsabilités
* développement incrémental par petites pull requests
* tests à différents niveaux

Mon objectif est de construire une application :

* maintenable dans le temps
* testable
* indépendante des frameworks et des outils techniques
* évolutive

---

## Décision

J’adopte une **architecture hexagonale (Ports & Adapters)**.

Le code est organisé en trois couches principales :

### Domaine (Domain)

Contient :

* les modèles métier
* les règles métier
* les use cases

👉 Cette couche est indépendante de toute technologie.

---

### Application

Contient :

* les cas d’usage (use cases)
* les interfaces de ports (IRepository, IEmailService, etc.)

👉 Elle orchestre les objets de domaine. Aucune dépendance vers le framework.

---

### Infrastructure

Contient :

* l’accès à la base de données
* les implémentations concrètes (repositories)
* les services externes (email, API, etc.)

👉 Cette couche dépend des outils techniques.

---

## Règles d’architecture

* Le domaine ne dépend d’aucune autre couche

* L’application dépend du domaine

* L’infrastructure dépend du domaine (via interfaces / ports)

* Les dépendances vont toujours vers l’intérieur

* Les implémentations concrètes sont injectées (inversion de dépendance)

---

## Raisons

* Séparer clairement la logique métier de la technique
* Faciliter les tests unitaires (notamment du domaine)
* Permettre de changer facilement de technologie (DB, API, etc.)
* Réduire la dette technique

---

## Conséquences

### Avantages

* Code plus lisible et structuré
* Meilleure testabilité
* Évolutivité facilitée
* Indépendance vis-à-vis des frameworks

---

### Inconvénients

* Complexité initiale plus élevée
* Nécessite de la rigueur dans l’organisation
* Peut sembler surdimensionné pour de petites fonctionnalités

---

## Décision finale

J’adopte l’architecture hexagonale comme standard pour l’ensemble du projet.

Toute nouvelle fonctionnalité doit respecter cette organisation.
