package com.dran.web_social.services;

import org.springframework.web.multipart.MultipartFile;

import com.dran.web_social.models.Media;

public interface MediaService {
    Media uploadMedia(Long postId, MultipartFile file);

    void deleteMedia(Long mediaId);

    Media updateMedia(Long mediaId, MultipartFile newFile);
}
