var Validate = (function () {
	return {
		TIMEOUT: 1500, /* 倒计时时间 */
		noLayer: true,
		REG_ARR:{
			mobile : /^1[34578]\d{9}$/,//手机号
			icCard : /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i, //身份证
			passport : /^1[45][0-9]{7}|G[0-9]{8}|P[0-9]{7}|S[0-9]{7,8}|D[0-9]+$/,
			notNull : /^.*[^\s]+.*$/, //不为空
			integer_z : /^\+?[1-9][0-9]*$/, //正整数
			number : /^[0-9]*$/,    //数字
			number1: /^\d+(\.\d+)?$/,//有小数点的数字
			number2: /^\d+$/,//非空数字
			money : /^[0-9]+(.[0-9]{1,3})?$/,
            money1: /^(0|([1-9]\d{0,5}(\.\d{1,2})?))$/,
            money2: /^(0|([1-9]\d{0,10}(\.\d{1,2})?))$/,
			username: /^[\u4E00-\u9FA5\uF900-\uFA2D\w]{6,20}$/,
			banknum: /^\d{16}|\d{19}$/, // 银行卡号
			password: /^[a-zA-Z0-9]{6,15}$/, // 密码 6~15位字符
		},

		exam: function (ele, reg) {
			var type = ele.nodeName;
			var val = (type == 'textarea' ? $(ele).text() : $(ele).val());
			var trimVal = $.trim(val);
			if (type.toLowerCase() == 'textarea') {
				return trimVal != '';
			}else{
				return reg.test($.trim(val));
			}
		},

		showTipListen: function (msg, ele, regExp, resultEle) {
			var ind = $(ele).attr('layer-index');
			if (ind) {
				layer.close(ind);
				$(ele).attr('layer-index' ,'');
			}

			ind = layer.tips(msg, ele, {
				tipsMore: true,
				tips: [3,"#f23000"]
			}).index;

			$(ele).attr('layer-index', ind);

			Validate.bind(ele, msg, ['blur'], regExp, resultEle);

			setTimeout(function () {
				$(ele).attr('layer-index' ,'');
				layer.close(ind);
			}, Validate.TIMEOUT);
		},

		asignResult: function (resultEle, ele, result) {
			if (!$(ele).is(':visible')) { // 元素不可见 无论怎么检测 都是true
                result = true;
			}
			if (!result) {
				if (ele && $(ele))
					$(ele).attr('result', '0');
				$(resultEle).attr('result', '0');
			} else {
				if (ele && $(ele))
					$(ele).attr('result', '1');
				$(resultEle).attr('result', ($(resultEle).find('input[result=0]').length == 0) ? '1' : '0');
			}
		},

		check: function (ele, msg, regExp, resultEle) {
			var res = Validate.exam(ele, regExp);
			if (res) {
				$(ele).removeClass('errorBorder');
				if ($(ele).attr('layer-index') && Validate.noLayer) {
					layer.close($(ele).attr('layer-index'));
					$(ele).attr('layer-index', '');
				}
			} else {
				$(ele).addClass('errorBorder');

				//判断ele高度 ---- offsetTop + eleHeight + tipsHeight
				var elmTop = $(ele).offset().top + $(ele).height() + 40,
					parentH = 0, parentTop = 0,
					fixedH = 0;
				//判断是否弹窗
				var isInLayer = $(ele).parents('.layui-layer').length > 0;
				if (isInLayer){
					parentH = $(ele).parents('.layui-layer').height();
					parentTop = $(ele).parents('.layui-layer').scrollTop();
					fixedH = 60;
				}else{
					parentH = $(window).height();
					parentTop = $(window).scrollTop();
					fixedH = 120; //先随便写个，主要是分散式房源底部120
				}
				var elmFlag = true; 
				if (elmTop >= (parentTop - fixedH) && elmTop < (parentTop + parentH - fixedH)) {
                    elmFlag = true;
                }

				if (!$(ele).attr('layer-index') && Validate.noLayer && elmFlag) {
					Validate.showTipListen(msg, ele, regExp, resultEle);
				}
			}
			Validate.asignResult(resultEle, ele, res);
			return res;
		},

		bind: function (ele, msg, bindTypes, regExp, resultEle) {
			var callback = function (e) {
				Validate.check(ele, msg, regExp, resultEle);
			};

			bindTypes = [].concat(bindTypes);
			$.each(bindTypes, function (i, ob) {
				switch(ob) {
					case 'blur':
						$(ele).unbind(ob).blur(callback);
						break;
				}
			});
		},

		/**
		 * ele: MUST input / textarea #id 或者 .class
		 * name: 输入项的中文名 可不传
		 * type: 可以是预设好的'mobile'这样的模式,也可以是正则表达式的数组
		 * 		 如果是正则表达式数组的话，如果只有第一个值，表示输入过程中，都需要满足这个正则
		 * 		 如果有2个值，第一个表示输入过程要满足的正则，第二个输入框失焦需要满足的正则
		 * 		 正则表达式字符串规则参考上面定义的宏观INTEGER、MOBILE...
		 * param: 个别特殊预设好的类型，需要传入第二个参数,param
		 * resultEle: MUST 显示结果的div，会给div新增一个attr，名为'result',要求resultEle需要为所有ele的parent div
		 **/
		validate: function (ele, name, type, param, resultEle) {
			if (!ele || !resultEle)
				return;
			Validate.asignResult(resultEle, ele, true); // 先默认给OK

			name = name ? name : '内容';
			name = '请输入有效' + name;

			var val = $.trim($(ele).val());
			if (!val) {
				Validate.asignResult(resultEle, ele, false);
			}

			// if (!type)
			// 	type = Validate.TYPE_NOTNULL;
			// if ($.isArray(type)) { // 传入的是正则表达式
			// 	if (type[0].length) { // 输入过程中需要满足的正则
			// 		Validate.bind(ele, name, 'keyup', type[0], resultEle);
			// 	}
			// 	if (type.length > 1 && type[1].length) {
			// 		Validate.bind(ele, name, 'blur', type[1], resultEle);
			// 	}
			// } else { // 传的是固定模式的
				// switch (type) {
				// 	case Validate.TYPE_NOTNULL: // 非空
				// 		Validate.bind(ele, name, 'blur', Validate.REG_NOTNULL);
				// 		break;
				// 	case Validate.TYPE_NUM: // 数字 不管输入中还是失焦，都是整形校验
				// 		Validate.bind(ele, name, ['keyup', 'blur'], Validate.REG_INTEGER);
				// 		break;
				// 	case Validate.TYPE_MOBILE: // 手机号 输入中是整数校验,失焦是手机校验
				// 		Validate.bind(ele, name, 'keyup', Validate.REG_INTEGER);
				// 		Validate.bind(ele, name, 'blur', Validate.REG_MOBILE);
				// 		break;
				// 	case Validate.TYPE_ICCARD:
				// 		Validate.bind(ele, name, 'blur', Validate.REG_ICCARD);
				// 		break;
				// }
			// }
		},

		/** 返回批量结果
		 * resultEle: 赋值结果的div '.className / $idName'
		 **/
		batchValidate: function (list, resultEle) {
			//layer.closeAll('tips');
			var flag = true;
			if (!list || list.length < 1) { // 传入检测list有误，直接返回
				Validate.asignResult(resultEle, false, false);
				return;
			}
			$.each(list, function (i, obj) {
				Validate.validate(obj.ele, obj.name, obj.type, obj.param, resultEle);
			});
		},
	
		/*
		 * 批量检测某个div下面所有的input、select、textarea不为空
		 * showInstant 需要立即显示检测结果标记 并且返回结果
		 */
		batchBlockValidate: function (block, showInstant,noLayer) {
			if (!block || !$(block))
				return;
			if(noLayer === false){
				Validate.noLayer = false;
			}
			var eles = $(block).find('[validate]:visible');
			var list = [];
			var flag = true;
			$.each(eles, function (i, obj) {
				// var ele = $(obj).parent().prev();
				// if ($(ele).length && !$(ele).is('div') && ($(ele).prev() != $(ele))) {
				// 	ele = $(ele).prev();
				// }
				// var name = $(ele).html().trim().replace(/\:/g,'').replace(/\：/g,'').replace(/<.*>/, '');

				// if (!ele.length)
				// 	return true;
				if (obj.hasAttribute('disabled') || obj.hasAttribute('readonly'))
					return true;
				list.push({
					ele: obj,
					name: '',
					type: $(obj).attr('validate')
				});

				if (showInstant) {// TODO
					var regName=$(obj).attr('validate') || 'notNull';
					var msg = $(obj).attr('valiMsg') || '请输入正确的信息';
					var res = Validate.check(obj, msg, Validate.REG_ARR[regName], block);
					flag = !res ? false : flag;
				}
			});
			Validate.batchValidate(list, block);
			return flag;
		}
	};
})();






































