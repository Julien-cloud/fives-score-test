# Supabase : schéma et migrations

## Organisation

- `schema.sql` initialise une **nouvelle base vide**.
- `migrations/` contient les évolutions successives de la structure et des politiques.

Les migrations sont numérotées pour rendre leur ordre lisible. Elles correspondent à l’historique fonctionnel du projet (buts, photos, ligues, matchs à venir, pronostics, Mode Match, etc.).

## Règles essentielles

1. Sauvegardez ou exportez les données avant une intervention sur un projet existant.
2. N’exécutez jamais `schema.sql` sur une base déjà utilisée : il sert uniquement à l’initialisation.
3. Sur une base existante, n’exécutez que les migrations manquantes, dans l’ordre numérique.
4. Vérifiez le contenu SQL et le projet Supabase sélectionné avant d’exécuter un script.
5. Testez d’abord sur l’instance de test.
6. Ne stockez jamais une clé `service_role` dans le code front-end.

## Catalogue des migrations

| Fichier | Objet |
| --- | --- |
| `001-atonprime.sql` | Passes, état blessé et Mode mystère partagé |
| `002-avatar-storage.sql` | Bucket et règles des photos joueurs |
| `003-data-api-grants.sql` | Droits Data API explicites |
| `004-fut-cards.sql` | Cartes FUT joueurs |
| `005-goals.sql` | Buts par participation |
| `006-leagues.sql` | Ligues, saisons et effectifs |
| `007-match-kickoff-time.sql` | Heure de coup d’envoi |
| `008-match-predictions.sql` | Pronostics initiaux |
| `009-player-positions.sql` | Profils Milieu et Gardien |
| `010-upcoming-matches.sql` | Matchs à venir |
| `011-youtube.sql` | Lien YouTube de match |
| `012-live-match.sql` | Données du Mode Match |

Les migrations ne sont pas une commande automatique de déploiement : elles doivent être exécutées manuellement dans Supabase SQL Editor, après validation.