package com.levanminh.realtimechatapp.user;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
                    .toList();   // hoặc .map(user -> userConverter.toUserResponse(user))
    }

    public List<UserResponse> searchUsersByName(Authentication authentication, String keyword){
        final String userid = authentication.getName();
        return userRepository.searchUsersByKeywordExceptSelf(keyword, userid)
                .stream()
                .map(userConverter::toUserResponse)
                .toList();  // hoặc .map(user -> userConverter.toUserResponse(user))
    }

    @Transactional
    public UserResponse updateAvatar(String userid, String avatarUrl) {
        User user = userRepository.findById(userid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatar(avatarUrl);
        User savedUser = userRepository.save(user);
        return userConverter.toUserResponse(savedUser);
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        String userId = authentication.getName();
        return userRepository.findById(userId)
                .map(userConverter::toUserResponse)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
    }
}
