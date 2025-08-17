package com.dran.web_social.config;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.dran.web_social.utils.TokenType;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtConfig {
    @Value("${jwt.access.secret}")
    private String accessSecret;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    @Value("${jwt.access.expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    @SuppressWarnings("deprecation")
    public String generateToken(String username, Set<String> roles, TokenType type) {
        Map<String, Object> claims = new HashMap<>();
        if (type == TokenType.ACCESS_TOKEN) {
            claims.put("roles", roles);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()
                        + (type == TokenType.ACCESS_TOKEN ? accessExpiration : refreshExpiration)))
                .signWith(
                        Keys.hmacShaKeyFor((type == TokenType.ACCESS_TOKEN ? accessSecret : refreshSecret).getBytes()),
                        SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(TokenType typeToken, String token) {
        Claims claims = getAllClaimsFromToken(typeToken, token);

        return claims.getSubject();
    }

    public Set<String> getRolesFromToken(TokenType typeToken, String token) {
        Claims claims = getAllClaimsFromToken(typeToken, token);
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        return roles != null ? new HashSet<>(roles) : new HashSet<>();
    }

    public boolean validateToken(TokenType typeToken, String token, String username) {
        String extractedUsername = getUsernameFromToken(typeToken, token);
        return extractedUsername != null && extractedUsername.equals(username)
                && !isAccessTokenExpired(typeToken, token);
    }

    @SuppressWarnings("deprecation")
    private Claims getAllClaimsFromToken(TokenType typeToken, String token) {
        String secret = getSecret(typeToken);
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isAccessTokenExpired(TokenType typeToken, String token) {
        Date expirationDate = getAllClaimsFromToken(typeToken, token).getExpiration();
        return expirationDate.before(new Date());
    }

    private String getSecret(TokenType tokenType) {
        return tokenType == TokenType.ACCESS_TOKEN ? accessSecret : refreshSecret;
    }

    @SuppressWarnings("unused")
    private long getExpiration(TokenType tokenType) {
        return tokenType == TokenType.ACCESS_TOKEN ? accessExpiration : refreshExpiration;
    }

}
