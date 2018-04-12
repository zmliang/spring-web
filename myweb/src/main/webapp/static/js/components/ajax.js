var Ajax = {
    requestList: [],
    isDuplicate: function(url) {
        if ((url !== null) && this.requestList.some(function(obj) {
                return (obj == url)
            })) {
            return true; // 该接口已经调用 并且正在调用中
        }
        return false;
    },

    removeUrl: function (url) {
        var ind = -1
        if ((url !== null) && this.requestList.some(function(obj, index) {
                ind = index;
                return (obj == url)
            })) {
            this.requestList.splice(ind, 1);
        }
    },

    /**
     * 基于ajax的POST请求
     *
     * @param data
     *            传入的参数
     * @param callback
     *            ajax请求成功后执行的回调方法
     * @param callbackDone
     *            ajax请求成功后最后执行的方法
     * @param btn
     *            传入btn
     */
    post : function(url, data, callback, callbackFail, silendMode, forceShowLoading) {
        if ($.isFunction(data)) { // data没传 后面的直接传进来了
            silendMode = callbackFail;
            callbackFail = callback;
            callback = data;
            data = {};
        }

        if (this.isDuplicate(url))
            return;
        this.requestList.push(url);
        var ref = this;
        var pendingRequests = {};
       /* $.ajaxPrefilter(function(options, originalOptions, jqXHR ) {
            var key = options.url;
            //请求是否已经存在
            if(!pendingRequests[key]){
                pendingRequests[key] = jqXHR;
                jqXHR.pendingRequestKey = key;
            }else{
                //取消请求
                jqXHR.abort();
            }
            //ajax请求完成时，pendingRequests清除对应数据
            var complete = options.complete;
            options.complete = function(jqXHR, textStatus) {
                setTimeout(function(){
                    delete pendingRequests[jqXHR.pendingRequestKey];
                },1000);
                if ($.isFunction(complete)) {
                    complete.apply(this, arguments);
                }
            };
        }); */
        // if (forceShowLoading){
        //     layer.load();
        // }else{
            // layer.load(-1,{
            //     shade:[0,'rgb(255,255,255)'],
            //     time:0
            // });
        // }
        $.post(url, data).done(function(response) {
            layer.closeAll('loading');
            ref.removeUrl(url);
            if(typeof response == 'string'){
                response = eval('(' + response + ')');
            }
            if(response.success !== true){
                if ($.isFunction(callbackFail)) {
                    callbackFail(response);
                } else {
                    if (!silendMode){
                        layer.msg(response.msg || '数据操作失败');
                    }
                }
                return;
            }
            if ($.isFunction(callback)) {
                callback(response);
            }
        }).fail(function( jqXHR, textStatus, errorThrown ) {
            ref.removeUrl(url);
            // layer.closeAll('loading');
            if ($.isFunction(callbackFail)) { // 如果有fail callback,则不提示接口调用错误
                callbackFail(jqXHR);
            } else {
                if (!silendMode && errorThrown != 'canceled'){
                    layer.msg('数据操作失败');
                }
            }
        });
    },

    /**
     * 基于ajax的POST请求
     *
     * @param data
     *            传入的参数
     * @param callback
     *            ajax请求成功后执行的回调方法
     * @param callbackDone
     *            ajax请求成功后最后执行的方法
     * @param btn
     *            传入btn
     */
    postJson : function(url, data, callback, callbackFail, silendMode, forceShowLoading) {
        if ($.isFunction(data)) { // data没传 后面的直接传进来了
            silendMode = callbackFail;
            callbackFail = callback;
            callback = data;
            data = {};
        }
        if (forceShowLoading)
            layer.load();

        if (this.isDuplicate(url))
            return;
        this.requestList.push(url);
        var ref = this;
        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: 'json',
            success: function(response) {
                layer.closeAll('loading');
                ref.removeUrl(url);
                if(typeof response == 'string'){
                    response = eval('(' + response + ')');
                }
                if(response.success !== true){
                    if ($.isFunction(callbackFail)) {
                        callbackFail(response);
                    } else {
                        if (!silendMode)
                            layer.msg(response.msg || '数据操作失败');
                    }
                    return;
                }
                if ($.isFunction(callback)) {
                    callback(response);
                }
            },
            fail: function( jqXHR, textStatus, errorThrown ) {
                ref.removeUrl(url);
                layer.closeAll('loading');
                if ($.isFunction(callbackFail)) { // 如果有fail callback,则不提示接口调用错误
                    callbackFail(jqXHR);
                } else {
                    if (!silendMode && errorThrown != 'canceled')
                        layer.msg('数据操作失败');
                }
            }
        });
    }
};