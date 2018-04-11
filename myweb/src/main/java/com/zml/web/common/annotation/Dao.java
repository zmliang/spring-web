package com.zml.web.common.annotation;

import org.springframework.stereotype.Component;

import java.lang.annotation.*;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:25
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD,ElementType.TYPE})
@Documented
@Component
public @interface Dao {
    String value() default "";
}
