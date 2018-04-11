package com.zml.web.model;

import java.io.Serializable;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:34
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
public class BannerConfig implements Serializable{
    private String head;
    private String body;
    private String navigateTo;
    private String imageUrl;
    private boolean opened;
    private String aboutUrl;
    private int index;

    public BannerConfig() {
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getHead() {
        return head;
    }

    public void setHead(String head) {
        this.head = head;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getNavigateTo() {
        return navigateTo;
    }

    public void setNavigateTo(String navigateTo) {
        this.navigateTo = navigateTo;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isOpened() {
        return opened;
    }

    public void setOpened(boolean opened) {
        this.opened = opened;
    }

    public String getAboutUrl() {
        return aboutUrl;
    }

    public void setAboutUrl(String aboutUrl) {
        this.aboutUrl = aboutUrl;
    }

    @Override
    public String toString() {
        return "BannerConfig{" +
                "head='" + head + '\'' +
                ", body='" + body + '\'' +
                ", navigateTo='" + navigateTo + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", opened=" + opened +
                ", aboutUrl='" + aboutUrl + '\'' +
                ", index='" + index + '\'' +
                '}';
    }
}
