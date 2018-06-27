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


    @Override
    public String toString() {
        return "Config{" +
                "typeId=" + typeId +
                ", typeName='" + typeName + '\'' +
                ", typeImgUrl='" + typeImgUrl + '\'' +
                '}';
    }
}
