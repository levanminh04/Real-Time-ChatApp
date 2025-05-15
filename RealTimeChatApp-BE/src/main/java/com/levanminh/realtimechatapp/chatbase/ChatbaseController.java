package com.levanminh.realtimechatapp.chatbase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;

@RestController
@RequestMapping("/api/v1/chatbase")
@RequiredArgsConstructor
public class ChatbaseController {

    private static final String SECRET_KEY = "66j1xny3z901v2ytwnm0w024yyk7cqhk"; // Secret key từ Chatbase

    @PostMapping("/verification")
    public ResponseEntity<VerificationResponse> getVerificationHmac(Authentication authentication, 
                                                              @RequestBody VerificationRequest request) {
        // Lấy user ID từ xác thực
        String userId = authentication.getName();
        
        // Kiểm tra nếu userId trong request khớp với userId của người dùng đã xác thực
        if (!userId.equals(request.getUserId())) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            // Tạo HMAC từ userId và secret key
            String hmac = createHmacSha256(userId, SECRET_KEY);
            return ResponseEntity.ok(new VerificationResponse(hmac));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private static String createHmacSha256(String data, String key) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        // Tạo một đối tượng Mac với thuật toán HmacSHA256
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        
        // Tính toán HMAC
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Chuyển đổi bytes thành chuỗi hex
        return toHexString(hmacBytes);
    }
    
    private static String toHexString(byte[] bytes) {
        try (Formatter formatter = new Formatter()) {
            for (byte b : bytes) {
                formatter.format("%02x", b);
            }
            return formatter.toString();
        }
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class VerificationRequest {
        private String userId;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class VerificationResponse {
        private String hmac;
    }
}
