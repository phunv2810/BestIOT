var tmrId;


const Gauge_Width = 290;
const Gauge_Ticks = ["-15", "0", "15", "30", "45", "60"];
const Min_Temperature = -15;
const Max_Temperature = 60;
const Chart_tickInterval = 15;

const lowTempColor = 'rgba(50,50,255,0.8)';
const hiTempColor = 'rgba(255,80,80,0.8)';
const lowTempColor2 = 'rgba(50,50,255,0.4)';
const hiTempColor2 = 'rgba(255,80,80,0.4)';

let occtrlnum = 0;
let tempctrlnum = 0;
let timectrlnum = 0;

var temp_gauge = new Array();
var chartplot = new Array();

var ctrl_name = new Array();
var ctrl_lowval = new Array();
var ctrl_hival = new Array();
var ctrl_mode = new Array();

let upclicktime = new Array(8);
let dnclicktime = new Array(8);
let upclickok = new Array(24).fill(0);
let dnclickok = new Array(24).fill(0);

$(document).ready(function(){
	$('.animsition').animsition();

	var user_id = $("#session_id").prop("value");
	var user_level = $("#session_lv").prop("value");

	$.ajax({
		type : 'POST',
		//url : '/php/read_setconfig.php',
		url : '/php/read_setchannel.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//if (isEmpty(data)) return false;
			//console.log(data);
			create_mainscreen(data);
			creat_clickevent();
			read_nowdata();
		}
	}); //End of $.ajax({


	//1000ms(1초) 마다 read_nowdata()함수를 실행시킨다.
	tmrId = setInterval("read_nowdata()", 2000);
}); //End of $(document).ready(function(){

$(window).resize(function(){
	for(i=0; i<(occtrlnum+tempctrlnum); i++){
		if (chartplot[i] !== undefined && chartplot[i] !== null) {
			chartplot[i].replot();
		}
	}
});

window.detectSwipeEvent(window, function (element, direction) {
	//var parent = window.parent.document;	//video_screen.html
	window.parent.swipe_func(direction);
})

function creat_clickevent(){
	for(var i=0; i<occtrlnum; i++){
		$("#ocopenup_"+(i+1)).click({"ctrltemp":"ocopup"+(i+1)}, updown_settemp_clink);		//ocopup1
		$("#ocopendn_"+(i+1)).click({"ctrltemp":"ocopdn"+(i+1)}, updown_settemp_clink);		//ocopdn1
		$("#occloseup_"+(i+1)).click({"ctrltemp":"occlup"+(i+1)}, updown_settemp_clink);	//occlup1
		$("#occlosedn_"+(i+1)).click({"ctrltemp":"occldn"+(i+1)}, updown_settemp_clink);	//occldn1
		
		$("#ocmanualup_"+(i+1)).click({"ctrlname":"up"+(i+1)}, openclose_click);
		$("#ocmanualdn_"+(i+1)).click({"ctrlname":"dn"+(i+1)}, openclose_click);
	}
	
	for(var i=0; i<tempctrlnum; i++){
		$("#tempsetup_"+(i+1)).click({"ctrltemp":"tmopup"+(i+1)}, updown_settemp_clink);	//tmopup1
		$("#tempsetdn_"+(i+1)).click({"ctrltemp":"tmopdn"+(i+1)}, updown_settemp_clink);	//tmopdn1
		
		$("#tempoutbt_"+(i+1)).click({"ctrlname":"tempout"+(i+1)}, tempoutbutton_clink);
	}

	for(var i=0; i<timectrlnum; i++){
		if(ctrl_mode[i] == 10){
			$("#tmr_up"+(i+1)).click({"ctrlname":"up"+(i+1)}, tmrbutton_clink);
			$("#tmr_dn"+(i+1)).click({"ctrlname":"dn"+(i+1)}, tmrbutton_clink);
		}else if(ctrl_mode[i] == 11){
			$("#tmr_up"+(i+1)).click({"ctrlname":"up"+(i+1)}, tmrbutton_clink);
		}else if(ctrl_mode[i] == 12){
			$("#tmr_up"+(i+1)).click({"ctrlname":"up"+(i+1)}, tmrbutton_clink);
			$("#tmr_dn"+(i+1)).click({"ctrlname":"dn"+(i+1)}, tmrbutton_clink);
		}
	}
}
function tempoutbutton_clink(event){
	var component_name = event.data.ctrlname;
	var ctrl_num = Number(component_name.slice(-1));
	var ctrl_cmd;
	
	var now_state = $("#tempoutbtstate_"+ctrl_num).prop("value");
	//console.log( $("#tempoutbtstate_"+ctrl_num).length );
	
	//console.log("ctrl_name="+ctrl_name+" , now_state="+now_state);
	if(Number(now_state) == 0){
		$("#tempoutbt_"+ctrl_num).attr('src', "/html/img/png_image/on_enable(96).png");
		$("#tempoutbtstate_"+ctrl_num).prop("value", 1);
		ctrl_cmd = 1;
	}else{
		$("#tempoutbt_"+ctrl_num).attr('src', "/html/img/png_image/off_disable(96).png");
		$("#tempoutbtstate_"+ctrl_num).prop("value", 0);
		ctrl_cmd = 0;
	}

	$("#tempoutbt_"+ctrl_num).prop('disabled', true);
	//console.log(component_name + ", " + ctrl_num + ", " + now_state);

	upclicktime[8+ctrl_num-1] = Date.now();
	upclickok[8+ctrl_num-1] = 1;

	$.ajax({
		type : 'POST',
		url : '/php/set_openclose.php',
		data : {"ctrlnum":(ctrl_num+8), "ctrlcmd":ctrl_cmd},
		dataType : 'json',
		success : function(data){
			//console.log("ctrl_name="+ctrl_name+", ctrl_num="+ctrl_num+", ctrl_cmd="+ctrl_cmd+", Cmd_Result="+data);
			//if (isEmpty(data)) return false;
			//display_status(ctrl_name, ctrl_num, ctrl_cmd, data);
		}
	}); //End of $.ajax({
}

function tmrbutton_clink(event){
	var component_name = event.data.ctrlname;
	var ctrl_name = component_name.substring(0,2);
	var ctrl_num = Number(component_name.substring(2));
	var ctrl_cmd;	//UP on=1, UP off=2, DN on=3, DN off=4
	
	var now_state = Number($("#tmr_"+ctrl_name+"state"+ctrl_num).prop("value"));

	//console.log("#tmr_"+ctrl_name+"state"+ctrl_num);
	//console.log(component_name + ", " + ctrl_name + ", " + ctrl_num + ", " + ctrl_mode[ctrl_num-1]);
	//console.log("ctrl_name="+ctrl_name+" , now_state="+now_state);
	if(ctrl_name=="up"){
		if(now_state==1){
			$("#tmr_up"+ctrl_num).attr('src', "/html/img/png_image/up_disable(96).png");
			$("#tmr_upstate"+ctrl_num).prop("value", 0);
			ctrl_cmd = 0;
		}else if(now_state==0){
			$("#tmr_up"+ctrl_num).attr('src', "/html/img/png_image/up_enable(96).png");
			$("#tmr_upstate"+ctrl_num).prop("value", 1);
			if(ctrl_mode[ctrl_num-1] != 11){
				$("#tmr_dn"+ctrl_num).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_dnstate"+ctrl_num).prop("value", 0);
			}
			ctrl_cmd = 1;
		}
		$("#tmr_up"+ctrl_num).prop('disabled', true);
		upclicktime[16+ctrl_num-1] = Date.now();
		upclickok[16+ctrl_num-1] = 1;
	}else if(ctrl_name=="dn"){
		if(now_state==1){
			$("#tmr_dn"+ctrl_num).attr('src', "/html/img/png_image/down_disable(96).png");
			$("#tmr_dnstate"+ctrl_num).prop("value", 0);
			ctrl_cmd = 0;
		}else if(now_state==0){
			$("#tmr_dn"+ctrl_num).attr('src', "/html/img/png_image/down_enable(96).png");
			$("#tmr_dnstate"+ctrl_num).prop("value", 1);
			if(ctrl_mode[ctrl_num-1] != 11){
				$("#tmr_up"+ctrl_num).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_upstate"+ctrl_num).prop("value", 0);
			}
			ctrl_cmd = 2;
		}
		$("#tmr_dn"+ctrl_num).prop('disabled', true);
		dnclicktime[16+ctrl_num-1] = Date.now();
		dnclickok[16+ctrl_num-1] = 1;
	}

	//console.log((ctrl_num+16) + ", " + ctrl_cmd);
	$.ajax({
		type : 'POST',
		url : '/php/set_openclose.php',
		data : {"ctrlnum":(ctrl_num+16), "ctrlcmd":ctrl_cmd},
		dataType : 'json',
		success : function(data){
			//console.log("ctrl_name="+ctrl_name+", ctrl_num="+ctrl_num+", ctrl_cmd="+ctrl_cmd+", Cmd_Result="+data);
			//if (isEmpty(data)) return false;
			display_status(ctrl_name, ctrl_num, ctrl_cmd, data);
		}
	}); //End of $.ajax({
}


function openclose_click(event){
	//if( (Date.now() - lastclicktime)< 50 ) return;

	var component_name = event.data.ctrlname;

	var ctrl_name = component_name.substring(0,2);
	var ctrl_num = component_name.substring(2);
	var ctrl_cmd;	//UP on=1, UP off=2, DN on=3, DN off=4
	
	var now_state = $("#oc"+ctrl_name+"state_"+ctrl_num).prop("value");
	//console.log("now_state = "+now_state);

	if(ctrl_name=="up"){
		if(now_state==1){
			ctrl_cmd = 1;
			$("#ocmanualup_"+ctrl_num).attr('src', "/html/img/png_image/up_enable(96).png");
		}else if(now_state==0){
			ctrl_cmd = 2;
			$("#ocmanualup_"+ctrl_num).attr('src', "/html/img/png_image/up_disable(96).png");
		}
		$("#ocmanualup_"+ctrl_num).prop('disabled', true);
		upclicktime[ctrl_num-1] = Date.now();
		upclickok[ctrl_num-1] = 1;
	}else if(ctrl_name=="dn"){
		if(now_state==1){
			ctrl_cmd = 3;
			$("#ocmanualdn_"+ctrl_num).attr('src', "/html/img/png_image/down_enable(96).png");
		}else if(now_state==0){
			ctrl_cmd = 4;
			$("#ocmanualdn_"+ctrl_num).attr('src', "/html/img/png_image/down_disable(96).png");
		}
		$("#ocmanualdn_"+ctrl_num).prop('disabled', true);
		dnclicktime[ctrl_num-1] = Date.now();
		dnclickok[ctrl_num-1] = 1;
	}
	
	//console.log("ctrlnum:"+ctrl_num+", ctrlcmd:"+ctrl_cmd);
	$.ajax({
		type : 'POST',
		url : '/php/set_openclose.php',
		data : {"ctrlnum":ctrl_num, "ctrlcmd":ctrl_cmd},
		dataType : 'json',
		success : function(data){
			//console.log("ctrl_name="+ctrl_name+", ctrl_num="+ctrl_num+", ctrl_cmd="+ctrl_cmd+", Cmd_Result="+data);
			//if (isEmpty(data)) return false;
			display_status(ctrl_name, ctrl_num, ctrl_cmd, data);
		}
	}); //End of $.ajax({
}

function updown_settemp_clink(event){
	var component_name = event.data.ctrltemp;
	var ctrl_name = component_name.substring(0,2);	//oc(개폐기컨트롤러) or tm(온도컨트롤러)
	var openclose = component_name.substring(2,4);	//op(Open) or cl(Close)
	var updown = component_name.substring(4,6);		//up(Up) or dn(Down)
	var ctrl_num = Number(component_name.substring(6));
	//console.log(component_name+": "+ctrl_name+", "+openclose+", "+updown+", "+ctrl_num);
	
	var cell_name, set_temp;
	if(ctrl_name == "oc"){
		//개폐기 컨트롤러
		if(openclose == "op"){
			//열림온도
			if(updown == "up"){
				//Up
				cell_name = "opentemp";
				set_temp = Number($("#ocopen_"+ctrl_num).prop("value"))*10 + 1;
			}else if(updown == "dn"){
				//Down
				cell_name = "opentemp";
				set_temp = Number($("#ocopen_"+ctrl_num).prop("value"))*10 - 1;
			}
		}else if(openclose == "cl"){
			//닫힘온도
			if(updown == "up"){
				//Up
				cell_name = "closetemp";
				set_temp = Number($("#occlose_"+ctrl_num).prop("value"))*10 + 1;
			}else if(updown == "dn"){
				//Down
				cell_name = "closetemp";
				set_temp = Number($("#occlose_"+ctrl_num).prop("value"))*10 - 1;
				
				//영하 온도 처리
				if(set_temp<0){
					set_temp = 65536 + set_temp;
				}
			}
		}
	}else if(ctrl_name == "tm"){
		//온도 컨트롤러
		if(openclose == "op"){
			//설정온도
			if(updown == "up"){
				//Up
				cell_name = "opentemp";
				set_temp = Number($("#tempset_"+ctrl_num).prop("value"))*10 + 1;
				ctrl_num += 8;
			}else if(updown == "dn"){
				//Down
				cell_name = "opentemp";
				set_temp = Number($("#tempset_"+ctrl_num).prop("value"))*10 - 1;
				ctrl_num += 8;

				//영하 온도 처리
				if(set_temp<0){
					set_temp = 65536 + set_temp;
				}
			}
		}
	}
	//console.log("cell name="+cell_name +", set temp="+set_temp +", chno="+ctrl_num);

	$.ajax({
		type : 'POST',
		url : '/php/update_channeldata.php',
		data : {"cellname":cell_name, "value":set_temp, "channel":ctrl_num,},
		dataType : 'json',
		success : function(data){
			//console.log(data);
			if (data == undefined || data == null) return false;
			read_nowdata();
		}
	}); //End of $.ajax({
}

function display_status(ctrl_name, ctrl_num, ctrl_cmd, result){
	if(String(result).substring(0,1) == "e"){
		//console.log("Command Error");
		alert("명령이 정상적으로 수행되지 않았습니다.<br>다시 눌러주세요");
		return;
	}
	
	//console.log(result.length + ", " + result[0] + ", " + result[1]);
	if(ctrl_name=="up"){
		if(ctrl_cmd==1){
			$("#ocmanualup_"+ctrl_num).attr('src', "/html/img/png_image/up_enable(96).png");
		}else if(ctrl_cmd==2){
			$("#ocmanualup_"+ctrl_num).attr('src', "/html/img/png_image/up_disable(96).png");
		}
	}else if(ctrl_name=="dn"){
		if(ctrl_cmd==3){
			$("#ocmanualdn_"+ctrl_num).attr('src', "/html/img/png_image/down_enable(96).png");
		}else if(ctrl_cmd==4){
			$("#ocmanualdn_"+ctrl_num).attr('src', "/html/img/png_image/down_disable(96).png");
		}
	}
}

function create_mainscreen(data){
	var mtable = "";

	occtrlnum = data[0];
	tempctrlnum = data[1];
	timectrlnum = data[2];
	
	mtable += "<table width='100%' class='tbl_control'>";
	
	//SH2N 개폐기 컨트롤러 화면구성
	mtable += "<tr><td class='txt_occtrl_title'>개폐 제어기</td></tr>";
	for(var i=0; i<occtrlnum; i++){
		ctrl_name[i] = data[i+3];
		ctrl_hival[i] = getTemperatureValue(data[i*6 + 30]);
		ctrl_lowval[i] = getTemperatureValue(data[i*6 + 31]);
		
		//console.log(ctrl_name[i], ctrl_hival[i], ctrl_lowval[i]);
		//console.log(ctrl_hival[i]);
		//console.log(ctrl_lowval[i]);
		
		mtable += "<tr><td class='txt_occtrl_name'>" + data[i+3] + "</td></tr>";

		mtable += "<tr><td>";
		mtable += "<table width='100%' class='tbl_channel'>";
		mtable += "<tr>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>현재<br>온도</td>";
		mtable += "<td width='20%' colspan='2' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='ocnow_"+(i+1)+"' disabled></td>";		//ocnow_1 (1번 개폐기 현재온도)
		mtable += "<td width='4%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>열림<br>온도</td>";
		mtable += "<td width='20%' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='ocopen_"+(i+1)+"' disabled></td>";		//ocopen_1 (1번 개폐기 열림온도)
		mtable += "<td width='8%' height='56' style='vertical-align: bottom;'>";
		mtable += "<button class='ctrlbutton' id='ocopenup_"+(i+1)+"'>▲</button></td>";			//ocopenup_1 (1번 개폐기 열림온도 up 버튼)
		mtable += "<td width='4%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='13%' rowspan='2' align='right' class='txt_label1'>수동<br>열림</td>";
		mtable += "<td width='15%' rowspan='2' align='left'>";
		mtable += "<input type='image' width='112' height='112' id='ocmanualup_"+(i+1)+"' ";	//ocmanualup_1 (1번 개폐기 수동열림 버튼)
			mtable += "src='/html/img/png_image/up_disable(96).png'></td>";
		mtable += "<input type='hidden' id='ocupstate_"+(i+1)+"'>";								//ocupstate_1 (1번 계폐기 열림상태 저장)
		mtable += "</tr>";
		mtable += "<tr>";
		mtable += "<td height='56' style='vertical-align: top;'>";
		mtable += "<button class='ctrlbutton' id='ocopendn_"+(i+1)+"'>▼</button></td>";			//ocopendn_1 (1번 개폐기 열림온도 down 버튼)
		mtable += "</tr>";
		mtable += "<tr><td colspan='10' style='font-size:5px;'>&nbsp;</td></tr>";	//중간 여백
		mtable += "<tr>";
		mtable += "<td width='8%'>열림<br>상태</td>";
		mtable += "<td width='8%'>열림<br>출력</td>";
		mtable += "<td width='8%'>닫힘<br>상태</td>";
		mtable += "<td width='8%'>닫힘<br>출력</td>";
		mtable += "<td rowspan='2' class='txt_label1'>닫힘<br>온도</td>";
		mtable += "<td rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='occlose_"+(i+1)+"' disabled></td>";	//occlose_1 (1번 개폐기 닫힘온도)
		mtable += "<td height='56' style='vertical-align: bottom;'>";
		mtable += "<button class='ctrlbutton' id='occloseup_"+(i+1)+"'>▲</button></td>";		//occloseup_1 (1번 개폐기 닫힘온도 up 버튼)
		mtable += "<td rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td rowspan='2' align='right' class='txt_label1'>수동<br>닫힘</td>";
		mtable += "<td rowspan='2' align='left'>";
		mtable += "<input type='image' width='112' height='112' id='ocmanualdn_"+(i+1)+"' ";	//ocmanualdn_1 (1번 개폐기 수동닫힘 버튼)
			mtable += "src='/html/img/png_image/down_disable(96).png'></td>";
		mtable += "<input type='hidden' id='ocdnstate_"+(i+1)+"'>";								//ocdnstate_1 (1번 계폐기 닫힘상태 저장)
		mtable += "</tr>";
		mtable += "<tr>";
		mtable += "<td><input type='image' width='32' height='32' id='oclampopens_"+(i+1)+"' ";		//oclampopens_1 (1번 개폐기 열림상태 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td><input type='image' width='32' height='32' id='oclampopenr_"+(i+1)+"' ";		//oclampopenr_1 (1번 개폐기 열림출력 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td><input type='image' width='32' height='32' id='oclampcloses_"+(i+1)+"' ";	//oclampcloses_1 (1번 개폐기 닫힘상태 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td><input type='image' width='32' height='32' id='oclampcloser_"+(i+1)+"' ";	//oclampcloser_1 (1번 개폐기 닫힘출력 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td height='56' style='vertical-align: top;'>";
		mtable += "<button class='ctrlbutton' id='occlosedn_"+(i+1)+"'>▼</button></td>";		//occlosedn_1 (1번 개폐기 닫힘온도 down 버튼)
		mtable += "</tr>";
		mtable += "</table>";

		//Gauge 와 24시간 Barchart
		mtable += "<table width='100%' class='tbl_sensor'>";
		mtable += "<tr>";
		mtable += "<td width='"+Gauge_Width+"px'><canvas id='occtrlgauge"+(i+1)+"' style='width:100%;'></canvas></td>";
		mtable += "<td><div id='occtrlchart"+(i+1)+"' style='width:100%; height:"+Gauge_Width+"px;'></div></td>";
		mtable += "</tr>";
		mtable += "</table>";

		mtable += "</td></tr>";
	}

	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	mtable += "<tr><td style='font-size:10px;'>&nbsp;</td></tr>";	//중간 여백
	
	//XR10 온도 컨트롤러 화면구성
	mtable += "<tr><td class='txt_tempctrl_title'>온도 제어기</td></tr>";
	for(var i=0; i<tempctrlnum; i++){
		ctrl_name[Number(occtrlnum)+i] = data[i+11];
		ctrl_hival[Number(occtrlnum)+i] = getTemperatureValue(data[i*6 + 78]);
		ctrl_lowval[Number(occtrlnum)+i] = getTemperatureValue(data[i*6 + 79]);

		mtable += "<tr><td class='txt_tempctrl_name'>" + data[i+11] + "</td></tr>";
		mtable += "<tr><td>";

/*
		mtable += "<table width='100%' class='tbl_channel'>";
		mtable += "<tr>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>현재<br>온도</td>";
		mtable += "<td width='15%' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='tempnow_"+(i+1)+"' disabled></td>";	//tempnow_1 (1번 온도제어기 현재온도)
		mtable += "<td width='7%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>설정<br>온도</td>";
		mtable += "<td width='15%' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='tempset_"+(i+1)+"' disabled></td>";	//tempset_1 (1번 온도제어기 설정온도)
		mtable += "<td width='8%' height='56' style='vertical-align: bottom;'>";
		mtable += "<button class='ctrlbutton' id='tempsetup_"+(i+1)+"'>▲</button></td>";					//tempsetup_1 (1번 온도제어기 설정온도 up 버튼)
		mtable += "<td width='7%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='7%' rowspan='2' align='right' class='txt_label1'>동작<br>모드</td>";
		mtable += "<td width='8%' align='right'>COOL</td>";
		mtable += "<td width='7%' align='left' style='padding-left:15px;'>";
		mtable += "<input type='image' width='32' height='32' id='templampcool_"+(i+1)+"' ";				//templampcool_1 (1번 온도제어기 COOL LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td width='10%' class='txt_label1'>출력</td>";
		mtable += "</tr>";
		mtable += "<tr>";
		mtable += "<td height='56' style='vertical-align: top;'>";
		mtable += "<button class='ctrlbutton' id='tempsetdn_"+(i+1)+"'>▼</button></td>";					//tempsetdn_1 (1번 온도제어기 설정온도 down 버튼)
		mtable += "<td align='right'>HEAT</td>";
		mtable += "<td align='left' style='padding-left:15px;'>";
		mtable += "<input type='image' width='32' height='32' id='templampheat_"+(i+1)+"' ";				//templampheat_1 (1번 온도제어기 HEAT LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td align='center'>";
		mtable += "<input type='image' width='32' height='32' id='templampout_"+(i+1)+"' ";					//templampout_1 (1번 온도제어기 출력 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "</tr>";
		mtable += "</table>";
*/

		mtable += "<table width='100%' class='tbl_channel'>";
		mtable += "<tr>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>현재<br>온도</td>";
		mtable += "<td width='15%' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='tempnow_"+(i+1)+"' disabled></td>";	//tempnow_1 (1번 온도제어기 현재온도)
		mtable += "<td width='7%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='8%' rowspan='2' class='txt_label1'>설정<br>온도</td>";
		mtable += "<td width='15%' rowspan='2' height='112'>";
		mtable += "<input type='number' step='0.1' class='txt_item_value' id='tempset_"+(i+1)+"' disabled></td>";	//tempset_1 (1번 온도제어기 설정온도)
		mtable += "<td width='8%' height='56' style='vertical-align: bottom;'>";
		mtable += "<button class='ctrlbutton' id='tempsetup_"+(i+1)+"'>▲</button></td>";							//tempsetup_1 (1번 온도제어기 설정온도 up 버튼)
		mtable += "<td width='7%' rowspan='2' align='left' style='padding-left:15px;' class='txt_unit'>℃</td>";
		mtable += "<td width='15%' rowspan='2' class='txt_label1' style='text-align:right;padding-right:15px;'>수동<br>출력</td>";
		mtable += "<td rowspan='2' align='left' style='padding-left:0px;'>";
		mtable += "<input type='image' width='112' height='112' id='tempoutbt_"+(i+1)+"' ";					//tempoutbt_1 (1번 온도제어기 수동 버튼)
			mtable += "src='/html/img/png_image/off_disable(96).png'></td>";
		mtable += "<input type='hidden' id='tempoutbtstate_"+(i+1)+"' value='0'>";							//tempoutbtstate_1 (1번 온도제어기 수동 버튼 상태 저장)
		mtable += "</tr>";
		mtable += "<tr>";
		mtable += "<td height='56' style='vertical-align: top;'>";
		mtable += "<button class='ctrlbutton' id='tempsetdn_"+(i+1)+"'>▼</button></td>";					//tempsetdn_1 (1번 온도제어기 설정온도 down 버튼)
		mtable += "</tr>";
		mtable += "<tr>";
		mtable += "<td height='5' colspan='9'></td>";
		mtable += "</tr>";
		mtable += "<tr>";
		//mtable += "<td class='txt_label1'>동작</td>";
		mtable += "<td>&nbsp;</td>";
		mtable += "<td class='txt_label1' style='text-align:right;padding-right:5px;'>COOL</td>";
		mtable += "<td align='left' style='padding-left:15px;padding-top:5px;'>";
		mtable += "<input type='image' width='32' height='32' id='templampcool_"+(i+1)+"' ";				//templampcool_1 (1번 온도제어기 COOL LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td></td>";
		mtable += "<td class='txt_label1' style='text-align:right;padding-right:5px;'>HEAT</td>";
		mtable += "<td align='left' style='padding-left:15px;padding-top:5px;'>";
		mtable += "<input type='image' width='32' height='32' id='templampheat_"+(i+1)+"' ";				//templampheat_1 (1번 온도제어기 HEAT LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "<td></td>";
		mtable += "<td class='txt_label1' style='text-align:right;padding-right:15px;'>출력</td>";
		mtable += "<td align='left' style='padding-left:5px;padding-top:5px;'>";
		mtable += "<input type='image' width='32' height='32' id='templampout_"+(i+1)+"' ";					//templampout_1 (1번 온도제어기 출력 LED)
			mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
		mtable += "</tr>";
		mtable += "</table>";
		

		//Gauge 와 24시간 Barchart
		mtable += "<table width='100%' class='tbl_sensor2'>";
		mtable += "<tr>";
		mtable += "<td width='"+Gauge_Width+"px'><canvas id='tempctrlgauge"+(i+1)+"' style='width:100%;'></canvas></td>";
		mtable += "<td><div id='tempctrlchart"+(i+1)+"' style='width:100%; height:"+Gauge_Width+"px;'></div></td>";
		mtable += "</tr>";
		mtable += "</table>";

		mtable += "</td></tr>";
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	mtable += "<tr><td style='font-size:10px;'>&nbsp;</td></tr>";	//중간 여백

	//타이머 컨트롤러 화면구성
	mtable += "<tr><td class='txt_timectrl_title'>TIMER 제어기</td></tr>";
	for(var i=0; i<timectrlnum; i++){
		ctrl_name[Number(occtrlnum)+i] = data[i+19];
		ctrl_mode[i] = data[i*29+124];
		
		mtable += "<tr><td class='txt_timectrl_name'>" + data[i+19] + "</td></tr>";
		mtable += "<tr><td>";
		
		//set_timechannel 시작 index = 123 (29개 col데이터)
		//	(chno,모드,시간단위,시작시간(시),시작시간(분),종료시간(시),종료시간(분),동작시간,멈춤시간,
		//		ex1_시작시간(시),ex1_시작시간(분),ex1_동작시간(초),ex1_출력,
		//		ex2_시작시간(시),ex2_시작시간(분),ex2_동작시간(초),ex2_출력,
		//		ex3_시작시간(시),ex3_시작시간(분),ex3_동작시간(초),ex3_출력,
		//		ex4_시작시간(시),ex4_시작시간(분),ex4_동작시간(초),ex4_출력,
		//		ex5_시작시간(시),ex5_시작시간(분),ex5_동작시간(초),ex5_출력)*timectrlnum
		if (data[i*29 + 124] == 10){
			//출력지속 모드 인 경우
			mtable += "<table width='100%' class='tbl_channel2'>";
			mtable += "<tr>";
			mtable += "<td width='15%' align='right' style='padding-top:10px;'>열림시간</td>";
			//mtable += "<td width='35%' align='left' style='padding-top:10px;padding-left:10px;'>";
			mtable += "<td width='35%' align='left' style='padding:10px 0px 0px 10px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:85%;' id='tmr_opentime"+(i+1)+"' value='09:00' disabled></td>";
			mtable += "<td width='8%' align='right' style='padding-top:10px;'>열림</td>";
			//mtable += "<td width='10%' align='left' style='padding-left:10px;'>";
			mtable += "<td width='10%' align='left' style='padding:10px 0px 0px 10px;'>";
			mtable += "<input type='image' width='32' height='32' id='tmr_openout"+(i+1)+"' ";			//출력지속모드 열림상태 LED
				mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
			mtable += "<td rowspan=2>수동열림<br>";
			mtable += "<input type='image' width='112' height='112' id='tmr_up"+(i+1)+"' ";				//출력지속모드 수동 열림 버튼
				mtable += "src='/html/img/png_image/up_disable(96).png'>&nbsp;</td>";
			mtable += "<input type='hidden' id='tmr_upstate"+(i+1)+"' value='0'>";						//출력지속모드 수동 열림상태 저장
			mtable += "<td rowspan=2>수동닫힘<br>";
			mtable += "<input type='image' width='112' height='112' id='tmr_dn"+(i+1)+"' ";				//출력지속모드 수동 닫힘 버튼
				mtable += "src='/html/img/png_image/down_disable(96).png'></td>";
			mtable += "<input type='hidden' id='tmr_dnstate"+(i+1)+"' value='0'>";							//출력지속모드 수동 닫힘상태 저장
			mtable += "</tr>";
			mtable += "<tr>";
			mtable += "<td align='right' style='padding-bottom:10px;'>닫힘시간</td>";
			//mtable += "<td align='left' style='padding-left:10px;'>";
			mtable += "<td align='left' style='padding:0px 0px 10px 10px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:85%;' id='tmr_closetime"+(i+1)+"' value='18:00' disabled></td>";
			mtable += "<td align='right' style='padding-bottom:10px;'>닫힘</td>";
			mtable += "<td align='left' style='padding-left:10px;'>";
			mtable += "<input type='image' width='32' height='32' id='tmr_closeout"+(i+1)+"' ";			//출력지속모드 닫힘상태 LED
				mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
			mtable += "</tr>";
			mtable += "</table>";
		}else if (data[i*29 + 124] == 11){
			//플리커 모드 인 경우
			mtable += "<table width='100%' class='tbl_channel2'>";
			mtable += "<tr>";
			mtable += "<td width='15%' align='right' style='padding-top:10px;'>시작시간</td>";
			//mtable += "<td colspan='2' width='35%' align='left' style='padding-left:10px;'>";
			mtable += "<td colspan='2' width='35%' align='left' style='padding:10px 0px 0px 10px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:80%;' id='tmr_starttime"+(i+1)+"' value='09:00' disabled></td>";
			mtable += "<td width='15%' align='right' style='padding-top:10px;'>종료시간</td>";
			//mtable += "<td align='left' style='padding-left:10px;'>";
			mtable += "<td align='left' style='padding:10px 0px 0px 10px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:80%;' id='tmr_endtime"+(i+1)+"' value='18:00' disabled></td>";
			mtable += "</tr>";
			mtable += "<tr>";
			mtable += "<td align='right'>동작시간</td>";
			mtable += "<td width='20%' align='left' style='padding-left:10px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td align='left'><div style='padding-left:15px;' id='tmr_rununit"+(i+1)+"'>(분)</div></td>";
			mtable += "<td style='padding-top:30px;'>출력상태</td>";
			mtable += "<td rowspan='2'><input type='image' width='112' height='112' id='tmr_up"+(i+1)+"' ";	//플리커모드 수동 출력 버튼
				mtable += "src='/html/img/png_image/up_disable(96).png'></td>";
			mtable += "<input type='hidden' id='tmr_upstate"+(i+1)+"' value='0'>";							//플리커모드 수동 출력상태 저장
			mtable += "</tr>";
			mtable += "<tr>";
			mtable += "<td align='right' style='padding-bottom:10px;'>정지시간</td>";
			mtable += "<td align='left' style='padding:0px 0px 10px 10px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_stoptime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td align='left' style='padding-bottom:10px;'><div style='padding-left:15px;' id='tmr_stopunit"+(i+1)+"'>(분)</div></td>";
			mtable += "<td><input type='image' width='32' height='32' style='margin-top:-20px;' id='tmr_openout"+(i+1)+"' ";	//플리커모드 출력상태 LED
				mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
			mtable += "</tr>";
			mtable += "</table>";
		}else if (data[i*29 + 124] == 12){
			//5단 확장 모드 인 경우
			mtable += "<table width='100%' class='tbl_channel2'>";
			mtable += "<tr>";
			mtable += "<td width='7%' align='right' style='padding-top:10px;'>1단</td>";
			mtable += "<td width='14%' style='padding-top:10px;'>시작시간</td>";
			mtable += "<td width='22%' colspan='2' align='left' style='padding:10px 0px 0px 5px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:100%;' id='tmr_ex1starttime"+(i+1)+"' value='09:00' disabled></td>";
			mtable += "<td width='18%' align='right' style='padding-top:10px;'>동작시간</td>";
			mtable += "<td width='15%' align='left' style='padding-left:5px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_ex1runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td width='5%' style='padding-top:10px;'>(초)</td>";
			mtable += "<td width='10%' align='right' style='padding-top:10px;'>출력</td>";
			mtable += "<td align='left' style='padding:10px 0px 0px 10px;font-weight:bold;'><div id='tmr_ex1output"+(i+1)+"'>열림</div></td>";
			mtable += "</tr>";

			mtable += "<tr>";
			mtable += "<td width='7%' align='right'>2단</td>";
			mtable += "<td width='14%'>시작시간</td>";
			mtable += "<td width='22%' colspan='2' align='left' style='padding-left:5px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:100%;' id='tmr_ex2starttime"+(i+1)+"' value='10:00' disabled></td>";
			mtable += "<td width='18%' align='right'>동작시간</td>";
			mtable += "<td width='15%' align='left' style='padding-left:5px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_ex2runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td width='5%'>(초)</td>";
			mtable += "<td width='10%' align='right'>출력</td>";
			mtable += "<td align='left' style='padding-left:10px;font-weight:bold;'><div id='tmr_ex2output"+(i+1)+"'>닫힘</div></td>";
			mtable += "</tr>";

			mtable += "<tr>";
			mtable += "<td width='7%' align='right'>3단</td>";
			mtable += "<td width='14%'>시작시간</td>";
			mtable += "<td width='22%' colspan='2' align='left' style='padding-left:5px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:100%;' id='tmr_ex3starttime"+(i+1)+"' value='11:00' disabled></td>";
			mtable += "<td width='18%' align='right'>동작시간</td>";
			mtable += "<td width='15%' align='left' style='padding-left:5px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_ex3runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td width='5%'>(초)</td>";
			mtable += "<td width='10%' align='right'>출력</td>";
			mtable += "<td align='left' style='padding-left:10px;font-weight:bold;'><div id='tmr_ex3output"+(i+1)+"'>닫힘</div></td>";
			mtable += "</tr>";

			mtable += "<tr>";
			mtable += "<td width='7%' align='right'>4단</td>";
			mtable += "<td width='14%'>시작시간</td>";
			mtable += "<td width='22%' colspan='2' align='left' style='padding-left:5px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:100%;' id='tmr_ex4starttime"+(i+1)+"' value='12:00' disabled></td>";
			mtable += "<td width='18%' align='right'>동작시간</td>";
			mtable += "<td width='15%' align='left' style='padding-left:5px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_ex4runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td width='5%'>(초)</td>";
			mtable += "<td width='10%' align='right'>출력</td>";
			mtable += "<td align='left' style='padding-left:10px;font-weight:bold;'><div id='tmr_ex4output"+(i+1)+"'>닫힘</div></td>";
			mtable += "</tr>";

			mtable += "<tr>";
			mtable += "<td width='7%' align='right'>5단</td>";
			mtable += "<td width='14%'>시작시간</td>";
			mtable += "<td width='22%' colspan='2' align='left' style='padding-left:5px;'>";
			mtable += "<input type='text' class='txt_item_value2' style='width:100%;' id='tmr_ex5starttime"+(i+1)+"' value='13:00' disabled></td>";
			mtable += "<td width='18%' align='right'>동작시간</td>";
			mtable += "<td width='15%' align='left' style='padding-left:5px;'>";
			mtable += "<input type='number' step='1' class='txt_item_value2' id='tmr_ex5runtime"+(i+1)+"' value='120' disabled></td>";
			mtable += "<td width='5%'>(초)</td>";
			mtable += "<td width='10%' align='right'>출력</td>";
			mtable += "<td align='left' style='padding-left:10px;font-weight:bold;'><div id='tmr_ex5output"+(i+1)+"'>열림</div></td>";
			mtable += "</tr>";

			mtable += "<tr>";
			mtable += "<td colspan='2' rowspan='2' align='right'>출력상태</td>";
			mtable += "<td width='11%' style='padding:10px 0px 0px 0px;'>열림</td>";
			mtable += "<td style='padding:10px 0px 0px 0px;'>닫힘</td>";
			mtable += "<td colspan='3' rowspan='2' style='padding:10px 0px;'>";
			mtable += "<input type='image' width='112' height='112' id='tmr_up"+(i+1)+"' ";			//확장모드 수동 열림 버튼
				mtable += "src='/html/img/png_image/up_disable(96).png'></td>";
			mtable += "<input type='hidden' id='tmr_upstate"+(i+1)+"' value='0'>";					//확장모드 수동 열림상태 저장
			mtable += "<td colspan='2' rowspan='2' style='padding:10px 0px;'>";
			mtable += "<input type='image' width='112' height='112' id='tmr_dn"+(i+1)+"' ";			//확장모드 수동 닫힘 버튼
				mtable += "src='/html/img/png_image/down_disable(96).png'></td>";
			mtable += "<input type='hidden' id='tmr_dnstate"+(i+1)+"' value='0'>";					//확장모드 수동 닫힘상태 저장
			mtable += "</tr>";
			mtable += "<tr>";
			mtable += "<td style='padding-bottom:15px;'>";
			mtable += "<input type='image' width='32' height='32' style='margin-top:-20px;' id='tmr_exopenout"+(i+1)+"' ";	//확장모드 출력상태 LED
				mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
			mtable += "<td style='padding-bottom:15px;'>";
			mtable += "<input type='image' width='32' height='32' style='margin-top:-20px;' id='tmr_excloseout"+(i+1)+"' ";	//확장모드 출력상태 LED
				mtable += "src='/html/img/png_image/LED_Disable(32).png'></td>";
			mtable += "</tr>";
			
			mtable += "</table>";
		}
		
		mtable += "</td></tr>";
	}

	mtable += "</table>";
	
	$("#main").append(mtable);
	
	//온도 Gauge를 표시
	var gauge_index = 0;
	for(var i=0; i<occtrlnum; i++){
		draw_ctrlgauge(gauge_index, i, 1);
		gauge_index++;
	}
	for(var i=0; i<tempctrlnum; i++){
		draw_ctrlgauge(gauge_index, i, 2);
		gauge_index++;
	}

	
	create_temphistory();
}


function create_temphistory(){
	$.ajax({
		type : 'POST',
		//url : '/php/read_1daydata.php',
		url : '/php/read_1daydata_test.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//console.log(data);
			//if (isEmpty(data)) return false;
			
			//if(design[0] == 1){
			var chart_index = 0;
			for(i=0; i<occtrlnum; i++){
				//draw_occtrlchart(i, data[i]);
				if (data[i] && data[i].length !== 0) {
					draw_occtrlchart(chart_index, i, data[i], 1);
					chart_index++;
				}
			}
			for(i=0; i<tempctrlnum; i++){
				//draw_occtrlchart(i, data[i]);
				if (data[i] && data[i].length !== 0) {
					draw_occtrlchart(chart_index, i, data[8+i], 2);
					chart_index++;
				}
			}
			//}
		}
	}); //End of $.ajax({
	return true;
}


function read_nowdata(){
	$.ajax({
		type : 'POST',
		url : '/php/read_nowsetdata.php',
		data : {},
		dataType : 'json',
		success : function(data){
			//console.log(data);
			if (data == undefined || data == null) return false;
			display_nowdata(data);
		}
	}); //End of $.ajax({
	return true;
}

function display_nowdata(data){
	//console.log("display...");
	
	//if(bCheckClick==true) return;

	//SH2N 의 경우
	// [equip_state] 비트
	//  bit0: 열림상태 (0:ON/1:OFF)
	//  bit1: 닫힘상태 (0:ON/1:OFF)
	//  bit2: 열림출력 (0:ON/1:OFF)
	//  bit3: 닫힘출력 (0:ON/1:OFF)
	//  bit4: 센서오픈에러 -> 원격열림설정(0:원격열림/1:미사용) 으로 변경
	//  bit5: 센서쇼트에러 -> 원격닫힘설정(0:원격닫힘/1:미사용) 으로 변경
	//  bit6: 시스템상태 (0:운전/1:정지)
	//
	//XR10 의 경우
	//  [equip_state] 비트
	//  bit0: 온도단위 (0:℃/1:℉)
	//  bit1: 온도제어출력 (0:ON/1:OFF)
	//  bit2: 센서오픈에러 (0:에러상태/1:정상)
	//  bit3: 센서쇼트에러 (0:에러상태/1:정상)
	//  bit4: 시스템상태 (0:운전/1:정지)
	//  bit5: COOL/HEAT (0:COOL/1:HEAT)
	
	//[0]~[3] : nowtemp1,opentemp1,closetemp1,nowstate1
	//[4]~[7] : nowtemp2,opentemp2,closetemp2,nowstate2
	//.................................................
	//[60]~[63] : nowtemp16,opentemp16,closetemp16,nowstate16
	var idx;
	for(var i=0; i<occtrlnum; i++){
		idx = i*4;
		temp_gauge[i].value = getTemperatureValue(data[idx]).toFixed(1);
		
		
		$("#ocnow_"+(i+1)).prop("value", getTemperatureValue(data[idx]).toFixed(1));		//현재온도 표시
		$("#ocopen_"+(i+1)).prop("value", getTemperatureValue(data[idx+1]).toFixed(1));		//열림온도 표시
		$("#occlose_"+(i+1)).prop("value", getTemperatureValue(data[idx+2]).toFixed(1));	//닫힘온도 표시
				
		//수동열림 검사
		if(upclickok[i] == 1){
			let elapsedTime = (Date.now() - upclicktime[i]) / 1000;		// 초 단위
			if(elapsedTime >= 5){
			$("#ocmanualup_"+(i+1)).attr('src', "/html/img/png_image/up_"+ (isBitSet(data[idx+3],4)? "dis":"en") +"able(96).png");
			$("#ocupstate_"+(i+1)).prop("value", isBitSet(data[idx+3],4)? "1":"0");
			$("#ocmanualup_"+(i+1)).prop('disabled', false);
			upclickok[i] = 0;
			}
		}else{
			$("#ocmanualup_"+(i+1)).attr('src', "/html/img/png_image/up_"+ (isBitSet(data[idx+3],4)? "dis":"en") +"able(96).png");
			$("#ocupstate_"+(i+1)).prop("value", isBitSet(data[idx+3],4)? "1":"0");
		}
		
		//수동닫힘 검사
		if(dnclickok[i] == 1){
			let elapsedTime = (Date.now() - dnclicktime[i]) / 1000;		// 초 단위
			if(elapsedTime >= 5){
			$("#ocmanualdn_"+(i+1)).attr('src', "/html/img/png_image/down_"+ (isBitSet(data[idx+3],5)? "dis":"en") +"able(96).png");
			$("#ocdnstate_"+(i+1)).prop("value", isBitSet(data[idx+3],5)? "1":"0");
			$("#ocmanualdn_"+(i+1)).prop('disabled', false);
			dnclickok[i] = 0;
			}
		}else{
			$("#ocmanualdn_"+(i+1)).attr('src', "/html/img/png_image/down_"+ (isBitSet(data[idx+3],5)? "dis":"en") +"able(96).png");
			$("#ocdnstate_"+(i+1)).prop("value", isBitSet(data[idx+3],5)? "1":"0");
		}
		
		//열림상태 검사
		$("#oclampopens_"+(i+1)).attr('src', "/html/img/png_image/LED_"+ (isBitSet(data[idx+3],0)? "Disable(32)":"Green(32)") +".png");
		//닫힘상태 검사
		$("#oclampcloses_"+(i+1)).attr('src', "/html/img/png_image/LED_"+ (isBitSet(data[idx+3],1)? "Disable(32)":"Orange(32)") +".png");
		//열림출력 검사
		$("#oclampopenr_"+(i+1)).attr('src', "/html/img/png_image/LED_"+ (isBitSet(data[idx+3],2)? "Disable(32)":"Red(32)") +".png");
		//닫힘출력 검사
		$("#oclampcloser_"+(i+1)).attr('src', "/html/img/png_image/LED_"+ (isBitSet(data[idx+3],3)? "Disable(32)":"Red(32)") +".png");

	}
	for(var i=0; i<tempctrlnum; i++){
		idx = 32 + i*4;
		temp_gauge[Number(occtrlnum)+i].value = getTemperatureValue(data[idx]).toFixed(1);

		$("#tempnow_"+(i+1)).prop("value", getTemperatureValue(data[idx]).toFixed(1));		//현재온도 표시
		$("#tempset_"+(i+1)).prop("value", getTemperatureValue(data[idx+1]).toFixed(1));	//설정온도 표시

		//수동ON/OFF 검사
		if(upclickok[8+i] == 1){
			let elapsedTime = (Date.now() - upclicktime[8+i]) / 1000;		// 초 단위
			if(elapsedTime >= 2){
			$("#tempoutbt_"+(i+1)).prop('disabled', false);
			upclickok[8+i] = 0;
			}
		}


		if(isBitSet(data[idx+3],5)){
			//HEAT
			$("#templampcool_"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			$("#templampheat_"+(i+1)).attr('src', '/html/img/png_image/LED_Red(32).png');
		}else{
			//COOL
			$("#templampcool_"+(i+1)).attr('src', '/html/img/png_image/LED_Blue(32).png');
			$("#templampheat_"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
		}

		if(isBitSet(data[idx+3],1)){
			//Relay OFF
			$("#templampout_"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
		}else{
			//Relay ON
			$("#templampout_"+(i+1)).attr('src', '/html/img/png_image/LED_Red(32).png');
		}

		//$("#tempoutbtstate_"+(i+1)).prop("value", isBitSet(data[idx+3],4)? "1":"0");
	}
	
	//Timer1[64], Timer2[94], Timer3[124], Timer4[154], Timer5[184], Timer6[214], Timer7[244], Timer8[274]
	//[64],[65],[66]...[93] : runtime1,eqstate17, mode1,time_unit1,....
	//[94],[95],[96]...[123] : runtime2,eqstate18, mode2,time_unit2,....
	//..................................................................
	for(var i=0; i<timectrlnum; i++){
		idx = 64 + i*30;
		//console.log(ctrl_mode[i], data[idx+1]);
		if(ctrl_mode[i] == 10){
			//출력지속 모드
			$("#tmr_opentime"+(i+1)).prop("value", formatTime(data[idx+4], data[idx+5]));		//열림시간
			$("#tmr_closetime"+(i+1)).prop("value", formatTime(data[idx+6], data[idx+7]));		//닫힘시간

			/*
			if(Number(data[idx+1])== 0){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
				$("#tmr_dnstate"+(i+1)).prop("value", "0");
			}else if(Number(data[idx+1]) == 1){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_enable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "1");
				$("#tmr_dnstate"+(i+1)).prop("value", "0");
			}else if(Number(data[idx+1]) == 2){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_enable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
				$("#tmr_dnstate"+(i+1)).prop("value", "1");
			}
			*/
			if(upclickok[16+i] == 1){
				let elapsedTime = (Date.now() - upclicktime[16+i]) / 1000;		// 초 단위
				if(elapsedTime >= 2){
				$("#tmr_up"+(i+1)).prop('disabled', false);
				upclickok[16+i] = 0;
				}
			}
			if(dnclickok[16+i] == 1){
				let elapsedTime = (Date.now() - dnclicktime[16+i]) / 1000;		// 초 단위
				if(elapsedTime >= 2){
				$("#tmr_dn"+(i+1)).prop('disabled', false);
				dnclickok[16+i] = 0;
				}
			}
			
			if(Number(data[idx+1]) == 0){
				//정지
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
				$("#tmr_closeout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			}else if(Number(data[idx+1]) == 1){
				//열림
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Red(32).png');
				$("#tmr_closeout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			}else if(Number(data[idx+1]) == 2){
				//닫힘
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
				$("#tmr_closeout"+(i+1)).attr('src', '/html/img/png_image/LED_Blue(32).png');
			}
		}else if(ctrl_mode[i] == 11){
			//플리커 모드
			$("#tmr_starttime"+(i+1)).prop("value", formatTime(data[idx+4], data[idx+5]));		//시작시간
			$("#tmr_endtime"+(i+1)).prop("value", formatTime(data[idx+6], data[idx+7]));		//종료시간
			$("#tmr_runtime"+(i+1)).prop("value", data[idx+8]);									//동작시간
			$("#tmr_stoptime"+(i+1)).prop("value", data[idx+9]);								//정지시간

			//$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_"+ (data[idx+3]==1)? "dis":"en") +"able(96).png");
			if(Number(data[idx+3]) == 0){
				$("#tmr_rununit"+(i+1)).html("(초)");
				$("#tmr_stopunit"+(i+1)).html("(초)");
			}else if(Number(data[idx+3]) == 1){
				$("#tmr_rununit"+(i+1)).html("(초)");
				$("#tmr_stopunit"+(i+1)).html("(분)");
			}else if(Number(data[idx+3]) == 2){
				$("#tmr_rununit"+(i+1)).html("(분)");
				$("#tmr_stopunit"+(i+1)).html("(초)");
			}else if(Number(data[idx+3]) == 3){
				$("#tmr_rununit"+(i+1)).html("(분)");
				$("#tmr_stopunit"+(i+1)).html("(분)");
			}

			/*
			if(Number(data[idx+1])== 0){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
			}else if(Number(data[idx+1]) == 1){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_enable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "1");
			}else if(Number(data[idx+1]) == 2){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
			}
			*/
			if(upclickok[16+i] == 1){
				let elapsedTime = (Date.now() - upclicktime[16+i]) / 1000;		// 초 단위
				if(elapsedTime >= 2){
				$("#tmr_up"+(i+1)).prop('disabled', false);
				upclickok[16+i] = 0;
				}
			}
			
			if(Number(data[idx+1]) == 0){
				//정지
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			}else if(Number(data[idx+1]) == 1){
				//열림
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Red(32).png');
			}else if(Number(data[idx+1]) == 2){
				//닫힘
				$("#tmr_openout"+(i+1)).attr('src', '/html/img/png_image/LED_Blue(32).png');
			}
		}else if(ctrl_mode[i] == 12){
			//5단 확장 모드
			$("#tmr_ex1starttime"+(i+1)).prop("value", formatTime(data[idx+10], data[idx+11]));		//1단 시작시간
			$("#tmr_ex1runtime"+(i+1)).prop("value", data[idx+12]);									//1단 동작시간
			if(Number(data[idx+13]) == 0){
				$("#tmr_ex1output"+(i+1)).html("열림");												//1단 열림 혹은 닫힘
			}else if(Number(data[idx+13]) == 1){
				$("#tmr_ex1output"+(i+1)).html("닫힘");
			}
			$("#tmr_ex2starttime"+(i+1)).prop("value", formatTime(data[idx+14], data[idx+15]));		//2단 시작시간
			$("#tmr_ex2runtime"+(i+1)).prop("value", data[idx+16]);									//2단 동작시간
			if(Number(data[idx+17]) == 0){
				$("#tmr_ex2output"+(i+1)).html("열림");												//2단 열림 혹은 닫힘
			}else if(Number(data[idx+17]) == 1){
				$("#tmr_ex2output"+(i+1)).html("닫힘");
			}
			$("#tmr_ex3starttime"+(i+1)).prop("value", formatTime(data[idx+18], data[idx+19]));		//3단 시작시간
			$("#tmr_ex3runtime"+(i+1)).prop("value", data[idx+20]);									//3단 동작시간
			if(Number(data[idx+21]) == 0){
				$("#tmr_ex3output"+(i+1)).html("열림");												//3단 열림 혹은 닫힘
			}else if(Number(data[idx+21]) == 1){
				$("#tmr_ex3output"+(i+1)).html("닫힘");
			}
			$("#tmr_ex4starttime"+(i+1)).prop("value", formatTime(data[idx+22], data[idx+23]));		//4단 시작시간
			$("#tmr_ex4runtime"+(i+1)).prop("value", data[idx+24]);									//4단 동작시간
			if(Number(data[idx+25]) == 0){
				$("#tmr_ex4output"+(i+1)).html("열림");												//4단 열림 혹은 닫힘
			}else if(Number(data[idx+25]) == 1){
				$("#tmr_ex4output"+(i+1)).html("닫힘");
			}
			$("#tmr_ex5starttime"+(i+1)).prop("value", formatTime(data[idx+26], data[idx+27]));		//5단 시작시간
			$("#tmr_ex5runtime"+(i+1)).prop("value", data[idx+28]);									//5단 동작시간
			if(Number(data[idx+29]) == 0){
				$("#tmr_ex5output"+(i+1)).html("열림");												//5단 열림 혹은 닫힘
			}else if(Number(data[idx+29]) == 1){
				$("#tmr_ex5output"+(i+1)).html("닫힘");
			}
			
			/*
			if(Number(data[idx+1])== 0){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
				$("#tmr_dnstate"+(i+1)).prop("value", "0");
			}else if(Number(data[idx+1]) == 1){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_enable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_disable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "1");
				$("#tmr_dnstate"+(i+1)).prop("value", "0");
			}else if(Number(data[idx+1]) == 2){
				$("#tmr_up"+(i+1)).attr('src', "/html/img/png_image/up_disable(96).png");
				$("#tmr_dn"+(i+1)).attr('src', "/html/img/png_image/down_enable(96).png");
				$("#tmr_upstate"+(i+1)).prop("value", "0");
				$("#tmr_dnstate"+(i+1)).prop("value", "1");
			}
			*/
			if(upclickok[16+i] == 1){
				let elapsedTime = (Date.now() - upclicktime[16+i]) / 1000;		// 초 단위
				if(elapsedTime >= 2){
				$("#tmr_up"+(i+1)).prop('disabled', false);
				upclickok[16+i] = 0;
				}
			}
			if(dnclickok[16+i] == 1){
				let elapsedTime = (Date.now() - dnclicktime[16+i]) / 1000;		// 초 단위
				if(elapsedTime >= 2){
				$("#tmr_dn"+(i+1)).prop('disabled', false);
				dnclickok[16+i] = 0;
				}
			}
			
			if(Number(data[idx+1]) == 0){
				//정지
				$("#tmr_exopenout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
				$("#tmr_excloseout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			}else if(Number(data[idx+1]) == 1){
				//열림
				$("#tmr_exopenout"+(i+1)).attr('src', '/html/img/png_image/LED_Red(32).png');
				$("#tmr_excloseout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
			}else if(Number(data[idx+1]) == 2){
				//닫힘
				$("#tmr_exopenout"+(i+1)).attr('src', '/html/img/png_image/LED_Disable(32).png');
				$("#tmr_excloseout"+(i+1)).attr('src', '/html/img/png_image/LED_Blue(32).png');
			}
		}
	}
}

function draw_ctrlgauge(gauge_index, temp_index, ctrl_type){
	//ctrl_type : 1(개폐기 컨트롤러), 2(온도 컨트롤러)
	var idx = (ctrl_type==1)? temp_index : (Number(occtrlnum)+temp_index);
	temp_gauge[gauge_index] = new RadialGauge({
		renderTo: (ctrl_type==1)? 'occtrlgauge'+(temp_index+1) : 'tempctrlgauge'+(temp_index+1),
		//renderTo: 'occtrlgauge'+(temp_index+1),
		//width: 300,
		//height: 300,
		width: Gauge_Width,
		height: Gauge_Width,
		title: ctrl_name[idx],
		fontTitleSize: "60",
		units: "(℃)",
		fontUnitsSize: "40",
		minorTicks: 5,
		//minorTicks: 2,
		minValue: Min_Temperature,
		maxValue: Max_Temperature,
		//majorTicks: ["-20", "-10", "0", "10", "20", "30", "40", "50", "60", "70", "80"],
		//majorTicks: ["-15", "0", "15", "30", "45", "60"],
		majorTicks: Gauge_Ticks,
		//highlights: false,
		highlights : [ {from: Min_Temperature, to: ctrl_lowval[idx], color: lowTempColor},
					   {from: ctrl_hival[idx], to: Max_Temperature, color: hiTempColor}],
		colorValueBoxShadow: true,
		valueBoxStroke: 0,
		colorValueBoxBackground: false,
		fontValueSize: "55",
		colorMajorTicks: "#555",
		colorMinorTicks: "#aaa",
		colorTitle: "#222",
		colorUnits: "#777",
		colorNumbers: "#555",
		colorNeedleStart: "rgba(255, 0, 0, .1)",
		colorNeedleEnd: "rgba(255, 0, 0, .9)",
		colorPlate: "#E6E6E6",

		//colorBorderOuter: "#333",
		//colorBorderOuterEnd: "#111",
		//colorBorderMiddle: "#222",
		//colorBorderMiddleEnd: "#111",
		//colorBorderInner: "#111",
		//colorBorderInnerEnd: "#333",
		//colorNeedleShadowDown: "#333",
			
		valueInt: 2,
		valueDec: 1		
	});
	temp_gauge[gauge_index].draw();
}

function draw_occtrlchart(chart_index, temp_index, chartdata, ctrl_type){
	//ctrl_type : 1(개폐기 컨트롤러), 2(온도 컨트롤러)
	var idx = (ctrl_type==1)? temp_index : (Number(occtrlnum)+temp_index);
	var chart_name = (ctrl_type==1)? 'occtrlchart' : 'tempctrlchart';
	
	var xtic_max;
	if(chartdata.length < 12){
		xtic_max = chartdata.length;
	}else{
		xtic_max = 12;
		chartdata = chartdata.slice(chartdata.length-12, chartdata.length);
	}
	
	if(chartplot[chart_index]){chartplot[chart_index].destroy();};
	chartplot[chart_index] = $.jqplot(chart_name+(temp_index+1), [chartdata, chartdata], {
		seriesDefaults:{
			//renderer:$.jqplot.BarRenderer,
			rendererOptions:{
				animation: {show: true, speed:1000},
				barWidth: 15
			}
			,pointLabels:{show: true, 
			//formatString: '%.1f'
			}
		},
		//series: [{color: '#9966CC', lineWidth:1}]
		series: [
			//{renderer:$.jqplot.BarRenderer, color: '#9966CC', lineWidth:1},
			{renderer:$.jqplot.BarRenderer, color: '#EEEEFF', lineWidth:1},
			{renderer:$.jqplot.LineRenderer, color: '#66FF66', lineWidth:2}
		],
		grid: {
			background: 'rgba(255,255,255, 0.0)',
			drawBorder: true,
			shadow: false,
			gridLineColor: '#BBBBBB',
			gridLineWidth: 0.5
        },
		axes:{
			xaxis:{
				//renderer: $.jqplot.CategoryAxisRenderer,
				renderer:$.jqplot.DateAxisRenderer,
				rendererOptions: {
					tickRenderer:$.jqplot.CanvasAxisTickRenderer
				},
				tickOptions: {
					//show: false,
					//showLabel: false
					fontSize:'12pt',
					fontFamily:'Tahoma',
					textColor:'#FFFFFF',
					//formatString:'%H:%M'
					formatString:'%m-%d %H:%M'
				},
				//min: 0,
				//max: (xtic_max + 0.5),
				//tickInterval: 2
				tickInterval: '8 hours'
				,min: subtractHours(chartdata[0][0], 1)
				,max: subtractHours(new Date(), 0)
			},
			yaxis:{
				tickOptions: {
					//show: false
					fontSize:'14pt',
					fontFamily:'Tahoma',
					textColor:'#FFFFFF'
					//formatString: (seltype==3)? '%H:%M:%S' : '%Y-%m-%d'
					//formatString: xaxis_format
				},
				min: Min_Temperature,
				max: Max_Temperature,
				//tickInterval: 15
				tickInterval: Chart_tickInterval
			}
		},
		canvasOverlay: {
			show: true,
			objects: [
				{ rectangle: { ymax: ctrl_lowval[idx], xminOffset: "0px", xmaxOffset: "0px", yminOffset: "0px", ymaxOffset: "0px",
					color: lowTempColor2} },
				{ rectangle: { ymin: ctrl_hival[idx], xminOffset: "0px", xmaxOffset: "0px", yminOffset: "0px", ymaxOffset: "0px",
					color: hiTempColor2} }
			]
		}
	  
	});
}

function getTemperatureValue(temp){
	//temp : 0~65535
	if(temp < 32768){
		return (temp/10.0);
	}else{
		return ((temp - 65536)/10.0);
	}
}

function SelectedRadio(radioname){
	var rn = document.getElementsByName(radioname);
	for(var i=0; i<rn.length; i++){
		if(rn[i].checked == true){			
			return (i);
		}
	}
	return 0;
};

function subtractHours(dateString, minusHours) {
    // 입력된 날짜 문자열을 Date 객체로 변환
    let date = new Date(dateString);

    // Date 객체에서 minusHours시간을 빼기 (밀리초 기준)
    date.setHours(date.getHours() - minusHours);

    // 년, 월, 일, 시, 분, 초를 각각 추출
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    // 원하는 형식으로 조합
    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

//16비트 값에서 특정 비트가 1인지 확인하는 함수
function isBitSet(value, bitPosition) {
	// bitPosition은 0 ~ 15
	return ((value >> bitPosition) & 1) === 1;
}

//문자열이 빈 문자열인지 검사한다.
function isEmpty(str){
	if(typeof str == "undefined" || str == null || str == "")
		return true;
	else
		return false ;
}

//문자열이 빈 문자열인지 검사하여 기본 문자열로 반환한다.
function nvl(str, defaultStr){
	if(typeof str == "undefined" || str == null || str == "")
		str = defaultStr ;
        
	return str ;
}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms
  while (Date.now() < wakeUpTime) {}
}

function formatTime(hour, minute) {
	// 테스트
	//console.log(formatTime(9, 5));   // "09:05"
	//console.log(formatTime(0, 0));   // "00:00"
	//console.log(formatTime(14, 30)); // "14:30"

	var h = String(hour).padStart(2, '0');
	var m = String(minute).padStart(2, '0');
    
	return h + ':' + m;
}
