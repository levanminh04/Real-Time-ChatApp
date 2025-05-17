package com.levanminh.realtimechatapp.message;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/messages")
@Tag(name = "Message")
@SecurityRequirement(name = "keycloak")
public class MessageController {

    private final MessageService messageService;

    // SAU CÓ THỜI GIAN THÌ SỬA LẠI CHO CHUẨN BEST PRATICE

    @PostMapping // Tạo mới dữ liệu
    @ResponseStatus(HttpStatus.CREATED)  // trả về 201 CREATED nếu save success
    public void saveMessage(@RequestBody MessageRequest messageRequest) {
        messageService.saveMessage(messageRequest);
    }

    @PostMapping(value = "/media", consumes = "multipart/form-data") // @RequestBody không hỗ trợ multipart/form-data mặc định vì vậy cần có consumes = "multipart/form-data" để Spring cần biết request này có chứa multipart/form-data, nhưng ở đây có thể bỏ consumes vì có sử dụng RequestPart
    @ResponseStatus(HttpStatus.CREATED)  // Nếu bỏ đi: Spring sẽ mặc định trả về 200 OK thay vì 201 CREATED.
    public void uploadMediaMessage(
            @RequestParam("chat-id") String chatId, // truyền qua query paramater (@RequestParam), còn của getAllMessages thì gọi là URI path paramater (@PathVariable)
            @Parameter(description = "File media cần upload")
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        messageService.uploadMediaMessage(chatId, file, authentication);
    }

    @PatchMapping // Cập nhật một phần tài nguyên hiện có
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void setMessageToSeen(@RequestParam("chat-id") String chatId,
                                 Authentication authentication) {//
        messageService.setMessageStateToSeen(chatId, authentication);
    }
//    @RequestParam được sử dụng để ánh xạ các tham số từ yêu cầu HTTP vào các tham số của phương thức controller. cách dữ liệu được truyền (qua query string hay body) phụ thuộc vào Content-Type của yêu cầu và loại dữ liệu được gửi.
//    Trong các yêu cầu GET, @RequestParam luôn ánh xạ từ query string (ví dụ: /path?param=value).
//    Trong thực tế, khi gửi object thông thường qua POST, dữ liệu thường được gửi trong body dưới dạng form data (không phải query string), vì query string không được khuyến khích cho dữ liệu lớn hoặc nhạy cảm.
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageResponse>> getAllMessages(
            @PathVariable String chatId
    ) {
        return ResponseEntity.ok(messageService.getAllMessagesByChatId(chatId));
    }
}
