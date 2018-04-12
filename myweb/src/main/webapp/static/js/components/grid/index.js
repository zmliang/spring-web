/**
 可展开写法：
 跟dataType同级，添加expandable属性为true
 添加 expandCellTemplate 方法，入参obj，每一行的数据，返回一个list
 [{
 	name: 'xxx',
 	val: 'xxxxx',
 	singleLine: false (default)
 }]

 colModel添加一格: {type:"expander"} 用于显示加减号
 参见develop.js
 **/

define(function(require, exports, module) {
    require("./index.css");
    require("tools");
    require('layer');
    require('select2');

    var browser = $.browser
    if (!browser) {
        function uaMatch(ua) {
            ua = ua.toLowerCase();
            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
            return {
                browser: match[1] || "",
                version: match[2] || "0"
            };
        };

        var matched = uaMatch(navigator.userAgent);
        browser = {};

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }

        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }
    }

    if (typeof $.support.selectstart != 'function') {
        $.support.selectstart = "onselectstart" in document.createElement("div");
    }

    if (typeof $.fn.disableSelection != 'function') {
        $.fn.disableSelection = function() {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
                ".ui-disableSelection",
                function(event) {
                    event.preventDefault();
                });
        };
    }
    var grid = function(t, p) {
            this.init.call(this, t, p);
        },
        fire = require("../fire.js");
    $.extend(grid.prototype, fire, {
        init: function(t, p) {
            var self = this;
            if (t.grid) return false;
            p = $.extend({
                btnColorStyle: '', //按钮风格
                height: 200, //高度
                width: 'auto', //宽度
                striped: true, //隔行换色
                novstripe: false, //表格边框
                minwidth: 30, //最小宽度
                minheight: 80, //最小高度
                resizable: false, //宽度调整
                url: false, //数据请求接口
                method: 'POST', //请求方式
                dataType: 'xml',
                errormsg: '连接错误', //错误提示
                usepager: false, //分页
                nowrap: true, //不换行
                pageNo: 1, //当前页码
                records: 1, //总数据
                useRp: true, //单页显示数量选择
                rp: 20, //单页显示数量
                fixed: false, //是否开启固定列悬浮
                rpOptions: [10, 15, 20, 30, 50, 100], //单页数量选择组
                title: false, //表头
                idProperty: 'id',
                pagestat: '共 {records} 条'
                    /*'显示第&nbsp;{from}&nbsp;条至第&nbsp;{to}&nbsp;条，共 {records} 条数据'*/
                    ,
                pagetext: '跳至',
                outof: '共',
                findtext: 'Find',
                searchParam: [], //新增的搜索条件
                turnPageData: { 'nameList': [], 'result': [], pageNo: 1, records: 10 }, //翻页保存
                params: [], //搜索条件
                procmsg: '数据加载中，请稍后 ...',
                query: '',
                qtype: '',
                nomsg: '无数据',
                minColToggle: 1,
                showToggleBtn: false, //显隐切换
                hideOnSubmit: true,
                autoload: true,
                blockOpacity: 0.2, //加载时bDiv的透明层
                // preProcess: false,
                format: false, //数据预处理
                addTitleToCell: false,
                dblClickResize: false,
                onDragCol: false,
                onToggleCol: false,
                onChangeSort: false,
                onDoubleClick: false,
                onsaveCol: false,
                onSuccess: false,
                onError: false,
                expandable: false,
                onSubmit: false, //using a custom populate function
                __mw: { //extendable middleware function holding object
                    datacol: function(p, col, val) { //middleware for formatting data columns

                        var _col = (typeof p.datacol[col] == 'function') ? p.datacol[col](val) : val; //format column using function
                        if (typeof p.datacol['*'] == 'function') { //if wildcard function exists
                            return p.datacol['*'](_col); //run wildcard function
                        } else {
                            return _col; //return column without wildcard
                        }
                    }
                },
                getGridClass: function(g) { //get the grid class, always returns g
                    return g;
                },
                datacol: {}, //datacol middleware object 'colkey': function(colval) {}
                colResize: false, //拖动修改宽度
                singleSelect: true,
                colMove: false
            }, p);
            p.colResize = false;
            p.colMove = false;
            $(t).show() //show if hidden
                .attr({
                    cellPadding: 0,
                    cellSpacing: 0,
                    border: 0
                }) //remove padding and spacing
                .removeAttr('width'); //remove width properties
            //create grid class
            var currentData = [],
                fixArr = { //悬浮数据数组
                    left: [],
                    right: []
                };
            var timer = null;
            var g = {
                hset: {},
                rePosDrag: function() {
                    var cdleft = 0 - this.hDiv.scrollLeft;
                    if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
                    $(g.cDrag).css({
                        top: g.hDiv.offsetTop + 1
                    });
                    var cdpad = this.cdpad;
                    var cdcounter = 0;
                    $('div', g.cDrag).hide();
                    $('thead tr:first th:visible', this.hDiv).each(function() {
                        var n = $('thead tr:first th:visible', g.hDiv).index(this);
                        var cdpos = parseInt($('div', this).width());
                        if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
                        cdpos = cdpos + cdleft + cdpad;
                        if (isNaN(cdpos)) {
                            cdpos = 0;
                        }
                        $('div:eq(' + n + ')', g.cDrag).css({
                            'left': (!(browser.mozilla) ? cdpos : cdpos) + 'px'
                        }).show();
                        cdleft = cdpos;
                        cdcounter++;
                    });
                },
                fixHeight: function(newH) {
                    newH = false;
                    if (!newH) newH = $(g.bDiv).height();
                    var hdHeight = $(this.hDiv).height();
                    $('div', this.cDrag).each(
                        function() {
                            $(this).height(newH + hdHeight);
                        }
                    );
                    var nd = parseInt($(g.nDiv).height(), 10);
                    if (nd > newH) $(g.nDiv).height(newH).width(200);
                    else $(g.nDiv).height('auto').width('auto');
                    $(g.block).css({
                        height: newH,
                        marginBottom: (newH * -1)
                    });
                    var hrH = g.bDiv.offsetTop + newH;
                    if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
                    $(g.rDiv).css({
                        height: hrH
                    });
                },
                dragStart: function(dragtype, e, obj) { //default drag function start
                    if (dragtype == 'colresize' && p.colResize === true) { //column resize
                        $(g.nDiv).hide();
                        $(g.nBtn).hide();
                        var n = $('div', this.cDrag).index(obj);
                        var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
                        $(obj).addClass('dragging').siblings().hide();
                        $(obj).prev().addClass('dragging').show();
                        this.colresize = {
                            startX: e.pageX,
                            ol: parseInt(obj.style.left, 10),
                            ow: ow,
                            n: n
                        };
                        $('body').css('cursor', 'col-resize');
                    } else if (dragtype == 'vresize') { //table resize
                        var hgo = false;
                        $('body').css('cursor', 'row-resize');
                        if (obj) {
                            hgo = true;
                            $('body').css('cursor', 'col-resize');
                        }
                        this.vresize = {
                            h: p.height,
                            sy: e.pageY,
                            w: p.width,
                            sx: e.pageX,
                            hgo: hgo
                        };
                    } else if (dragtype == 'colMove') { //column header drag
                        $(e.target).disableSelection(); //disable selecting the column header
                        if ((p.colMove === true)) {
                            $(g.nDiv).hide();
                            $(g.nBtn).hide();
                            this.hset = $(this.hDiv).offset();
                            this.hset.right = this.hset.left + $('table', this.hDiv).width();
                            this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
                            this.dcol = obj;
                            this.dcoln = $('th', this.hDiv).index(obj);
                            this.colCopy = document.createElement("div");
                            this.colCopy.className = "colCopy";
                            this.colCopy.innerHTML = obj.innerHTML;
                            if (browser.msie) {
                                this.colCopy.className = "colCopy ie";
                            }

                            var objAlign = cm.textAlign || 'left';
                            $(obj).attr('align', objAlign);

                            $(this.colCopy).css({
                                position: 'absolute',
                                float: 'left',
                                display: 'none',
                                textAlign: obj.align
                            });
                            $('body').append(this.colCopy);
                            $(this.cDrag).hide();
                        }
                    }
                    $('body').noSelect();
                },
                dragMove: function(e) {
                    if (this.colresize) { //column resize
                        var n = this.colresize.n;
                        var diff = e.pageX - this.colresize.startX;
                        var nleft = this.colresize.ol + diff;
                        var nw = this.colresize.ow + diff;
                        if (nw > p.minwidth) {
                            $('div:eq(' + n + ')', this.cDrag).css('left', nleft);
                            this.colresize.nw = nw;
                        }
                    } else if (this.vresize) { //table resize
                        var v = this.vresize;
                        var y = e.pageY;
                        var diff = y - v.sy;
                        if (!p.defwidth) p.defwidth = p.width;
                        if (p.width != 'auto' && !p.nohresize && v.hgo) {
                            var x = e.pageX;
                            var xdiff = x - v.sx;
                            var newW = v.w + xdiff;
                            if (newW > p.defwidth) {
                                this.gDiv.style.width = newW + 'px';
                                p.width = newW;
                            }
                        }
                        var newH = v.h + diff;
                        if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
                            this.bDiv.style.height = newH + 'px';
                            p.height = newH;
                            this.fixHeight(newH);
                        }
                        v = null;
                    } else if (this.colCopy) {
                        $(this.dcol).addClass('thMove').removeClass('thOver');
                        if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
                            //this.dragEnd();
                            $('body').css('cursor', 'move');
                        } else {
                            $('body').css('cursor', 'pointer');
                        }
                        $(this.colCopy).css({
                            top: e.pageY + 10,
                            left: e.pageX + 20,
                            display: 'block'
                        });
                    }
                },
                dragEnd: function() {
                    if (this.colresize) {
                        var n = this.colresize.n;
                        var nw = this.colresize.nw;
                        $('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
                        var overth_title = $('th:visible div:eq(' + n + ')', this.hDiv).text();
                        if (p.colModel != undefined) {
                            var exitTitle = false;
                            $.each(p.colModel, function(oi, oj) {
                                if (oj.display == overth_title) {
                                    oj.width = nw;
                                    exitTitle = true;
                                    return false;
                                }
                            });
                            if (!exitTitle) {
                                p.colModel[n]["width"] = nw;
                            }
                        }
                        $('tr', this.bDiv).each(
                            function() {
                                var $tdDiv = $('td:visible div:eq(' + n + ')', this);
                                if (!$tdDiv.hasClass('expandBox'))
                                    $tdDiv.css('width', nw);
                                g.addTitleToCell($tdDiv);
                            }
                        );
                        this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                        $('div:eq(' + n + ')', this.cDrag).siblings().show();
                        $('.dragging', this.cDrag).removeClass('dragging');
                        this.rePosDrag();
                        this.fixHeight();
                        this.colresize = false;
                        if ($.cookies) {
                            var name = p.colModel[n].name; // Store the widths in the cookies
                            $.cookie('flexiwidths/' + name, nw);
                        }
                    } else if (this.vresize) {
                        this.vresize = false;
                    } else if (this.colCopy) {
                        $(this.colCopy).remove();

                        if (this.dcolt !== null) {
                            if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
                            else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
                            this.switchCol(this.dcoln, this.dcolt);
                            $(this.cdropleft).remove();
                            $(this.cdropright).remove();
                            this.rePosDrag();
                            if (p.onDragCol) {
                                p.onDragCol(this.dcoln, this.dcolt);
                            }
                        }
                        this.dcol = null;
                        this.hset = null;
                        this.dcoln = null;
                        this.dcolt = null;
                        this.colCopy = null;
                        $('.thMove', this.hDiv).removeClass('thMove');
                        $(this.cDrag).show();
                    }
                    $('body').css('cursor', 'default');
                    $('body').noSelect(false);
                },
                toggleCol: function(cid, visible) {
                    var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
                    var n = $('thead th', g.hDiv).index(ncol);
                    var cb = $('input[value=' + cid + ']', g.nDiv)[0];
                    if (visible == null) {
                        visible = ncol.hidden;
                    }
                    if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
                        return false;
                    }
                    if (visible) {
                        ncol.hidden = false;
                        $(ncol).show();
                        cb.checked = true;
                        if (typeof p.colModel != "undefined") {
                            p.colModel[n].hide = false;
                        }
                    } else {
                        ncol.hidden = true;
                        $(ncol).hide();
                        cb.checked = false;
                        if (typeof p.colModel != "undefined") {
                            p.colModel[n].hide = true;
                        }
                    }
                    $('tbody tr', t).each(
                        function() {
                            if (visible) {
                                $('td:eq(' + n + ')', this).show();
                            } else {
                                $('td:eq(' + n + ')', this).hide();
                            }
                        }
                    );
                    this.rePosDrag();
                    if (p.onToggleCol) {
                        p.onToggleCol(cid, visible);
                    }
                    return visible;
                },
                swap: function(array, a, b) {
                    if (a && b) {
                        var cacheSave = array[a];
                        //array[a] = array[b];
                        //array[b] = cacheSave;
                        array.splice(a, 1);
                        array.splice(b, 0, cacheSave);
                        return array;
                    } else {
                        return array;
                    }
                },
                switchCol: function(cdrag, cdrop) { //switch columns
                    $('tbody tr', t).each(
                        function() {
                            if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
                            else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
                        }
                    );
                    //switch order in nDiv
                    if (cdrag > cdrop) {
                        $('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
                    } else {
                        $('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
                    }
                    if (browser.msie && browser.version < 7.0) {
                        $('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
                    }
                    if (typeof p.colModel != "undefined") {
                        p.colModel = this.swap(p.colModel, cdrag, cdrop);
                    }
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                },
                scroll: function() {
                    if (p.fixed) {
                        $(g.gDiv).find('.fixDiv .bDiv').off('scroll').scrollTop(this.bDiv.scrollTop);

                        clearTimeout(timer);

                        timer = setTimeout(function() {
                            $(g.gDiv).find('.fixDiv .bDiv').on("scroll", g.fixedScroll);
                        }, 300);
                    }
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                    this.rePosDrag();
                },
                fixedScroll: function(e) {
                    $(g.gDiv).children('.bDiv').off('scroll').scrollTop($(this).scrollTop());

                    clearTimeout(timer);

                    timer = setTimeout(function() {
                        $(g.gDiv).children('.bDiv').on("scroll", g.scroll.bind(g));
                    }, 300);
                },
                addData: function(data) { //parse data
                    self.Data = data;
                    if (p.dataType == 'json') {
                        if (data.result == undefined) {
                            data.result = data.dataObject;
                        }
                        data = $.extend({ result: [], pageNo: 1, records: 1 }, data);
                    }
                    $('.pReload', this.pDiv).removeClass('loading');
                    this.loading = false;
                    if (!data) {
                        $('.pPageStat', this.pDiv).html(p.errormsg);
                        if (p.onSuccess)
                            p.onSuccess(this, self.Data);
                        return false;
                    }
                    if ((!data.result || data.result.length === 0) && p.onSuccess){
                        p.onSuccess(this, self.Data);
                    }
                    if (p.dataType == 'xml') {
                        p.records = +$('rows total', data).text();
                    } else {
                        p.records = data.records;
                    }
                    if (p.records === 0 || p.records === -1) {
                        $('tr, a, td, div', t).unbind();
                        $(t).html('<div class="noDataImg"></div>');
                        p.pages = 1;
                        p.pageNo = 1;
                        this.buildpager();
                        this.pagerHTML();
                        if (p.fixed) {
                            $('.fixDiv', g.gDiv).remove();
                        }
                        if (p.onError) { // 添加错误的回调
                            p.onError(this, self.Data);
                        }
                        //解决方案：统计信息在查询接口返回数据时，数据result为空情况下，继续统计返回页面
                        if (p.format) {
                            return p.format(data.result, data);
                        }
                        return false;
                    }
                    p.pages = Math.ceil(p.records / p.rp);
                    if (p.dataType == 'xml') {
                        p.pageNo = +$('rows page', data).text();
                    } else {
                        p.pageNo = data.pageNo;
                    }

                    this.pagerHTML(); //分页

                    this.buildpager();
                    var tbody = document.createElement('table');
                    p.selectQueue = [];

                    if (p.dataType == 'json') {
                        currentData = p.format ? p.format(data.result, data) : data.result;
                        var turnPageName = null;
                        if (p.turnPageSave) {
                            turnPageName = p.turnPageSave.turnName;
                        }
                        $("[multibox]", g.hDiv).attr("checked", false);
                        $.each(currentData, function(i, row) {
                            var tr = document.createElement('tr');
                            var jtr = $(tr);

                            if (row.name) tr.name = row.name;
                            if (row.color) {
                                jtr.css('background', row.color);
                            } else {
                                if (i % 2 && p.striped) tr.className = 'erow';
                            }
                            if (row[p.idProperty]) {
                                tr.id = 'row' + row[p.idProperty];
                                jtr.attr('data-id', row[p.idProperty]);
                            }

                            $('thead tr:first th', g.hDiv).each(function() {
                                var td = document.createElement('td'),
                                    idx = $(this).attr('axis').substr(3),
                                    isHide = p.colModel[idx].direction ? true : false,
                                    pType = p.colModel[idx].type,
                                    pTag = p.colModel[idx].tagName;

                                var thWidth = this.textArea || 'auto',
                                    thAlign = this.textAlign || 'left';
                                $(th).width(thWidth);
                                $(th).attr('align', thAlign);
                                td.align = thAlign;
                                if (p.colModel[idx].custWidth) {
                                    td.width = this.width //p.colModel[idx].width;
                                }
                                if (p.fixed && isHide) {
                                    $(td).addClass('is-hidden')
                                }
                                if (p.colModel[idx].rowspan) { // 是一个多行的表格
                                    if (!row['rowspan']) {
                                        return;
                                    }
                                    if (row['rowspan'] > 1) {
                                        td.rowSpan = row['rowspan'];
                                    }
                                }
                                if (pType == "sed") {
                                    var ischecked = false;
                                    if (turnPageName) {
                                        $.each(p.turnPageData.nameList, function(lx, ly) {
                                            if (row[turnPageName] == ly) {
                                                ischecked = true;
                                                p.selectQueue.push(i);
                                                return;
                                            }
                                        })
                                    }
                                    if (p.showSed && row.stockNo == 0) {
                                        td.innerHTML = "";
                                    } else if (p.allowSedCheckParam) {
                                        var currentValue = row[p.allowSedCheckParam.name];
                                        if (currentValue == p.allowSedCheckParam.value) {
                                            td.innerHTML = "<input type='checkbox' sedIndex='" + i + "' " + (ischecked ? 'checked' : '') + ">";
                                        } else {
                                            td.innerHTML = '-';
                                        }
                                    } else {
                                        td.innerHTML = "<input type='checkbox' sedIndex='" + i + "' " + (ischecked ? 'checked' : '') + ">";
                                    }
                                } else if (pType == "radio") {

                                    td.innerHTML = "<input type='radio' name='sedOne' sedIndex='" + i + "'/>";
                                } else if (pType == "sort") {
                                    var pageNum = (p.pageNo - 1) * p.rp + i * 1 + 1;
                                    if (row['ownPage']) // 为多行表格的计数器进行自定义
                                        pageNum = row['ownPage'];
                                    td.innerHTML = pageNum;
                                } else if (pType == "expander") {
                                    var expander = '<span class="expandMarker">&nbsp;&nbsp;&nbsp;<i class="triangleIcon"></i></span>';
                                    $(td).addClass('toggleTag');
                                    td.innerHTML = expander;
                                } else if (pType == "checkbox") {
                                    var checkboxHtml = '<input ' + p.colModel[idx].checked + ' class="checkboxInput" type="checkbox" disabled>';
                                    td.innerHTML = checkboxHtml;
                                } else if (pType == "show") {
                                    var color_style = '';
                                    if (p.colModel[idx].setcolor != undefined) {
                                        color_style = 'style="color:' + p.colModel[idx].setcolor + '"';
                                    }
                                    td.innerHTML = "<span class='edit-span " + p.colModel[idx].setclass + "_show' rowIndex='" + i + "' key='" + p.colModel[idx].name + "' " + color_style + ">" + row[p.colModel[idx].name] + "</span>";
                                } else if (pType == "modify") {
                                    var modStr = "";
                                    $.each(p.colModel[idx].name, function(k, m) {
                                        $.each(p.colModel[idx].modifySet.options, function(o, j) {
                                            var btnStyle = '';
                                            if (j.btnColorStyle) {
                                                btnStyle = j.btnColorStyle;
                                            } else {
                                                if (j.display.indexOf('编辑') > -1 ||
                                                    j.display.indexOf('授权') > -1) {
                                                    btnStyle = 'mj';
                                                } else if (j.display.indexOf('删除') > -1 ||
                                                    j.display.indexOf('撤销') > -1) {
                                                    btnStyle = 'danger';
                                                } else if (j.display.indexOf('设置') > -1 ||
                                                    j.display.indexOf('发布') > -1) {
                                                    btnStyle = 'success';
                                                } else if (j.display.indexOf('查看') > -1 ||
                                                    j.display.indexOf('信息') > -1 ||
                                                    j.display.indexOf('资料') > -1) {
                                                    btnStyle = 'info';
                                                } else if (j.display.indexOf('密码') > -1 ||
                                                    j.display.indexOf('账号') > -1) {
                                                    btnStyle = 'warning';
                                                }
                                            }

                                            if (j.setname == m) {
                                                var endtrue = true;
                                                var numHtml = j.hasNum ? '(' + row[j.hasNum] + ')' : '';
                                                var dropMenu = '';
                                                if (j.alwayshow) {
                                                    if (j.dropConfig) {
                                                        var _dataType = Object.prototype.toString.call(j.dropConfig),
                                                            traversalObj = (_dataType === "[object Array]" ? j.dropConfig : row[j.dropConfig.obj]);
                                                        if (traversalObj.length <= 1) {
                                                            modStr += ("<button type='button' class='btn btn-" + btnStyle + " modify-btn' \
																key='" + j.name + "' rowIndex='" + i + "' idx='" + idx + "' mindex='" + o + "'>\
																<span style='display:inline-block;width:6px;'></span>" + j.display + numHtml + "<span style='display:inline-block;width:6px;'></span></button>");
                                                        } else {
                                                            modStr += '<span style="display:inline-block;position:relative;margin-left:5px;">';
                                                            modStr += ("<button type='button' class='btn btn-" + btnStyle + " modify-btn' \
																key='" + j.name + "' rowIndex='" + i + "' idx='" + idx + "' mindex='" + o + "'>\
																" + j.display + numHtml + "");
                                                            modStr += ' <span class="caret"></span></button>\
																<ul class="dropdown-menu" style="min-width:50px;left:0;border:0;box-shadow:4px 4px 40px rgba(0,0,0,.2)"><div class="btn-group-vertical">';
                                                            $.each(traversalObj, function(configIdx, configItem) {
                                                                var _configId = (_dataType === "[object Array]" ? configItem.id : row[j.dropConfig.id]),
                                                                    _configValue = (_dataType === "[object Array]" ? configItem.value : row[j.dropConfig.value]);
                                                                modStr += '<button class="btn" data-id="' + _configId + '" style="margin-left:0;">' + _configValue + '</button>';
                                                            });
                                                            modStr += '</div></ul></span>';
                                                        }
                                                    } else {
                                                        modStr += ("<button type='button' class='btn btn-" + btnStyle + " modify-btn' \
															key='" + j.name + "' rowIndex='" + i + "' idx='" + idx + "' mindex='" + o + "'>\
															<span style='display:inline-block;width:6px;'></span>" + j.display + numHtml + "<span style='display:inline-block;width:6px;'></span></button>");
                                                    }
                                                } else {
                                                    $.each(j.status.type, function(y, z) {
                                                        if (row[m] == z && endtrue) {
                                                            var addHtml = "<button type='button' class='btn btn-" + btnStyle + " modify-btn' \
																key='" + j.name + "' rowIndex='" + i + "' idx='" + idx + "' mindex='" + o + "'>\
																	<span style='display:inline-block;width:6px;'></span>" + j.display + numHtml + "<span style='display:inline-block;width:6px;'></span></button>";
                                                            if (j.status.index == 0) {
                                                                modStr = addHtml + modStr;
                                                            } else {
                                                                modStr += addHtml;
                                                            }
                                                            endtrue = false;
                                                        }
                                                    });
                                                    if (endtrue) {
                                                        if (j.endName != undefined) {
                                                            j.enddisplay = row[j.endName];
                                                        }
                                                        //enddisplay有值时
                                                        if ($.trim(j.enddisplay) != "") {
                                                            modStr += ("<button type='button' class='btn btn-disabled'>\
																<span style='display:inline-block;width:6px;'></span>" + j.enddisplay + numHtml + "<span style='display:inline-block;width:6px;'></span></button>");
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    });
                                    td.innerHTML = modStr;
                                } else if (pType == "link") {
                                    var linkElm = "<a href='javascript:;' key='" + p.colModel[idx].type + "' idx='" + idx + "' rowIndex='" + i + "' setname='" + p.colModel[idx].setname + "'>" + row[p.colModel[idx].name] + "</a>";
                                    td.innerHTML = linkElm;
                                } else if (pType == 'linkItem') {
                                    var btnOptions = p.colModel[idx].modifySet.options || [];
                                    var minW = btnOptions.length * 72 + 'px';
                                    var linkElm = '<div class="btn-group" style="min-width:' + minW + '">';
                                    $.each(btnOptions, function(o, j) {
                                        linkElm += "<button class='btn modify-btn' key='" + j.name + "' rowIndex='" + i + "' idx='" + idx + "' mindex='" + o + "'>" + j.display + "</button>";
                                    });
                                    linkElm += '</div>';
                                    td.innerHTML = linkElm;
                                } else if (pType == "img") {
                                    var width = (p.colModel[idx].modifySet.width) ? (p.colModel[idx].modifySet.width) : 25,
                                        height = (p.colModel[idx].modifySet.height) ? (p.colModel[idx].modifySet.height) : 25;
                                    var imgStr = "",
                                        isArrayFlag = row[p.colModel[idx].name] instanceof Array,
                                        imgSrc = isArrayFlag ? row[p.colModel[idx].name][0] : row[p.colModel[idx].name];
                                    if (imgSrc != "" && imgSrc) {
                                        var regionData = isArrayFlag ? row[p.colModel[idx].name].join(',') : row[p.colModel[idx].name];
                                        imgStr = "<span style='display:inline-block;width:" + width + "px;height:" + height + "px;margin:4px 0 0 0;padding:0;overflow:hidden;'>\
											<img src='" + imgSrc + "' alt='' title='' isArrayFlag=" + isArrayFlag + " regionData='" + regionData + "' \
											style='width:" + width + "px;height:" + height + "px;' imgClick/></span>";
                                    }
                                    td.innerHTML = imgStr;
                                } else if (pType == "desc") {
                                    var descElm = "<span key='" + p.colModel[idx].type + "' idx='" + idx + "' rowIndex='" + i + "' >" + row[p.colModel[idx].name] + "</span>";
                                    td.innerHTML = descElm;
                                } else if (pTag && (row[pTag] !== "" && row[pTag])) {
                                    var tagStyle = '',
                                        tagHtml = '',
                                        btnClass = p.colModel[idx].setClass || '',
                                        styles = p.colModel[idx].tagSettings;
                                    if (row[pTag] instanceof Array) {
                                        $.each(row[pTag], function(k, v) {
                                            var tagStyle = '';
                                            $.each(styles, function(kk, vv) {
                                                if (vv.value == v) {
                                                    tagStyle = vv.style;
                                                    return false;
                                                }
                                            });
                                            tagHtml += "<span class='mj-tag " + tagStyle + " " + btnClass + "'>" + v + "</span>";
                                        });
                                    } else {
                                        $.each(styles, function(k, v) {
                                            if (v.value == row[pTag]) {
                                                tagStyle = v.style;
                                                return false;
                                            }
                                        });
                                        tagHtml = "<span class='mj-tag " + tagStyle + " " + btnClass + "' key='" + p.colModel[idx].name + "' idx='" + idx + "' rowIndex='" + i + "' >" + row[p.colModel[idx].name] + "</span>";
                                    }
                                    td.innerHTML = tagHtml;
                                }
                                //批量替换现有状态
                                else if (row[p.colModel[idx].name] == "是" ||
                                    row[p.colModel[idx].name] == "启用" ||
                                    row[p.colModel[idx].name] == "已发布") {
                                    var tagHtml = "<span class='mj-tag mj-tag-success' key='" + p.colModel[idx].name + "' idx='" + idx + "' rowIndex='" + i + "' >" + row[p.colModel[idx].name] + "</span>";
                                    td.innerHTML = tagHtml;
                                } else if (row[p.colModel[idx].name] == "否" ||
                                    row[p.colModel[idx].name] == "停用" ||
                                    row[p.colModel[idx].name] == "禁用" ||
                                    row[p.colModel[idx].name] == '未发布') {
                                    var tagHtml = "<span class='mj-tag mj-tag-danger' key='" + p.colModel[idx].name + "' idx='" + idx + "' rowIndex='" + i + "' >" + row[p.colModel[idx].name] + "</span>";
                                    td.innerHTML = tagHtml;
                                } else {
                                    var colName = row[p.colModel[idx].name] === 0 ? '0' : row[p.colModel[idx].name];
                                    td.innerHTML = p.__mw.datacol(p, p.colModel[idx].name, colName || '');
                                }


                                // If the content has a <BGCOLOR=nnnnnn> option, decode it.
                                var offs = td.innerHTML.indexOf('<BGCOLOR=');
                                if (offs > 0) {
                                    $(td).css('background', text.substr(offs + 7, 7));
                                }

                                $(td).attr('abbr', $(this).attr('abbr'));
                                if ($(this)[0].hidden) {
                                    td.hidden = true;
                                }
                                $(tr).append(td);
                                td = null;
                            });

                            if ($('thead', this.gDiv).length < 1) { //handle if grid has no headers
                                for (idx = 0; idx < row.cell.length; idx++) {
                                    var td = document.createElement('td');
                                    // If the json elements aren't named (which is typical), use numeric order
                                    if (typeof row.cell[idx] != "undefined") {
                                        td.innerHTML = (row.cell[idx] != null) ? row.cell[idx] : ''; //null-check for Opera-browser
                                    } else {
                                        td.innerHTML = row.cell[p.colModel[idx].name];
                                    }
                                    $(tr).append(td);
                                    td = null;
                                }
                            }
                            jtr.attr("rowIndex", i);
                            $(tbody).append(tr);
                            if (p.expandable) {
                                var tr2 = document.createElement('tr');
                                var td2 = document.createElement('td');
                                $(td2).attr('class', 'expandable');

                                var html_t = '';
                                var list_t = p.expandCellTemplate(row);
                                if (list_t && list_t.length) {
                                    for (var i = 0; i < list_t.length; ++i) {
                                        var o_t = list_t[i];
                                        // var cls_w = o_t.width == '20%' ? 'style="width:;"' : '';
                                        var cls_t = o_t.singleLine ? 'full' : '';
                                        var cls_n = o_t.isNewLine ? 'style="width:66%;"' : o_t.width == '20%' ? 'style="width:20%;"' : '';
                                        o_t.val = (o_t.val === 0 ? '0.00' : (o_t.val || ''));
                                        var isEnergyHtm = '',
                                            energyData = [];
                                        if (o_t.isEnergy) {
                                            if (o_t.isEnergy.chargeType == 1) {
                                                energyData = [{
                                                    name: '计价收费',
                                                    val: ''
                                                }, {
                                                    name: '本次抄表',
                                                    val: o_t.isEnergy.thisNumber + ' ' + (o_t.isEnergy.thisReadingDateStr ? '【' + o_t.isEnergy.thisReadingDateStr + '】' : '') + ''
                                                }, {
                                                    name: '上次抄表',
                                                    val: o_t.isEnergy.lastNumber + ' ' + (o_t.isEnergy.lastReadingDateStr ? '【' + o_t.isEnergy.lastReadingDateStr + '】' : '') + ''
                                                }, {
                                                    name: '单价金额',
                                                    val: o_t.isEnergy.costPrice || '0'
                                                }, {
                                                    name: '总计',
                                                    val: o_t.isEnergy.itemFee || '0'
                                                }];
                                            } else {
                                                energyData = [{
                                                    name: '固定收费',
                                                    val: ''
                                                }, {
                                                    name: '总计',
                                                    val: o_t.isEnergy.itemFee || '0'
                                                }];
                                            }
                                            var tipsHtm = '';
                                            $.each(energyData, function(k, v) {
                                                var _name = v.val == '' ? v.name : (v.name + '：');
                                                tipsHtm += '<p>' + _name + (v.val || '') + '</p>'
                                            });
                                            isEnergyHtm = '<span class="btn btn-active" tips="' + tipsHtm + '"\
												style="padding:0;height:24px;line-height:22px;">详情</span>';
                                        }
                                        if (o_t.isRemark) {
                                            isEnergyHtm = '<span class="btn btn-active" tips="' + o_t.isRemark.itemRemark + '"\
                                                style="padding:0;height:24px;line-height:22px;">详情</span>';
                                        }
                                        html_t += '<div class="expandBox ' + cls_t + '" ' + cls_n + '>\
												<span class="expandLabel ellipsis" title="' + o_t.name + '">' + o_t.name + '：</span>\
												<span class="expandValue">' + o_t.val + '</span>\
												' + isEnergyHtm + '\
											</div>';
                                    }
                                }
                                td2.innerHTML = html_t;

                                $(td2).attr('colspan', p.colModel.length);
                                $(tr2).attr('style', 'display: none');
                                $(tr2).append(td2);
                                $(tbody).append(tr2);

                                $('body').unbind().on('mouseover', '.expandBox', function() {
                                    var self = $(this),
                                        elm = self.find('.expandValue'),
                                        tipsContent = elm.text();
                                    if (self.find('.btn').length > 0) {
                                        tipsContent = self.find('.btn').attr('tips');
                                        elm = self.find('.btn');
                                    } else if (elm[0].offsetWidth <= self[0].offsetWidth - self.find('.expandLabel')[0].offsetWidth - 30) {
                                        return false;
                                    }
                                    if (tipsContent == '' || !tipsContent) {
                                        return false;
                                    }
                                    layer.tips(tipsContent, elm, { tips: 3 });
                                }).on('mouseleave', '.expandBox', function() {
                                    layer.closeAll('tips');
                                });
                            }
                            tr = null;
                        });
                    } else if (p.dataType == 'xml') {
                        var i = 1;
                        $("rows row", data).each(function() {
                            i++;
                            var tr = document.createElement('tr');
                            if ($(this).attr('name')) tr.name = $(this).attr('name');
                            if ($(this).attr('color')) {
                                $(tr).css('background', $(this).attr('id'));
                            } else {
                                if (i % 2 && p.striped) tr.className = 'erow';
                            }
                            var nid = $(this).attr('id');
                            if (nid) {
                                tr.id = 'row' + nid;
                            }
                            nid = null;
                            var robj = this;
                            $('thead tr:first th', g.hDiv).each(function() {
                                var td = document.createElement('td');
                                var idx = $(this).attr('axis').substr(3);
                                td.align = 'left'; //this.align;

                                var text = $("cell:eq(" + idx + ")", robj).text();
                                var offs = text.indexOf('<BGCOLOR=');
                                if (offs > 0) {
                                    $(td).css('background', text.substr(offs + 7, 7));
                                }
                                td.innerHTML = p.__mw.datacol(p, $(this).attr('abbr'), text); //use middleware datacol to format cols
                                $(td).attr('abbr', $(this).attr('abbr'));
                                $(tr).append(td);
                                td = null;
                            });
                            if ($('thead', this.gDiv).length < 1) { //handle if grid has no headers
                                $('cell', this).each(function() {
                                    var td = document.createElement('td');
                                    td.innerHTML = $(this).text();
                                    $(tr).append(td);
                                    td = null;
                                });
                            }
                            $(tbody).append(tr);
                            tr = null;
                            robj = null;
                        });
                    }
                    $('tr', t).unbind();
                    $(t).empty();
                    $(t).append(tbody);
                    this.addCellProp();
                    this.addRowProp();
                    this.autoWidth();
                    this.rePosDrag();

                    if ($('input[sedIndex]', g.bDiv).length == $('input[sedIndex]:checked', g.bDiv).length && $('input[sedIndex]:checked', g.bDiv).length > 0) {
                        $("[multibox]", g.hDiv).attr("checked", true);
                    }

                    /* 悬浮列 */
                    if (p.fixed) {
                        g.fixLeftDiv.className = 'fixDiv fixLeftDiv';
                        g.fixRightDiv.className = 'fixDiv fixRightDiv';
                        var leftTh = $('.is-hidden-left', g.hDiv).length,
                            rightTh = $('.is-hidden-right', g.hDiv).length,
                            leftWidth = 0,
                            rightWidth = 0,
                            fixHeight = $(g.bDiv).height() + $(g.hDiv).height() + 2;
                        for (i = 0; i < leftTh; i++) { //别问我为什么加2 宽度就是不够
                            leftWidth += $('.is-hidden-left', g.hDiv).eq(i).width() + 1.5;
                        }
                        for (i = 0; i < rightTh; i++) {
                            rightWidth += $('.is-hidden-right', g.hDiv).eq(i).width() + 2;
                        }

                        var fixHtml = $(t.grid.hDiv).prop("outerHTML") + $(t.grid.bDiv).prop("outerHTML");
                        $(g.fixLeftDiv).css({
                            width: leftWidth,
                            height: fixHeight
                        }).html(fixHtml);
                        $(g.fixRightDiv).css({
                            width: rightWidth,
                            height: fixHeight
                        }).html(fixHtml);
                        $(g.gDiv).append(g.fixLeftDiv).append(g.fixRightDiv);
                        $('.is-hidden', $('.fixDiv')).removeClass('is-hidden');
                        $(g.bDiv).parents('.flexigrid').find('.fixDiv .bDiv').scrollTop(g.bDiv.scrollTop);
                        $(g.fixRightDiv).find('.bDiv').on('scroll', g.fixedScroll);
                    }
                    tbody = null;
                    data = null;
                    i = null;
                    if (p.onSuccess) {
                        p.onSuccess(this, self.Data);
                    }
                    if (p.hideOnSubmit) {
                        $(g.block).remove();
                    }
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;


                    if (browser.opera) {
                        $(t).css('visibility', 'visible');
                    }
                    self.fire("beforeRender", {});
                },
                //宽度自适应
                autoWidth: function(autoType) {
                    $('thead tr:first th', g.hDiv).each(function() {
                        var tdIndex = $('th', $(this).parent()).index(this);
                        tdDiv = $('tbody td:eq(' + tdIndex + ')', g.bDiv)
                            .find('div.edit');
                        thDivW = $(this).find('div').width(),
                            tdDivW = tdDiv.width();
                        if (autoType == 'resize') {
                            $(this).find('div').width(tdDivW);
                            return true;
                        }
                        //th 比 td 宽
                        if (thDivW > tdDivW) {
                            tdDiv.width(thDivW);
                        } else {
                            $(this).find('div').width(tdDivW);
                        }
                    });
                    if (p.expandable) {
                        $('.expandable').css({
                            'maxWidth': $(g.bDiv).find('table').width() - 10,
                            'background-color': '#FBFDFF'
                        });
                    }
                },
                changeSort: function(th) { //change sortorder
                    if (this.loading) {
                        return true;
                    }
                    $(g.nDiv).hide();
                    $(g.nBtn).hide();
                    if (p.sortname == $(th).attr('abbr')) {
                        if (p.sortorder == 'asc') {
                            p.sortorder = 'desc';
                        } else {
                            p.sortorder = 'asc';
                        }
                    }
                    $(th).addClass('sorted').siblings().removeClass('sorted');
                    $('.sdesc', this.hDiv).removeClass('sdesc');
                    $('.sasc', this.hDiv).removeClass('sasc');
                    $('div', th).addClass('s' + p.sortorder);
                    p.sortname = $(th).attr('abbr');
                    if (p.onChangeSort) {
                        p.onChangeSort(p.sortname, p.sortorder);
                    } else {
                        this.populate();
                    }
                },
                buildpager: function() { //rebuild pager based on new properties
                    $('.pcontrol input', this.pDiv).val(p.pageNo);
                    $('.pcontrol span', this.pDiv).html(p.pages);
                    var r1 = p.records == 0 ? 0 : (p.pageNo - 1) * p.rp + 1;
                    var r2 = r1 * 1 + p.rp * 1 - 1;
                    if (p.records < r2) {
                        r2 = p.records;
                    }
                    var stat = p.pagestat;
                    // stat = stat.replace(/{from}/, r1);
                    // stat = stat.replace(/{to}/, r2);
                    stat = stat.replace(/{records}/, p.records);
                    $('.pPageStat', this.pDiv).html(stat);
                },
                populate: function() { //get latest data
                    if (this.loading) {
                        return true;
                    }
                    if (p.onSubmit) {
                        var gh = p.onSubmit();
                        if (!gh) {
                            return false;
                        }
                    }
                    this.loading = true;
                    if (!p.url) {
                        return false;
                    }
                    $('.pPageStat', this.pDiv).html(p.procmsg);
                    $('.pReload', this.pDiv).addClass('loading');
                    $(g.block).css({
                        top: g.bDiv.offsetTop
                    });
                    if (p.hideOnSubmit) {
                        $(this.gDiv).prepend(g.block);
                    }
                    if (browser.opera) {
                        $(t).css('visibility', 'hidden');
                    }
                    if (!p.newp) {
                        p.newp = 1;
                    }
                    if (p.pageNo > p.pages) {
                        p.pageNo = p.pages;
                    }
                    var param = [{
                        name: 'pageNo',
                        value: p.newp
                    }, {
                        name: 'pageSize',
                        value: p.rp
                    }, {
                        name: 'sortname',
                        value: p.sortname
                    }, {
                        name: 'sortorder',
                        value: p.sortorder
                    }];
                    param = param.concat(p.searchParam);
                    if (p.params.length) {
                        for (var pi = 0; pi < p.params.length; pi++) {
                            param[param.length] = p.params[pi];
                        }
                    }

                    function getGridDataAjax() {
                        $.ajax({
                            type: p.method,
                            url: p.url,
                            data: param,
                            dataType: p.dataType,
                            success: function(data) {
                                // 删除最后一页所有数据时，自动跳前一页
                                if (p.newp > 1 && (!data.result || data.result.length == 0)) {
                                    p.newp--;
                                    param[0].value = p.newp;
                                    getGridDataAjax();
                                    return false;
                                }
                                g.addData(data);
                                Tools.scaleImg.initImg([{
                                    el: $("img[imgClick]"),
                                    area: ["20", "20"]
                                }]);
                                if (typeof p.turnPageSave != "undefined") {
                                    p.turnPageData = p.turnPageSave.turnData;
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                $(t).html('<div class="noDataImg"></div>');
                                try {
                                    if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
                                } catch (e) {}
                            },
                        });
                    }
                    getGridDataAjax();
                },
                changeUrl: function(data) {
                    if (typeof data.url !== 'undefined') {
                        p.url = data.url;
                    }
                    if ($.isArray(data.searchParam)) {
                        p.newp = 1;
                        p.searchParam = data.searchParam;
                    } else if (typeof data.searchParam == "object") {
                        p.newp = 1;
                        var oldsearchParam = [];
                        if (p.searchParam.length > 0) {
                            oldsearchParam = p.searchParam;
                        }
                        p.searchParam = [];
                        $.each(data.searchParam, function(k, v) {
                            p.searchParam.push({
                                name: k,
                                value: v
                            });
                        });
                    }
                    this.populate();
                    return false;
                },
                doSearch: function(param) {
                    if ($.isArray(param)) {
                        p.newp = 1;
                        p.searchParam = param;
                        this.populate();
                        return false;
                    }
                    if (typeof param == "object") {
                        p.newp = 1;
                        var oldsearchParam = [];
                        if (p.searchParam.length > 0) {
                            oldsearchParam = p.searchParam;
                        }
                        p.searchParam = [];
                        $.each(param, function(k, v) {
                            p.searchParam.push({
                                name: k,
                                value: v
                            });
                        });

                        this.populate();
                        return false;
                    }
                },
                changePage: function(ctype) { //change page
                    if (this.loading && !p.onChangePage) {
                        return true;
                    }
                    p.newp = ctype;
                    switch (ctype) {
                        case 'input':
                            var nv = parseInt($('.pcontrol input', this.pDiv).val(), 10);
                            if (isNaN(nv)) {
                                nv = 1;
                            }
                            if (nv < 1) {
                                nv = 1;
                            } else if (nv > p.pages) {
                                nv = p.pages;
                            }
                            $('.pcontrol input', this.pDiv).val(nv);
                            p.newp = nv;
                            break;
                    }
                    if (p.newp == p.pageNo) {
                        return false;
                    }
                    if (p.onChangePage) {
                        p.onChangePage(p.newp);

                    } else {
                        this.populate();
                    }
                },
                addCellProp: function() {
                    $('tbody tr td', g.bDiv).each(function(_item, _index) {
                        var tdDiv = document.createElement('div');
                        var n = $('td', $(this).parent()).index(this);
                        var pIndex = $("tbody tr", g.bDiv).index($(this).parent());
                        var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
                        tdDiv.className = "edit";
                        $(tdDiv).attr("index", pIndex);
                        if (pth != null) {
                            if (p.sortname == $(pth).attr('abbr') && p.sortname) {
                                this.className = 'sorted';
                            }
                            var pthWidth = pth.textArea || 'auto',
                                pthAlign = pth.textAlign || 'left';
                            $(this).width(pthWidth);
                            $(this).attr('align', pthAlign);
                            $(tdDiv).attr('style', 'text-align:' + pthAlign);

                            if (pth.hidden) {
                                $(this).css('display', 'none');
                            }
                        }
                        if (p.nowrap == false) {
                            $(tdDiv).css('white-space', 'normal');
                        }
                        if (this.innerHTML == '') {
                            this.innerHTML = '&nbsp;';
                        }
                        tdDiv.innerHTML = this.innerHTML;
                        if (this.cellIndex == p.shiftSedIndex) {
                            tdDiv.className += ' div_sedindex';
                        }
                        var prnt = $(this).parent()[0];
                        var pid = false;
                        if (prnt.id) {
                            pid = prnt.id.substr(3);
                        }
                        if (pth != null) {
                            if (pth.process) pth.process(tdDiv, pid);
                        }
                        $(this).empty().append(tdDiv).removeAttr('width'); //wrap content
                        if ($(this).find('.modify-btn').length > 0) {
                            $(this).find(tdDiv).css('maxWidth', '1000px');
                        }
                        g.addTitleToCell(tdDiv);
                    });
                },
                getCellDim: function(obj) { // get cell prop for editable event
                    var ht = parseInt($(obj).height(), 10);
                    var pht = parseInt($(obj).parent().height(), 10);
                    var wt = parseInt(obj.style.width, 10);
                    var pwt = parseInt($(obj).parent().width(), 10);
                    var top = obj.offsetParent.offsetTop;
                    var left = obj.offsetParent.offsetLeft;
                    var pdl = parseInt($(obj).css('paddingLeft'), 10);
                    var pdt = parseInt($(obj).css('paddingTop'), 10);
                    return {
                        ht: ht,
                        wt: wt,
                        top: top,
                        left: left,
                        pdl: pdl,
                        pdt: pdt,
                        pht: pht,
                        pwt: pwt
                    };
                },
                addRowProp: function() {
                    $('tbody tr', g.bDiv).on('click', function(e) {
                        var obj = (e.target || e.srcElement);
                        if (obj.href || obj.type) return true;
                        if (e.ctrlKey || e.metaKey) {
                            // mousedown already took care of this case
                            return;
                        }
                        //$(this).toggleClass('trSelected');
                        $(this).addClass('trSelected');
                        if (p.singleSelect && !g.multisel) {
                            $(this).siblings().removeClass('trSelected');
                        }
                    }).on('mousedown', function(e) {
                        if (e.shiftKey) {
                            $(this).toggleClass('trSelected');
                            g.multisel = true;
                            this.focus();
                            $(g.gDiv).noSelect();
                        }
                        if (e.ctrlKey || e.metaKey) {
                            $(this).toggleClass('trSelected');
                            g.multisel = true;
                            this.focus();
                        }
                    }).on('mouseup', function(e) {
                        if (g.multisel && !(e.ctrlKey || e.metaKey)) {
                            g.multisel = false;
                            $(g.gDiv).noSelect(false);
                        }
                    }).on('dblclick', function() {
                        if (p.onDoubleClick) {
                            p.onDoubleClick(this, g, p);
                        }
                    }).hover(function(e) {
                        if (g.multisel && e.shiftKey) {
                            $(this).toggleClass('trSelected');
                        }
                    }, function() {});
                    if (browser.msie && browser.version < 7.0) {
                        $(this).hover(function() {
                            $(this).addClass('trOver');
                        }, function() {
                            $(this).removeClass('trOver');
                        });
                    }
                },
                combo_flag: true,
                combo_resetIndex: function(selObj) {
                    if (this.combo_flag) {
                        selObj.selectedIndex = 0;
                    }
                    this.combo_flag = true;
                },
                combo_doSelectAction: function(selObj) {
                    eval(selObj.options[selObj.selectedIndex].value);
                    selObj.selectedIndex = 0;
                    this.combo_flag = false;
                },
                //Add title attribute to div if cell contents is truncated
                addTitleToCell: function(tdDiv) {
                    if (p.addTitleToCell) {
                        var $span = $('<span />').css('display', 'none'),
                            $div = (tdDiv instanceof jQuery) ? tdDiv : $(tdDiv),
                            div_w = $div.outerWidth(),
                            span_w = 0;

                        $('body').children(':first').before($span);
                        $span.html($div.html());
                        $span.css('font-size', '' + $div.css('font-size'));
                        $span.css('padding-left', '' + $div.css('padding-left'));
                        span_w = $span.innerWidth();
                        $span.remove();

                        if (span_w > div_w) {
                            $div.attr('title', $div.text());
                        } else {
                            $div.removeAttr('title');
                        }
                    }
                },
                autoResizeColumn: function(obj) {
                    if (!p.dblClickResize) {
                        return;
                    }
                    var n = $('div', this.cDrag).index(obj),
                        $th = $('th:visible div:eq(' + n + ')', this.hDiv),
                        ol = parseInt(obj.style.left, 10),
                        ow = $th.width(),
                        nw = 0,
                        nl = 0,
                        $span = $('<span />');
                    $('body').children(':first').before($span);
                    $span.html($th.html());
                    $span.css('font-size', '' + $th.css('font-size'));
                    $span.css('padding-left', '' + $th.css('padding-left'));
                    $span.css('padding-right', '' + $th.css('padding-right'));
                    nw = $span.width();
                    $('tr', this.bDiv).each(function() {
                        var $tdDiv = $('td:visible div:eq(' + n + ')', this),
                            spanW = 0;
                        $span.html($tdDiv.html());
                        $span.css('font-size', '' + $tdDiv.css('font-size'));
                        $span.css('padding-left', '' + $tdDiv.css('padding-left'));
                        $span.css('padding-right', '' + $tdDiv.css('padding-right'));
                        spanW = $span.width();
                        nw = (spanW > nw) ? spanW : nw;
                    });
                    $span.remove();
                    nw = (p.minWidth > nw) ? p.minWidth : nw;
                    nl = ol + (nw - ow);
                    $('div:eq(' + n + ')', this.cDrag).css('left', nl);
                    this.colresize = {
                        nw: nw,
                        n: n
                    };
                    g.dragEnd();
                },
                pager: 0,
                pagerHTML: function() { //分页部分代码
                    if (p.usepager) {
                        //var pTotalPages = data.totalPages;
                        var html = '';
                        if (p.pageNo > 1) {
                            html += '<div class="page_div prevPage icon-pagination_back"></div>';
                        } else {
                            html = '<div class="page_div page_disabled icon-pagination_back"></div>';
                        }

                        if (p.pageNo >= 4) {
                            html += '<div class="page_div tcdNumber">' + 1 + '</div>';
                        }
                        if (p.pageNo - 2 > 2 && p.pageNo <= p.pages && p.pages >= 5) {
                            html += '<div class="page_ellipsis disabled">...</div>';
                        }
                        var start = (p.pageNo - 2) < 1 ? 1 : (p.pageNo - 2);
                        var end = p.pageNo > (p.pages - 2) ? p.pages : (p.pageNo + 2);
                        for (start; start <= end; start++) {
                            if (start <= p.pages && start >= 1) {
                                if (start != p.pageNo) {
                                    html += '<div class="page_div tcdNumber">' + start + '</div>';
                                } else {
                                    html += '<div class="page_div pageNo">' + start + '</div>';
                                }
                            }
                        }

                        if ((p.pageNo + 2) < (p.pages - 1) && p.pageNo >= 1 && p.pages >= 5) {
                            html += '<div class="page_ellipsis disabled">...</div>';
                        }
                        if (p.pageNo < (p.pages - 2)) {
                            html += '<div class="page_div tcdNumber">' + p.pages + '</div>';
                        }
                        if (p.pageNo < p.pages) {
                            html += '<div class="page_div nextPage icon-pagination-next"></div>';
                        } else {
                            html += '<div class="page_div page_disabled  icon-pagination-next"></div>';
                        }
                        $('div.pagerGroup', g.pDiv).html(html);

                        $('.pDiv2').on('click', '.tcdNumber', function() {
                            var current = $(this).text();
                            g.changePage(current * 1);
                        });
                        $('.pDiv2').on('click', '.nextPage', function() {
                            var current = $('.pDiv2 .pageNo', g.pDiv).text();
                            g.changePage(current * 1 + 1);
                        })
                        $('.pDiv2').on('click', '.prevPage', function() {
                            var current = $('.pDiv2 .pageNo', g.pDiv).text();
                            g.changePage(current * 1 - 1);
                        })
                    }
                }
            };
            g = p.getGridClass(g); //get the grid class
            if (p.userDefine) {
                var userDefineData = window.parent.userDefinedDataList || [];
                $.each(userDefineData, function(k, v) {
                    var addColdata = { display: '', name: '', width: 88, align: 'left' };
                    var addFlag = true;
                    addColdata.display = v.value;
                    addColdata.name = "value" + v.index;
                    $.each(p.colModel, function(kk, vv) {
                        if (vv.name == addColdata.name) {
                            addFlag = false;
                        }
                    });
                    if (addFlag) {
                        if (p.userDefineIndex) {
                            p.colModel.splice(p.userDefineIndex + k, 0, addColdata);
                        } else {
                            p.colModel.push(addColdata);
                        }
                    }
                });
            }
            if (p.colModel) { //create model if any
                if (p.fixed) { //需要悬浮时改变排列顺序
                    for (var i = 0; i < p.colModel.length; i++) {
                        var thisData = p.colModel[i];
                        if (thisData.hasOwnProperty('direction')) {
                            fixArr[thisData.direction].push(thisData);
                            p.colModel.splice(i, 1);
                            --i;
                        }
                    }
                    p.colModel = fixArr.left.concat(p.colModel).concat(fixArr.right)
                }
                thead = document.createElement('thead');
                var tr = document.createElement('tr');
                for (var i = 0; i < p.colModel.length; i++) {
                    var cm = p.colModel[i];
                    var th = document.createElement('th');
                    $(th).attr('axis', 'col' + i);
                    if (cm) { // only use cm if its defined
                        if ($.cookies) {
                            var cookie_width = 'flexiwidths/' + cm.name; // Re-Store the widths in the cookies
                            if ($.cookie(cookie_width) != undefined) {
                                cm.width = $.cookie(cookie_width);
                            }
                        }
                        if (cm.type && cm.type == "sort") {
                            $(th).attr("multi", "");
                            th.innerHTML = "";
                        }
                        if (cm.type && cm.type == "sed") {
                            $(th).attr("multi", "");
                            if (!cm.noMultibox) {
                                th.innerHTML = "<input type='checkbox' multiBox/>";
                            }
                        }
                        if (cm.display != undefined) {
                            if (cm.type && cm.type == "edit") {
                                th.innerHTML = "" + cm.display + "<i class='icon-p icon-p-thedit'></i>";
                            } else if (cm.type && cm.type == "editzone") {
                                th.innerHTML = "" + cm.display + "<i class='icon-p icon-p-thedit'></i>";
                            } else if (cm.type && cm.type == "help") {
                                th.innerHTML = "" + cm.display + "<i class='icon-tips-fill'></i>";
                            } else {
                                th.innerHTML = cm.display;
                            }
                        }
                        if (cm.name && cm.sortable) {
                            $(th).attr('abbr', cm.name);
                        }
                        if (cm.help && cm.help != undefined) {
                            $(th).attr("help", cm.help);
                        }
                        var thWidth = cm.textArea || 'auto',
                            thAlign = cm.textAlign || 'left';
                        th.textArea = thWidth;
                        th.textAlign = thAlign;
                        $(th).width(thWidth);
                        $(th).attr('align', thAlign);

                        if ($(cm).attr('hide') || cm.hidden) {
                            th.hidden = true;
                        }
                        if (p.fixed && cm.direction) { //获取悬浮列的数据
                            $(th).addClass('is-hidden is-hidden-' + cm.direction);
                        }
                        if (cm.process) {
                            th.process = cm.process;
                        }
                    } else {
                        th.innerHTML = "";
                        $(th).attr('width', 30);
                    }
                    $(tr).append(th);
                }
                $(thead).append(tr);
                $(t).prepend(thead);
            } // end if p.colmodel
            //init divs
            g.gDiv = document.createElement('div'); //create global container
            g.mDiv = document.createElement('div'); //create title container
            g.hDiv = document.createElement('div'); //create header container
            g.bDiv = document.createElement('div'); //create body container
            g.vDiv = document.createElement('div'); //create grip
            g.rDiv = document.createElement('div'); //create horizontal resizer
            g.cDrag = document.createElement('div'); //create column drag
            g.block = document.createElement('div'); //creat blocker
            g.nDiv = document.createElement('div'); //create column show/hide popup
            g.nBtn = document.createElement('div'); //create column show/hide button
            g.iDiv = document.createElement('div'); //create editable layer
            g.tDiv = document.createElement('div'); //create toolbar
            g.sDiv = document.createElement('div');
            g.pDiv = document.createElement('div'); //create pager container
            g.fixLeftDiv = document.createElement('div');
            g.fixRightDiv = document.createElement('div');

            if (p.colResize === false) { //don't display column drag if we are not using it
                $(g.cDrag).css('display', 'none');
            }

            if (!p.usepager) {
                g.pDiv.style.display = 'none';
            }
            g.hTable = document.createElement('table');
            g.gDiv.className = 'flexigrid';
            if (p.width != 'auto') {
                g.gDiv.style.width = p.width + (isNaN(p.width) ? '' : 'px');
            }
            //add conditional classes
            if (browser.msie) {
                $(g.gDiv).addClass('ie');
            }
            if (p.novstripe) {
                $(g.gDiv).addClass('novstripe');
            }
            $(t).before(g.gDiv);
            $(g.gDiv).append(t);
            //set toolbar
            if (p.buttons) {
                g.tDiv.className = 'tDiv';
                var tDiv2 = document.createElement('div');
                tDiv2.className = 'tDiv2';
                for (var i = 0; i < p.buttons.length; i++) {
                    var btn = p.buttons[i];
                    if (!btn.separator) {
                        var btnDiv = document.createElement('div');
                        btnDiv.className = 'fbutton';
                        btnDiv.innerHTML = ("<div><span>") + (btn.hidename ? "&nbsp;" : btn.name) + ("</span></div>");
                        if (btn.bclass) $('span', btnDiv).addClass(btn.bclass).css({
                            paddingLeft: 20
                        });
                        if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
                            $('span', btnDiv).css('background', 'url(' + btn.bimage + ') no-repeat center left');
                        $('span', btnDiv).css('paddingLeft', 20);

                        if (btn.tooltip) // add title if exists (RS)
                            $('span', btnDiv)[0].title = btn.tooltip;

                        btnDiv.onpress = btn.onpress;
                        btnDiv.name = btn.name;
                        if (btn.id) {
                            btnDiv.id = btn.id;
                        }
                        if (btn.onpress) {
                            $(btnDiv).click(function() {
                                this.onpress(this.id || this.name, g.gDiv);
                            });
                        }
                        $(tDiv2).append(btnDiv);
                        if (browser.msie && browser.version < 7.0) {
                            $(btnDiv).hover(function() {
                                $(this).addClass('fbOver');
                            }, function() {
                                $(this).removeClass('fbOver');
                            });
                        }
                    } else {
                        $(tDiv2).append("<div class='btnseparator'></div>");
                    }
                }
                $(g.tDiv).append(tDiv2);
                $(g.tDiv).append("<div style='clear:both'></div>");
                $(g.gDiv).prepend(g.tDiv);
            }
            g.hDiv.className = 'hDiv';

            // Define a combo button set with custom action'ed calls when clicked.
            if (p.combobuttons && $(g.tDiv2)) {
                var btnDiv = document.createElement('div');
                btnDiv.className = 'fbutton';

                var tSelect = document.createElement('select');
                $(tSelect).change(function() { g.combo_doSelectAction(tSelect) });
                $(tSelect).click(function() { g.combo_resetIndex(tSelect) });
                tSelect.className = 'cselect';
                $(btnDiv).append(tSelect);

                for (i = 0; i < p.combobuttons.length; i++) {
                    var btn = p.combobuttons[i];
                    if (!btn.separator) {
                        var btnOpt = document.createElement('option');
                        btnOpt.innerHTML = btn.name;

                        if (btn.bclass)
                            $(btnOpt)
                            .addClass(btn.bclass)
                            .css({ paddingLeft: 20 });
                        if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
                            $(btnOpt).css('background', 'url(' + btn.bimage + ') no-repeat center left');
                        $(btnOpt).css('paddingLeft', 20);

                        if (btn.tooltip) // add title if exists (RS)
                            $(btnOpt)[0].title = btn.tooltip;

                        if (btn.onpress) {
                            btnOpt.value = btn.onpress;
                        }
                        $(tSelect).append(btnOpt);
                    }
                }
                $('.tDiv2').append(btnDiv);
            }
            $(t).before(g.hDiv);
            g.hTable.cellPadding = 0;
            g.hTable.cellSpacing = 0;
            $(g.hDiv).append('<div class="hDivBox"></div>');
            $('div', g.hDiv).append(g.hTable);
            var thead = $("thead:first", t).get(0);
            if (thead) $(g.hTable).append(thead);
            thead = null;
            if (!p.colmodel) var ci = 0;

            $('thead tr:first th', g.hDiv).each(function() {
                if ($(this).attr("multi")) return false;
                var thdiv = document.createElement('div');
                if ($(this).attr('abbr')) {
                    $(this).click(function(e) {
                        if (!$(this).hasClass('thOver')) return false;
                        var obj = (e.target || e.srcElement);
                        if (obj.href || obj.type) return true;
                        g.changeSort(this);
                    });
                    if ($(this).attr('abbr') == p.sortname) {
                        this.className = 'sorted';
                        thdiv.className = 's' + p.sortorder;
                    }
                }
                if (this.hidden) {
                    $(this).hide();
                }
                if (!p.colmodel) {
                    $(this).attr('axis', 'col' + ci++);
                }
                var thWidth = this.textArea || 'auto',
                    thAlign = this.textAlign || 'left';
                $(th).width(thWidth);
                $(th).attr('align', thAlign);

                thdiv.innerHTML = this.innerHTML;
                $(this).empty().append(thdiv).removeAttr('width').mousedown(function(e) {
                    g.dragStart('colMove', e, this);
                }).hover(function() {
                    if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) {
                        $(this).addClass('thOver');
                    }
                    if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
                        $('div', this).addClass('s' + p.sortorder);
                    } else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
                        var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
                        $('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
                    }
                    if (g.colCopy) {
                        var n = $('th', g.hDiv).index(this);
                        if (n == g.dcoln) {
                            return false;
                        }
                        if (n < g.dcoln) {
                            $(this).append(g.cdropleft);
                        } else {
                            $(this).append(g.cdropright);
                        }
                        g.dcolt = n;
                    } else if (!g.colresize) {
                        var nv = $('th:visible', g.hDiv).index(this);
                        var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'), 10);
                        var nw = jQuery(g.nBtn).outerWidth();
                        var nl = onl - nw + Math.floor(p.cgwidth / 2);
                        $(g.nDiv).hide();
                        $(g.nBtn).hide();
                        /*$(g.nBtn).css({
                        	'left': nl,
                        	top: g.hDiv.offsetTop
                        }).show();*/
                        var ndw = parseInt($(g.nDiv).width(), 10);
                        $(g.nDiv).css({
                            top: g.bDiv.offsetTop
                        });
                        if ((nl + ndw) > $(g.gDiv).width()) {
                            $(g.nDiv).css('left', onl - ndw + 1);
                        } else {
                            $(g.nDiv).css('left', nl);
                        }
                        if ($(this).hasClass('sorted')) {
                            $(g.nBtn).addClass('srtd');
                        } else {
                            $(g.nBtn).removeClass('srtd');
                        }
                    }
                }, function() {
                    $(this).removeClass('thOver');
                    if ($(this).attr('abbr') != p.sortname) {
                        $('div', this).removeClass('s' + p.sortorder);
                    } else if ($(this).attr('abbr') == p.sortname) {
                        var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
                        $('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
                    }
                    if (g.colCopy) {
                        $(g.cdropleft).remove();
                        $(g.cdropright).remove();
                        g.dcolt = null;
                    }
                }); //wrap content
            });
            if (p.onsaveCol) {
                $(g.hDiv).append('<div class="hDivSav"><i class="flex_save" title="保存列表改动" gridCol_save></i>\
					<i class="icon-p icon-p-clear" style="width:20px;height:19px;cursor:pointer;" title="重置列表改动" gridCol_clear></i></div>');
            }
            //set bDiv
            g.bDiv.className = 'bDiv';
            $(t).before(g.bDiv);
            $(g.bDiv).css({
                height: (p.height == 'auto') ? 'auto' : p.height + "px"
            }).scroll(function (e){
                g.scroll();
            }).append(t);

            if (p.height == 'auto') {
                $('table', g.bDiv).addClass('autoht');
            }
            p.selectQueue = [];

            //add td & row properties
            g.addCellProp();
            g.addRowProp();
            //set cDrag only if we are using it
            if (p.colResize === true) {
                var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
                if (cdcol !== null) {
                    g.cDrag.className = 'cDrag';
                    g.cdpad = 0;
                    g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'), 10)) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth'), 10));
                    g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'), 10)) ? 0 : parseInt($('div', cdcol).css('borderRightWidth'), 10));
                    g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'), 10)) ? 0 : parseInt($('div', cdcol).css('paddingLeft'), 10));
                    g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'), 10)) ? 0 : parseInt($('div', cdcol).css('paddingRight'), 10));
                    g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'), 10)) ? 0 : parseInt($(cdcol).css('borderLeftWidth'), 10));
                    g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'), 10)) ? 0 : parseInt($(cdcol).css('borderRightWidth'), 10));
                    g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'), 10)) ? 0 : parseInt($(cdcol).css('paddingLeft'), 10));
                    g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'), 10)) ? 0 : parseInt($(cdcol).css('paddingRight'), 10));
                    $(g.bDiv).before(g.cDrag);
                    var cdheight = $(g.bDiv).height();
                    var hdheight = $(g.hDiv).height();
                    $(g.cDrag).css({
                        top: -hdheight + 'px'
                    });
                    $('thead tr:first th', g.hDiv).each(function() {
                        var cgDiv = document.createElement('div');
                        $(g.cDrag).append(cgDiv);
                        if (!p.cgwidth) {
                            p.cgwidth = $(cgDiv).width();
                        }
                        $(cgDiv).css({
                            height: cdheight + hdheight
                        }).mousedown(function(e) {
                            g.dragStart('colresize', e, this);
                        }).dblclick(function(e) {
                            g.autoResizeColumn(this);
                        });
                        if (browser.msie && browser.version < 7.0) {
                            g.fixHeight($(g.gDiv).height());
                            $(cgDiv).hover(function() {
                                g.fixHeight();
                                $(this).addClass('dragging');
                            }, function() {
                                if (!g.colresize) {
                                    $(this).removeClass('dragging');
                                }
                            });
                        }
                    });
                }
            }

            //add strip
            if (p.striped) {
                $('tbody tr:odd', g.bDiv).addClass('erow');
            }
            if (p.resizable && p.height != 'auto') {
                g.vDiv.className = 'vGrip';
                $(g.vDiv).mousedown(function(e) {
                    g.dragStart('vresize', e);
                }).html('<span></span>');
                $(g.bDiv).after(g.vDiv);
            }
            if (p.resizable && p.width != 'auto' && !p.nohresize) {
                g.rDiv.className = 'hGrip';
                $(g.rDiv).mousedown(function(e) {
                    g.dragStart('vresize', e, true);
                }).html('<span></span>').css('height', $(g.gDiv).height());
                if (browser.msie && browser.version < 7.0) {
                    $(g.rDiv).hover(function() {
                        $(this).addClass('hgOver');
                    }, function() {
                        $(this).removeClass('hgOver');
                    });
                }
                $(g.gDiv).append(g.rDiv);
            }
            // add pager
            if (p.usepager) {
                g.pDiv.className = 'pDiv';
                g.pDiv.innerHTML = '<div class="pDiv2"></div>';
                $(g.bDiv).after(g.pDiv);
                var html = '<div class="pGroup pagerGroup"></div>\
							<div class="pGroup">\
								<div class="pReload pButton">\
								     <span title="刷新" class="icon-pagination-refresh"></span>\
								</div>\
							</div>\
							<div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input type="text" size="4" value="1" /> 页，' + p.outof + ' <span> 1 </span>页</span></div>\
						</div>';
                $('div', g.pDiv).html(html);
                $('.pReload', g.pDiv).click(function() {
                    g.populate();
                });
                $('.pcontrol input', g.pDiv).keydown(function(e) {
                    if (e.keyCode == 13) {
                        g.changePage('input');
                    }
                });
                if (browser.msie && browser.version < 7) $('.pButton', g.pDiv).hover(function() {
                    $(this).addClass('pBtnOver');
                }, function() {
                    $(this).removeClass('pBtnOver');
                });
                if (p.useRp) {
                    var opt = '',
                        sel = '';
                    for (var nx = 0; nx < p.rpOptions.length; nx++) {
                        if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"';
                        else sel = '';
                        opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;条/页</option>";
                    }
                    $('.pDiv2', g.pDiv).prepend("<div class='pGroup'>\
				                <span class='pPageStat'></span>\
							</div>\
							<div class='pGroup'><select name='rp'>" + opt + "</select></div>");
                    $('select', g.pDiv).change(function() {
                        if (p.onRpChange) {
                            p.onRpChange(+this.value);
                        } else {
                            p.newp = 1;
                            p.rp = +this.value;
                            g.populate();
                        }
                    });

                    $('select', g.pDiv).select2();
                }
            }
            $(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
            if (p.title) {
                g.mDiv.className = 'mDiv';
                g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
                $(g.gDiv).prepend(g.mDiv);
                if (p.showTableToggleBtn) {
                    $(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
                    $('div.ptogtitle', g.mDiv).click(function() {
                        $(g.gDiv).toggleClass('hideBody');
                        $(this).toggleClass('vsble');
                    });
                }
            }
            g.cdropleft = document.createElement('span');
            g.cdropleft.className = 'cdropleft';
            g.cdropright = document.createElement('span');
            g.cdropright.className = 'cdropright';
            g.block.className = 'gBlock';
            var gh = $(g.bDiv).height();
            var gtop = g.bDiv.offsetTop;
            $(g.block).css({
                width: g.bDiv.style.width,
                height: gh,
                background: 'white',
                position: 'relative',
                marginBottom: (gh * -1),
                zIndex: 1,
                top: gtop,
                left: '0px'
            });
            $(g.block).fadeTo(0, p.blockOpacity);
            if ($('th', g.hDiv).length) {
                g.nDiv.className = 'nDiv';
                g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
                $(g.nDiv).css({
                    marginBottom: (gh * -1),
                    display: 'none',
                    top: gtop
                }).noSelect();
                $('th div', g.hDiv).each(function(ki, vi) {
                    if ($(this).parent().attr("multi") == "") {
                        return true;
                    }
                    var kcol = $("th[axis='col" + ki + "']", g.hDiv)[0];
                    var chk = 'checked="checked"';
                    if (kcol.style.display == 'none') {
                        chk = '';
                    }
                    $('tbody', g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + ki + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
                });

                if (browser.msie && browser.version < 7.0) $('tr', g.nDiv).hover(function() {
                    $(this).addClass('ndcolover');
                }, function() {
                    $(this).removeClass('ndcolover');
                });
                $('td.ndcol2', g.nDiv).click(function() {
                    if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
                    return g.toggleCol($(this).prev().find('input').val());
                });
                $('input.togCol', g.nDiv).click(function() {
                    if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked === false) return false;
                    $(this).parent().next().trigger('click');
                });
                $(g.gDiv).prepend(g.nDiv);
                $(g.nBtn).addClass('nBtn')
                    .html('<div></div>')
                    .attr('title', '隐藏/显示切换')
                    .click(function() {
                        $(g.nDiv).toggle();
                        return true;
                    });
                if (p.showToggleBtn) {
                    $(g.gDiv).prepend(g.nBtn);
                }
            }
            $(g.iDiv).addClass('iDiv').css({
                display: 'none'
            });
            $(g.bDiv).append(g.iDiv);
            $(g.bDiv).hover(function() {
                $(g.nDiv).hide();
                $(g.nBtn).hide();
            }, function() {
                if (g.multisel) {
                    g.multisel = false;
                }
            });
            $(g.gDiv).hover(function() {}, function() {
                $(g.nDiv).hide();
                $(g.nBtn).hide();
            });
            $(document).mousemove(function(e) {
                g.dragMove(e);
            }).mouseup(function(e) {
                g.dragEnd();
            }).hover(function() {}, function() {
                g.dragEnd();
            });
            if (browser.msie && browser.version < 7.0) {
                $('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
                    width: '100%'
                });
                $(g.gDiv).addClass('ie6');
                if (p.width != 'auto') {
                    $(g.gDiv).addClass('ie6fullwidthbug');
                }
            }
            g.rePosDrag();
            g.fixHeight();
            t.p = p;
            t.grid = g;
            if (p.url && p.autoload && !p.data) {
                g.populate();
            }
            if (p.data) {
                g.addData(p.data);
            }
            $.extend(this, {
                doSearch: function(param) {
                    g.doSearch(param);
                },
                getSedIndex: function() {
                    return p.selectQueue;
                },
                getSedRows: function() {
                    var rows = [];
                    $.each(p.selectQueue, function(i, k) {
                        rows.push(currentData[k]);
                    });
                    return rows;
                },
                changeUrl: function(url) {
                    g.changeUrl(url);
                },
                getTurnPageData: function() {
                    return p.turnPageData;
                },
                getColModel: function() {
                    return p.colModel;
                },
                addData: function(data) {
                    g.addData(data);
                },
                reload: function() {
                    g.populate();
                }
            });
            $(g.bDiv).parents('.flexigrid').delegate("[sedIndex]", "click", function(e) {
                var sedIndex = $(this).attr("sedIndex"),
                    turnPageName = p.turnPageSave ? p.turnPageSave.turnName : '';
                var i = -1,
                    t = -1;
                if (p.allowSedCheckParam) {
                    var currentValue = currentData[sedIndex][p.allowSedCheckParam.name];
                    if (currentValue != p.allowSedCheckParam.value) {
                        layer.msg(p.allowSedCheckParam.errorText);
                        return false;
                    }
                }
                if (e.shiftKey && p.selectQueue.length > 0 && e.target.checked) {
                    var checked_ele = p.fixed ? $('.fixLeftDiv .bDiv') : g.bDiv;
                    var lastNum = p.selectQueue[p.selectQueue.length - 1],
                        n = lastNum * 1 > sedIndex * 1 ? sedIndex * 1 : lastNum * 1 + 1,
                        length = Math.abs(lastNum - sedIndex);
                    for (var i = 0; i < length; i++) {
                        if ($.inArray((n + i).toString(), p.selectQueue) == -1) {
                            var indexs = (n + i).toString();
                            p.selectQueue.push(indexs);
                            $('div.edit.div_sedindex', checked_ele).eq(indexs).find('[sedIndex]')[0].checked = true;
                            p.turnPageData.nameList.push(currentData[indexs][turnPageName]);
                            p.turnPageData.result.push(currentData[indexs]);
                        }
                    }
                    if (p.checkChange) {
                        p.checkChange(p.turnPageData.nameList.length);
                    }
                } else {
                    $.each(p.selectQueue, function(k, v) {
                        if (sedIndex == v) {
                            i = k;
                        }
                    });
                    if (i == -1) {
                        p.selectQueue.push(sedIndex);
                    } else {
                        p.selectQueue.splice(i, 1);
                    }
                    if (turnPageName) {
                        $.each(p.turnPageData.nameList, function(k, v) {
                            if (currentData[sedIndex][turnPageName] == v) {
                                t = k;
                            }
                        });
                        if (t == -1) {
                            p.turnPageData.nameList.push(currentData[sedIndex][turnPageName]);
                            p.turnPageData.result.push(currentData[sedIndex]);
                        } else {
                            p.turnPageData.nameList.splice(t, 1);
                            p.turnPageData.result.splice(t, 1);
                        }
                        if (p.checkChange) {
                            p.checkChange(p.turnPageData.nameList.length);
                        }
                    }
                }
                var _targetElement = p.fixed ? $('.fixLeftDiv .bDiv') : g.bDiv;
                if ($('input[sedIndex]:checked', _targetElement).length >= 0) {
                    var checkedh_ele = p.fixed ? $('.fixLeftDiv .hDiv') : g.hDiv;
                    var isCheckedAll = $('input[sedIndex]', _targetElement).length == $('input[sedIndex]:checked', _targetElement).length;
                    $("[multibox]", checkedh_ele).prop("checked", isCheckedAll);
                }
                // p.selectQueue.sort();
            });
            $(g.hDiv).parents('.flexigrid').delegate("[multibox]", "click", function() {
                var turnPageName = p.turnPageSave ? p.turnPageSave.turnName : '',
                    selfChecked = this.checked;
                if (selfChecked) {
                    var array = [];
                    $("[sedIndex]", g.bDiv).each(function() {
                        array.push($(this).attr("sedIndex"));
                        this.checked = true;
                    });
                    p.selectQueue = array;
                    if (turnPageName) {
                        $.each(array, function(k, v) {
                            if (p.turnPageData.nameList.indexOf(currentData[v][turnPageName]) == -1) {
                                p.turnPageData.nameList.push(currentData[v][turnPageName]);
                                p.turnPageData.result.push(currentData[v]);
                            }
                        });
                        if (p.checkChange) {
                            p.checkChange(p.turnPageData.nameList.length);
                        }
                    }
                } else {
                    $("[sedIndex]", g.bDiv).removeAttr("checked");
                    p.selectQueue = [];
                    if (turnPageName && $("[sedIndex]", g.bDiv).length > 0) {
                        for (var i = 0; i < currentData.length; i++) {
                            $.each(p.turnPageData.nameList, function(k, v) {
                                if (v == currentData[i][turnPageName]) {
                                    p.turnPageData.nameList.splice(k, 1);
                                    p.turnPageData.result.splice(k, 1);
                                }
                            })
                        }
                        if (p.checkChange) {
                            p.checkChange(p.turnPageData.nameList.length);
                        }
                    }
                }
                if (p.fixed) {
                    $("[sedIndex]", $('.fixLeftDiv .bDiv')).each(function() {
                        this.checked = selfChecked;
                    });
                }
            });
            //toogleTag
            $(g.bDiv).on("click", "td.toggleTag", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var nextTr = $(this).parent('tr').next('tr');
                $(this).find('.triangleIcon').toggleClass('active');
                $(nextTr).slideToggle(100);
                return false;
            });
            //查看图片
            $(g.bDiv).delegate("img[imgClick]", "click", function(e) {
                var imgSrc = e.target.src;
                if (imgSrc == "" || imgSrc == undefined) {
                    return false;
                }
                if (e.target.naturalHeight == 0) {
                    layer.msg("未查询到该图片");
                    return false;
                }
                var regionData = $(this).attr('regionData').split(',');
                var photosData = [];
                $.each(regionData, function(k, v) {
                    var addData = { "alt": "", "pid": "", "src": "", "thumb": "" };
                    addData.alt = addData.pid = "第" + (k * 1 + 1) + "张照片";
                    addData.src = addData.thumb = v;
                    photosData.push(addData);
                });
                layer.photos({
                    photos: {
                        "title": "bolin",
                        "id": 'bolin_photos',
                        "start": 0,
                        "data": photosData
                    },
                    shift: -1
                });
                if (photosData.length == 1) {
                    $('.layui-layer-imgbar').remove();
                }
            });
            //显示toolTips
            p.tipsIndex = null;
            $(g.bDiv).delegate("div.edit", "mouseenter", function() {
                var offsetW = this.offsetWidth,
                    scrollW = this.scrollWidth;
                if (offsetW >= scrollW) {
                    return false;
                }
                var self = $(this),
                    toolTips = self.html();
                var isModify = $(this).find('button').length > 0;
                if (isModify) {
                    //toolTips = '【操作按钮】被遮盖，建议拖动调整宽度显示【操作按钮】！'
                    return false;
                }
                p.tipsIndex = layer.tips(
                    toolTips, self, {
                        tips: 1
                    }).index;
            }).delegate("div.edit", "mouseout", function() {
                layer.close(p.tipsIndex);
            });
            $(g.hDiv).delegate("i[gridCol_save]", "click", function(e) {
                layer.confirm("确定保存列表改动？", function() {
                    var grid_rp = p.rp;
                    var grid_Col = p.colModel;
                    var iload = $(this);
                    iload.addClass("flex_load");
                    self.fire("saveCol", {
                        rp: grid_rp,
                        Coldata: grid_Col
                    });
                    setTimeout(function() {
                        iload.removeClass("flex_load");
                    }, 800);
                    layer.closeAll();
                    window.location.href = window.location.href;
                });
            });
            $(g.hDiv).delegate("i[gridCol_clear]", "click", function(e) {
                layer.confirm("确定重置列表改动？", function() {
                    var grid_rp = p.rp;
                    var grid_Col = p.colModel;
                    var iload = $(this);
                    iload.addClass("flex_load");
                    self.fire("clearCol");
                    setTimeout(function() {
                        iload.removeClass("flex_load");
                    }, 800);
                    layer.closeAll();
                    window.location.href = window.location.href;
                });
            });
            $(g.gDiv).on("click", "button[rowIndex],a[rowIndex]", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var rowIndex = $(this).attr("rowIndex"),
                    mindex = $(this).attr("mindex"),
                    key = $(this).attr("key"),
                    idx = $(this).attr("idx");
                if (key == "link") {
                    var modify = $(this).attr("setname");
                    self.fire(modify, currentData[rowIndex]);
                } else if (key == "noteslink") {
                    self.fire("noteslink", currentData[rowIndex]);
                } else {
                    var modify = p.colModel[idx].modifySet;
                    if (modify["options"][mindex]["name"]) {
                        self.fire(modify["options"][mindex]["name"], {
                            Data: currentData[rowIndex],
                            index: rowIndex,
                            target: this
                        });
                    }
                }
                return false;
            });

            $(g.bDiv).delegate("tr[rowIndex]", "click", function() {
                var rowIndex = $(this).attr("rowIndex");
                self.fire("clickRow", {
                    rowData: currentData[rowIndex],
                    index: rowIndex,
                    target: this
                });
            });
            $(g.bDiv).delegate("tr[rowIndex]", "dblclick", function() {
                var rowIndex = $(this).attr("rowIndex");
                self.fire("dblClickRow", {
                    rowData: currentData[rowIndex],
                    index: rowIndex,
                    target: this
                });
            });
        }
    });
    $.fn.noSelect = function(p) { //no select plugin by me :-)
        var prevent = (p === null) ? true : p;
        if (prevent) {
            return this.each(function() {
                if (browser.msie || browser.safari) $(this).bind('selectstart', function() {
                    return false;
                });
                else if (browser.mozilla) {
                    $(this).css('MozUserSelect', 'none');
                    $('body').trigger('focus');
                } else if (browser.opera) $(this).bind('mousedown', function() {
                    return false;
                });
                else $(this).attr('unselectable', 'on');
            });
        } else {
            return this.each(function() {
                if (browser.msie || browser.safari) $(this).unbind('selectstart');
                else if (browser.mozilla) $(this).css('MozUserSelect', 'inherit');
                else if (browser.opera) $(this).unbind('mousedown');
                else $(this).removeAttr('unselectable', 'on');
            });
        }
    }; //end noSelect
    var docloaded = false;
    $(document).ready(function() {
        docloaded = true
    });
    $.fn.flexigrid = function(p) {
        if (!docloaded) {
            $(this).hide();
            var t = this;
            $(document).ready(function() {
                var _grid = new grid(t, p);
                return _grid;
            });
        } else {
            var _grid = new grid(this, p);
            return _grid;
        }
    }
    module.exports = grid;
});
