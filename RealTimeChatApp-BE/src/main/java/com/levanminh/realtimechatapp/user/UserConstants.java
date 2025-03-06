package com.levanminh.realtimechatapp.user;

public class UserConstants {
    public static final String FIND_USER_BY_EMAIL = "User.findByEmail";
    public static final String FIND_ALL_USERS_EXCEPT_SEFT = "User.findAllUsersExceptSelf";
    public static final String FIND_USER_BY_PUBLIC_ID = "User.findByPublicId";
    private UserConstants() {} // khởi tạo constructor là private để không cho dùng new tạo đối tượng, lớp này chỉ chứa hằng số và không cần thiết phải tạo instance.
}
