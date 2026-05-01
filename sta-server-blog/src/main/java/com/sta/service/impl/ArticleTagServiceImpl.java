package com.sta.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import com.sta.domain.entity.ArticleTag;
import com.sta.mapper.ArticleTagMapper;
import com.sta.service.ArticleTagService;

/**
 * (ArticleTag)表服务实现类
 *
 * @author kuailemao
 * @since 2023-10-15 02:29:13
 */
@Service("articleTagService")
public class ArticleTagServiceImpl extends ServiceImpl<ArticleTagMapper, ArticleTag> implements ArticleTagService {

}
