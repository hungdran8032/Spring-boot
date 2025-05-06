package com.dran.web_social.services.impl;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dran.web_social.models.Media;
import com.dran.web_social.models.Post;
import com.dran.web_social.repositories.MediaRepository;
import com.dran.web_social.repositories.PostRepository;
import com.dran.web_social.services.CloudService;
import com.dran.web_social.services.MediaService;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {
    private final CloudService cloudService;
    private final MediaRepository mediaRepository;
    private final PostRepository postRepository;

    @Override
    public Media uploadMedia(Long postId, MultipartFile file) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            Map<String, String> result;

            result = cloudService.uploadFile(file);

            Media media = new Media();
            media.setUrl(result.get("url"));
            media.setPublicId(result.get("public_id"));
            media.setType(file.getContentType().split("/")[0]);
            media.setPost(post);

            return mediaRepository.save(media);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading file");
        }
    }

    @Override
    public void deleteMedia(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        cloudService.deleteFile(media.getPublicId());
        mediaRepository.delete(media);
    }

    @Override
    public Media updateMedia(Long mediaId, MultipartFile newFile) {
        try {
            Media media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> new RuntimeException("Media not found"));

            cloudService.deleteFile(media.getPublicId());

            Map<String, String> result = null;

            result = cloudService.uploadFile(newFile);

            media.setUrl(result.get("url"));
            media.setPublicId(result.get("public_id"));
            media.setType(newFile.getContentType().split("/")[0]);

            return mediaRepository.save(media);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading file");
        }
    }

}
