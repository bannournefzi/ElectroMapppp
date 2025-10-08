package org.example.electromap1.config;


import com.stripe.StripeClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StripeProperties.class)
public class StripeConfig {
    @Bean
    public StripeClient stripeClient(StripeProperties props) {
        return new StripeClient(props.getSecretKey());
    }
}