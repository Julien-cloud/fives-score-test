# Mise à jour du lien vidéo en test

Le script d'envoi appelle `PUT /api/match-video` avec un en-tête
`Authorization: Bearer <jeton>` et un corps JSON contenant `matchId`
(identifiant Fives Score) et `videoId` (identifiant YouTube).

Dans le projet Vercel `fives-score-test`, configurer les variables de
l'environnement Production, associé à la branche `test`.

- `FIVES_VIDEO_TOKEN` contient le jeton réservé au script.
- `FIVES_VIDEO_LEAGUE_ID` contient l'identifiant de la ligue autorisée.
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` désignent le projet Supabase de test.

Après un nouveau déploiement, une requête sans jeton renvoie HTTP 401.
Une mise à jour réussie renvoie HTTP 200 et l'URL enregistrée.
Une fiche indisponible ou liée à une autre URL renvoie HTTP 409.
