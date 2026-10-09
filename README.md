# Fives League

Fives League est une application web légère pour organiser des matchs de five entre amis : joueurs, ligues, saisons, compositions, statistiques, classement et suivi en direct.

Le projet est un site statique HTML/CSS/JavaScript, hébergé sur Vercel, avec Supabase pour les données, l’authentification des administrateurs et le stockage des médias.

## Accès

| Environnement | URL | Branche Git |
| --- | --- | --- |
| Production | https://fives-score.vercel.app | `main` |
| Test | https://fives-score-test.vercel.app | `test` |

> Travaillez et validez les évolutions sur **test** avant de les reporter vers la production.

## Fonctionnalités

- Gestion de plusieurs ligues, saisons et effectifs ;
- Création de matchs à venir ou terminés ;
- Composition d’équipes avec pronostic d’équilibre ;
- Mode Match : score en direct, chronomètre, buts, passes, fautes et pénalty MLS ;
- Statistiques joueurs, classement, homme du match et historique ;
- Fiches joueurs, avatars, postes et cartes FUT ;
- Accès public en lecture et actions réservées aux administrateurs autorisés.

## Démarrage rapide

1. Clonez le dépôt concerné.
2. Vérifiez que `supabase-config.js` contient l’URL et la **publishable key** du projet Supabase de l’environnement visé.
3. Servez le dossier avec un serveur web local (ne pas ouvrir `index.html` directement si le navigateur bloque les requêtes réseau).
4. Ouvrez le site, puis utilisez une adresse administratrice autorisée pour les modifications.

Aucune étape de compilation n’est nécessaire : Vercel publie directement les fichiers statiques.

## Structure du dépôt

```text
.
├── index.html                 # Point d’entrée de l’application
├── app.js                     # Logique front-end
├── *.css                      # Styles par fonctionnalité
├── supabase-config.js         # Configuration publique de l’environnement
├── admin-emails.js            # Adresses autorisées côté interface
├── cgu.html / rgpd.html       # Pages légales
├── docs/                      # Documentation de maintenance et déploiement
└── supabase/
    ├── schema.sql             # Installation neuve uniquement
    └── migrations/            # Évolutions SQL numérotées
```

Les fichiers chargés par le navigateur restent volontairement à la racine. Les déplacer exigerait de modifier les chemins présents dans `index.html` et dans les pages légales.

## Documentation

- [Architecture et fonctionnement](docs/architecture.md)
- [Déploiement et exploitation](docs/deployment.md)
- [Guide Supabase et migrations](supabase/README.md)

## Règles de sécurité

- Ne mettez jamais une clé `service_role` dans le dépôt ni dans le navigateur.
- La clé publishable est conçue pour le client, mais la protection réelle doit rester assurée par les politiques RLS Supabase.
- Les adresses de `admin-emails.js` améliorent l’expérience d’interface ; les droits sensibles doivent toujours être vérifiés aussi côté Supabase.

## Contribution

1. Faites les modifications dans le dépôt **test** sur la branche `test`.
2. Vérifiez les parcours publics, admin et Mode Match sur https://fives-score-test.vercel.app.
3. Contrôlez la configuration Supabase de test avant toute migration.
4. Reportez uniquement les changements validés dans le dépôt de production, sur `main`.
