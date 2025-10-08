package org.example.electromap1.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ChargingType {
    STANDARD,
    FAST,
    ULTRA_FAST;
    @JsonCreator
    public static ChargingType fromString(String value) {
        return switch (value.toUpperCase()) {
            case "FAST" -> FAST;
            case "STANDARD", "NORMALE" -> STANDARD;
            case "ULTRA_FAST", "ULTRA-RAPIDE", "ULTRA" -> ULTRA_FAST;
            default -> throw new IllegalArgumentException("Invalid charging type: " + value);
        };
    }
}
