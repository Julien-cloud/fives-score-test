# Mettre FIVES LEAGUE en ligne

1. Crée un projet sur Supabase. Dans SQL Editor, exécute `supabase-schema.sql`. Le script contient les quatre administrateurs déclarés dans `admin-emails.js`.
2. Dans Authentication > URL Configuration, ajoute l'URL Vercel finale dans Site URL et Redirect URLs.
3. Dans Project Settings > API, copie **Project URL** et la clé **anon public**.
4. Mets le contenu du dossier `outputs` dans un dépôt GitHub, puis importe ce dépôt sur Vercel. Aucun réglage de build n'est nécessaire.
5. Ouvre le site publié et connecte-toi depuis Réglages avec l'une des adresses administratrices, via le lien reçu par e-mail.

Les joueurs n'ont pas besoin de compte : ils lisent les statistiques publiquement. Seules les quatre adresses administratrices peuvent modifier les joueurs et les matchs.

## Migration principale

Exécute une seule fois `supabase-migration-atonprime.sql` dans Supabase > SQL Editor. Cette migration ajoute les passes décisives, l’état blessé et le Mode mystère partagé. Elle conserve intégralement les joueurs, matchs, buts et participations existants.

## Ajouter le dépôt des photos de profil

Exécute une seule fois `supabase-migration-avatar-storage.sql` dans Supabase > SQL Editor. Cette migration crée le bucket public `player-avatars`, limite les images à 5 Mo et réserve leur envoi aux quatre comptes administrateurs.

Avant l’envoi, le navigateur recadre automatiquement la photo en 512 × 512 px, la convertit en WebP et vise un poids inférieur à 200 Ko. Un seul fichier est conservé par joueur et les anciennes images de FIVES LEAGUE sont supprimées lors de leur remplacement.

## Ajouter le suivi des buts à une base existante

Exécute une seule fois `supabase-migration-goals.sql` dans Supabase > SQL Editor. Cette migration ajoute le nombre de buts à chaque participation sans supprimer ni modifier l'historique existant.

## Ajouter les vidéos YouTube aux matchs

Exécute une seule fois `supabase-migration-youtube.sql` dans Supabase > SQL Editor. Cette migration ajoute uniquement un lien YouTube facultatif à chaque match et conserve tout l’historique existant. Les vidéos restent hébergées par YouTube : Supabase ne stocke que leur URL.

## Conserver les pronostics initiaux

Exécute une seule fois `supabase-migration-match-predictions.sql` dans Supabase > SQL Editor. Cette migration ajoute uniquement le pourcentage initial de la Team A aux matchs. La Team B est toujours le complément à 100 %. Les anciens matchs restent sans pronostic enregistré afin de ne pas fabriquer de prévision après coup.

## Ajouter les cartes FUT aux joueurs

Exécute une seule fois `supabase-migration-fut-cards.sql` dans Supabase > SQL Editor. Les cartes utilisent le bucket `player-avatars` déjà configuré. Le navigateur conserve leurs proportions, les redimensionne au maximum à 700 × 900 px et les compresse en WebP autour de 200 Ko. Une seule carte est conservée par joueur.

## Ajouter les profils Milieu et Gardien

Exécute une seule fois `supabase-migration-positions.sql` dans Supabase > SQL Editor. Cette migration élargit uniquement la liste des profils autorisés et conserve tous les joueurs existants.

Ne colle jamais la clé `service_role` dans le site ; seule la clé `anon public` doit être utilisée.
