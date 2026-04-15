# Changelog

## 3.6.0 (2026-04-15)

- [FIX] PWA — autoriser la rotation paysage sur tablettes (#67)
- [CI] Keep alive plus robuste (#66)

## 3.6.0 (2026-04-15)

- fix(pwa): allow landscape orientation on Android tablets (#67)
- Refactor keep-alive workflow for smart pinging (#66)

## 3.5.2 (2026-04-15)

- [CI] Améliorer le keep-alive : route /health légère, jitter et logs de durée (#65)
- [FEAT] Ajuste keep alive cron (#64)

## 3.5.2 (2026-04-15)

- feat(backend): improve health check (#65)
- Adjust cron schedule and enhance ping retry logic (#64)

## 3.5.1 (2026-04-14)

- [CHORE] Keep-alive ping pour éviter le cold start Render (#63)

## 3.5.1 (2026-04-14)

- chore(ci): add keep-alive ping workflow to prevent Render free tier sleep (#63)

## 3.5.0 (2026-04-13)

- [FIX] Suppression d'une chanson : bypass cache SW lors du broadcast pour éviter la réapparition (#62)

## 3.5.0 (2026-04-13)

- fix(pwa): force cache bypass on SW broadcast to prevent stale data after delete (#62)

## 3.4.0 (2026-04-13)

- [FIX] WebSocket : émission REFRESH manquante sur toutes les mutations chanson et playlist (#61)

## 3.4.0 (2026-04-13)

- fix(websocket): emit REFRESH on all mutating song and playlist operations (#61)

## 3.3.0 (2026-04-13)

- [FIX] Cache SW : confirmation du sync différée à la réception des données fraîches (#60)

## 3.3.0 (2026-04-13)

- fix(pwa): confirm lastSync only after SW broadcast delivers fresh data (#60)

## 3.2.0 (2026-04-12)

- [FEAT] Mise à jour du cache à la modification de chanson ou playlist (#59)

## 3.2.0 (2026-04-12)

- [FEAT] Mise à jour du cache à la modification de chanson ou playlist (#59)

## 3.1.0 (2026-04-12)

- [FIX] Mise au propre Ci deploy (#58)
- [TECH] Maj cache à l'ajout/modification chanson ou playlist (#57)

## 3.1.0 (2026-04-12)

- fix(ci): replace illegal return with if-guard in node -e script (#58)
- [TECH] Maj cache à l'ajout/modification chanson ou playlist (#57)

## 3.0.0 (2026-04-12)

- [TECH] Trie par playliste côté front (#56)
- [TECH] Filtre playlist 100% frontend — suppression appel réseau redondant
- [TECH] Cache PWA StaleWhileRevalidate + BroadcastUpdate automatique
- [TECH] Setup base locale : Docker Compose + script seed MongoDB

## 2.2.0 (2026-04-10)

- [TECH] Ajout de monitoring (#55)
- [FEATURE] Amélioration burger menu sur tablette (#54)

## 2.1.0 (2026-04-05)

- [FEATURE] Amélioration rendu en mode mobile (#52)

## 2.0.3 (2026-04-04)

- Fix/mobile safe area and admin layout (#51)
- Navbar style mobile amélioration (#50)
- Amélioration navbar (#49)

## 2.0.0 (2026-04-04)

- Améliorations ux (#48)
- Synchronise CLAUDE.md, README et ADR avec la réalité du projet (#47)
- Migration email Nodemailer/Gmail vers Resend SDK (#46)
- Mise à jour du workflow de déploiement (#45, #44, #43, #42, #41)

## 1.1.0 (2026-03-31)

- Mise à jour des icônes PWA (#40)
- Refonte du workflow de déploiement GitHub Actions
- Ajout du versioning automatique et génération du changelog
