package com.sta.domain.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * @author stallone
 * <p>
 * 创建时间：2026/05/09
 * 标签及关联文章ID的VO
 */
@Data
@Schema(name = "TagWithArticleVO", description = "标签及关联文章ID的VO")
public class TagWithArticleVO {
    // 标签id
    @Schema(description = "标签id")
    private Long id;
    // 标签名
    @Schema(description = "标签名")
    private String tagName;
    // 标签下的文章数量
    @Schema(description = "标签下的文章数量")
    private Long articleCount;
    // 关联的文章ID列表
    @Schema(description = "关联的文章ID列表")
    private List<Long> articleIdList;
}
