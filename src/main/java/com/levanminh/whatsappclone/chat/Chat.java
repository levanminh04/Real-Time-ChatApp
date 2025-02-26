package com.levanminh.whatsappclone.chat;

import com.levanminh.whatsappclone.common.BaseAuditingEntity;
import com.levanminh.whatsappclone.message.Message;
import com.levanminh.whatsappclone.message.MessageState;
import com.levanminh.whatsappclone.message.MessageType;
import com.levanminh.whatsappclone.user.User;
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
@MappedSuperclass
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat")

public class Chat extends BaseAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @OneToMany(mappedBy = "chat", fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC")
    private List<Message> messages;

    @Transient
    public long getUnreadMessages(String senderId) {
        return this.messages.stream()
                .filter(m -> m.getReceiverId().equals(senderId))
                .filter(m -> MessageState.SENT == m.getState())
                .count();
    }

    @Transient
    public String getChatName(String senderId) {
        if(recipient.getId().equals(senderId)) {
            return sender.getFirstName() + " " + sender.getLastName();
        }
        return recipient.getFirstName() + " " + recipient.getLastName();
    }

    @Transient
    public String getLastMessage() {
        if(messages != null && !messages.isEmpty()){
            if(messages.get(0).getType() != MessageType.TEXT)
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
}
