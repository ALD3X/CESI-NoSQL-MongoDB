• Requête 1 : Trouver toutes les commandes d'un client spécifique.
index sur le champ clientId

• Requête 2 : Trouver toutes les commandes passées dans un certain intervalle de dates.
index sur le champ dateCommande

• Requête 3 : Trouver toutes les commandes d'un montant supérieur à un certain seuil.
index sur le champ montant

Index composé ? clientId et dateCommande afin d'être plus performant sur des filtres simples