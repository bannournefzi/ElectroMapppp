package org.example.electromap1.utill;

public class GeoUtils {

    /**
     * Calcule la distance entre deux points géographiques en kilomètres
     * en utilisant la formule de Haversine.
     *
     * @param lat1 Latitude du point 1
     * @param lon1 Longitude du point 1
     * @param lat2 Latitude du point 2
     * @param lon2 Longitude du point 2
     * @return Distance en kilomètres
     */
    public static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Rayon moyen de la Terre en km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance en kilomètres
    }

    /**
     * Vérifie si une station est "proche" du segment entre deux points.
     * Peut être utilisé pour filtrer les stations proches d’un itinéraire.
     *
     * @param latStation latitude de la station
     * @param lngStation longitude de la station
     * @param lat1 latitude du point de départ
     * @param lng1 longitude du point de départ
     * @param lat2 latitude de destination
     * @param lng2 longitude de destination
     * @param toleranceKm tolérance max de distance par rapport à la ligne (en km)
     * @return true si la station est proche de la ligne
     */
    public static boolean isNearPath(
            double latStation, double lngStation,
            double lat1, double lng1,
            double lat2, double lng2,
            double toleranceKm
    ) {
        // Simple approximation : on vérifie si la station est dans la "zone tampon" entre les deux points
        double d1 = distanceKm(lat1, lng1, latStation, lngStation);
        double d2 = distanceKm(lat2, lng2, latStation, lngStation);
        double direct = distanceKm(lat1, lng1, lat2, lng2);

        return (d1 + d2) <= (direct + toleranceKm);
    }
}
