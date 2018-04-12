define(function(require, exports, module){
	require('../cityData');
	require('./index.css');
	$.fn.extend({
		area:function(config){
			if(this[0] && this[0].nodeName !== "DIV"){
				return false;
			}

			var configParm = $.extend({
				ProvinceId : 0,
				CityId : 0,
				AreaId : 0,
				proviceAttrName : 'provinceId',
				cityAttrName : 'cityId',
				areaAttrName : 'areaId'
			},config);
	
			var self = this,
				proviceElm = '',
				cityData = [],proviceName = "",cityName = "",districtName = "";

			var elmBox='<div class="bf-select">\
							<div id="city-title" class="city-title">请选择省市区</div>\
							<div class="bf-menu-button-dropdown"></div>\
							<div id="areaMain" class="ks-overlay">\
								<input type="hidden" name="'+configParm.proviceAttrName+'" value="'+configParm.ProvinceId+'"/>\
								<input type="hidden" name="'+configParm.cityAttrName+'" value="'+configParm.CityId+'"/>\
								<input type="hidden" name="'+configParm.areaAttrName+'" value="'+configParm.AreaId+'"/>\
								<div class="city-select-tab">\
									<a class="current" attr-cont="city-province">省份</a>\
									<a attr-cont="city-city">城市</a>\
									<a attr-cont="city-district">县区</a>\
								</div>\
								<div class="city-select-content">\
									<div class="city-select city-province"></div>\
									<div class="city-select city-city" style="display:none"></div>\
									<div class="city-select city-district" style="display:none"></div>\
								</div>\
							</div>\
						</div>';
			self.html(elmBox);

			$.each(window.letterArea,function(k,v){
				proviceElm+='<dl class="fn-clear"><dt>'+v.key+'</dt><dd>'
				$.each(v.provice,function(kk,vv){
					if(configParm.ProvinceId == vv.id){
						proviceName = vv.name;
						proviceElm+='<a textName="'+vv.name+'" class="current" attr-id="'+vv.id+'" href="javascript:;">'+vv.title+'</a>';
						renderHtml(configParm.ProvinceId,configParm.CityId,configParm.AreaId);
					}else{
						proviceElm+='<a textName="'+vv.name+'" attr-id="'+vv.id+'" href="javascript:;">'+vv.title+'</a>';
					}
				});
				proviceElm+='</dd></dl>';
				$('.city-province',self).html(proviceElm);				
			});

			$('.bf-select',self).on('click',function(event){
				if($('.bf-select',self).hasClass('disabledArea')){
					return false;
				}
				$('#areaMain',self).show();
			});
			$(document).on("click", function(e){
				var id = self.attr('id');
				if($(e.target).parents('#'+id).length <= 0){
					$('#areaMain',self).hide();
				}
		        
		    });
			$('.city-select-tab a',self).click(function(){
				var attr = $(this).attr('attr-cont');
				if (attr == 'city-district') {
                    var cityId = $(this).parent().parent().find('input').eq(1).val();
					if (cityId == 0) {
						$('.city-district').html('');
					}
				}
			    
				if($('.bf-select',self).hasClass('disabledArea')){
					return false;
				}
				var showElm = $(this).attr('attr-cont');
				$(this).addClass('current').siblings('a').removeClass('current');
				$('.city-select',self).hide();
				$('.'+showElm).show();
			});
  
			// 省份切换
			$('.city-province a',self).click(function(){
				if($('.bf-select',self).hasClass('disabledArea')){
					return false;
				}
				proviceName = $(this).attr('textName');
				$('.city-province a',self).removeClass('current')
				$(this).addClass('current');
				var attrId = $(this).attr('attr-id'),
					cityHtml = '<dl class="fn-clear city-select-city"><dd>';
				$('input[name="'+configParm.proviceAttrName+'"]').val(attrId);
				$('input[name="'+configParm.cityAttrName+'"]').val(0);
				$('input[name="'+configParm.areaAttrName+'"]').val(0);
				$.each(window.cityDataNodes,function(k,v){
					if(v.id == attrId){
						cityData = v.children;
						$.each(v.children, function(kk,vv){
							cityHtml += '<a textName="'+vv.name+'" attr-id="'+vv.id+'" href="javascript:;">'+vv.name+'</a>';
						});
						cityHtml += '</dd></dl>';
					}
				});
				$('.city-city',self).html(cityHtml);
				$('.city-select-tab a',self).eq(1).click();
				$('.city-title',self).addClass('has-city-title').text(proviceName);
			});

			// 城市切换
			self.delegate('.city-city a','click',function(){
				if($('.bf-select',self).hasClass('disabledArea')){
					return false;
				}
				cityName = $(this).attr('textName');

				$('.city-city a',self).removeClass('current');
				$(this).addClass('current');
				var attrId = $(this).attr('attr-id'),
					isHide = false,
					cityHtml = '<dl class="fn-clear city-select-district"><dd>';
				$('input[name="'+configParm.cityAttrName+'"]').val(attrId);
				$.each(cityData,function(k,v){
					if(v.id == attrId){
						if(v.children.length === 0){
							$('input[name="'+configParm.areaAttrName+'"]').val('-1');
							isHide = true;
						}else{
							$.each(v.children, function(kk,vv){
								cityHtml += '<a textName="'+vv.name+'" attr-id="'+vv.id+'" href="javascript:;">'+vv.name+'</a>';
							});
							cityHtml += '</dd></dl>';
							$('input[name="'+configParm.areaAttrName+'"]').val(0);
						}
						
					}
				});
				$('.city-district',self).html(cityHtml);
				if(isHide){
					$('#areaMain',self).hide();
				}else{
					$('.city-select-tab a',self).eq(2).click();
				}				
				$('.city-title',self).text(proviceName +'/'+ cityName);
			});

			// 县区切换
			self.delegate('.city-district a','click',function(){
				if($('.bf-select',self).hasClass('disabledArea')){
					return false;
				}
				districtName = $(this).attr('textName');
				$('.city-district a',self).removeClass('current');
				$(this).addClass('current');
				var attrId = $(this).attr('attr-id');
				$('input[name="'+configParm.areaAttrName+'"]').val(attrId);
				$('.city-title',self).text(proviceName +'/'+ cityName +'/'+ districtName);
				$('#areaMain',self).hide();
			});

			function renderHtml(ProvinceId,CityId,AreaId){
				$.each(window.cityDataNodes,function(k,v){
					if(v.id == ProvinceId){
						cityData =v.children;
						var cityHtml = '<dl class="fn-clear city-select-city"><dd>';
						$.each(v.children, function(kk,vv){
							if(vv.id == CityId){
								cityName = vv.name;
								cityHtml += '<a textName="'+vv.name+'" class="current" attr-id="'+vv.id+'" href="javascript:;">'+vv.name+'</a>';
								var areaHtml='<dl class="fn-clear city-select-district"><dd>';
								if (vv.children.length>0){
									$.each(vv.children,function(kkk,vvv){
										if(vvv.id == AreaId){
											districtName = vvv.name;
											areaHtml += '<a textName="'+vvv.name+'" class="current" attr-id="'+vvv.id+'" href="javascript:;">'+vvv.name+'</a>';
										}else{
											areaHtml += '<a textName="'+vvv.name+'"  attr-id="'+vvv.id+'" href="javascript:;">'+vvv.name+'</a>';
										}
										
									});
								}
								areaHtml += '</dd></dl>';
								$('.city-district',self).html(areaHtml);
								if (vv.children.length>0) {
								  $('.city-title',self).addClass('has-city-title').text(proviceName +'/'+ cityName +'/'+ districtName);
								} else {
									 $('.city-title',self).addClass('has-city-title').text(proviceName +'/'+ cityName );
								}
							}else{
								cityHtml += '<a textName="'+vv.name+'" attr-id="'+vv.id+'" href="javascript:;">'+vv.name+'</a>';
							}
						});
						cityHtml += '</dd></dl>';
						$('.city-city',self).html(cityHtml);
					}
				});
			}
		}
	});
	
});