package com.zml.web.service;

import com.zml.web.model.Config;

import java.util.List;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:50
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
public interface IService {

    boolean updateQsThreshold(int value) ;

    List<Config> getMainPageConfigs();

    int getQsThreshold();

}
