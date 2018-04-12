define(function(require, exports, module) {
	require('layer');
	require('select2');
  	require('handlebars');
	require('ajax');
	require('validate');
	require('localStorage');
	require('date');
	var CURRENT_URL = window.location.pathname,
		TOPURL=CURRENT_URL.split('/')[2],
		$BODY = $('body'),
		$MENU_TOGGLE = $('#menu_toggle'),
		$SIDEBAR_MENU = $('#sidebar-menu'),
		$SIDEBAR_FOOTER = $('.sidebar-footer'),
		$LEFT_COL = $('.left_col'),
		$RIGHT_COL = $('.right_col'),
		$NAV_MENU = $('.nav_menu'),
		$FOOTER = $('footer'),
		$ROW = $(".row"),
		$zhRIGHT_COL = $('.nav-zh .right_col'),
		$MAIN_SECTION = $('.main_section'),
		$ROOM_ALL = $('.room_all'),
		$PortRait = $('.txt-plain-portrait'),
		$Menu_status = $('.menu_status');
	// Sidebar
	$(document).ready(function() {
		getMsg();
		setInterval(function() {
			getMsg();
		}, 60000)
	    var grid = require('grid');
	    var item;
	    
        $('.flex').css('overflow', 'visible');
		// 全局注册input keydown 事件，回车触发查询事件
		$(document).delegate('input','keydown',function(e){
			if (e.keyCode == 13) {
				console.log('bolin');
				if (!e.target) {
					return false;
				}
				var keydown_targetForm = e.target.form,
					keydown_inputItems = $(keydown_targetForm).find('input:not([type=hidden])');
				if ($(keydown_targetForm).length == 0){
					return false;
				}
				var isDoSearch = false;
				if (keydown_inputItems.length <= 1) {
					var _tempInput = document.createElement('input');
					_tempInput.className = 'hide';
					$(keydown_targetForm).append($(_tempInput));
				}
				$.each($(keydown_targetForm).find('.btn-mj'),function(k,v){
					if (v.innerText === '查询' || v.innerText === '搜索') {
						isDoSearch = v;
						return false;
					}
				});
				if (isDoSearch) {
					$(isDoSearch).click();
				}
			}
		});
		function GetDateStr(AddDayCount, noHMS) {
            var dd = new Date();
            dd.setDate(dd.getDate()+AddDayCount);
            var y = dd.getFullYear();
            var m = dd.getMonth()+1;
            var d = dd.getDate();
            var hh = dd.getHours();
            var mm = dd.getMinutes();
            var ss = dd.getSeconds();
            var clock = y +"-";
            if(m <10)clock += "0";
            clock += m +"-";
            if(d < 10)clock += "0";
            clock += d+" ";
            if (noHMS)
                return clock;
            if(hh < 10)
                clock += "0";
             clock += hh+":";
             if(mm < 10)
                clock += "0";
             clock += mm+":";
             if(ss < 10)
                clock += "0";
             clock += ss;
            // clock += '00:00:00';
            return clock;
        }

		var setContentHeight = function() {
			// reset height
			var windowH = $(window).height();
			var containerPadding = 30,
				pannelPadding = 20,
				$menuStatusH = $Menu_status.height() + 12;
				$TOPH = $NAV_MENU.height() || 55;

			$LEFT_COL.height(windowH);
			$RIGHT_COL.height(windowH - $TOPH - containerPadding);
			$ROW.height($RIGHT_COL.height());
			$(".window").height($RIGHT_COL.height());
			//解决当前双window影响高度
			$(".x_panel.window").height($RIGHT_COL.height() - pannelPadding);
            $(".x_panel.window.anti-window").height($RIGHT_COL.height() - pannelPadding + 20);

			//实时房态
			if ($Menu_status.length>0) {
				$MAIN_SECTION.height(windowH - $menuStatusH);
			}else{
				$MAIN_SECTION.height(windowH);
			}
			$ROOM_ALL.height($MAIN_SECTION.height() - 50);
			$zhRIGHT_COL.height(windowH - $menuStatusH);

			//登录账户控制
			var PortRaitWFlag = $(window).width() > 1300;
			if (!PortRaitWFlag) {
				$PortRait.css("width","100");
				$PortRait.bind('mouseover',function(){
					var tipHtml = $(this).attr('help-tips');
					layer.tips(tipHtml,this,{tips:3});
				}).bind('mouseleave',function(){
					layer.closeAll('tips');
				});
			}else{
				$PortRait.css("width","auto");
				$PortRait.unbind('mouseover');
			}

			$('.div_ul_list').height(windowH - 142);
            $('.room_out').height($RIGHT_COL.height() - pannelPadding - 75);
            $('.room_out.ONELINE').height(220); // 支付设置这里的列表高度只要220
			if ($NAV_MENU.length > 0) {
				$('.hostingLease').height(windowH - $TOPH - containerPadding);
			}else{
				$('.hostingLease').height(windowH);
			}
		};
		var itemA = $SIDEBAR_MENU.find('a'),
			itemLi = $('.navbar-nav li.item');
		$.each(itemA, function(k, v) {
			if (v.href.indexOf(CURRENT_URL) != -1) {
				if ($(v).hasClass('name')) {
					$(v).parent('li').addClass('active')
				} else {
					$(v).parent('li').addClass('active_child').parent('ul').show().parents('li.hasSon').addClass('active');
				}
			};
		})
		$.each(itemLi,function(k,v){
			if($(v).attr('type')==TOPURL){
				$(v).addClass('active');
			}
		})
		itemA.on('click', function(ev) {
			var $li = $(this).parent();

			if ($li.is('.active')) {
				$li.removeClass('active active-sm');
				$('ul:first', $li).slideUp(function() {
					setContentHeight();
				});
			} else {
				if (!$li.parent().is('.child_menu')) {
					$SIDEBAR_MENU.find('li').removeClass('active active-sm');
					$SIDEBAR_MENU.find('li ul').slideUp();
				}

				$li.addClass('active');

				$('ul:first', $li).slideDown(function() {
					if ($(this).find('.active_child').length <= 0) {
						var aHref = $(this).children('li').eq(0).children('a')[0].href;
						window.location.href = aHref;
					}
					
					$('.side-menu > li.active .child_menu > li').css('height', '100%');
					setContentHeight();
				});
			}
		});

		$(window).resize(function() {
			setContentHeight(); 
		});

		setContentHeight();
		
		$('.head_loginOut').click(function(){
			layer.confirm('确定退出系统吗？',function(eq){
				window.location.href="/hms/logout.htm";
			});
		});

		$('.mail-letter-prompt').click(function() {
			var setPsdTmp = Handlebars.compile(($('#mailLetter').html()));
			layerPanel = layer.open({
				type: 1,
				title: '站内信',
				area: '1000px',
				content: setPsdTmp(),
				success: function(elm, index) {
					item = new grid($('#grid_log'),{
	                    dataType:'json',
	                    usepager:true,
	                    autoload:true,
	                    height:260,
	                    singleSelect:true,
	                    showToggleBtn:false,
	                    searchParam:[{
	                    	name: 'startDate',
	                    	value: ''
	                    },{
	                    	name: 'endDate',
	                    	value: ''
	                    },{
	                    	name: 'keyWord',
	                    	value: ''
	                    }],
	                    format:function(data){
                            $.each(data,function(k,v){
                                v.timeStr = getLocalTime(v.gmtCreate);
                                switch(v.status){
			                        case 0:
			                            v.statusStr='未读';
			                            break;
			                        case 1:
			                            v.statusStr='已读';
			                            break;
			                    }
                            })
                            return data;
                        },
	                    colModel:[
	                    	{type:"sort"},
	                    	{type:"sed"},
	                        {display: '时间', name : 'timeStr'},
	                        {display: '标题', name : 'title'},
	                        {display: '状态', name : 'statusStr',tagName : 'status',
			                    tagSettings:[{
			                        value:"0",
			                        style:'mj-tag-danger'
			                    },{
			                        value:"1",
			                        style:'mj-tag-seccess'
			                    }]
			                },
	                        {display: '操作', type:"modify",name : ['content'],modifySet:{options:[
	                            {
	                                display:"查看",
	                                enddisplay:"",
	                                name:"view",
	                                alwayshow:true,
	                                setname:"content",
	                                btnColorStyle: "mj"
	                            }
                        	]}}
	                    ],
	                    url:'/hms/sms/mailletter/queryList.htm'
	                });
	                layer.resetHeight(index, true);

	                // 查询
	                $('.btn.search').click(function () { 
		                searchItem();
		            });
		            // 清空
		              $('.btn.empty').click(function () { 
		              	$("#msgForm")[0].reset();
			                searchItem();
			           });
		            // 标记
		            $('.btn.flag').click(function() {
		            	var getSedData = item.getSedRows()
		            	if (getSedData.length < 1) {
		            		layer.msg('请选择数据')
		            		return false
		            	} else {
		            		var postIds = [];
		            		$.each(getSedData, function(k, v) {
		            			postIds.push(v.id)
		            		})
		            		Ajax.post('/hms/sms/mailletter/markupRead.htm', {ids: postIds.join(",")}, function (res) {
		            			layer.msg('标记成功！');
		            			getMsg();
		            			item.reload()
				            });
		            	}
		            });


		            function searchItem(){
			            var postData = {},
			                self = $("#msgForm");
			            var val=((self.serialize()).replace(/\+/g," ")).split("&");
			            $.each(val,function(index,v){
			                var map = decodeURIComponent(v,true).split("=");
			                if (!(map[1]==""||map[1]==-1)) {
			                    postData[map[0]] = $.trim(map[1]);
			                }
			            });
			            item.doSearch(postData);
			        }
					// 查看
		            item.on('view', function (e) {
		            	viewMsg(e.Data.id)
					})
				}
			})
		});

		function viewMsg (id) {
			Ajax.post('/hms/sms/mailletter/queryDetail.htm', {id: id}, function (res) {
               	if (res.success) {
               		var content = '<div class="col-sm-12"><h4>' + res.dataObject.title + '</h4>\
               		<span class="" style="display:block;margin-bottom:0">' + getLocalTime(res.dataObject.gmtCreate)	+ '</span><hr style=" margin-top:5px;;height:2px;border:none;border-top:1px solid #d5d5d5; width: 530px" />\
               		<p>' +res.dataObject.content + '</p></div>';
		            layer.open({
						type: 1,
						title: '内容',
						area: ['600px', '400px'],
						content: content,
						btn: '确定',
						success: function(elm, index) {
							Ajax.post('/hms/sms/mailletter/markupRead.htm', {ids: id}, function (res) {
				               	if (res.success) {
				               		console.log('已读')
				               	}
				            });
						},
						end: function () {
							getMsg();
							item.reload();
							layer.close();
						}
				    })
               	}
            });
		}

		function getLocalTime(nS) {  
			var date = new Date(nS);
			Y = date.getFullYear() + '-';
			M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
			D = date.getDate() + ' ';
			h = date.getHours() + ':';
			m = date.getMinutes() + ':';
			s = date.getSeconds(); 
			return Y+M+D+h+m+s
        }  

		// 站内信轮询
		function getMsg() {
			Ajax.post('/hms/sms/mailletter/queryUnread.htm', function (res) {
               	if (res.success) {
               		if (res.dataObject && res.dataObject.count >= 1) {
               			$('.mail-letter-prompt').css('color', '#000');
               			$('.mail-letter-prompt em').css('color', 'red');
               			$('.icon-notice').css('color', 'red');
               		} else {
               			$('.mail-letter-prompt, .mail-letter-prompt em').css('color', '#a6abbc');
               			$('.icon-notice').css('color', '#a6abbc')
               		}
               		$('.mail-letter em').text(res.dataObject.count < 99 ? res.dataObject.count : 'N'); 
               		var li = '';
               		if (res.dataObject && res.dataObject.unNoticeSrl) {
	               		$.each(res.dataObject.unNoticeSrl, function(index, el) {
	               			li += '<li value="' + el.id + '">' + (el.title.length > 20 ? (el.title.substring(0, 19) + '...') : el.title) + '<span></span></li>';
	               		});
	               		$('.msg-tips').append(li).find('li').on('click', function() {
	               			viewMsg(this.value)
	               		}); 
	               	}
               		setTimeout(function() {
               			$('.msg-tips li, .msg-tips span').fadeOut()
               		}, 5000);
               	}
            });
		}

		// 帮助中心
		$('#hms_helpCenter').click(function(){
			layer.open({
				type: 2,
				title: '帮助中心',
				area: ['1200px', '600px'],
				btn:['关闭'],
				content: 'https://www.mdguanjia.com/hmsPages/helpCenter.html',
				success:function(elm){
					$('.layui-layer-btn',elm).css('textAlign','center');
		        },
		        end:function(){
		        	
		        }
			});
		});
		
		// 用户首次登录
		var HMS_UPDATE_DATA = {
			update_version: '3.7.0',
			update_info: [{
				title:'麦滴管家更新公告！2018-3-22',
				contents:[
					'1. 人员组织-消息权限新增【房租账单结果通知】，新增通知渠道-麦滴管家APP！<br />',
					'2. 麦滴管家APP现在也能收到消息推送了，账单信息统统不会错过，第一时间获得信息！<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			}, {
				title:'麦滴管家更新公告！2018-3-16',
				contents:[
					'<em>麦滴管家支持租客使用平台发放的优惠券啦！租客享受优惠，平台贴补金额，让您的房源出房更迅速，租客线上交租更积极！</em><br />',
					'<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-2-12',
				contents:[
					'<em style="color: red;">尊敬的公寓运营商，感谢您2017年对麦滴管家的信任和支持，2018年我们将会继续为您提供优质的服务，预祝您春节愉快，财源广进！</em><br />',
					'1. 工作台新增图形化报表，让数据更加直观！<br />\
					 2. 磐谷金融信息查询入口优化处理，查询登录更方便！<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-2-5',
				contents:[
					'1. 调整退房功能，可以自定义实际退房日期，并自动计算租金和服务费，退房时产生的费用自动从押金或租金中抵扣；<br />',
					'2. 优化了退房账单，清晰记录应退金额、应收金额和实退金额 。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-1-30',
				contents:[
					'1. 人员组织-消息权限新增7种消息通知类型；部分消息类型支持短信通知；可以第一时间获得通知<br />',
					'2. 麦滴管家站内信上线，重要信息可以第一时间获得通知，及时处理；<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-1-17',
				contents:[
					'1. 手动生成房租账单优化，根据合同自动生成房租账单信息，无需手动输入<br />',
					'2. 手动生成账单创建完后会自动推送至麦邻生活APP；<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-1-9',
				contents:[
					'1. 系统页面整体布局优化，增加可操作区域；<br />',
					'2. 原分散式租务管理、集中式租务管理页面合并，统一菜单【租务】，支持分散式房源、集中式房源统一管理；<br />',
					'3. 工作台待收账单新增房源的所在城市；<br />',
					'4. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2018-1-8',
				contents:[
					'1. 工作台待收账单增加逾期类型，归属订单操作员，快速结算！<br />',
					'2. 智能设备优化公寓/小区筛选，快速查询！<br />',
					'3. 集中式房源发布至APP操作优化，更加方便！<br />',
					'4. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-12-20',
				contents:[
					'1. 工作台新增智能设备异常提醒，随时掌握设备异常信息，做到快速处理！<br />',
					'2. 退房账单财务中心可以重新编辑，满足财务二次审核确认工作，资金更明确！<br />',
					'3. 新增意向客源管理，登记意向租客的租房需求，记录管家跟进情况，提高意向租客转化率！<br />',
					'4. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-12-14',
				contents:[
					'1. 我的资金-提现优化为按账单笔数提现，方便更好的核实资金的流向！<br />',
					'2. 提现申请增加备注说明，明确资金出入！<br />',
					'3. 新增交易校验手机号，支持修改，提现操作更加安全！<br />',
					'4. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-12-12',
				contents:[
					'1. 在线签约电子签章大升级，现在企业用户可以自主申请电子签章，更加方便快捷！<br />',
					'2. 支持了个人用户升级成为企业用户，满足实际发展需求!<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-11-30',
				contents:[
					'1. 麦滴管家后台可以推送租客分期的订单啦，减少租客在APP找房操作，加快出房效率！<br />',
					'2. 实时房态新增彩色模式，保留原来的线框模式，支持切换，房源信息一目了然！<br />',
					'3. 支持在下单中修改房价、押金，调整价格，加快出房速度，提高出房效率；<br />',
					'4. 订单管理支持导出，统计查询一键搞定；<br />',
					'5. 交易流程优化，调整先签约后付款，更符合实际场景。<br />',
					'6. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-11-13',
				contents:[
					'1. 分散式房源现在支持合租整租切换啦！<br />',
					'2. 帮助中心麦滴管家已经上线了，点击左侧菜单底部 【帮助中心】即可进入；我们会及时更新系统的功能和操作说明，帮助大家更好的理解和操作系统！<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-11-2',
				contents:[
					'1. 平台在线支付正式上线，在线收租轻松简单，租客线上交易方便快捷；<br />',
					'2. 开通平台在线支付后，为租客提供了支付宝、微信、银行卡支付渠道，为租客提供了便捷方便的支付渠道；<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-10-23',
				contents:[
					'1. 麦滴管家租务管理系统提供支持公寓运营商从拿房—装修—出房一站式金融服务；<br />',
					'2. 麦滴管家租务管理系统提供租约贴现融资服务；<br />',
					'3. 通过租约贴现将租客租金由传统的季付年付模式转化为月付模式，减少租客交租压力；\
						<a href="http://www.panguyr.com" target="_blank" style="color:#4680ff; cursor:pointer;">\
							点击了解更多详情\
						</a><br />',
					'4. 【金融房源】也可以添加和删除普通交租方式；<br />',
					'5. 部分页面展示优化，交互逻辑更加合理。<br />\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="https://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：https://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-10-19',
				contents:[
					'1. 分散式合租大门智能门锁APP开门权限可以独立控制子房间，灵活操作；<br />',
					'2. 优化了智能门锁的开门记录，信息更明朗；<br />',
					'3. 部分页面展示优化，交互逻辑更加合理。<br />'
				]
			},{
				title:'麦滴管家更新公告！2017-09-28',
				contents:[
					'1. 系统支持智能电表接入，实现远程抄表，从此告别费时费力的人工抄表；<br />',
					'2. 新增智能设备模块，支持查看智能设备状态，足不出户随时了解设备状态；<br />',
					'3. 优化录入水、电费账单，支持选择历史账单读取历史抄表读数，结算更方便；<br />',
					'4. 支持租客的房源账单出现逾期，短信及时通知管理员，再也不用担心忘记催收账单了；<br />',
					'5. 房源管理分散式列表显示房源数量，房源数量一清二楚；<br />',
					'6. 部分页面展示优化，交互逻辑更加合理。',
				]
			},{
				title:'麦滴管家更新公告！2017-09-14',
				contents:[
					'1. 解决了租客在麦邻生活APP付款会提示支付异常的问题；<br />',
					'2. 优化了账单，支持退房时可以直接结算水、电费用；租务管理-账单管理 支持 Excel 导出；<br />',
					'3. 财务中心查询维度优化，支持exl导出；新增科目查询，支持 Excel 导出；<br />',
					'4. 工作台待收账单优化排序，催收账单更明朗；<br />',
					'5. 录入房源，房源照片支持批量上传；<br />',
					'6. 实时房态新增智能设备入口，智能门锁开门记录一清二楚；<br />',
					'7. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="http://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：http://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-08-30',
				contents:[
					'1. 录入房源时可以通过地图搜索小区地址、选择小区地址，允许自定义修改；<br />',
					'2. 工作台新增栏目，支持金融房源首笔确认收款；<br />',
					'3. 设置交租方式的时候，押金允许为0；<br />',
					'4. 工作台新增预约看房栏目，支持查看麦邻生活APP用户在线预约内容；<br />',
					'5. 部分页面展示优化，交互逻辑更加合理。\
					<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="http://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：http://www.mdguanjia.com</a>\
					</p>'
				]
			},{
				title:'麦滴管家更新公告！2017-08-24',
				contents:[
					'1. 录入分散式房源直接区分整租、合租，移除【启用租务】方可使用房源的限制；<br />',
					'2. 调整房源发布到APP的条件，需要设置房间交租方式；<br />',
					'3. 房源照片上传数量从6张扩展到15张，并且支持自定义排序；<br />',
					'4. 麦滴管家APP同步更新 V1.3版本：<br />\
						<div style="position:relative; width:450px;">\
							<p style="text-indent:2em">a. 新增工作台，待办事项更方便查看</p>\
							<p style="text-indent:2em">b. 支持集中式/分散式房源录入</p>\
							<p style="text-indent:2em">c. 支持线下支付模式录入租客</p>\
							<div style="position:absolute;right:0;top:-28px;">\
								<img src="/hms/images/app_download.png" style="width:100px;height:100px;">\
								<p class="text-center">扫码下载APP</p>\
							</div>\
						</div>\
					<p><br>注：iOS版本需要苹果审核（预计1~2个工作日），审核通过后即可下载新版</p>',
					'<p class="text-center" style="line-height:30px;margin-bottom:0;">\
						<a href="http://www.mdguanjia.com" target="_blank" style="color:#999;">麦滴管家官网：http://www.mdguanjia.com</a>\
					</p>'
				]
			}]
		}
		function updateInfoLayer(index){
			var title = HMS_UPDATE_DATA.update_info[index].title;
			var html = '';
			$.each(HMS_UPDATE_DATA.update_info[index].contents,function(k,v){
				html +="<p>"+ v +"</p>";
			});
			var layer_HMS_update = layer.open({
				title:title,
				type: 1,
				area:'800px',
				closeBtn:0,
				btn:["我知道了"],
				content: html,
				success:function(elm,index){
					$('.layui-layer-btn',elm).css('textAlign','center');
					layer.resetHeight(index,true);
				},
				yes:function(index){
					localStorage.setItem('HMS_UPDATE_VERSION',JSON.stringify({
		            	"data": HMS_UPDATE_DATA.update_version
		            }));
		            layer.close(index);
				}
			});
		}
		var getLockrItem = JSON.parse(localStorage.getItem('HMS_UPDATE_VERSION')) || {};
		if (getLockrItem.data != HMS_UPDATE_DATA.update_version) {
			updateInfoLayer(0);
        }
        if ($('.beta_version').text() != HMS_UPDATE_DATA.update_version) {
			$('.beta_version').text(HMS_UPDATE_DATA.update_version);
		}
	});
	
	//异常日志处理，暂时console，屏蔽浏览器报错
	window.onerror = function(msg, url, line, col, error) {
		var defaults = {};
		setTimeout(function() {
			col = col || (window.event && window.event.errorCharacter) || 0;
			defaults.url = url;
			defaults.line = line;
			defaults.col = col;
			if (error && error.stack) {
				//如果浏览器有堆栈信息，直接使用
				defaults.msg = error.stack.toString();
			} else if (arguments.callee) {
				//尝试通过callee拿堆栈信息
				var ext = [];
				var fn = arguments.callee.caller;
				var floor = 3; //这里只拿三层堆栈信息
				while (fn && (--floor > 0)) {
					ext.push(fn.toString());
					if (fn === fn.caller) {
						break;
					}
					fn = fn.caller;
				}
				ext = ext.join(",");
				defaults.msg = error.stack.toString();
			}
			console.log(defaults);
		}, 0);

		//开发时，返回false ---- 线上返回true
		return false;
	};
});




















