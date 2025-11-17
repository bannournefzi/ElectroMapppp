⚡ ElectroMap – Plateforme de Gestion des Bornes de Recharge Électrique

ElectroMap est une plateforme moderne et complète permettant de gérer et visualiser des bornes de recharge pour véhicules électriques.
Elle offre une interface intuitive pour les utilisateurs (recherche de bornes, affichage sur carte, réservation, itinéraires optimisés) ainsi qu’un tableau de bord administrateur pour gérer les stations.

🚀 Fonctionnalités principales
👤 Utilisateur

Affichage des stations de recharge sur une carte (Leaflet + OSM)

Affichage de la distance réelle entre l’utilisateur et les stations

Filtrage dynamique par :

Disponibilité

Type de charge

Type de connecteur (Type2, CCS…)

Affichage des 2 stations les plus proches

Planification de trajet intelligente :

Entrée : départ, destination, charge actuelle

Génération d’un itinéraire optimisé via Leaflet Routing Machine

Suggestion automatique de la meilleure station où s’arrêter

Réservation d’une station avec calcul automatique de :

Temps de charge estimé

Indisponibilité de la borne pendant la recharge

Tableau de bord utilisateur complet avec :

Statistiques

Historique des trajets

Réservations

🛠️ Admin

CRUD complet des stations :

Nom, adresse, puissance, prix, connecteur, statut

Activation/désactivation à distance :

Disponibilité

État de fonctionnement (ON/OFF)

Gestion dynamique de la carte admin

Table d’administration moderne avec filtres, recherche, pagination

Fenêtres modales pour :

Ajouter

Modifier

Supprimer

Voir détails

🧩 Architecture
⚙️ Backend – Spring Boot

REST APIs

JPA / Hibernate

PostgreSQL

Services :

ChargingStationService

ReservationStationService

TrajetPlanifieService

Gestion du statut de station en temps réel

Calcul automatique du temps de charge

WebSocket (notifications utilisateur)

Sécurité (JWT / Keycloak)

💻 Frontend – Angular 16

Angular Material

Leaflet + Leaflet Routing Machine

Modales (MatDialog)

Services HTTP structurés

Components :

ChargingStationListComponent

MapComponent

ReservationDialogComponent

UserComponent (dashboard)
