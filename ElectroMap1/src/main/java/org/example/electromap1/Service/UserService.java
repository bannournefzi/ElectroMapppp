package org.example.electromap1.Service;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.role.Role;
import org.example.electromap1.role.RoleRepository;
import org.example.electromap1.user.User;
import org.example.electromap1.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));
    }

    public User createUser(User user) {
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Le rôle par défaut 'ROLE_USER' est introuvable"));

        user.setRoles(List.of(defaultRole));
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));


        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable pour suppression");
        }
        userRepository.deleteById(id);
    }

    public User updateUser(Integer id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
        existingUser.setCarType(updatedUser.getCarType());
        existingUser.setAccountLocked(updatedUser.isAccountLocked());
        existingUser.setEnabled(updatedUser.isEnabled());

        if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
            existingUser.setRoles(updatedUser.getRoles());
        }

        return userRepository.save(existingUser);
    }
}