package com.zml.web.model;

import java.io.Serializable;

/**
 * \* Created with IntelliJ IDEA.
 * \* User: zml
 * \* Date: 2018/4/11
 * \* Time: 13:30
 * \* To change this template use File | Settings | File Templates.
 * \* Description:
 * \
 */
public class Config implements Serializable {
    private int typeId;
    private String typeName;
    private String typeImgUrl;
    private String sharedCopy;
    private int qsThreshold;

    public Config() {
    }

    public int getTypeId() {
        return typeId;
    }

    public void setTypeId(int typeId) {
        this.typeId = typeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getTypeImgUrl() {
        return typeImgUrl;
    }

    public void setTypeImgUrl(String typeImgUrl) {
        this.typeImgUrl = typeImgUrl;
    }

    public String getSharedCopy() {
        return sharedCopy;
    }

    public void setSharedCopy(String sharedCopy) {
        this.sharedCopy = sharedCopy;
    }

    public int getQsThreshold() {
        return qsThreshold;
    }

    public void setQsThreshold(int qsThreshold) {
        this.qsThreshold = qsThreshold;
    }

    @Override
    public String toString() {
        return "Config{" +
                "typeId=" + typeId +
                ", typeName='" + typeName + '\'' +
                ", typeImgUrl='" + typeImgUrl + '\'' +
                ", sharedCopy='" + sharedCopy + '\'' +
                ", qsThreshold=" + qsThreshold +
                '}';
    }
}
