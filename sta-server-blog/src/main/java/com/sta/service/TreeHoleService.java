package com.sta.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.sta.domain.dto.SearchTreeHoleDTO;
import com.sta.domain.dto.TreeHoleIsCheckDTO;
import com.sta.domain.entity.TreeHole;
import com.sta.domain.response.ResponseResult;
import com.sta.domain.vo.TreeHoleListVO;
import com.sta.domain.vo.TreeHoleVO;

import java.util.List;


/**
 * (TreeHole)表服务接口
 *
 * @author kuailemao
 * @since 2023-10-30 11:14:14
 */
public interface TreeHoleService extends IService<TreeHole> {
    /**
     * 新增树洞
     * @param content 树洞内容
     * @return 是否成功
     */
    ResponseResult<Void> addTreeHole(String content);

    /**
     * 查看树洞
     * @return 树洞列表
     */
    List<TreeHoleVO> getTreeHole();

    /**
     * 后台树洞列表
     * @return 结果
     */
    List<TreeHoleListVO> getBackTreeHoleList(SearchTreeHoleDTO searchDTO);

    /**
     * 是否通过树洞
     * @param isCheckDTO 是否通过
     * @return 是否成功
     */
    ResponseResult<Void> isCheckTreeHole(TreeHoleIsCheckDTO isCheckDTO);

    /**
     * 删除树洞
     * @param ids id 列表
     * @return 是否成功
     */
    ResponseResult<Void> deleteTreeHole(List<Long> ids);
}
