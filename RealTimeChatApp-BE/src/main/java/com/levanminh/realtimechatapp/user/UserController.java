package com.levanminh.realtimechatapp.user;


import com.levanminh.realtimechatapp.cloudinary.CloudinaryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User")
@SecurityRequirement(name = "keycloak")
public class UserController {
    private final UserService userService;

    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsersExceptSelf(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllUsersExceptSelf(authentication));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }


    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> SearchUsersByKeywordExceptSelf(Authentication authentication, @RequestParam(name = "keyword") String keyword){

        return ResponseEntity.ok(userService.searchUsersByName(authentication, keyword));
    }
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(  // @RequestParam("file") không có nghĩa là dữ liệu được gửi qua query string (như ?file=...), mà nó ánh xạ một field trong phần body multipart/form-data.
                                                              @RequestParam("file")MultipartFile file,
                                                              Authentication authentication
            ){
        if(file == null || file.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
        }
        if(!file.getContentType().startsWith("image/")){
            return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
        }

        try{
            String userid = authentication.getName();
            String avatarUrl = cloudinaryService.uploadImage(file).get("url").toString();
            UserResponse updatedUser = userService.updateAvatar(userid, avatarUrl);
            return ResponseEntity.ok(updatedUser);
        }catch(IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload avatar: " + e.getMessage()));
        }

    }
}


