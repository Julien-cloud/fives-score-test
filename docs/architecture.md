# Architecture

## Front-end

L’application est volontairement sans framework ni étape de build : `index.html` charge les styles et scripts directement. Cette simplicité permet un déploiement Vercel immédiat et rend les ressources faciles à inspecter.

- `index.html` : structure de la page, navigation et zones de dialogue.
- `app.js` : état de l’application, requêtes Supabase, rendu des onglets et interactions.
- `*.css` : styles organisés par zone fonctionnelle (match, composition, ligue, tableau de bord, Mode Match, etc.).
- `admin-emails.js` : liste d’adresses autorisées dans l’interface.
- `supabase-config.js` : configuration publique de l’instance Supabase active.

## Données

Supabase stocke notamment les joueurs, ligues, saisons, membres d’effectif, matchs, participations, buts, passes décisives et données de match en direct. La structure exacte et son historique d’évolution sont dans `supabase/`.

Les données sont séparées entre les projets Supabase de production et de test. Ne mélangez jamais leurs URL ou leurs clés publishables.

## Rôles

- **Visiteur** : consulte les statistiques et l’historique public.
- **Administrateur autorisé** : gère les joueurs, ligues, saisons et matchs après authentification par lien magique.

L’interface filtre les actions selon `admin-emails.js`, mais les opérations d’écriture reposent également sur les politiques Row Level Security (RLS) de Supabase.

## Déploiement

Vercel sert le dépôt comme site statique. Il n’y a pas de commande de build. Chaque dépôt possède son propre projet Vercel et son propre projet Supabase.

Pour le déroulé complet, consultez [deployment.md](deployment.md).