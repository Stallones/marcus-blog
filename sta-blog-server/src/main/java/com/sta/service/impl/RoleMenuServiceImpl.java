package com.sta.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import com.sta.domain.entity.RoleMenu;
import com.sta.mapper.RoleMenuMapper;
import com.sta.service.RoleMenuService;

/**
 * (RoleMenu)表服务实现类
 *
 * @author kuailemao
 * @since 2023-11-28 10:23:17
 */
@Service("roleMenuService")
public class RoleMenuServiceImpl extends ServiceImpl<RoleMenuMapper, RoleMenu> implements RoleMenuService {

}
