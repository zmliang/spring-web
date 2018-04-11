package com.zml.web.service.impl;

import com.zml.web.dao.IConfigDao;
import com.zml.web.model.Config;
import com.zml.web.service.IService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:55
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */

@Service
public class ConfigServiceImpl implements IService{
    private final static Logger logger = LogManager.getLogger(ConfigServiceImpl.class);

    @Autowired
    private IConfigDao configDao;

    @Override
    public boolean updateQsThreshold(int value) {
        logger.trace("Service updateQsThreshold");
        try {
            configDao.setQsThreshold(value);
        } catch (Exception e) {
            logger.error("setQsThreshold:"+e.getMessage());
            return false;
        }
        return true;
    }

    @Override
    public List<Config> getMainPageConfigs() {
        logger.trace("Service getMainPageConfigs");
        try {
            return configDao.getMainPageConfigs();
        } catch (Exception e) {
            logger.error("getMainPageConfigs:"+e.getMessage());
            return null;
        }
    }

    @Override
    public int getQsThreshold() {
        try {
            return configDao.getQsThreshold();
        } catch (Exception e) {
            logger.error("getQsThreshold:"+e.getMessage());
            return -1;
        }
    }
}
