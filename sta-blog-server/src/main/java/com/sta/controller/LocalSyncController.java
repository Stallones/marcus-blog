package com.sta.controller;

import com.sta.annotation.AccessLimit;
import com.sta.domain.response.ResponseResult;
import com.sta.domain.vo.ArticleContentVO;
import com.sta.domain.vo.ArticleDetailVO;
import com.sta.domain.vo.CategoryWithArticleVO;
import com.sta.domain.vo.TagWithArticleVO;
import java.util.List;
import com.sta.service.ArticleService;
import com.sta.service.CategoryService;
import com.sta.utils.ControllerUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "本地同步相关接口")
@RequestMapping("/localSync")
@Validated
public class LocalSyncController {

    @Resource
    private ArticleService articleService;

    @Operation(summary = "获取所有文章详情")
    @AccessLimit(seconds = 60, maxCount = 60)
    @GetMapping("/article-detail")
    public ResponseResult<List<ArticleDetailVO>> listAllDetail() {
        return ControllerUtils.messageHandler(() -> articleService.listArticleDetail());
    }
    @Operation(summary = "获取所有文章内容")
    @AccessLimit(seconds = 60, maxCount = 60)
    @GetMapping("/article-content")
    public ResponseResult<List<ArticleContentVO>> listAllContent() {
        return ControllerUtils.messageHandler(() -> articleService.listArticleContent());
    }

    @Operation(summary = "获取所有分类及其关联文章ID")
    @AccessLimit(seconds = 60, maxCount = 60)
    @GetMapping("/category-with-article")
    public ResponseResult<List<CategoryWithArticleVO>> listCategoryWithArticleId() {
        return ControllerUtils.messageHandler(() -> articleService.listCategoryWithArticleId());
    }

    @Operation(summary = "获取所有标签及其关联文章ID")
    @AccessLimit(seconds = 60, maxCount = 60)
    @GetMapping("/tag-with-article")
    public ResponseResult<List<TagWithArticleVO>> listTagWithArticleId() {
        return ControllerUtils.messageHandler(() -> articleService.listTagWithArticleId());
    }
    

}
