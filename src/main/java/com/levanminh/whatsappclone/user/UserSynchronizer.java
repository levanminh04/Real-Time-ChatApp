package com.levanminh.whatsappclone.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service  // Lớp này thực hiện logic xử lý dữ liệu từ Keycloak và đồng bộ với database =>nên sử dụng @Service
@Slf4j
@RequiredArgsConstructor
// Đồng bộ dữ liệu giữa keycloak và database
public class UserSynchronizer {

    private final UserRepository userRepository;

    private final UserConverter userConverter;

    public void synchronizeWithIDP(Jwt token){
        log.info("Synchronizing user with IDP");
        getUserEmail(token).ifPresent(email -> {
            log.info("Synchronizing user having email: " + email);
            Optional<User> optionalUser = userRepository.findByEmail(email);
            User user = userConverter.fromTokenAttributes(token.getClaims());
            optionalUser.ifPresent(value -> user.setId(value.getId()));
            userRepository.save(user);
        });
    }

    private Optional<String> getUserEmail(Jwt token){
        Map<String, Object> attributes = token.getClaims();
        if(attributes.containsKey("email")){
            return Optional.of(attributes.get("email").toString());
        }
        return Optional.empty();
    }
}
