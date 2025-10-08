package org.example.electromap1.user;

import java.util.stream.Collectors;

public class UserMapper {
    public static UserProfileDTO toDTO(User u) {
        return UserProfileDTO.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .dateOfBirth(u.getDateOfBirth())
                .carType(u.getCarType() != null ? u.getCarType().name() : null)
                .accountLocked(u.isAccountLocked())
                .enabled(u.isEnabled())
                .roles(u.getRoles() != null
                        ? u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList())
                        : null)
                .creationDate(u.getCreationDate())
                .lastModifiedDate(u.getLastModifiedDate())
                .build();
    }
}