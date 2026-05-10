package com.sta.domain.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "ArticleContentVO", description = "文章内容VO")
public class ArticleContentVO {
    //文章id
    @Schema(description = "文章id")
    private Long id;

    //文章内容
    @Schema(description = "文章内容")
    private String articleContent;
}
