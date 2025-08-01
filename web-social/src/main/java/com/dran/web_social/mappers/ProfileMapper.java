package com.dran.web_social.mappers;

import com.dran.web_social.models.Profile;
import com.dran.web_social.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

//    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bio", constant = "")
    @Mapping(target = "banner", constant = "")
    @Mapping(target = "website", constant = "")
    @Mapping(target = "location", constant = "")
    @Mapping(target = "followersCount", constant = "0")
    @Mapping(target = "followingCount", constant = "0")
    @Mapping(target = "postsCount", constant = "0")
    @Mapping(target = "user", source = "user")
    Profile createDefaultProfile(User user);
}
