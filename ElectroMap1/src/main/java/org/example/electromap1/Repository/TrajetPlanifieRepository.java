package org.example.electromap1.Repository;

import org.example.electromap1.entity.TrajetPlanifie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrajetPlanifieRepository extends JpaRepository<TrajetPlanifie, Long> {
}
