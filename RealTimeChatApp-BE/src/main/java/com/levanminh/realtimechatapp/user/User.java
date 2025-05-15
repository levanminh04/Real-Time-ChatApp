package com.levanminh.realtimechatapp.user;


import com.levanminh.realtimechatapp.chat.Chat;
import com.levanminh.realtimechatapp.common.BaseAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")

@NamedQuery(name = UserConstants.FIND_USER_BY_EMAIL,
            query = "SELECT u FROM User u WHERE u.email = :email" // Câu lệnh này thuộc JPQL (Java Persistence Query Language), không phải SQL thuần, hoạt động trên entities (đối tượng Java) thay vì bảng SQL. User u LÀ Class User
)
@NamedQuery(name = UserConstants.FIND_ALL_USERS_EXCEPT_SEFT,
            query = "SELECT u FROM User u WHERE u.id != :publicId"
)
@NamedQuery(name = UserConstants.FIND_USER_BY_PUBLIC_ID,
            query = "SELECT u FROM User u WHERE u.id = :publicId"
)

public class User extends BaseAuditingEntity {

    private static final int LAST_ACTIVE_INTERVAL = 5;
    @Id
    private String id;  // Keycloak tự động tạo ID cho mỗi người dùng dưới dạng UUID (Universally Unique Identifier), tức là một chuỗi ký tự kiểu String.
    private String firstName;
    private String lastName; // không cần sử dụng @Column vì Hibernate tự động convert từ camelCase sang snake_case). trừ khi đặt tên field khác tên column
    private String email;
    private LocalDateTime lastSeen;

    @OneToMany(mappedBy = "sender")
    private List<Chat> chatsAsSender;

    @OneToMany(mappedBy = "recipient")
    private List<Chat> chatsAsRecipient;

    @Column(name = "avatar") // Lưu URL của ảnh từ Cloudinary
    private String avatar;

    @Transient // @Transient đánh dấu một field không được ánh xạ vào database. chỉ sử dụng để xử lý logic trong Java, nhưng không cần lưu vào database.
    public boolean isUserOnline(){
        return this.lastSeen != null && this.lastSeen.isAfter(LocalDateTime.now().minusMinutes(LAST_ACTIVE_INTERVAL));
    }
    // Nếu lastSeen nằm sau mốc này (tức là user có hoạt động trong 5 phút gần đây) → User được coi là online.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}


