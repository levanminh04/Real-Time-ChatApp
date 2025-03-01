package com.levanminh.whatsappclone.file;

import org.springframework.web.multipart.MultipartFile;

public class FileService {
    public String saveFile(MultipartFile file, String currentUserId) {
        String fileName = file.getOriginalFilename();
    }
}
