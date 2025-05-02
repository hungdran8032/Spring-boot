package com.dran.web_social.services.impl;

import org.springframework.stereotype.Service;

import com.dran.web_social.models.Role;
import com.dran.web_social.repositories.RoleRepository;
import com.dran.web_social.services.RoleService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Override
    public Role getRoleByName(String name) {
        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = Role.builder().name("USER").build();
                    return roleRepository.save(newRole);
                });
        return role;
    }

    @Override
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

}
