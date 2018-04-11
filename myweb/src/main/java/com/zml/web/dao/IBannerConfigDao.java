package com.zml.web.dao;

import com.zml.web.common.annotation.Dao;
import com.zml.web.model.BannerConfig;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:36
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
@Dao
public interface IBannerConfigDao {

    public int insertBanner(BannerConfig config) throws Exception;

    public int activeBanner(@Param("index") int index , @Param("opened") boolean opened) throws Exception;

    public int updateBanner(BannerConfig config)throws Exception;

    public List<BannerConfig> getBanners(boolean opened) throws Exception;
}
