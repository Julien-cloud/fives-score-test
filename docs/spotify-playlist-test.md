# Configuration Spotify — environnement de test

Les secrets ne doivent jamais être ajoutés dans `supabase-config.js`, `app.js` ou GitHub.

Dans le projet Vercel `fives-score-test`, ajouter ces variables uniquement pour **Production** (la branche `test` est suivie comme déploiement Production) :

- `SPOTIFY_CLIENT_ID` : l’identifiant public de l’application Spotify.
- `SPOTIFY_CLIENT_SECRET` : le secret créé dans Spotify Developer Dashboard.
- `SPOTIFY_REDIRECT_URI` : `https://fives-score-test.vercel.app/api/spotify/callback`
- `SUPABASE_URL` : URL du projet Supabase de test.
- `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role` du projet Supabase de test. Ne jamais l’exposer côté navigateur.
- `FIVES_ADMIN_EMAILS` : les e-mails admin séparés par des virgules.

La Redirect URI Spotify doit correspondre exactement à `SPOTIFY_REDIRECT_URI`.

Après toute modification de variable dans Vercel, lancer un nouveau déploiement de la branche `test`.