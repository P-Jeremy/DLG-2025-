# ADR 0002 - Stratégie de versioning

## Statut

Accepté

## Date

2026-03-30

---

## Contexte

Je souhaite mettre en place une stratégie de versioning claire et simple pour suivre l’évolution du projet.

Le projet est développé en solo et ne propose pas (à ce stade) d’API publique consommée par des tiers.

L’utilisation stricte de Semantic Versioning (SemVer) introduit des contraintes (notamment sur les breaking changes) qui ne sont pas toujours pertinentes dans ce contexte.

Je souhaite donc une approche :

* simple à appliquer au quotidien
* cohérente dans le temps
* alignée avec l’impact réel sur l’application

---

## Décision

J’adopte une version simplifiée de Semantic Versioning :

```
MAJOR.MINOR.PATCH
```

---

## Règles de versioning

### 🔴 MAJOR

J’incrémente la version majeure lorsque un changement casse le fonctionnement réel de l’application.

Exemples :

* le frontend ne fonctionne plus sans modification
* modification du flux d’authentification
* changement impactant les cas d’usage principaux

---

### 🟡 MINOR

J’incrémente la version mineure lors de l’ajout de nouvelles fonctionnalités.

Exemples :

* ajout d’un module
* nouvelle fonctionnalité utilisateur
* nouvelle page

---

### 🟢 PATCH

J’incrémente la version de patch pour les corrections et améliorations.

Exemples :

* amélioration UI/UX
* responsive design
* corrections de bugs
* refactoring interne sans impact fonctionnel

---

## Règles importantes

* La suppression de code ou de routes non utilisées n’est pas considérée comme un breaking change
* Les refactorings internes n’impactent pas la version
* Le versioning reflète l’impact réel sur l’application, pas un contrat théorique

---

## Raisons

* Réduire la complexité liée au versioning
* Garder une logique simple et rapide à appliquer
* Adapter les règles à un projet solo
* Rester cohérent avec l’évolution réelle du produit

---

## Conséquences

### Avantages

* Versioning simple et compréhensible
* Moins de charge mentale
* Meilleure fluidité dans les releases

---

### Inconvénients

* Non conforme strictement à SemVer
* Moins adapté si l’API devient publique

---

## Évolution future

Si le projet évolue vers :

* une API publique
* des consommateurs externes

Alors une adoption stricte de Semantic Versioning sera envisagée.

---

## Décision finale

Cette stratégie est adoptée à partir de la version :

```
v1.0.0
```
