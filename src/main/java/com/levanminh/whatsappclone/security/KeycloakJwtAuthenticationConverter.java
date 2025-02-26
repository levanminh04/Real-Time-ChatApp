package com.levanminh.whatsappclone.security;

import lombok.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;

// Hàm này trích xuất thông tin quyền (Roles) từ JWT của Keycloak và chuyển đổi chúng thành GrantedAuthority
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> { // Converter<Jwt, AbstractAuthenticationToken> chuyển đổi một đối tượng Jwt (đã được giải mã) thành một AbstractAuthenticationToken (cụ thể là JwtAuthenticationToken).
    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt source) { // Lấy JWT từ Keycloak và chuyển đổi thành một JwtAuthenticationToken (Spring Security sử dụng để xác thực người dùng).
        // trả về 1 Authentication để lưu vào security context
        return new JwtAuthenticationToken( // JwtAuthenticationToken giống với UsernamePasswordAuthenticationToken, 2  class này đều kế thừa từ AbstractAuthenticationToken và đều được dùng để đại diện cho Authentication (Xác thực) của một user, nhưng chúng có những khác biệt quan trọng trong cách sử dụng. JwtAuthenticationToken  Dành cho hệ thống API sử dụng JWT theo chuẩn OAuth2, UsernamePasswordAuthenticationToken phù hợp với xác thực bằng usernawm, password
                source,
                Stream.concat(
                new JwtGrantedAuthoritiesConverter().convert(source).stream(),
                        extractResourceRoles(source).stream())
                .collect(toSet()));
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        var resourceAccess = new HashMap<>(jwt.getClaim("resource_access"));

        var eternal = (Map<String, List<String>>) resourceAccess.get("account"); // account là tên 1 client trong keycloak

        var roles = eternal.get("roles");

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("-", "_")))
                .collect(toSet());
    }
}


