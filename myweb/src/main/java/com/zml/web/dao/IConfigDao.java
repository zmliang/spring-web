package com.zml.web.dao;

import com.zml.web.common.annotation.Dao;
import com.zml.web.model.Config;

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
public interface IConfigDao {
    List<Config> getMainPageConfigs()throws Exception;

    int getQsThreshold()throws Exception;

    int setQsThreshold(int value) throws Exception;

    List<String> getSharedCopy() throws Exception;
}
