package com.sta.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.sta.domain.dto.AddBlackListDTO;
import com.sta.domain.dto.SearchBlackListDTO;
import com.sta.domain.dto.UpdateBlackListDTO;
import com.sta.domain.entity.BlackList;
import com.sta.domain.response.ResponseResult;
import com.sta.domain.vo.BlackListVO;

import java.util.List;


/**
 * (BlackList)表服务接口
 *
 * @author kuailemao
 * @since 2024-09-05 16:13:20
 */
public interface BlackListService extends IService<BlackList> {

    /**
     * 新增数据
     * @param addBlackListDTO 新增对象
     * @return 新增结果
     */
    ResponseResult<Void> addBlackList(AddBlackListDTO addBlackListDTO);

    /**
     * 获取黑名单
     * @return 黑名单
     */
    List<BlackListVO> getBlackList(SearchBlackListDTO searchBlackListDTO);

    /**
     * 修改数据
     * @param updateBlackListDTO 修改对象
     * @return 修改结果
     */
    ResponseResult<Void> updateBlackList(UpdateBlackListDTO updateBlackListDTO);

    /**
     * 删除黑名单
     * @param ids 黑名单id
     * @return 是否成功
     */
    ResponseResult<Void> deleteBlackList(List<Long> ids);
}
