package com.levanminh.realtimechatapp.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query(name = MessageConstants.FIND_MESSAGES_BY_CHAT_ID)
    List<Message> findMessagesByChatId(@Param("chatId") String chatId);

    @Query(name = MessageConstants.UPDATE_MESSAGE_STATE_BY_CHAT_ID)
    @Modifying  // Khi sử dụng @Query trong Spring Data JPA, mặc định nó chỉ dùng để đọc dữ liệu (SELECT), cần có  @Modifying khi dùng @Query để viết custom JPQL or SQL hoặc Native SQL
    void setMessageStateToSeenByChatId(@Param("chatId") String chatId, @Param("newState") MessageState state);

    // không nên setByMessageId
}
