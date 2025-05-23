package com.levanminh.realtimechatapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {

    // @Query được dùng để định nghĩa truy vấn tùy chỉnh bằng JPQL (Java Persistence Query Language) hoặc native SQL thay vì sử dụng các phương thức truy vấn tự động do Spring Data JPA cung cấp.
    @Query(name = UserConstants.FIND_USER_BY_EMAIL)   // @NamedQuery chỉ có thể được đặt trên  lớp được đánh dấu @Entity.
    Optional<User> findByEmail(@Param("email") String email);



    @Query(name = UserConstants.FIND_USER_BY_PUBLIC_ID)
    Optional<User> findByPublicId(@Param("publicId") String senderId);

    @Query(name = UserConstants.FIND_ALL_USERS_EXCEPT_SEFT)
    List<User> findAllUsersExceptSelf(@Param("publicId") String publicId);

    Optional<User> findById(String id);
}
