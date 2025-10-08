package org.example.electromap1.user;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class UserProfileDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String dateOfBirth;
    private String carType;
    private boolean accountLocked;
    private boolean enabled;
    private List<String> roles;
    private LocalDateTime creationDate;
    private LocalDateTime lastModifiedDate;
}
