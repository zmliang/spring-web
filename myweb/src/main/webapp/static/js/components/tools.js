function returnBlanks() {
    return '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
}

function renderFee(obj) {
    var chargeType = obj.billItems ? obj.billItems[0].chargeType : null;
    if (!chargeType) {
        return [];
    }
    var billItem = obj.billItems[0];
    var unit = obj.feeType == 8 ? '吨' : '度';
    if (chargeType == 1) {
        return [{
            name: obj.feeTypeStr + '类型',
            val: '计价收费'
        }, {
            name: '本次抄表',
            val: (billItem.thisNumber || '0') + ' ' + unit
        }, {
            name: '抄表时间',
            val: billItem.thisReadingDateStr
        }, {
            name: '单价金额',
            val: (billItem.costPrice || '0.00') + ' 元/' + unit
        }, {
            name: '上次抄表',
            val: (billItem.lastNumber || '0') + ' ' + unit
        }, {
            name: '抄表时间',
            val: billItem.lastReadingDateStr
        }];
    } else {
        return [{
            name: obj.feeTypeStr + '类型',
            val: '固定收费',
            singleLine: true
        }]
    }
}

function renderServiceFeeType(serviceFeeType) {
    switch (serviceFeeType) {
        case 1:
            return '无';
        case 2:
            return '随租金付';
        case 3:
            return '一次性付清';
        default :
            return '';
    }
}

// 支付方式 结账时间
var Tools = (function () {
    return {
        handlePdfUrl: function (url) {
            if (!url)
                return '';
            return url.replace(/.*pdf-viewer\/examples\/mobile-viewer\/viewer\.html\?pdfurl=/, '');
        },

        getQueryVariable: function (variable) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return (false);
        },

        renderBillDetails: function (obj) {
            if (!obj || !obj.billId) return [];
            var list = [{
                name: '账单号',
                val: obj.billNo
            }, {
                name: '结账时间',
                val: obj.finishDateStr ? obj.finishPersonName + ' ' + obj.finishDateStr : ''
            }, {
                name: '应付时间',
                val: obj.deadlineDateStr
            }];
            switch (obj.feeType) {
                // 期租金
                case 14:
                case 15:
                    var billItems = obj.billItems || [],
                        addItems = [];
                     $.each(billItems,function(k, v){
                        addItems.push({
                            name: v.itemName,
                            val: v.originalFee ? Number(v.originalFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '商家优惠',
                            val: v.discountFee ? Number(v.discountFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '平台补贴',
                            val: v.discountAmountDouble ? Number(v.discountAmountDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '租客付款',
                            val: v.actualPayFeeDouble ? Number(v.actualPayFeeDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '实收金额',
                            val: v.itemFee ? Number(v.itemFee).toFixed(2) : '0.00',
                            width: '20%'
                        })
                    });
                    $.merge(list, addItems);
                    break;
                case 8:
                case 9:
                    var billItems = obj.billItems || [],
                        addItems = [];
                     $.each(billItems,function(k, v){
                        addItems.push({
                            name: v.itemName,
                            val: v.originalFee ? Number(v.originalFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '商家优惠',
                            val: v.discountFee ? Number(v.discountFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '平台补贴',
                            val: v.discountAmountDouble ? Number(v.discountAmountDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '租客付款',
                            val: v.actualPayFeeDouble ? Number(v.actualPayFeeDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '实收金额',
                            val: v.itemFee ? Number(v.itemFee).toFixed(2) : '0.00',
                            width: '20%'
                        })
                    });
                    $.merge(list, addItems);
                    var newRender = $.each(renderFee(obj), function(kk, vv) {
                        vv.width = '20%'
                    })
                    $.merge(list, newRender);
                    break;
                case 12:
                    var sub_type = parseInt(obj.subType);
                    switch (sub_type) {
                        case 1:
                            sub_type = '正常退房(退房租退押金)';
                            break;
                        case 2:
                            sub_type = '违约退房(退房租不退押金)';
                            break;
                        case 3:
                            sub_type = '提前退房(只退押金)';
                            break;
                        case 4:
                            sub_type = '特殊退房(押金、房租全不退)';
                            break;
                    }
                    var billItems = obj.billItems || [],
                        addItems = [{
                        name: '退房类型',
                        val: sub_type
                        }];
                    $.each(billItems,function(k,v){
                        var addData = {
                            name: v.itemName,
                            val: v.itemFee
                        };
                        if (v.itemName == '收水费' || v.itemName == '收电费') {
                            addData.isEnergy = v;
                        }
                        if (v.type == 7) {//其他
                            addData.isRemark = v;
                        }
                        addItems.push(addData);
                    });
                    addItems.push({
                        name: '总计退款',
                        val: obj.billFeeStr,
                        singleLine: true
                    });
                    $.merge(list, addItems);
                    break;
                case 13:
                    var billItems = obj.billItems || [];
                    $.merge(list, [{
                        name: '支付类型',
                        val: renderServiceFeeType(obj.serviceFeeType)
                    }, {
                        name: '付款明细',
                        val: obj.serviceMonthStr,
                        isNewLine: true
                    },{
                        name: '账单金额',
                        val: billItems[0].originalFee || billItems[0].itemFee
                    },{
                        name: '优惠金额',
                        val: billItems[0].discountFee ? Number(billItems[0].discountFee).toFixed(2) : '0.00'
                    },{
                        name: '实收金额',
                        val: billItems[0].itemFee
                    }]);
                    break;
                default:
                    var billItems = obj.billItems || [],
                        addItems = [];
                     $.each(billItems,function(k, v){
                        addItems.push({
                            name: v.itemName,
                            val: v.originalFee ? Number(v.originalFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '商家优惠',
                            val: v.discountFee ? Number(v.discountFee).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '平台补贴',
                            val: v.discountAmountDouble ? Number(v.discountAmountDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '租客付款',
                            val: v.actualPayFeeDouble ? Number(v.actualPayFeeDouble).toFixed(2) : '0.00',
                            width: '20%'
                        },{
                            name: '实收金额',
                            val: v.itemFee ? Number(v.itemFee).toFixed(2) : '0.00',
                            width: '20%'
                        })
                    });
                    $.merge(list, addItems);
                    break;
                }
            if (obj.feeType != 12) {
                list.push({
                    name: '备注内容',
                    val: obj.desc,
                    singleLine: true
                });
            }
            return list;
        },
        renderBillExpandInfoHtml: function (obj) {
            // 1-房租，2-押金，3-暖气，4-物业，5-增配，6-退款，7-其他，8-水费，9-电费，10-宽带，11-定金，12-退房，13-服务费
            // 3、10不要
            if (!obj || !obj.billId)
                return [];
            var list = [{
                name: '账单号',
                val: obj.billNo
            }, {
                name: '结账时间',
                val: obj.finishDateStr ? obj.finishPersonName + ' ' + obj.finishDateStr : ''
            }];

            switch (obj.feeType) {
                // 期租金/首期租金
                case 14:
                case 15:
                    var billItems = obj.billItems || [],
                        addItems = [{
                            name: '应付时间',
                            val: obj.deadlineDateStr
                        }];
                    $.each(billItems,function(k,v){
                        var addData = {
                            name: v.itemName,
                            val: v.originalFee || v.itemFee
                        };
                        addItems.push(addData);
                        addItems.push({
                            name: '优惠金额',
                            val: v.discountFee || '0.00'
                        },{
                            name: '实收金额',
                            val: v.itemFee
                        })
                    });
                    $.merge(list, addItems);
                    break;
                case 8:
                case 9:
                    var billItems = obj.billItems || [],
                        addItems = [{
                            name: '账单金额',
                            val: billItems[0].originalFee || billItems[0].itemFee
                        },{
                            name: '优惠金额',
                            val: billItems[0].discountFee || '0.00'
                        },{
                            name: '实收金额',
                            val: billItems[0].itemFee
                        }];
                    list.push({
                        name: '应付时间',
                        val: obj.deadlineDateStr
                    });
                    $.merge(list, renderFee(obj));
                    $.merge(list, addItems);
                    break;
                case 12:
                    var sub_type = parseInt(obj.subType);
                    switch (sub_type) {
                        case 1:
                            sub_type = '正常退房(退房租退押金)';
                            break;
                        case 2:
                            sub_type = '违约退房(退房租不退押金)';
                            break;
                        case 3:
                            sub_type = '提前退房(只退押金)';
                            break;
                        case 4:
                            sub_type = '特殊退房(押金、房租全不退)';
                            break;
                    }
                    var billItems = obj.billItems || [],
                        addItems = [{
                        name: '退房类型',
                        val: sub_type
                        }];
                    $.each(billItems,function(k,v){
                        var addData = {
                            name: v.itemName,
                            val: v.itemFee
                        };
                        if (v.itemName == '收水费' || v.itemName == '收电费') {
                            addData.isEnergy = v;
                        }
                        if (v.type == 7) {//其他
                            addData.isRemark = v;
                        }
                        addItems.push(addData);
                    });
                    addItems.push({
                        name: '总计退款',
                        val: obj.billFeeStr,
                        singleLine: true
                    });
                    $.merge(list, addItems);
                    break;
                case 13:
                    var billItems = obj.billItems || [];
                    $.merge(list, [{
                        name: '应付时间',
                        val: obj.deadlineDateStr
                    },{
                        name: '支付类型',
                        val: renderServiceFeeType(obj.serviceFeeType)
                    }, {
                        name: '付款明细',
                        val: obj.serviceMonthStr,
                        isNewLine: true
                    },{
                        name: '账单金额',
                        val: billItems[0].originalFee || billItems[0].itemFee
                    },{
                        name: '优惠金额',
                        val: billItems[0].discountFee || '0.00'
                    },{
                        name: '实收金额',
                        val: billItems[0].itemFee
                    }]);
                    break;
                default:
                    var billItems = obj.billItems || [];
                    if (obj.feeType != 11) {
                        list.push({
                            name: '应付时间',
                            val: obj.deadlineDateStr
                        });
                    }
                    $.merge(list, [{
                        name: '账单金额',
                        val: billItems[0].originalFee || billItems[0].itemFee
                    }, {
                        name: '优惠金额',
                        val: billItems[0].discountFee || '0.00'
                    },{
                        name: '实收金额',
                        val: billItems[0].itemFee
                    }]);
                    console.log(list)
                    break;
            }
            if (obj.feeType != 12) {
                list.push({
                    name: '备注内容',
                    val: obj.desc,
                    singleLine: true
                });
            }
            
            return list;
        },
        scaleImg: {  //图片缩放
            initImg: function (options) {
                var self = this;
                var defaultOpt = {
                    el: document.body,
                    area: ["20", "20"],
                    author: "Bolin"
                };
                var isArray = options instanceof Array;
                if (isArray) {
                    $.each(options, function (k, v) {
                        var _options = $.extend({}, defaultOpt, v);
                        self.imgLoader(_options);
                    });
                } else {
                    var _options = $.extend({}, defaultOpt, options);
                    self.imgLoader(_options);
                }
            },
            //递归判断图片加载完成
            imgLoader: function (param) {
                var t_img,
                    isLoad = true;
                var self = this;
                isImgLoad();
                function isImgLoad() {
                    $.each(param.el, function (k, v) {
                        if (!v.complete) {
                            isLoad = false;
                            return false;
                        }
                    });
                    if (isLoad) {
                        clearTimeout(t_img);
                        self.renderImg(param);
                    } else {
                        isLoad = true;
                        t_img = setTimeout(function () {
                            isImgLoad();
                        }, 300);
                    }
                }
            },
            //等比例缩放
            renderImg: function (param) {
                var elList = param.el,
                    area = param.area;
                var self = this;
                $.each(elList, function (k, v) {
                    //创建模糊图层并插入
                    //self.mountImage(v);

                    //获取img实际尺寸
                    var naturalHeight = v.height,
                        naturalWidth = v.width;

                    //比例计算
                    var naturalScale = naturalWidth / naturalHeight,
                        areaScale = area[0] / area[1];

                    //宽高比例
                    var scale_h = (1 / naturalScale) * area[0],
                        scale_w = naturalScale * area[1];

                    //原始比例>显示比例
                    if (naturalScale > areaScale) {
                        if (scale_w >= scale_h) {
                            self.renderW(v, area, naturalScale);
                        } else {
                            self.renderH(v, area, naturalScale);
                        }
                    } else if (naturalScale == areaScale) {
                        v.width = area[0];
                        v.height = area[1];
                    } else {
                        if (scale_w <= scale_h) {
                            self.renderW(v, area, naturalScale);
                        } else {
                            self.renderH(v, area, naturalScale);
                        }
                    }
                });
            },
            mountImage: function (target) {
                var previewImg = new Image();
                previewImg.src = target.src;
                target.before(previewImg);
                previewImg.classList.add("previewImg");

                //父级元素相对定位
                $(target).parents().eq(0).css("position", "relative");
                target.classList.add("originImg");
                target.addEventListener('animationend', function () {
                    previewImg.classList.remove('previewImg');
                    previewImg.classList.add('hide');
                });
            },
            //reset margin
            resetImg: function (target) {
                target.style.marginLeft = 0;
                target.style.marginTop = 0;
            },
            //缩放回调
            renderW: function (v, area, naturalScale) {
                this.resetImg(v);
                v.width = naturalScale * area[0];
                v.height = area[1];
                //尺寸<容器  放大处理
                if (v.width <= area[0]) {
                    v.width = area[0];
                    v.height = area[0] / naturalScale;
                    v.style.marginTop = -((v.height - area[1]) / 2) + "px";
                } else {
                    v.style.marginLeft = -((v.width - area[0]) / 2) + "px";
                }
            },
            renderH: function (v, area, naturalScale) {
                this.resetImg(v);
                v.width = area[0];
                v.height = area[0] / naturalScale;
                if (v.height <= area[1]) {
                    v.height = area[1];
                    v.width = naturalScale * area[1];
                    v.style.marginLeft = -((v.width - area[0]) / 2) + "px";
                } else {
                    v.style.marginTop = -((v.height - area[1]) / 2) + "px";
                }
            }
        },
        switchChoice: {  //switch
            init: function () {
                var self = this;
                var initDom = "<span class='slider-swicth_box'></span>\
                                <span class='txt-swicth_box'></span>";
                var switchInput = $('input.tools_switch');
                if (switchInput == 0) {
                    return;
                }
                $.each(switchInput, function () {
                    var targetFlag = $(this).attr('switchFlag').toUpperCase(),
                        isDisabled = $(this).attr('disabled');
                    var itemClass = targetFlag === "ON" ? "switch-on" : "switch-off";
                    if (isDisabled === 'disabled') {
                        itemClass += ' switch-disabled';
                    }
                    var item = '<span class="' + itemClass + '">' + initDom + '</span>';
                    $(this).hide().before(item);
                });
                $("span[class^=switch]").click(function () {
                    if ($(this).hasClass("switch-disabled")) {
                        return;
                    }
                    if ($(this).hasClass("switch-on")) {
                        self.showOff(this);
                    } else {
                        self.showOn(this);
                    }
                });
                self.renderSwitch();
            },
            renderSwitch: function () {
                var self = this;
                var switchItems = $("span[class^=switch]");
                if (switchItems.length <= 0) {
                    return;
                }
                $.each(switchItems, function () {
                    if ($(this).hasClass("switch-on")) {
                        if ($(this).hasClass("switch-disabled")) {
                            self.showDisabled(this, ['ON','开启']);
                            return;
                        }
                        self.showOn(this);
                    } else {
                        if ($(this).hasClass("switch-disabled")) {
                            self.showDisabled(this, ['OFF','关闭']);
                            return;
                        }
                        self.showOff(this);
                    }
                });
            },
            showDisabled: function (ele, txt) {
                $(ele).find('.txt-swicth_box')
                    .attr('data-text',txt[0])
                    .text(txt[1]);
            },
            showOn: function (ele) {
                $(ele)
                    .removeClass("switch-off")
                    .addClass("switch-on")
                    .find('.txt-swicth_box')
                    .attr('data-text','ON')
                    .text('开启');
                $(ele).next('input.tools_switch').prop('checked', true).change();
            },
            showOff: function (ele) {
                $(ele)
                    .removeClass("switch-on")
                    .addClass("switch-off")
                    .find('.txt-swicth_box')
                    .attr('data-text','OFF')
                    .text('关闭');
                $(ele).next('input.tools_switch').prop('checked', false).change();
            }
        },
        backTop: function (btnId) {  //返回顶部
            var btn = document.getElementById(btnId),
                dom = document.documentElement,
                body = document.body;
            btn.style.display = "none";
            btn.onclick = function () {
                btn.style.display = "none";
                window.onscroll = null;
                this.timer = setInterval(function () {
                    dom.scrollTop -= Math.ceil((dom.scrollTop + body.scrollTop) * 0.1);
                    body.scrollTop -= Math.ceil((dom.scrollTop + body.scrollTop) * 0.1);
                    if ((dom.scrollTop + body.scrollTop) == 0) {
                        clearInterval(btn.timer, window.onscroll = set);
                    }
                }, 10);
            };
            window.onscroll = set;
            function set() {
                btn.style.display = (dom.scrollTop + body.scrollTop > 100) ? 'block' : "none"
            }
        },
        getUrlData: function () {   //url search 数据
            var queryStr = decodeURIComponent(location.search);
            var queryUrlData = {};
            if (queryStr.indexOf("?") != -1) {
                var strs = (queryStr.substr(1)).split("&");
                for (var i = 0; i < strs.length; i++) {
                    queryUrlData[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
                }
            }
            return queryUrlData;
        },
        formTypeChange: function (form, type) { //form切换编辑状态
            var dataType = Object.prototype.toString.call(form);
            var _forms = [];
            if (dataType === "[object Array]") {
                _forms = form;
            } else {
                _forms = [form];
            }
            for (var j = 0; j < _forms.length; j++) {
                var targetForm = _forms[j][0];
                if (targetForm) {
                    for (var i = 0; i < targetForm.length; i++) {
                        type = type || false;
                        targetForm.elements[i].disabled = type;
                    }
                }
               
            }
        },
        sortItems: function(options) {  //排序
            var settings = $.extend(true, {
                start: function(){},
                end: function(){},
                elements: $('.pic-item .sortItem'),
                itemLength: 0
            }, options);
            function Pointer(x, y) {
                this.x = x;
                this.y = y;
            }

            function Position(left, top) {
                this.left = left;
                this.top = top;
            }
            settings.elements.each(function(i) {
                this.init = function() { // 初始化
                    this.box = $(this).parent();
                    $(this).attr("index", i*1 + settings.itemLength*1).css({
                        position: "absolute",
                        left: this.box[0].offsetLeft,
                        top: this.box[0].offsetTop,
                        width: this.box[0].offsetWidth,
                        height: this.box[0].offsetHeight,
                        border: '1px solid #c0ccda'
                    }).appendTo(".picList");
                    this.drag();
                },
                this.move = function(callback) { // 移动
                    $(this).stop(true).animate({
                        left: this.box[0].offsetLeft,
                        top: this.box[0].offsetTop
                    }, 500, function() {
                        if (callback) {
                            callback.call(this);
                        }
                    });
                },
                this.collisionCheck = function() {
                    var currentItem = this;
                    var direction = null;
                    $(this).siblings(".sortItem").each(function() { 
                        // 水平方向和垂直方向偏移
                        if(currentItem.pointer.x > this.box.offset().left &&
                            currentItem.pointer.y > this.box.offset().top &&
                            (currentItem.pointer.x < this.box.offset().left + this.box.width()) &&
                            (currentItem.pointer.y < this.box.offset().top + this.box.height())
                        ){
                            // 返回对象和方向
                            if (currentItem.box[0].offsetTop < this.box[0].offsetTop) {
                                direction = "down";
                            } else if (currentItem.box[0].offsetTop > this.box[0].offsetTop) {
                                direction = "up";
                            } else {
                                direction = "normal";
                            }
                            this.swap(currentItem, direction);
                        }
                    });
                },
                this.swap = function(currentItem, direction) { // 交换位置
                    var directions = {
                        normal: function() {
                            var saveBox = this.box;
                            this.box = currentItem.box;
                            currentItem.box = saveBox;
                            this.move();
                            $(this).attr("index", this.box.index());
                            $(currentItem).attr("index", currentItem.box.index());
                        },
                        down: function() {
                            // 移到下方
                            var box = this.box;
                            var node = this;
                            var startIndex = currentItem.box.index();
                            var endIndex = node.box.index();;
                            for (var i = endIndex; i > startIndex; i--) {
                                var prevNode = $(".picList .sortItem[index=" + (i - 1) + "]")[0];
                                node.box = prevNode.box;
                                $(node).attr("index", node.box.index());
                                node.move();
                                node = prevNode;
                            }
                            currentItem.box = box;
                            $(currentItem).attr("index", box.index());
                        },
                        up: function() {
                            // 移到上方
                            var box = this.box;
                            var node = this;
                            var startIndex = node.box.index();
                            var endIndex = currentItem.box.index();;
                            for (var i = startIndex; i < endIndex; i++) {
                                var nextNode = $(".picList .sortItem[index=" + (i + 1) + "]")[0];
                                node.box = nextNode.box;
                                $(node).attr("index", node.box.index());
                                node.move();
                                node = nextNode;
                            }
                            currentItem.box = box;
                            $(currentItem).attr("index", box.index());
                        }
                    }
                    directions[direction].call(this);
                },
                this.drag = function() { // 拖拽
                    var oldPosition = new Position();
                    var oldPointer = new Pointer();
                    var isDrag = false;
                    var currentItem = null;
                    $(this).mousedown(function(e) {
                        e.preventDefault();
                        if (e.target.localName == 'i') { //操作按钮，防止误操作
                            return false;
                        }
                        oldPosition.left = $(this)[0].offsetLeft;
                        oldPosition.top = $(this)[0].offsetTop;
                        oldPointer.x = e.clientX;
                        oldPointer.y = e.clientY;
                        isDrag = true;
                        currentItem = this;
                        settings.start.call(this);
                    });
                    $(this).parents('.picList').mousemove(function(e) {
                        var currentPointer = new Pointer(e.clientX, e.clientY);
                        if (!isDrag) return false;
                        $(currentItem).css({
                            "opacity": "0.8",
                            "z-index": 999
                        });
                        var left = currentPointer.x - oldPointer.x + oldPosition.left;
                        var top = currentPointer.y - oldPointer.y + oldPosition.top;
                        $(currentItem).css({
                            left: left,
                            top: top
                        });
                        currentItem.pointer = currentPointer;
                        // 开始交换位置
                        currentItem.collisionCheck();
                    });
                    $(this).parents('.picList').mouseup(function() {
                        if (!isDrag) return false;
                        isDrag = false;
                        currentItem.move(function() {
                            $(this).css({
                                "opacity": "1",
                                "z-index": 0
                            });
                        });
                        settings.end.call(this);
                    });
                }
                this.init();
            });
        },
        watermark: function(options,callback) { //图片水印
            var defaults = {
                watermark: '',
                fontStyle: 'Arial',
                fontSize: '30',
                fontColor: 'black',
                fontX: 10,
                fontY: 50,
                canvas: ''
            };
            var settings = $.extend(defaults, options);
            var img = new Image(),
                _img = new Image();
            _img.src = "/hms/images/watermark.png";
            _img.onload = function () {
                /*var _canvas = settings.canvas.getContext('2d');
                _canvas.drawImage(img, 0, 0, 100, 38);
                //_canvas.globalAlpha = 1;
                var markW = settings.canvas.width / 5,
                    markH = markW * (19 / 50);
                _canvas.drawImage(_img, settings.canvas.width - markW - 10, settings.canvas.height - markH - 5, markW, markH);
                if(settings.watermark != ''){
                    _canvas.font = settings.fontSize + 'px ' + settings.fontStyle;
                    _canvas.fillStyle = settings.fontColor;
                    _canvas.fillText(settings.watermark, settings.fontX, settings.fontY);
                }
                callback(_canvas.canvas);*/
                callback(settings.canvas);
            };
        }
    }
})();