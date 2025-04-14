package com.dran.web_social.services;

import com.dran.web_social.models.Role;

public interface RoleService {
    Role createRole(Role role);

    Role getRoleByName(String name);
}
