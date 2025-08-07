
package com.dran.web_social.utils;

import com.dran.web_social.dto.response.CommentResponse;
import com.dran.web_social.mappers.CommentMapper;
import com.dran.web_social.models.CommentPost;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CommentUtil {
    public static List<CommentResponse> processCommentsForAPI(List<CommentPost> topComments,
            List<CommentPost> allReplies,
            Long currentUserId, CommentMapper mapper) {
        // Group all comments by parentId for fast lookup
        Map<Long, List<CommentPost>> repliesMap = allReplies.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        List<CommentResponse> result = new ArrayList<>();
        for (CommentPost top : topComments) {
            CommentResponse topResp = mapper.commentToCommentResponse(top, currentUserId);

            if (!top.getDeleted()) {
                List<CommentResponse> replies = buildRepliesTree(top.getId(), repliesMap, currentUserId, mapper, 1);
                topResp.setReplies(replies);
            } else {
                topResp.setReplies(List.of());
            }

            result.add(topResp);
        }

        return result;
    }

    private static List<CommentResponse> buildRepliesTree(Long parentId,
            Map<Long, List<CommentPost>> repliesMap,
            Long currentUserId,
            CommentMapper mapper,
            int currentLevel) {
        List<CommentPost> children = repliesMap.getOrDefault(parentId, List.of());

        List<CommentResponse> responseList = new ArrayList<>();

        for (CommentPost child : children.stream()
                .sorted(Comparator.comparing(CommentPost::getCreateAt))
                .toList()) {

            if (child.getDeleted())
                continue;

            CommentResponse response = mapper.commentToCommentResponse(child, currentUserId);

            // Nếu chưa đến cấp 2, đệ quy xử lý tiếp
            if (currentLevel < 2) {
                List<CommentResponse> childReplies = buildRepliesTree(child.getId(), repliesMap, currentUserId, mapper,
                        currentLevel + 1);
                response.setReplies(childReplies);
            } else {
                // Nếu đang ở cấp 2 → vẫn cần collect các replies cấp sâu hơn, nhưng flatten vào
                // cùng cấp
                List<CommentResponse> flattened = buildRepliesTree(child.getId(), repliesMap, currentUserId, mapper,
                        currentLevel + 1);
                response.setReplies(List.of()); // Không lồng nữa
                responseList.add(response);
                responseList.addAll(flattened); // ✅ Flatten replies of replies vào cùng cấp
                continue;
            }

            responseList.add(response);
        }

        return responseList;
    }

}