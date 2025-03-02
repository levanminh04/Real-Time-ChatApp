package com.levanminh.whatsappclone.file;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;

import static java.lang.System.currentTimeMillis;


@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    @Value("${application.file.uploads.media-output-path}")
    private String fileUploadPath;

    public String saveFile(@NonNull MultipartFile file,
                           @NonNull String currentUserId) {
        final String fileUploadSubPath = "users" + File.separator + currentUserId;  // separator là '\' or '/' tùy vào hệ điều hành
        return uploadFile(file, fileUploadSubPath);   // example: /uploads/users/123/1709214331456.png
    }

    private String uploadFile(
            @NonNull MultipartFile sourceFile,
            @NonNull String fileUploadSubPath
    ){
        final String finalUploadPath = fileUploadPath + File.separator + fileUploadSubPath;
        File targetFolder = new File(finalUploadPath);
        if(!targetFolder.exists()){
            boolean mkdirs = targetFolder.mkdirs(); // nếu folder chưa tồn tại thì mkdirs
            if(!mkdirs){
                log.warn("Failed to create the Folder: " + targetFolder.getAbsolutePath());
                return null;
            }
        }

        final String fileExtension = getFileExtension(sourceFile.getOriginalFilename());
        String targetPath = finalUploadPath + File.separator + currentTimeMillis() + fileExtension; // thay tên gốc của file image.png bằng timestamp : 120329324.png để tránh trùng tên file

        try(FileOutputStream fos = new FileOutputStream(targetPath)){
            fos.write(sourceFile.getBytes());
            log.info("File saved to: " + targetPath);
            return targetPath;
        }catch(Exception e){
            log.warn("Failed to write File: " + targetPath);
            return null;
        }

    }

    private String getFileExtension(String fileName) { // lấy phần mở rộng của file (.png, .jpg, ...)
        if(fileName == null || fileName.isEmpty())
        {
            return "";
        }

        int lastIndexOf = fileName.lastIndexOf(".");
        if(lastIndexOf == -1)
        {
            return "";
        }
        return fileName.substring(lastIndexOf).toLowerCase();
    }
}
