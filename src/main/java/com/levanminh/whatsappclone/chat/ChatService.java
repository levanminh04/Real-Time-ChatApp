package com.levanminh.whatsappclone.chat;

import com.levanminh.whatsappclone.user.User;
import com.levanminh.whatsappclone.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;

    private final ChatConverter chatConverter;

    private final UserRepository userRepository;

    @Transactional(readOnly = true) // lấy danh sách tất cả chat của user
    public List<ChatResponse> getChatsByReceiverId(Authentication currentUser){ // Authentication = (SecurityContextHolder.getContext()).getAuthentication().getPrincipal(), UsernamePasswordAuthenticationToken,  getPrincipal() thường là một UserDetails, nên thể gọi .getPrincipal().getUsername(), còn với JwtAuthenticationToken - Keycloak getPrincipal() thường là một instance của Jwt hoặc JwtAuthenticationToken nên không thể gọi .getPrincipal().getUsername()
        final String userId = currentUser.getName();  // với JwtAuthenticationToken, getName() sẽ trả về giá trị của claim "sub" (Subject), mà "sub" do keycloak cung cấp mặc định lưu ID của user
        return chatRepository.findAllChatsByUser(userId)
                .stream()
                .map(c -> chatConverter.toChatResponse(c, userId))
                .toList();
    }

    public String getChat(String senderId, String receiverId){

        Optional<Chat> existingChat = chatRepository.findChatBetweenTwoUsers(senderId, receiverId);
        if(existingChat.isPresent()){
            return existingChat.get().getId();
        }
        User sender = userRepository.findByPublicId(senderId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID: " + senderId + " not found"));
        User receiver = userRepository.findByPublicId(receiverId)
                .orElseThrow(() -> new EntityNotFoundException("User with ID: " + receiverId + " not found"));

        Chat newChat = new Chat();
        newChat.setSender(sender);
        newChat.setRecipient(receiver);
        Chat tmpChat = chatRepository.save(newChat);
        return tmpChat.getId();
    }
}
