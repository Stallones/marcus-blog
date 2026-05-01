package com.sta.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.sta.domain.dto.CommentIsCheckDTO;
import com.sta.domain.dto.SearchCommentDTO;
import com.sta.domain.dto.UserCommentDTO;
import com.sta.domain.entity.Comment;
import com.sta.domain.response.ResponseResult;
import com.sta.domain.vo.ArticleCommentVO;
import com.sta.domain.vo.CommentListVO;
import com.sta.domain.vo.PageVO;

import java.util.List;


/**
 * (CommentEmail)表服务接口
 *
 * @author kuailemao
 * @since 2023-10-19 15:44:57
 */
public interface CommentService extends IService<Comment> {
    /**
     * 查询文章评论
     */
    PageVO<List<ArticleCommentVO>> getComment(Integer type, Integer typeId, Integer pageNum, Integer pageSize);

    /**
     * 添加评论
     */
    ResponseResult<String> userComment(UserCommentDTO commentDTO);

    /**
     * 后台评论列表
     * @return 结果
     */
    List<CommentListVO> getBackCommentList(SearchCommentDTO searchDTO);

    /**
     * 是否通过评论
     * @param isCheckDTO 是否通过
     * @return 是否成功
     */
    ResponseResult<Void> isCheckComment(CommentIsCheckDTO isCheckDTO);

    /**
     * 删除评论
     * @param id id 列表
     * @return 是否成功
     */
    ResponseResult<Void> deleteComment(Long id);
}
