package com.levanminh.realtimechatapp.chat;

import com.levanminh.realtimechatapp.common.BaseAuditingEntity;
import com.levanminh.realtimechatapp.message.Message;
import com.levanminh.realtimechatapp.message.MessageState;
import com.levanminh.realtimechatapp.message.MessageType;
import com.levanminh.realtimechatapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat")

@NamedQuery(name = ChatConstants.FIND_ALL_CHATS_BY_USERID,
        query = "SELECT DISTINCT c FROM Chat c " +
                "WHERE (c.sender.id = :userId OR c.recipient.id = :userId)" +
                " AND EXISTS(SELECT 1 FROM Message m WHERE m.chat = c)" +
                " ORDER BY c.createdDate DESC "  // jpa không hỗ trợ DISTINCT, ORDER BY, cũng như truy vấn phức tạp and or and như lệnh FIND_CHAT_BETWEEN_TWO_USERS bên dưới, vì vậy cần tự custom JPQL
)

@NamedQuery(name = ChatConstants.FIND_CHAT_BETWEEN_TWO_USERS,
        query = "SELECT DISTINCT c FROM Chat c WHERE (c.sender.id = :userId AND c.recipient.id = :otherUserId) OR (c.sender.id = :otherUserId AND c.recipient.id = :userId)ORDER BY createdDate DESC"
        )
public class Chat extends BaseAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) //  tạo ID là  chuỗi ngẫu nhiên
//    Với GenerationType.IDENTITY, bạn phải chờ database tạo ID trước khi có thể dùng nó.
//    Với GenerationType.UUID, ID được sinh ngay trong Java mà không cần truy vấn DB.
    private String id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @OneToMany(mappedBy = "chat", fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC")  //  sắp xếp danh sách (List) của một entity theo thứ tự tăng hoặc giảm
    private List<Message> messages;

    @Transient
    public long getUnreadMessages(String userId) {
        return this.messages.stream()
                .filter(m -> m.getReceiverId().equals(userId))  // userId là ID của người muốn kiểm tra tin nhắn chưa đọc của mình.
                .filter(m -> MessageState.SENT == m.getState())
                .count();
    }

    @Transient //  hiển thị tên đối phương.
    public String getChatName(String userId) {   // userId là ID của người muốn kiểm tra tin nhắn chưa đọc của mình.
        if(recipient.getId().equals(userId)) {
            return sender.getFirstName() + " " + sender.getLastName();
        }
        return recipient.getFirstName() + " " + recipient.getLastName();
    }

    @Transient
    public String getLastMessage() {
        if(messages != null && !messages.isEmpty()){
            if(messages.get(0).getType() != MessageType.TEXT)  // List<Message> được sort theo createdDate DESC vì vậy phần tử đầu là tin nhắn mới nhất
            {
                return"Attachment";
            }
            return messages.get(0).getContent();
        }
        return null;
    }

    @Transient
    public LocalDateTime getLastMessageTime() {
        if(messages != null && !messages.isEmpty()){
            return messages.get(0).getCreatedDate();
        }
        return null;
    }

    @Transient  // hiển thị tên chính người gửi.
    public String getCurrentUserChatName (String userId){ // getConversationPartnerName, Được sử dụng khi cần hiển thị đối phương trong cuộc trò chuyện.
        if(sender.getId().equals(userId)) {
            return sender.getFirstName() + " " + sender.getLastName();
        }
        return recipient.getFirstName() + " " + recipient.getLastName();
    }
}
