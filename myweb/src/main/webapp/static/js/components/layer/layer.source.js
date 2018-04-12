;
! function(window, undefined) {
    "use strict";

    var $, win, ready = {
        getPath: function() {
            // var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
            // if(script.getAttribute('merge')) return;
            // return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
            return '/hms/js/components/layer/';
        }(),

        //屏蔽Enter触发弹层
        enter: function(e) {
            if (e.keyCode === 13) e.preventDefault();
        },
        config: {},
        end: {},
        btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],

        //五种原始层模式
        type: ['dialog', 'page', 'iframe', 'loading', 'tips']
    };

    //默认内置方法。
    var layer = {
        v: '2.3',
        ie6: !!window.ActiveXObject && !window.XMLHttpRequest,
        index: 0,
        path: ready.getPath,
        config: function(options, fn) {
            var item = 0;
            options = options || {};
            layer.cache = ready.config = $.extend(ready.config, options);
            layer.path = ready.config.path || layer.path;
            typeof options.extend === 'string' && (options.extend = [options.extend]);
            // layer.use('skin/layer.css', (options.extend && options.extend.length > 0) ? (function loop(){
            //   var ext = options.extend;
            //   layer.use(ext[ext[item] ? item : item-1], item < ext.length ? function(){
            //     ++item; 
            //     return loop;
            //   }() : fn);
            // }()) : fn);
            return this;
        },

        //载入配件
        use: function(module, fn, readyMethod) {
            var i = 0,
                head = $('head')[0];
            var module = module.replace(/\s/g, '');
            var iscss = /\.css$/.test(module);
            var node = document.createElement(iscss ? 'link' : 'script');
            var id = 'layui_layer_' + module.replace(/\.|\//g, '');
            if (!layer.path) return;
            if (iscss) {
                node.rel = 'stylesheet';
            }
            node[iscss ? 'href' : 'src'] = /^http:\/\//.test(module) ? module : layer.path + module;
            node.id = id;
            if (!$('#' + id)[0]) {
                head.appendChild(node);
            }
            //轮询加载就绪
            ;
            (function poll() {;
                (iscss ? parseInt($('#' + id).css('width')) === 1989 : layer[readyMethod || id]) ? function() {
                    fn && fn();
                    try { iscss || head.removeChild(node); } catch (e) {};
                }() : setTimeout(poll, 100);
            }());
            return this;
        },

        ready: function(path, fn) {
            var type = typeof path === 'function';
            if (type) fn = path;
            layer.config($.extend(ready.config, function() {
                return type ? {} : { path: path };
            }()), fn);
            return this;
        },

        //各种快捷引用
        alert: function(content, options, yes) {
            var type = typeof options === 'function';
            if (type) yes = options;
            return layer.open($.extend({
                content: content,
                icon: 5,
                notOpen: 1,
                maxW: "600px",
                maxH: "240px",
                minW: "500px",
                minute: 40,
                yes: yes
            }, type ? {} : options));
        },

        confirm: function(content, options, yes, cancel) {
            var type = typeof options === 'function';
            if (type) {
                cancel = yes;
                yes = options;
            }
            return layer.open($.extend({
                content: content,
                btn: ready.btn,
                yes: yes,
                notOpen: 1,
                maxW: "600px",
                maxH: "240px",
                minW: "500px",
                minute: 40,
                icon: 3,
                btn2: cancel
            }, type ? {} : options));
        },

        msg: function(content, options, end) { //最常用提示层
            var type = typeof options === 'function',
                rskin = ready.config.skin;
            var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '') || 'layui-layer-msg';
            var shift = doms.anim.length - 1;
            if (type) end = options;
            return layer.open($.extend({
                content: content,
                time: 3000,
                shade: false,
                shift: 0,
                notOpen: 1,
                skin: skin,
                title: false,
                noClose: true,
                closeBtn: false,
                minute: 20,
                btn: false,
                end: end
            }, (type && !ready.config.skin) ? {
                skin: skin + ' layui-layer-hui',
                shift: shift
            } : function() {
                options = options || {};
                if (options.icon === -1 || options.icon === undefined && !ready.config.skin) {
                    options.skin = skin + ' ' + (options.skin || 'layui-layer-hui');
                }
                return options;
            }()));
        },

        load: function(icon, options) {
            return layer.open($.extend({
                type: 3,
                notOpen: 1,
                icon: icon || 0,
                shift: 0,
                time: 240 * 1000,
                shade: [0.3, '#000']
            }, options));
        },

        tips: function(content, follow, options) {
            return layer.open($.extend({
                type: 4,
                content: [content, follow],
                closeBtn: false,
                notOpen: 1,
                time: 0,
                shift: 0,
                minute: 10,
                tips: 2,
                shade: false,
                maxW: '300px'
            }, options));
        }
    };

    var Class = function(setings) {
        var that = this;
        that.index = ++layer.index;
        that.config = $.extend({}, that.config, ready.config, setings);
        that.creat();
    };

    Class.pt = Class.prototype;

    //缓存常用字符
    var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];
    doms.anim = ['layer-anim', 'layer-anim-01', 'layer-anim-02', 'layer-anim-03', 'layer-anim-04', 'layer-anim-05', 'layer-anim-06'];

    //默认配置
    Class.pt.config = {
        type: 0,
        shade: 0.4,
        fix: true,
        noClose: false,
        move: doms[1],
        title: '&#x4FE1;&#x606F;',
        offset: 'auto',
        area: ['auto', 'auto'],
        closeBtn: 1,
        time: 0, //0表示不自动关闭
        zIndex: 18999,
        maxWidth: 360,
        shift: 0,
        minute: 0, //非谷歌浏览器自适应高度
        icon: -1,
        scrollbar: true, //是否允许浏览器滚动条
        tips: 1
    };

    //容器
    Class.pt.vessel = function(conType, callback) {
        var that = this,
            times = that.index,
            config = that.config;
        if (config.type == 1 && (config.area[0] == "" || config.area[0] == "auto")) {
            config.minW = "500px";
        }
        var zIndex = config.zIndex + times,
            titype = typeof config.title === 'object';
        var ismax = config.maxmin && (config.type === 1 || config.type === 2);
        var titleHTML = (config.title ? '<div class="layui-layer-title" style="' + (titype ? config.title[1] : '') + '">' +
            (titype ? config.title[0] : config.title) +
            '</div>' : '');

        var minWidth = (config.minW ? 'min-width:' + config.minW + ';' : ''),
            maxWidth = (config.maxW ? 'max-width:' + config.maxW + ';' : ''),
            maxHeight = (config.maxH ? 'max-height:' + config.maxH + ';' : '');

        var styleStr = 'style="z-index: ' + zIndex + '; width:' + config.area[0] + '; height:' + config.area[1] + (config.fix ? '' : ';position:absolute;') + '; ' + minWidth + ' ' + maxWidth + ' ' + maxHeight + ' "';
        config.zIndex = zIndex;
        // if(config.type != 3){
        //     var userAgent = navigator.userAgent;
        //     if (userAgent.indexOf('WOW') < 0 && userAgent.indexOf("Edge") < 0) {
        //         var strStart = userAgent.indexOf('Chrome'),
        //             strStop = userAgent.indexOf(' Safari'),
        //             temp = userAgent.substring(strStart, strStop),
        //             delStart = temp.indexOf('/')+1, 
        //             broName = temp.substr(delStart,2);
        //             if(broName > 60){//chrome 61版本弹窗花屏
        //                 config.shade = 0;
        //             }

        //     }
        // }

        callback([
            //遮罩
            config.shade ? (
                '<div class="layui-layer-shade" id="layui-layer-shade' + times + '" times="' + times + '"\
            style="' + ('z-index:' + (zIndex - 1) + '; \
            background-color:rgba(0,0,0,' + (config.shade[0] || config.shade) + ');') + '">\
          </div>'
            ) : '',
            // '<div class="layui-layer-shade" id="layui-layer-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; background-color:'+ (config.shade[1]||'#000') +'; opacity:'+ (config.shade[0]||config.shade) +'; filter:alpha(opacity='+ (config.shade[0]*100||config.shade*100) +');') +'"></div>',
            //主体
            '<div class="' + doms[0] + ' ' + (doms.anim[config.shift] || '') + (' layui-layer-' + ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin || '') + '" id="' + doms[0] + times + '" type="' + ready.type[config.type] + '" times="' + times + '" showtime="' + config.time + '" conType="' + (conType ? 'object' : 'string') + '" ' + styleStr + '>' +
            (conType && config.type != 2 ? '' : titleHTML) +
            '<div id="' + (config.id || '') + '" class="layui-layer-content' + ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' : '') + (config.type == 3 ? ' layui-layer-loading' + config.icon : '') + '">' +
            (config.type == 0 && config.icon !== -1 ? '<i class="layui-layer-ico layui-layer-ico' + config.icon + '"></i>' : '') +
            (config.type == 1 && conType ? '' : (config.content || '')) +
            '</div>' +
            '<span class="layui-layer-setwin">' + function() {
                var closebtn = ismax ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : '';
                config.closeBtn && (closebtn += '<a class="layui-layer-ico ' + doms[7] + ' ' + doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) + '" href="javascript:;"></a>');
                return closebtn;
            }() + '</span>' +
            (config.btn ? function() {
                var button = '';
                typeof config.btn === 'string' && (config.btn = [config.btn]);
                for (var i = 0, len = config.btn.length; i < len; i++) {
                    button += '<button class="btn btn-' + (i == 0 ? "mj" : "") + ' ' + doms[6] + '' + i + '" >' + config.btn[i] + '</button>'
                }
                return '<div class="' + doms[6] + '">' + button + '</div>'
            }() : '') +
            '</div>'
        ], titleHTML);
        return that;
    };

    //创建骨架
    Class.pt.creat = function() {
        var that = this,
            config = that.config,
            times = that.index,
            nodeIndex;
        var content = config.content,
            conType = typeof content === 'object';

        if ($('#' + config.id)[0]) return;

        if (typeof config.area === 'string') {
            config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
        }

        switch (config.type) {
            case 0:
                config.btn = ('btn' in config) ? config.btn : ready.btn[0];
                if (!config.noClose) {
                    layer.closeAll('dialog');
                }
                break;
            case 2:
                var content = config.content = conType ? config.content : [config.content || 'http://layer.layui.com', 'auto'];
                var timestamp = 'timestamp=' + new Date().getTime();
                config.content = '<iframe scrolling="' + (config.content[1] || 'auto') + '" allowtransparency="true" \
        id="' + doms[4] + '' + times + '" name="' + doms[4] + '' + times + '" onload="this.className=\'\';" \
        class="layui-layer-load" frameborder="0" src="' + config.content[0] + (config.content[0].indexOf('?') === -1 ? '?' : '&') + timestamp + '"></iframe>';
                break;
            case 3:
                config.title = false;
                config.closeBtn = false;
                config.icon === -1 && (config.icon === 0);
                layer.closeAll('loading');
                break;
            case 4:
                conType || (config.content = [config.content, 'body']);
                config.follow = config.content[1];
                config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
                config.title = false;
                config.fix = false;
                config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
                config.tipsMore || layer.closeAll('tips');
                break;
        }

        //建立容器
        that.vessel(conType, function(html, titleHTML) {
            $('body').append(html[0]);
            conType ? function() {
                (config.type == 2 || config.type == 4) ? function() {
                    $('body').append(html[1]);
                }() : function() {
                    if (!content.parents('.' + doms[0])[0]) {
                        content.show().addClass('layui-layer-wrap').wrap(html[1]);
                        $('#' + doms[0] + times).find('.' + doms[5]).before(titleHTML);
                    }
                }();
            }() : $('body').append(html[1]);
            that.elm = $('#' + doms[0] + times);
            config.scrollbar || doms.html.css('overflow', 'hidden').attr('layer-full', times);
        }).auto(times);

        config.type == 2 && layer.ie6 && that.elm.find('iframe').attr('src', content[0]);
        $(document).off('keydown', ready.enter).on('keydown', ready.enter);
        that.elm.on('keydown', function(e) {
            $(document).off('keydown', ready.enter);
        });

        //坐标自适应浏览器窗口尺寸
        config.type == 4 ? that.tips() : that.offset();
        if (config.fix) {
            win.on('resize', function() {
                that.offset();
                (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
                config.type == 4 && that.tips();
            });
        }

        config.time <= 0 || setTimeout(function() {
            layer.close(that.index)
        }, config.time);
        that.move().callback();
    };

    //自适应
    Class.pt.auto = function(index) {
        var that = this,
            config = that.config,
            elm = $('#' + doms[0] + index);
        if (config.area[0] === '' && config.maxWidth > 0) {
            //为了修复IE7下一个让人难以理解的bug
            if (/MSIE 7/.test(navigator.userAgent) && config.btn) {
                elm.width(elm.innerWidth());
            }
            elm.outerWidth() > config.maxWidth && elm.width(config.maxWidth);
        }
        var area = [elm.innerWidth(), elm.innerHeight()];
        var titHeight = elm.find(doms[1]).outerHeight() || 0;
        var btnHeight = elm.find('.' + doms[6]).outerHeight() || 0;

        function setHeight(elem) {
            elem = elm.find(elem);
            if (elm.hasClass('layui-layer-photos')) {
                return false;
            }
            var paddingNum = 2 * (parseFloat(elem.css('padding')) | 0);
            if (paddingNum == 0 && (config.area[1] != "" || config.area[1] != "auto")) {
                paddingNum = config.minute;
            }
            if (config.notOpen != 1 && config.type != 2) { //解决火狐下layer.open按钮会错位
                paddingNum = 40;
            }
            elem.height(area[1] - titHeight - btnHeight - paddingNum);

            if (config.type == 3 && elem.height() == 0) {
                elem.height('64');
            }
        }
        switch (config.type) {
            case 2:
                setHeight('iframe');
                break;
            case 3:
                setHeight();
            default:
                if (config.area[1] === '') {
                    if (config.fix && area[1] >= win.height()) {
                        area[1] = win.height();
                        setHeight('.' + doms[5]);
                    }
                } else {
                    setHeight('.' + doms[5]);
                }
                break;
        }
        return that;
    };

    //计算坐标

    Class.pt.offset = function() {
        var that = this,
            config = that.config,
            elm = that.elm;
        var area = [elm.outerWidth(), elm.outerHeight()];
        var type = typeof config.offset === 'object';
        that.offsetTop = (win.height() - area[1]) / 2;
        that.offsetLeft = (win.width() - area[0]) / 2;
        if (type) {
            that.offsetTop = config.offset[0];
            that.offsetLeft = config.offset[1] || that.offsetLeft;
        } else if (config.offset !== 'auto') {
            that.offsetTop = config.offset;
            if (config.offset === 'rb') { //右下角
                that.offsetTop = win.height() - area[1];
                that.offsetLeft = win.width() - area[0];
            }
        }
        if (config.type == 3) {
            that.offsetTop = (win.height() - 64) / 2;
            that.offsetLeft = (win.width() - 64) / 2;
        }
        if (!config.fix) {
            that.offsetTop = /%$/.test(that.offsetTop) ?
                win.height() * parseFloat(that.offsetTop) / 100 :
                parseFloat(that.offsetTop);
            that.offsetLeft = /%$/.test(that.offsetLeft) ?
                win.width() * parseFloat(that.offsetLeft) / 100 :
                parseFloat(that.offsetLeft);
            that.offsetTop += win.scrollTop();
            that.offsetLeft += win.scrollLeft();
        }
        elm.css({ top: that.offsetTop, left: that.offsetLeft });
    };

    //Tips
    Class.pt.tips = function() {
        var that = this,
            config = that.config,
            elm = that.elm;
        var layArea = [elm.outerWidth(), elm.outerHeight()],
            follow = $(config.follow);
        if (!follow[0]) follow = $('body');
        var goal = {
                width: follow.outerWidth(),
                height: follow.outerHeight(),
                top: follow.offset().top,
                left: follow.offset().left
            },
            tipsG = elm.find('.layui-layer-TipsG');

        var guide = config.tips[0];
        config.tips[1] || tipsG.remove();

        goal.autoLeft = function() {
            if (goal.left + layArea[0] - win.width() > 0) {
                goal.tipLeft = goal.left + goal.width - layArea[0];
                tipsG.css({ right: 12, left: 'auto' });
            } else {
                goal.tipLeft = goal.left;
            };
        };

        //辨别tips的方位
        goal.where = [function() { //上        
            goal.autoLeft();
            goal.tipTop = goal.top - layArea[1] - 10;
            tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
        }, function() { //右
            goal.tipLeft = goal.left + goal.width + 10;
            goal.tipTop = goal.top - 10;
            tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]);
        }, function() { //下
            goal.autoLeft();
            goal.tipTop = goal.top + goal.height + 10;
            tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
        }, function() { //左
            goal.tipLeft = goal.left - layArea[0] - 10;
            goal.tipTop = goal.top;
            tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
        }];
        goal.where[guide - 1]();

        /* 8*2为小三角形占据的空间 */
        if (guide === 1) {
            goal.top - (win.scrollTop() + layArea[1] + 8 * 2) < 0 && goal.where[2]();
        } else if (guide === 2) {
            win.width() - (goal.left + goal.width + layArea[0] + 8 * 2) > 0 || goal.where[3]()
        } else if (guide === 3) {
            (goal.top - win.scrollTop() + goal.height + layArea[1] + 8 * 2) - win.height() > 0 && goal.where[0]();
        } else if (guide === 4) {
            layArea[0] + 8 * 2 - goal.left > 0 && goal.where[1]()
        }

        elm.find('.' + doms[5]).css({
            'background-color': config.tips[1],
            'padding-right': (config.closeBtn ? '30px' : '')
        });
        elm.css({ left: goal.tipLeft, top: goal.tipTop });
    }

    //拖拽层
    Class.pt.move = function() {
        var that = this,
            config = that.config,
            conf = {
                setY: 0,
                moveLayer: function() {
                    var elm = conf.elm,
                        mgleft = parseInt(elm.css('margin-left'));
                    var lefts = parseInt(conf.move.css('left'));
                    mgleft === 0 || (lefts = lefts - mgleft);
                    if (elm.css('position') !== 'fixed') {
                        lefts = lefts - elm.parent().offset().left;
                        conf.setY = 0;
                    }
                    elm.css({ left: lefts, top: parseInt(conf.move.css('top')) - conf.setY });
                }
            };

        var movedom = that.elm.find(config.move);
        config.move && movedom.attr('move', 'ok');
        movedom.css({ cursor: config.move ? 'move' : 'auto' });

        $(config.move).on('mousedown', function(M) {
            M.preventDefault();
            if ($(this).attr('move') === 'ok') {
                conf.ismove = true;
                conf.elm = $(this).parents('.' + doms[0]);
                var xx = conf.elm.offset().left,
                    yy = conf.elm.offset().top,
                    ww = conf.elm.outerWidth() - 6,
                    hh = conf.elm.outerHeight() - 6;
                if (!$('#layui-layer-moves')[0]) {
                    $('body').append('<div id="layui-layer-moves" class="layui-layer-moves" style="left:' + xx + 'px; top:' + yy + 'px; width:' + ww + 'px; height:' + hh + 'px; z-index:2147483584"></div>');
                }
                conf.move = $('#layui-layer-moves');
                config.moveType && conf.move.css({ visibility: 'hidden' });

                conf.moveX = M.pageX - conf.move.position().left;
                conf.moveY = M.pageY - conf.move.position().top;
                conf.elm.css('position') !== 'fixed' || (conf.setY = win.scrollTop());
            }
        });

        $(document).mousemove(function(M) {
            if (conf.ismove) {
                var offsetX = M.pageX - conf.moveX,
                    offsetY = M.pageY - conf.moveY;
                M.preventDefault();

                //控制元素不被拖出窗口外
                if (!config.moveOut) {
                    conf.setY = win.scrollTop();
                    var setRig = win.width() - conf.move.outerWidth(),
                        setTop = conf.setY;
                    offsetX < 0 && (offsetX = 0);
                    offsetX > setRig && (offsetX = setRig);
                    offsetY < setTop && (offsetY = setTop);
                    offsetY > win.height() - conf.move.outerHeight() + conf.setY && (offsetY = win.height() - conf.move.outerHeight() + conf.setY);
                }

                conf.move.css({ left: offsetX, top: offsetY });
                config.moveType && conf.moveLayer();

                offsetX = offsetY = setRig = setTop = null;
            }
        }).mouseup(function() {
            try {
                if (conf.ismove) {
                    conf.moveLayer();
                    conf.move.remove();
                    config.moveEnd && config.moveEnd();
                }
                conf.ismove = false;
            } catch (e) {
                conf.ismove = false;
            }
        });
        return that;
    };

    Class.pt.callback = function() {
        var that = this,
            elm = that.elm,
            config = that.config;
        that.openLayer();
        if (config.success) {
            if (config.type == 2) {
                elm.find('iframe').on('load', function() {
                    config.success(elm, that.index);
                });
            } else {
                config.success(elm, that.index);
            }
        }
        layer.ie6 && that.IE6(elm);

        //按钮
        elm.find('.' + doms[6]).children('button').on('click', function() {
            var index = $(this).index();
            if (index === 0) {
                if (config.yes) {
                    config.yes(that.index, elm)
                } else if (config['btn1']) {
                    config['btn1'](that.index, elm)
                } else {
                    layer.close(that.index);
                }
            } else if (index == 1) {
                if (config.checkPrev && config.btn.length > 2) {
                    config.checkPrev(that.index, elm)
                } else if (config['btn2']) {
                    config['btn2'](that.index, elm)
                } else {
                    layer.close(that.index);
                }
            } else {
                var close = config['btn' + (index + 1)] && config['btn' + (index + 1)](that.index, elm);
                close === false || layer.close(that.index);
            }
        });

        //取消
        function cancel() {
            var close = config.cancel && config.cancel(that.index, elm);
            close === false || layer.close(that.index);
        }

        //右上角关闭回调
        elm.find('.' + doms[7]).on('click', cancel);

        //点遮罩关闭
        if (config.shadeClose) {
            $('#layui-layer-shade' + that.index).on('click', function() {
                layer.close(that.index);
            });

            // 图片层ESC关闭
            $(document).on('keydown', function(e) {
                if (e.keyCode == 27) {
                    layer.close(that.index);
                }
            });
        }

        //最小化
        elm.find('.layui-layer-min').on('click', function() {
            layer.min(that.index, config);
            config.min && config.min(elm);
        });

        //全屏/还原
        elm.find('.layui-layer-max').on('click', function() {
            if ($(this).hasClass('layui-layer-maxmin')) {
                layer.restore(that.index);
                config.restore && config.restore(elm);
            } else {
                layer.full(that.index, config);
                config.full && config.full(elm);
            }
        });

        config.end && (ready.end[that.index] = config.end);
    };

    //for ie6 恢复select
    ready.reselect = function() {
        $.each($('select'), function(index, value) {
            var sthis = $(this);
            if (!sthis.parents('.' + doms[0])[0]) {
                (sthis.attr('layer') == 1 && $('.' + doms[0]).length < 1) && sthis.removeAttr('layer').show();
            }
            sthis = null;
        });
    };

    Class.pt.IE6 = function(elm) {
        var that = this,
            _ieTop = elm.offset().top;

        //ie6的固定与相对定位
        function ie6Fix() {
            elm.css({ top: _ieTop + (that.config.fix ? win.scrollTop() : 0) });
        };
        ie6Fix();
        win.scroll(ie6Fix);

        //隐藏select
        $('select').each(function(index, value) {
            var sthis = $(this);
            if (!sthis.parents('.' + doms[0])[0]) {
                sthis.css('display') === 'none' || sthis.attr({ 'layer': '1' }).hide();
            }
            sthis = null;
        });
    };

    //需依赖原型的对外方法
    Class.pt.openLayer = function() {
        var that = this;

        //置顶当前窗口
        layer.zIndex = that.config.zIndex;
        layer.setTop = function(elm) {
            var setZindex = function() {
                layer.zIndex++;
                elm.css('z-index', layer.zIndex + 1);
            };
            layer.zIndex = parseInt(elm[0].style.zIndex);
            elm.on('mousedown', setZindex);
            return layer.zIndex;
        };
    };

    ready.record = function(elm) {
        var area = [
            elm.outerWidth(),
            elm.outerHeight(),
            elm.position().top,
            elm.position().left + parseFloat(elm.css('margin-left'))
        ];
        elm.find('.layui-layer-max').addClass('layui-layer-maxmin');
        elm.attr({ area: area });
    };

    ready.rescollbar = function(index) {
        if (doms.html.attr('layer-full') == index) {
            if (doms.html[0].style.removeProperty) {
                doms.html[0].style.removeProperty('overflow');
            } else {
                doms.html[0].style.removeAttribute('overflow');
            }
            doms.html.removeAttr('layer-full');
        }
    };

    /** 内置成员 */

    window.layer = layer;

    //获取子iframe的DOM
    layer.getChildFrame = function(selector, index) {
        index = index || $('.' + doms[4]).attr('times');
        return $('#' + doms[0] + index).find('iframe').contents().find(selector);
    };

    //得到当前iframe层的索引，子iframe时使用
    layer.getFrameIndex = function(name) {
        return $('#' + name).parents('.' + doms[4]).attr('times');
    };

    //iframe层自适应宽高
    layer.iframeAuto = function(index, addH) {
        if (!index) return;
        addH = addH || 0;
        var heg = layer.getChildFrame('html', index).outerHeight();
        var elm = $('#' + doms[0] + index);
        var titHeight = elm.find(doms[1]).outerHeight() || 0;
        var btnHeight = elm.find('.' + doms[6]).outerHeight() || 0;
        elm.css({ height: heg + titHeight + btnHeight + addH });
        elm.find('iframe').css({ height: heg + addH });
    };

    //重置iframe url
    layer.iframeSrc = function(index, url) {
        $('#' + doms[0] + index).find('iframe').attr('src', url);
    };

    //设定层的样式
    layer.style = function(index, options) {
        var elm = $('#' + doms[0] + index),
            type = elm.attr('type');
        var titHeight = elm.find(doms[1]).outerHeight() || 0;
        var btnHeight = elm.find('.' + doms[6]).outerHeight() || 0;
        if (type === ready.type[1] || type === ready.type[2]) {
            elm.css(options);
            if (type === ready.type[2]) {
                elm.find('iframe').css({
                    height: parseFloat(options.height) - titHeight - btnHeight
                });
            }
        }
    };

    /*  
      Author:Bolin,
      remark:动态渲染的数据需要高度自适应
    */
    //重新自适应高度  
    layer.resetHeight = function(index, autoFlag) {
        var elm = $('#' + doms[0] + index),
            type = elm.attr('type');
        autoFlag = autoFlag || false;
        var titHeight = (elm.find(doms[1]).outerHeight() * 1) || 0,
            btnHeight = (elm.find('.' + doms[6] + ':not(.custom)').outerHeight() * 1) || 0,
            domH = titHeight + btnHeight + 40; //40为padding  page默认20*2
        var elem = elm.find('.' + doms[5]);

        //只有page才计算
        if (type != ready.type[1]) {
            return false;
        }
        if (autoFlag) {
            var _type = typeof autoFlag;
            var _height = 0;
            if (_type == 'string') {
                var _autoH = autoFlag.split('px')[0] * 1;
                _height = (_autoH + domH) >= win.height() ? win.height() : (_autoH + domH);
                elem.height(_height - domH);
                elm.height(_height);
            }
            var _offsetTop = (win.height() - elm.height()) / 2;
            elm.css('top', _offsetTop);
            return false;
        }

        var elemScrollH = elem[0].scrollHeight,
            elemOffsetH = elem[0].offsetHeight;
        var elemSetH = (elemScrollH + domH) >= win.height() ? win.height() : (elemScrollH + domH);

        //无滚动不计算
        if (elemScrollH <= elemOffsetH) {
            return false;
        }

        elem.height(elemSetH - domH);
        elm.height(elemSetH);
        var _offsetTop = (win.height() - elm.height()) / 2;
        elm.css('top', _offsetTop);
    }

    //最小化
    layer.min = function(index, options) {
        var elm = $('#' + doms[0] + index);
        var titHeight = elm.find(doms[1]).outerHeight() || 0;
        ready.record(elm);
        layer.style(index, { width: 180, height: titHeight, overflow: 'hidden' });
        elm.find('.layui-layer-min').hide();
        elm.attr('type') === 'page' && elm.find(doms[4]).hide();
        ready.rescollbar(index);
    };

    //还原
    layer.restore = function(index) {
        var elm = $('#' + doms[0] + index),
            area = elm.attr('area').split(',');
        var type = elm.attr('type');
        layer.style(index, {
            width: parseFloat(area[0]),
            height: parseFloat(area[1]),
            top: parseFloat(area[2]),
            left: parseFloat(area[3]),
            overflow: 'visible'
        });
        elm.find('.layui-layer-max').removeClass('layui-layer-maxmin');
        elm.find('.layui-layer-min').show();
        elm.attr('type') === 'page' && elm.find(doms[4]).show();
        ready.rescollbar(index);
    };

    //全屏
    layer.full = function(index) {
        var elm = $('#' + doms[0] + index),
            timer;
        ready.record(elm);
        if (!doms.html.attr('layer-full')) {
            doms.html.css('overflow', 'hidden').attr('layer-full', index);
        }
        clearTimeout(timer);
        timer = setTimeout(function() {
            var isfix = elm.css('position') === 'fixed';
            layer.style(index, {
                top: isfix ? 0 : win.scrollTop(),
                left: isfix ? 0 : win.scrollLeft(),
                width: win.width(),
                height: win.height()
            });
            elm.find('.layui-layer-min').hide();
        }, 100);
    };

    //改变title
    layer.title = function(name, index) {
        var title = $('#' + doms[0] + (index || layer.index)).find(doms[1]);
        title.html(name);
    };

    /*//改变按钮
    layer.btnList = function(list, index){
      var btn = $('#'+ doms[0] + (index||layer.index)).find('.'+doms[6]);
      var button = '';
      for(var i = 0, len = list.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ list[i] +'</a>'
      }
      btn.html(button);
    };*/

    //关闭layer总方法
    layer.close = function(index) {
        var elm = $('#' + doms[0] + index),
            type = elm.attr('type');
        if (!elm[0]) return;
        if (type === ready.type[1] && elm.attr('conType') === 'object') {
            elm.children(':not(.' + doms[5] + ')').remove();
            for (var i = 0; i < 2; i++) {
                elm.find('.layui-layer-wrap').unwrap().hide();
            }
        } else {
            //低版本IE 回收 iframe
            if (type === ready.type[2]) {
                try {
                    var iframe = $('#' + doms[4] + index)[0];
                    iframe.contentWindow.document.write('');
                    iframe.contentWindow.close();
                    elm.find('.' + doms[5])[0].removeChild(iframe);
                } catch (e) {}
            }
            elm[0].innerHTML = '';
            elm.remove();
        }
        $('#layui-layer-moves, #layui-layer-shade' + index).remove();
        layer.ie6 && ready.reselect();
        ready.rescollbar(index);
        $(document).off('keydown', ready.enter);
        typeof ready.end[index] === 'function' && ready.end[index]();
        delete ready.end[index];
    };

    //关闭所有层
    layer.closeAll = function(type) {
        $.each($('.' + doms[0]), function() {
            var othis = $(this);
            var is = type ? (othis.attr('type') === type) : 1;
            is && layer.close(othis.attr('times'));
            is = null;
        });
    };

    /** 
      拓展模块，layui开始合并在一起
     */

    var cache = layer.cache || {},
        skin = function(type) {
            return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-' + type) : '');
        };

    //仿系统prompt
    layer.prompt = function(options, yes) {
        options = options || {};
        if (typeof options === 'function') yes = options;
        var prompt, content = options.formType == 2 ? '<textarea class="layui-layer-input">' + (options.value || '') + '</textarea>' : function() {
            return '<input type="' + (options.formType == 1 ? 'password' : 'text') + '" class="layui-layer-input" value="' + (options.value || '') + '">';
        }();

        return layer.open($.extend({
            btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],
            content: content,
            minute: 40,
            skin: 'layui-layer-prompt' + skin('prompt'),
            success: function(elm, index) {
                prompt = elm.find('.layui-layer-input');
                prompt.select();
            },
            yes: function(index) {
                var value = prompt.val();
                if (value === '') {
                    prompt.focus();
                } else if (value.length > (options.maxlength || 500)) {
                    layer.tips('&#x6700;&#x591A;&#x8F93;&#x5165;' + (options.maxlength || 500) + '&#x4E2A;&#x5B57;&#x6570;', prompt, { tips: 1 });
                } else {
                    yes && yes(value, index, prompt);
                }
            }
        }, options));
    };

    //tab层
    layer.tab = function(options) {
        options = options || {};
        var tab = options.tab || {};
        return layer.open($.extend({
            type: 1,
            skin: 'layui-layer-tab' + skin('tab'),
            title: function() {
                var len = tab.length,
                    ii = 1,
                    str = '';
                if (len > 0) {
                    str = '<span class="layui-layer-tabnow">' + tab[0].title + '</span>';
                    for (; ii < len; ii++) {
                        str += '<span>' + tab[ii].title + '</span>';
                    }
                }
                return str;
            }(),
            content: '<ul class="layui-layer-tabmain">' + function() {
                var len = tab.length,
                    ii = 1,
                    str = '';
                if (len > 0) {
                    str = '<li class="layui-layer-tabli xubox_tab_layer">' + (tab[0].content || 'no content') + '</li>';
                    for (; ii < len; ii++) {
                        str += '<li class="layui-layer-tabli">' + (tab[ii].content || 'no  content') + '</li>';
                    }
                }
                return str;
            }() + '</ul>',
            success: function(elm) {
                var btn = elm.find('.layui-layer-title').children();
                var main = elm.find('.layui-layer-tabmain').children();
                btn.on('mousedown', function(e) {
                    e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                    var othis = $(this),
                        index = othis.index();
                    othis.addClass('layui-layer-tabnow').siblings().removeClass('layui-layer-tabnow');
                    main.eq(index).show().siblings().hide();
                    typeof options.change === 'function' && options.change(index);
                });
            }
        }, options));
    };

    //相册层
    layer.photos = function(options, loop, key) {
        var dict = {};
        options = options || {};
        if (!options.photos) return;
        var type = options.photos.constructor === Object;
        var photos = type ? options.photos : {},
            data = photos.data || [];
        var start = photos.start || 0;
        dict.imgIndex = (start | 0) + 1;

        options.img = options.img || 'img';

        if (!type) { //页面直接获取
            var parent = $(options.photos),
                pushData = function() {
                    data = [];
                    parent.find(options.img).each(function(index) {
                        var othis = $(this);
                        othis.attr('layer-index', index);
                        data.push({
                            alt: othis.attr('alt'),
                            pid: othis.attr('layer-pid'),
                            src: othis.attr('layer-src') || othis.attr('src'),
                            thumb: othis.attr('src')
                        });
                    })
                };

            pushData();

            if (data.length === 0) return;

            loop || parent.on('click', options.img, function() {
                var othis = $(this),
                    index = othis.attr('layer-index');
                layer.photos($.extend(options, {
                    photos: {
                        start: index,
                        data: data,
                        tab: options.tab
                    },
                    full: options.full
                }), true);
                pushData();
            })

            //不直接弹出
            if (!loop) return;

        } else if (data.length === 0) {
            return layer.msg('&#x6CA1;&#x6709;&#x56FE;&#x7247;');
        }

        //上一张
        dict.imgprev = function(key) {
            dict.imgIndex--;
            if (dict.imgIndex < 1) {
                dict.imgIndex = data.length;
            }
            dict.tabimg(key);
        };

        //下一张
        dict.imgnext = function(key, errorMsg) {
            dict.imgIndex++;
            if (dict.imgIndex > data.length) {
                dict.imgIndex = 1;
                if (errorMsg) { return };
            }
            dict.tabimg(key)
        };

        //方向键
        dict.keyup = function(event) {
            if (!dict.end) {
                var code = event.keyCode;
                event.preventDefault();
                if (code === 37) {
                    dict.imgprev(true);
                } else if (code === 39) {
                    dict.imgnext(true);
                } else if (code === 27) {
                    layer.close(dict.index.index);
                }
            }
        }

        //切换
        dict.tabimg = function(key) {
            if (data.length <= 1) return;
            photos.start = dict.imgIndex - 1;
            layer.close(dict.index.index);
            layer.photos(options, true, key);
        }

        //一些动作
        dict.event = function() {
            dict.bigimg.hover(function() {
                dict.imgsee.show();
            }, function() {
                dict.imgsee.hide();
            });

            dict.bigimg.find('.layui-layer-imgprev').on('click', function(event) {
                event.preventDefault();
                dict.imgprev();
            });

            dict.bigimg.find('.layui-layer-imgnext').on('click', function(event) {
                event.preventDefault();
                dict.imgnext();
            });

            $(document).on('keyup', dict.keyup);
        };

        //图片预加载
        function loadImage(url, callback, error) {
            var img = new Image();
            img.src = url;
            if (img.complete) {
                return callback(img);
            }
            img.onload = function() {
                img.onload = null;
                callback(img);
            };
            img.onerror = function(e) {
                img.onerror = null;
                error(e);
            };
        };

        dict.loadi = layer.load(1, {
            shade: 'shade' in options ? false : 0.9,
            scrollbar: false
        });
        loadImage(data[start].src, function(img) {
            layer.close(dict.loadi.index);
            dict.index = layer.open($.extend({
                type: 1,
                area: function() {
                    var imgarea = [img.width, img.height];
                    var winarea = [$(window).width() - 50, $(window).height() - 50];

                    //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
                    if (!options.full && (imgarea[0] > winarea[0] || imgarea[1] > winarea[1])) {
                        var wh = [imgarea[0] / winarea[0], imgarea[1] / winarea[1]]; //取宽度缩放比例、高度缩放比例
                        if (wh[0] > wh[1]) { //取缩放比例最大的进行缩放
                            imgarea[0] = imgarea[0] / wh[0];
                            imgarea[1] = imgarea[1] / wh[0];
                        } else if (wh[0] < wh[1]) {
                            imgarea[0] = imgarea[0] / wh[1];
                            imgarea[1] = imgarea[1] / wh[1];
                        }
                    }
                    return [imgarea[0] + 'px', imgarea[1] + 'px'];
                }(),
                title: false,
                shade: 0.9,
                shadeClose: true,
                closeBtn: false,
                move: '.layui-layer-phimg img',
                moveType: 1,
                scrollbar: false,
                moveOut: true,
                shift: Math.random() * 5 | 0,
                skin: 'layui-layer-photos' + skin('photos'),
                content: '<div class="layui-layer-phimg">' +
                    '<img src="' + data[start].src + '" alt="' + (data[start].alt || '') + '" layer-pid="' + data[start].pid + '">' +
                    '<div class="layui-layer-imgsee">' +
                    (data.length > 1 ? '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>' : '') +
                    '<div class="layui-layer-imgbar" style="display:' + (key ? 'block' : '') + '"><span class="layui-layer-imgtit"><a href="javascript:;">' + (data[start].alt || '') + '</a><em>' + dict.imgIndex + '/' + data.length + '</em></span></div>' +
                    '</div>' +
                    '</div>',
                success: function(elm, index) {
                    dict.bigimg = elm.find('.layui-layer-phimg');
                    dict.imgsee = elm.find('.layui-layer-imguide,.layui-layer-imgbar');
                    dict.event(elm);
                    options.tab && options.tab(data[start], elm);
                },
                end: function() {
                    dict.end = true;
                    $(document).off('keyup', dict.keyup);
                }
            }, options));
        }, function() {
            layer.close(dict.loadi);
            layer.msg('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', {
                time: 30000,
                btn: ['&#x4E0B;&#x4E00;&#x5F20;', '&#x4E0D;&#x770B;&#x4E86;'],
                yes: function() {
                    data.length > 1 && dict.imgnext(true, true);
                }
            });
        });
    };

    //主入口
    ready.run = function() {
        $ = jQuery;
        win = $(window);
        doms.html = $('html');
        layer.open = function(deliver) {
            var o = new Class(deliver);
            return o;
        };
    };

    'function' === typeof define ? define(function() {
        ready.run();
        layer.use('skin/layer.css');
        return layer;
    }) : function() {
        ready.run();
        layer.use('skin/layer.css');
    }();

}(window);