package com.levanminh.whatsappclone.user;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final UserConverter userConverter;

    public List<UserResponse> getAllUsersExceptSelf(Authentication authentication) {
        final String userId = authentication.getName();


        return userRepository.findAllUsersExceptSelf(userId)
                    .stream()
                    .map(userConverter::toUserResponse)
                    .toList();
    }
}
