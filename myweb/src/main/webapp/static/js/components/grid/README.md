1、GRID控件添加多行显示功能 在配置数据的时候需要添加一些自定义内容，如下：
/**********************************************************************************************************************************************/
format:function(data){
	var sed = 1; // 从1开始计数
	for (var i = 0;i < data.length; ++i) {
		v = data[i];
		if (v.needSkip)
			continue;
		v.deviceType = renderDeviceTypeName(v.deviceType);
		v.rowspan = v.roomList ? v.roomList.length : 1;
		v.ownPage = sed++;
		v.location = v.addrProvince + v.addrCity + v.addrRegion;
		v.info = v.estateName + '<br>' + (v.buildingName ? v.buildingName + '幢' : '') + (v.unitCode ? v.unitCode + '单元' : '')
			+ (v.floorName ? v.floorName + '楼' : '') + (v.roomNo ? v.roomNo + '号' : '');
		v.mngType = v.houseManageType == 1 ? '监管' : '托管';
		if (v.roomList) {
			var oo = v.roomList[0];
			v.rowspan = v.roomList.length;
			v.publishStatus = oo.publishStatus;
			v.roomDevice = oo.roomDevice;
			v.roomId = oo.roomId;
			v.roomName = oo.roomName;
			v.status = oo.status;
			data.splice(i, 1, v);
			if (v.roomList.length > 1) {
				var l_t = [];
				for(var ii = 1; ii < v.roomList.length; ++ii) {
					v.roomList[ii].needSkip = true;
					v.roomList.rowspan = 1;
					l_t.push(v.roomList[ii]);
				}
				data.splice.apply(data, [i + 1, 0].concat(l_t));
			}
		} else {
			v.rowspan = 1;
		}
	}
	return data;
},
colModel:[
	{type:"sort",width:40,align:'center', rowspan: true, ownPage: true},
	{display: '房源位置', name : 'location', width : 150, align: 'center', rowspan: true},
	{display: '房源信息', name : 'info', width : 200, align: 'center', rowspan: true},
	{display: '平台类型', name : 'mngType', width : 100, align: 'center', rowspan: true},
	{display: '客控', type:"modify",name : ['show'], width : 100, align: 'center', rowspan: true, modifySet:{options:[
		{
			 display:"设置",
			 enddisplay:"　　",
			 name:"ctrl",
			 alwayshow:true,
			 setname:"show",
			 style:{
			 	iconfont:'icon-setting',
			 	color:'#1ABB9C'
			 },
			 status:{
			 	"type":["0"]
			 }
		 }
       ]}},
	{display: '房间', name : 'roomName', width : 100, align: 'center', custWidth: true},
	{display: '门锁状态', name : 'status', width : 100, align: 'center', custWidth: true},
	{display: '系统状态', name : 'publishStatus', width : 100, align: 'center', custWidth: true},
	{display: '发布状态', name : 'publishStatus', width : 100, align: 'center', custWidth: true}
],
url:'queryByPageHouse.htm'
/**********************************************************************************************************************************************/






