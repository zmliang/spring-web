package com.zml.web.controller;

import com.zml.web.service.IService;
import com.zml.web.service.impl.ConfigServiceImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.jws.WebResult;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 14:00
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
@Controller

public class ConfigController {
    private static final Logger logger = LogManager.getLogger(ConfigController.class);

    @Autowired
    private ConfigServiceImpl configService;

    @RequestMapping(value = "/config")
    public ModelAndView getMPageConfigs(){
        final int threshold=0;
        logger.trace("threshold:"+threshold);
        ModelAndView mv=new ModelAndView();
        mv.setViewName("index");
        return mv;
    }

    @RequestMapping(value = "/")
    public ModelAndView requestDefault(){
        ModelAndView mv=new ModelAndView();
        mv.setViewName("home");
        return mv;
    }

}
