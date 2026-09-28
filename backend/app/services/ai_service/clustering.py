"""Geospatial & Semantic Clustering (HDBSCAN/DBSCAN) into Demand Hotspots"""
from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import DBSCAN

class ClusteringService:
    """
    Groups discrete citizen grievances into localized demand hotspots
    by fusing geospatial coordinates (lat/lon in radians) and category tags.
    """

    # Earth radius in kilometers
    EARTH_RADIUS_KM: float = 6371.0
    # Cluster radius approx 5.0 km
    EPS_KM: float = 5.0
    MIN_SAMPLES: int = 2

    def cluster_requests(self, requests_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes raw requests list with keys: 'id', 'category', 'lat', 'lon', 'urgency_score'.
        Returns list of hotspot definitions and which request IDs belong to them.
        """
        if not requests_data:
            return []

        # Group by category first so water complaints don't cluster with road complaints
        category_groups: Dict[str, List[Dict[str, Any]]] = {}
        for req in requests_data:
            cat = req.get("category", "other")
            category_groups.setdefault(cat, []).append(req)

        hotspots: List[Dict[str, Any]] = []

        for category, items in category_groups.items():
            if len(items) < self.MIN_SAMPLES:
                # Singletons form their own individual mini-cluster
                for item in items:
                    hotspots.append({
                        "category": category,
                        "centroid_lat": item["lat"],
                        "centroid_lon": item["lon"],
                        "request_count": 1,
                        "avg_urgency": item.get("urgency_score", 0.5),
                        "request_ids": [item["id"]],
                        "cluster_geom": {
                            "type": "Point",
                            "coordinates": [item["lon"], item["lat"]]
                        }
                    })
                continue

            # Convert lat/lon degrees to radians for Haversine distance
            coords_deg = np.array([[item["lat"], item["lon"]] for item in items])
            coords_rad = np.radians(coords_deg)

            eps_rad = self.EPS_KM / self.EARTH_RADIUS_KM
            db = DBSCAN(eps=eps_rad, min_samples=self.MIN_SAMPLES, metric='haversine')
            labels = db.fit_predict(coords_rad)

            # Gather clusters
            cluster_map: Dict[int, List[int]] = {}
            for idx, label in enumerate(labels):
                cluster_map.setdefault(label, []).append(idx)

            for label, indices in cluster_map.items():
                cluster_items = [items[i] for i in indices]
                cluster_lats = [c["lat"] for c in cluster_items]
                cluster_lons = [c["lon"] for c in cluster_items]
                urgencies = [c.get("urgency_score", 0.5) for c in cluster_items]

                centroid_lat = float(np.mean(cluster_lats))
                centroid_lon = float(np.mean(cluster_lons))
                avg_urgency = float(np.mean(urgencies))

                # Simple bounding box / polygon representation
                min_lat, max_lat = min(cluster_lats), max(cluster_lats)
                min_lon, max_lon = min(cluster_lons), max(cluster_lons)
                
                geom = {
                    "type": "Polygon",
                    "coordinates": [[
                        [min_lon - 0.005, min_lat - 0.005],
                        [max_lon + 0.005, min_lat - 0.005],
                        [max_lon + 0.005, max_lat + 0.005],
                        [min_lon - 0.005, max_lat + 0.005],
                        [min_lon - 0.005, min_lat - 0.005]
                    ]]
                }

                hotspots.append({
                    "category": category,
                    "centroid_lat": centroid_lat,
                    "centroid_lon": centroid_lon,
                    "request_count": len(cluster_items),
                    "avg_urgency": round(avg_urgency, 3),
                    "request_ids": [c["id"] for c in cluster_items],
                    "cluster_geom": geom
                })

        return hotspots

clustering_service = ClusteringService()
