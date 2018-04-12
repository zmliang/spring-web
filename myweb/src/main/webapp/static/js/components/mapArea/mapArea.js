define(function(require, exports, module){
	require('layer');
	require('../cityData');
	require('./index.css');
	$.fn.extend({
		mapArea:function(config){
			var mapSearchData = [],
				nowData = undefined,
				searchHtml = null;
			var configParm = $.extend({
				cityName : '杭州市',
				province_id : 0,
				city_id : 0,
				area_id : 0,
				areaArr : [], 
				successFn : function(data){
					return data;
				}
			},config);
			if(configParm.province_id != 0 && configParm.city_id != 0 ){
				$.each(window.cityDataNodes,function(k,v){
					if(v.id == configParm.province_id){
						$.each(v.children,function(m,n){
							if(n.id == configParm.city_id){
								configParm.areaArr = n.children;
							}
						})
					}
				})
			}
			var htmlDiv = '<div class="baiduMapDiv">\
								<div class="mapTips">\
									<span>1.如果搜索的内容在右侧列表中小区名称不对（例如：天天超市），点击后可以自定义小区名称、具体位置、所在区域。</span>\
									<span>2.如果搜索的内容在右侧列表中查询不到，请通过鼠标手动定位房源位置，自定义小区名称、具体位置、所在区域。</span>\
								</div>\
								<div class="mapCenter">\
									<div id="addressMap" style="width: 560px;height:350px"></div>\
									<ul class="mapSearchUl"></ul>\
									<input type="text" class="form-control mapInput" placeholder="请输入小区名称" />\
								</div>\
							</div>';
			var mapOverlay = layer.open({
				title:'地图选择小区',
				area:['800px','530px'],
				content:htmlDiv,
				noClose:true,
				btn:['确定','取消'],
				yes:function(eq){
					if(typeof nowData != 'object'){
						layer.msg('请选择小区');
						return false;
					}
					if($('select[name="mapSelect"] option:selected').val() == ''){
						layer.msg('所在区域不能为空');
						return false;
					}
					var mapSelect = $('select[name="mapSelect"] option:selected').text(),
						mapTitle = $('input[name="mapTitle"]').val().trim(),
						mapAddress = $('input[name="mapAddress"]').val().trim();
					
					var postData = {
						name : nowData.title,
						address : nowData.address,
						longitude : nowData.point.lng,
						latitude : nowData.point.lat,
						baiduUid : nowData.uid,
						provinceId : configParm.province_id,
						cityId : configParm.city_id,
						areaId : configParm.area_id,
						source : 1,
						poiTelephone : nowData.poiTelephone
					}
					if(mapSelect != nowData.areaValue
						|| mapTitle != nowData.title
						|| mapAddress != nowData.address){//判断用户是否修改过
						postData.areaId = $('select[name="mapSelect"] option:selected').val();
						postData.name = mapTitle;
						postData.address = mapAddress;
						postData.source = 5;//source 1是没有修改 5是修改过
					}
					doPost(0);
					var confirmIndex = null;
					function doPost(type){
						postData.confirmStatus = type;
						if(type != 0){
							postData.source = 5;
						}
						 Ajax.post('/hms/region/address/add.htm',postData,function(d){
							if(d.success){
								if(d.dataObject.confirmStatus == 1){
									layer.confirm('新选择的小区名称、区域、具体地址和历史录入的一致，<span style="color:red">但经纬度坐标不一致</span>，是否使用新坐标并覆盖？',{
										noClose:true,
				                        btn:['使用新地址', '使用原地址']
				                    },function(ee){
				                    	confirmIndex = ee;
				                        doPost(2);
				                    },function(ee){
				                    	confirmIndex = ee;
				                        doPost(3);
				                    })
								}else{
									layer.close(eq);
									if(confirmIndex != null){
										layer.close(confirmIndex);
									}
									configParm.successFn(d.dataObject);
								}
								
							}else{
								layer.alert(d.msg,{noClose:true});
							}
						})
					}
							
					
				}
			});

			var map = new BMap.Map("addressMap");
			var geoc = new BMap.Geocoder();	
			var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM}); 	
			map.centerAndZoom(configParm.cityName,12);
			map.enableScrollWheelZoom(true);     //
			map.addControl(top_right_navigation); //包含缩放按钮
			map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
			map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
			console.log(map.getBounds())
			map.addEventListener("click", function(e){
				pointData(e.point,map,2);
				$('.mapSearchUl li',mapOverlay.elm).removeClass('active');
			});
			var local = new BMap.LocalSearch(configParm.cityName, {
				onSearchComplete: function(results){
					
					// 判断状态是否正确
					if (local.getStatus() == BMAP_STATUS_SUCCESS){
						mapSearchData = [],searchHtml = '';
						for (var i = 0; i < results.getCurrentNumPois(); i ++){
							forData = results.getPoi(i);
							mapSearchData.push(forData);
							searchHtml += '<li><span class="areaTitle">'+forData.title+'</span><span class="areaAddress">'+forData.address+'</span></li>'
						}
						$('.mapSearchUl',mapOverlay.elm).html(searchHtml).scrollTop(0);
						$('.mapSearchUl li',mapOverlay.elm).click(function(){
							var index = $(this).index(),
								pp = mapSearchData[index].point;
							nowData = mapSearchData[index];
							$(this).addClass('active').siblings('li').removeClass('active');
							pointData(pp,map,1);
						})
					}
				},
				pageCapacity : 20 //设置每页容量
			});
			
			
			function pointData(pp,map,type){
				geoc.getLocation(pp, function(rs){//获取所在的区
					var addComp = rs.addressComponents;
					if(type == 2){
						nowData = {
							title : addComp.street + addComp.streetNumber,
							address : addComp.street + addComp.streetNumber,
							point : rs.point,
							areaValue : addComp.district
						}
					}else{
						nowData.areaValue = addComp.district;
					}
					var selectOption = '<option value="">请选择</option>';
					$.each(configParm.areaArr,function(x,y){
						var isSelected = '';
						if(y.name == nowData.areaValue){
							configParm.area_id = y.id;
							isSelected = 'selected';
						}
						selectOption += '<option '+isSelected+' value="'+y.id+'">'+y.name+'</option>'
					})
					var sContent = '<div class="mapWindow">\
									<div class="col-sm-3">当前城市：*</div><div class="col-sm-9">'+configParm.cityName+'</div>\
									<div class="col-sm-3">所在区域：*</div><div class="col-sm-9"><select name="mapSelect">'+selectOption+'</select></div>\
									<div class="col-sm-3">小区名称：*</div><div class="col-sm-9"><input class="form-control" maxlength="15" name="mapTitle" value="'+nowData.title+'" type="text" /></div>\
									<div class="col-sm-3">具体地址：*</div><div class="col-sm-9"><input class="form-control" maxlength="30" name="mapAddress" value="'+nowData.address+'" type="text" /></div></div>';
					var infoWindow = new BMap.InfoWindow(sContent,{
							width:400,
							enableAutoPan:true
						});
					map.openInfoWindow(infoWindow,rs.point);
				});  
				map.clearOverlays();//清除标注
				map.centerAndZoom(pp, 18);
				map.panBy(0,50);//垂直平移 防止输入挡住信息框
				var marker = new BMap.Marker(pp);
				map.addOverlay(marker); //添加标注
			}
			$('input.mapInput',mapOverlay.elm).keyup(function(){
				$('.chooseAddress',mapOverlay.elm).text('');
				var str = $(this).val();
				local.search(str,{forceLocal:true});
			})	
			
		}
	});
	
});