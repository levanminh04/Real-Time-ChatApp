package com.levanminh.realtimechatapp.chat;


import com.levanminh.realtimechatapp.user.User;
import org.springframework.stereotype.Component;

@Component
public class ChatConverter {
    public ChatResponse toChatResponse(Chat chat, String UserId) {
        boolean isOtherUserOnline = chat.getSender().getId().equals(UserId)
                ? chat.getRecipient().isUserOnline()  // Nếu người đăng nhập là sender, kiểm tra trạng thái online của recipient
                : chat.getSender().isUserOnline();    // Nếu người đăng nhập là recipient, kiểm tra trạng thái online của sender
        User currentUser = !chat.getSender().getId().equals(UserId) ? chat.getSender() : chat.getRecipient();
        return ChatResponse.builder()
                .id(chat.getId())
                .chatName(chat.getChatName(UserId))
                .lastMessageTime(chat.getLastMessageTime())
                .lastMessage(chat.getLastMessage())
                .unreadCount(chat.getUnreadMessages(UserId))
                .senderId(chat.getSender().getId())
                .recipientId(chat.getRecipient().getId())
                .isRecipientOnline(isOtherUserOnline)
                .avatarUrl(currentUser.getAvatar())
                .build();
    }
}
