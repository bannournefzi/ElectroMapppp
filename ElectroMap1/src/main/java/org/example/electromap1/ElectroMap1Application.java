package org.example.electromap1;

import org.example.electromap1.role.Role;
import org.example.electromap1.role.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class ElectroMap1Application {

    public static void main(String[] args) {
        SpringApplication.run(ElectroMap1Application.class, args);
    }

    @Bean
    public CommandLineRunner runner(RoleRepository roleRepository) {
        return args -> {
            try {
                if (roleRepository.findByName("USER").isEmpty()) {
                    roleRepository.save(
                            Role.builder().name("USER").build()
                    );
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de l’initialisation des rôles : " + e.getMessage());
            }
        };
    }



}
