# Déploiement et exploitation

## Environnements

| Usage | Dépôt / branche | Vercel | Supabase |
| --- | --- | --- | --- |
| Production | `fives-score` / `main` | `fives-score.vercel.app` | projet de production |
| Test | `fives-score-test` / `test` | `fives-score-test.vercel.app` | projet de test |

Chaque environnement doit conserver son propre `supabase-config.js`. Ne copiez jamais par inadvertance la configuration de production dans le dépôt de test, ou inversement.

## Publier une évolution

1. Implémentez la modification dans le dépôt de test.
2. Vérifiez le site publié : affichage public, connexion administrateur, création/édition d’un match, Mode Match et fiche joueur selon la portée du changement.
3. Committez et poussez la branche `test` : Vercel publie le site de test.
4. Une fois validée, reportez la même évolution dans le dépôt de production, sans écraser son `supabase-config.js`.
5. Committez et poussez `main`, puis vérifiez https://fives-score.vercel.app.

## Configuration Supabase

Dans Supabase, configurez l’URL du site et les URLs de redirection du lien magique pour **chaque projet** :

- production : `https://fives-score.vercel.app`
- test : `https://fives-score-test.vercel.app`

Le lien magique doit rediriger vers l’environnement depuis lequel la connexion est demandée. Si le lien de test ouvre la production, contrôlez d’abord les Redirect URLs du projet Supabase de test et le fichier `supabase-config.js` déployé sur Vercel.

## Créer un nouvel environnement

1. Créez un projet Supabase distinct.
2. Exécutez `supabase/schema.sql` uniquement sur cette base vide.
3. Appliquez les migrations nécessaires dans `supabase/migrations/`, dans l’ordre numérique.
4. Configurez Auth > URL Configuration avec l’URL Vercel de l’environnement.
5. Ajoutez les variables de configuration publiques dans `supabase-config.js` du dépôt associé.
6. Déployez le dépôt correspondant sur Vercel.

## Contrôles après déploiement

- La page d’accueil s’ouvre sans erreur dans la console.
- La bonne instance Supabase est utilisée.
- Les visiteurs voient les statistiques attendues.
- Une adresse autorisée peut recevoir puis utiliser un lien de connexion.
- Les actions non autorisées restent bloquées par RLS.

Pour les scripts SQL et leurs précautions d’application, consultez [../supabase/README.md](../supabase/README.md).