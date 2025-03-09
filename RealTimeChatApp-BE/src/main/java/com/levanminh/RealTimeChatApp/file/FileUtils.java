package com.levanminh.realtimechatapp.file;


import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
public class FileUtils {

    private FileUtils() {
        throw new UnsupportedOperationException("Utility class should not be instantiated");
    }

    public static byte[] readFileFromLocation(String fileUrl) {
        if (StringUtils.isBlank(fileUrl)) {
            log.warn("File path is blank or null");
            return new byte[0];  //  tạo ra một mảng byte có kích thước 0. Trả về mảng byte rỗng nếu file không hợp lệ.
        }
        Path filePath = Paths.get(fileUrl);  // Chuyển fileUrl thành một đối tượng Path
        try {
            return Files.readAllBytes(filePath);  // Đọc toàn bộ nội dung file và lưu vào byte[]
        } catch (IOException e) {
            log.warn("No file found at path: {}", fileUrl, e);
        }
        return new byte[0];
    }
}