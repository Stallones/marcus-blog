package com.sta.domain.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * @author stallone
 * <p>
 * 创建时间：2026/05/08
 * 分类及关联文章ID的VO
 */
@Data
@Schema(name = "CategoryWithArticleVO", description = "分类及关联文章ID的VO")
public class CategoryWithArticleVO {
    // 分类id
    @Schema(description = "分类id")
    private Long id;
    // 分类名
    @Schema(description = "分类名")
    private String categoryName;
    // 分类下的文章数量
    @Schema(description = "分类下的文章数量")
    private Long articleCount;
    // 关联的文章ID列表
    @Schema(description = "关联的文章ID列表")
    private List<Long> articleIdList;
}
