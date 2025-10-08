package org.example.electromap1.Repository;

import org.example.electromap1.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargingStationRepo extends JpaRepository<ChargingStation, Long> {
}