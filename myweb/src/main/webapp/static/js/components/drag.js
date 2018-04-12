define(function(require, exports, module) {
    $.fn.DDSort = function(options) {
        var $doc = $(document),
            fnEmpty = function() {},
            settings = $.extend(true, {
                down: fnEmpty,
                move: fnEmpty,
                up: fnEmpty,
                target: 'li',
                cloneStyle: {
                    'background-color': '#eee'
                },
                floatStyle: {
                    'position': 'fixed',
                    'background': '#dfe3ec'
                }
            }, options);
        return this.each(function() {
            var that = $(this),
                height = 'height',
                width = 'width';
            if (that.css('box-sizing') == 'border-box') {
                height = 'outerHeight';
                width = 'outerWidth';
            }
            that.on('mousedown.DDSort', settings.target, function(e) {
                //只允许鼠标左键拖动
                if (e.which != 1) {
                    return;
                }

                //防止表单元素失效
                var tagName = e.target.tagName.toLowerCase();
                if (tagName == 'input' || tagName == 'textarea' || tagName == 'select' || tagName == 'button') {
                    return;
                }

                var THIS = this,
                    $this = $(THIS),
                    offset = $this.offset(),
                    thatOffsetTop = that.offset().top,
                    disY = e.pageY - offset.top,
                    thatScrollTop = that.scrollTop(),
                    scrollVal,
                    clone = $this.clone()
                    .css(settings.cloneStyle)
                    .css('height', $this[height]())
                    .empty(),

                    hasClone = 1,

                    //缓存计算
                    thisOuterHeight = $this.outerHeight(),
                    thatOuterHeight = that.outerHeight(),

                    //滚动速度
                    upSpeed = thisOuterHeight,
                    downSpeed = thisOuterHeight,
                    maxSpeed = thisOuterHeight * 3;

                settings.down.call(THIS);

                $doc.on('mousemove.DDSort', function(e) {
                    if (hasClone) {
                        $this.before(clone)
                            .css('width', $this[width]())
                            .css(settings.floatStyle)
                            .appendTo($this.parent());
                        hasClone = 0;
                    }

                    var left = 20,
                        top = e.pageY - thatOffsetTop + disY + 90,
                        prev = clone.prev(),
                        next = clone.next().not($this);
                    $this.css({
                        left: left,
                        top: top
                    });
                    if (prev.length && top < (prev.offset().top + prev.outerHeight() / 2 - thatOffsetTop + 90)) {
                        clone.after(prev);
                    } else if (next.length && top + thisOuterHeight > (next.offset().top + next.outerHeight() / 2 - thatOffsetTop + 90)) {
                        clone.before(next);
                    }

                    //向上滚动
                    if (top < (thatOffsetTop - thatOffsetTop + 90)) {

                        downSpeed = thisOuterHeight;
                        upSpeed = ++upSpeed > maxSpeed ? maxSpeed : upSpeed;
                        scrollVal = thatScrollTop - upSpeed;

                        //向下滚动
                    } else if (top + (thisOuterHeight - thatOffsetTop - thatOffsetTop + 90) > thatOuterHeight) {

                        upSpeed = thisOuterHeight;
                        downSpeed = ++downSpeed > maxSpeed ? maxSpeed : downSpeed;
                        scrollVal = thatScrollTop + downSpeed;
                    }

                    that.scrollTop(scrollVal);

                    settings.move.call(THIS);

                })
                .on('mouseup.DDSort', function() {
                    $doc.off('mousemove.DDSort mouseup.DDSort');
                    if (!hasClone) {
                        clone.before($this.removeAttr('style')).remove();
                        settings.up.call(THIS);
                    }
                });

                return false;
            });
        });
    };

});