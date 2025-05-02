package com.dran.web_social.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Web Social API")
                        .version("1.0.0")
                        .description("API documentation for Web Social application"))
                // JWT Security
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                // OAuth2 Security
                .addSecurityItem(new SecurityRequirement().addList("OAuth2"))
                .components(new Components()
                        // JWT Schema
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT"))
                        // OAuth2 Schema
                        .addSecuritySchemes("OAuth2",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.OAUTH2)
                                        .flows(new OAuthFlows()
                                                .authorizationCode(new OAuthFlow()
                                                        .authorizationUrl("https://accounts.google.com/o/oauth2/auth")
                                                        .tokenUrl("https://oauth2.googleapis.com/token")
                                                        .scopes(new io.swagger.v3.oas.models.security.Scopes()
                                                                .addString("openid", "OpenID scope")
                                                                .addString("email", "Email scope")
                                                                .addString("profile", "Profile scope"))))));
    }
}