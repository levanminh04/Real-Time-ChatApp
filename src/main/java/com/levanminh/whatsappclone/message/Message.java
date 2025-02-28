package com.levanminh.whatsappclone.message;

import com.levanminh.whatsappclone.chat.Chat;
import com.levanminh.whatsappclone.common.BaseAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.awt.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "messages")
@NamedQuery(name = MessageConstants.FIND_MESSAGES_BY_CHAT_ID,
        query = "SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.createdDate"
)
@NamedQuery(name = MessageConstants.UPDATE_MESSAGE_STATE_BY_CHAT_ID,
        query = "UPDATE Message SET state = :newState WHERE chat.id = :chatId"
)
public class Message extends BaseAuditingEntity {
    @Id
    @SequenceGenerator(
            name = "msg_seq",         // Tên của SequenceGenerator trong Hibernate
            sequenceName = "msg_seq", // Tên sequence trong PostgreSQL
            allocationSize = 1        // Mỗi lần tăng 1 đơn vị
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
            generator = "msg_seq" // Liên kết với Generator có tên "msg_seq"
    )
    private Long id;

    @Column(columnDefinition = "TEXT") // chỉ định cột content lưu với kiểu dữ liệu TEXT, Nếu không chỉ định columnDefinition, Hibernate có thể mặc định sử dụng VARCHAR(255), gây giới hạn độ dài.
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Enumerated(EnumType.STRING) // chỉ định cách lưu trữ enum  Lưu giá trị dưới dạng String, nếu không có thì mặc định sẽ lưu dưới dạng EnumType.ORDINAL: Lưu giá trị dưới dạng số nguyên 0, 1, 2... (index của enum).
    private MessageState state;

    @ManyToOne
    @JoinColumn(name="chat_id")
    private Chat chat;

    @Column(name="sender_id", nullable=false)
    private String senderId;

    @Column(name="receiver_id", nullable=false)
    private String receiverId;

    private String mediaFilePath;

}
