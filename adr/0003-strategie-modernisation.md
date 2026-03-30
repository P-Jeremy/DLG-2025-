# ADR 0003 - Stratégie de modernisation du projet

## Statut

Accepté

## Date

2026-03-30

---

## Contexte

Le projet actuel est une refonte complète d’une application développée lors de ma reconversion professionnelle.

👉 Ancien repository :
https://github.com/P-Jeremy/DLG

Cette première version, basée sur une stack MEAN, m’a permis d’apprendre les bases du développement web, mais présente aujourd’hui plusieurs limites :

* dette technique importante
* architecture peu structurée
* difficulté à faire évoluer le code
* manque de testabilité

Je souhaite reconstruire cette application en appliquant les bonnes pratiques acquises depuis.

---

## Décision

Je choisis de **reconstruire entièrement l’application from scratch**, plutôt que de faire évoluer directement l’ancien projet.

La nouvelle version repose sur :

* React + TypeScript (frontend)
* Node.js + Express + TypeScript (backend)
* une architecture hexagonale

---

## Approche

La modernisation se fait de manière **incrémentale** :

* développement par petites pull requests
* ajout progressif des fonctionnalités
* validation à chaque étape

Les fonctionnalités de l’ancien projet sont réimplémentées progressivement dans la nouvelle architecture.

---

## Raisons

* Éviter de transporter la dette technique existante
* Repartir sur une architecture propre et maîtrisée
* Appliquer des pratiques modernes (TypeScript, tests, séparation des responsabilités)
* Faciliter la maintenance et les évolutions futures

---

## Conséquences

### Avantages

* Code plus propre et structuré
* Meilleure maintenabilité
* Possibilité d’amélioration continue
* Montée en qualité progressive

---

### Inconvénients

* Temps de développement plus important
* Nécessité de réimplémenter des fonctionnalités existantes
* Risque temporaire de duplication entre les deux versions

---

## Décision finale

La modernisation du projet se fait par reconstruction progressive, en repartant d’une base technique saine, plutôt que par modification de l’existant.
