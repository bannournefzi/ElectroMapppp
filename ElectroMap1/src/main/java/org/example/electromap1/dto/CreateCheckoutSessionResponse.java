package org.example.electromap1.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateCheckoutSessionResponse {
    private String sessionId;
    private String url;
}
