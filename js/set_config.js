var occtrlnum;
var tempctrlnum;
var timectrlnum;

var channelData;


$(document).ready(function(){
	$('.animsition').animsition();

	//로그인 되어 있는 상태에서는 값이 변하지 않는 오류 내포하고 있다.
	occtrlnum = $("#session_occtrlnum").prop("value");
	tempctrlnum = $("#session_tempctrlnum").prop("value");
	timectrlnum = $("#session_timectrlnum").prop("value");
	
	$("#id").prop("value", $("#session_id").prop("value"));		//암호설정에서 사용

	create_set_io_screen();
	create_set_alarm_screen();

	$.ajax({
		type : 'POST',
		url : '/php/read_setchannel.php',
		data : '',
		dataType : 'json',
		success : function(data){
			channelData = data;

			$("#occtrlnum").change(function(){
				occtrlnum = $(this).val();
				create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 1);
				create_init_set_alarm_screen(occtrlnum, tempctrlnum, 1);
				//read_channeldata(1);
				fill_channeldata(channelData, 1);
			});
			$("#tempctrlnum").change(function(){
				tempctrlnum = $(this).val();
				create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 2);
				create_init_set_alarm_screen(occtrlnum, tempctrlnum, 2);
				//read_channeldata(2);
				fill_channeldata(channelData, 2);
			});
			$("#timectrlnum").change(function(){
				timectrlnum = $(this).val();
				create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 3);
				
				//동작모드 변경 시 이벤트 등록
				for(var i=0; i<timectrlnum; i++){
					$("#timemode"+(i+1)).change(function(){
						selmode = $(this).val();
						//idname = $(this).attr('id');
						lastChar = $(this).attr('id').slice(-1);
						//console.log(selmode + ", " + lastChar + "  change.....");
						create_init_set_time_screen(lastChar, selmode);
						fill_timemodedata(data, lastChar, selmode);
					});
				}
				//read_channeldata(3);
				fill_channeldata(channelData, 3);
			});

			$("#occtrlnum").prop("selectedIndex", occtrlnum);
			$("#occtrlnum").change();
			$("#tempctrlnum").prop("selectedIndex", tempctrlnum);
			$("#tempctrlnum").change();
			$("#timectrlnum").prop("selectedIndex", timectrlnum);
			$("#timectrlnum").change();

		},
		error : function(){
			console.log("read_setchannel.php..... ajax error()");
		},
		complete : function(){
			//console.log("read_setchannel.php..... ajax complete()");
		}
	}); //End of $.ajax({



	/*
	$("#occtrlnum").change(function(){
		//alert($(this).val());
		occtrlnum = $(this).val();
		create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 1);
		create_init_set_alarm_screen(occtrlnum, tempctrlnum, 1);
		read_channeldata(1);
	});
	$("#tempctrlnum").change(function(){
		//alert($(this).val());
		tempctrlnum = $(this).val();
		create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 2);
		create_init_set_alarm_screen(occtrlnum, tempctrlnum, 2);
		read_channeldata(2);
	});
	$("#timectrlnum").change(function(){
		//alert($(this).val());
		timectrlnum = $(this).val();
		create_init_set_io_screen(occtrlnum, tempctrlnum, timectrlnum, 3);
		
		//동작모드 변경 시 이벤트 등록
		for(var i=0; i<timectrlnum; i++){
			$("#timemode"+(i+1)).change(function(){
				selmode = $(this).val();
				//idname = $(this).attr('id');
				lastChar = $(this).attr('id').slice(-1);
				create_init_set_time_screen(lastChar, selmode);
				//console.log(selmode + ", " + lastChar + "  change.....");
				//read_channeldata(3);
			});
		}

		read_channeldata(3);
	});

	$("#occtrlnum").prop("selectedIndex", occtrlnum);
	$("#occtrlnum").change();
	$("#tempctrlnum").prop("selectedIndex", tempctrlnum);
	$("#tempctrlnum").change();
	$("#timectrlnum").prop("selectedIndex", timectrlnum);
	$("#timectrlnum").change();

	*/
	

	
	//네트워크 설정 탭을 선택한 경우
	$("#set_network").click(function(){
		//alert("set_network_click()");
		read_wifilist();
	});


	//동작 설정 저장 버튼
	$("#setio_save").click(function(){
		//alert("channelsave_click()");
		save_setio_data();
	});
	//알람 설정 저장 버튼
	$("#setalarm_save").click(function(){
		//alert("alarmsave_click()");
		save_setio_data();
	});

	//Handfarm.net 접속(푸시알람 설정) 버튼
	$("#setpush_alarm").click(function(){
		//alert("푸시알람");
		//window.parent.postMessage("푸시알람");
		
		window.open("https://handfarm.net/webpush/login.html");
	});

	//웹 푸시알람 테스트 버튼
	$("#push_test").click(function(){
		send_pushtest();
		//alert("push_test()");
	});


	//암호 설정 저장 버튼
	$("#set_password_save").click(function(){
		//alert("set_password_save_click()");
		
		var id = $("#id").prop("value");
		id = "admin";
		var pw1 = $("#pw").prop("value");
		var pw2 = $("#pw2").prop("value");
		
		//alert("id="+id+", pw1="+pw1+", pw2="+pw2);

		$.ajax({
			type : 'POST',
			url : '/php/changepassword.php',
			data : {"id":id, "pw":pw1, "pw2":pw2},
			dataType : 'json',
			success : function(data){
				//alert(data);
				if(data == "암호가 변경되었습니다."){
					//alert("암호변경 완료");
					// main_frame.html 로 암호변경 정보 전달
					window.parent.postMessage("암호변경");
				}else{
					//alert("암호변경 실패");
				}
			}
		}); //End of $.ajax({
	});

	$("#system_reset").click(function(){
		var result = confirm("시스템을 재시작 하시겠습니까?");
			
		if(result){
			//alert("reset");
			$.ajax({
				type : 'POST',
				url : '/php/reboot.php',
				data : '',
				dataType : 'json',
				success : function(data){
					alert(data);
				}
			}); //End of $.ajax({			
		}else{
		}
	});

}); //End of $(document).ready(function(){


/*
window.detectSwipeEvent(window, function (element, direction) {
	//alert(direction);
	if(direction == "right"){
		$("#download", parent.document).trigger('click');
	}
});
*/

function create_set_io_screen(){
	mtable = "<table width='100%' class='tbl_frame'>";

	//개폐기 컨트롤러
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>개폐기 컨트롤러(SH2N) 개수 &nbsp;";
	mtable += "<select style='width:20%;' name='occtrlnum' id='occtrlnum'>"
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "</select>";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='setocctrl'>";
	mtable += "</div></td></tr>"
	mtable += "</table><br> ";
	mtable += "</td></tr>";
	
	//온도 컨트롤러
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>온도 컨트롤러(XR10) 개수 &nbsp;";
	mtable += "<select style='width:20%;' name='tempctrlnum' id='tempctrlnum'>"
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "</select>";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='settempctrl'>";
	mtable += "</div></td></tr>"
	mtable += "</table><br>";
	mtable += "</td></tr>";

	//타이머 컨트롤러
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>타이머 컨트롤러 개수 &nbsp;";
	mtable += "<select style='width:20%;' name='timectrlnum' id='timectrlnum'>"
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "</select>";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='settimectrl'>";
	mtable += "</div></td></tr>"
	mtable += "</table><br>";
	mtable += "</td></tr>";


	mtable += "<tr><td>";
	mtable += "<br><br><div id='save'>";
	mtable += "<input type='button' id='setio_save' value='설 정 저 장'><br><br><br>";
	mtable += "</div>";
	mtable += "</td></tr>"
	
	mtable += "</table>";
	
	$("#set_io_content").append(mtable);
	$("#occtrlnum").prop("selectedIndex", -1);
	$("#tempctrlnum").prop("selectedIndex", -1);
	$("#timectrlnum").prop("selectedIndex", -1);
}

function create_set_alarm_screen(){
	mtable = "<table width='100%' class='tbl_frame'>";
	
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>개폐기 컨트롤러(SH2N) 알람 설정 &nbsp;";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='setocalarm'></div></td></tr>";
	mtable += "</table>";
	mtable += "<br>";
	mtable += "</td></tr>";
	
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>온도 컨트롤러(XR10) 알람 설정 &nbsp;";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='settempalarm'></div></td></tr>";
	mtable += "</table>";
	mtable += "<br>";
	mtable += "</td></tr>";

	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td class='mnum'>알람 수신 설정 &nbsp;";
	mtable += "</td></tr>";
	mtable += "<tr><td><div id='setpush'></div></td></tr>";
	mtable += "</table>";
	mtable += "<br>";
	mtable += "</td></tr>";

	mtable += "<tr><td>";
	mtable += "<br><br>";
	mtable += "<div id='save'><input type='button' id='setalarm_save' value='설 정 저 장'><br><br><br></div>";
	mtable += "</td></tr>"



	mtable += "</table>";
	
	$("#set_alarm_content").append(mtable);
	
	//$("#occtrlnum").prop("selectedIndex", -1);
	//$("#tempctrlnum").prop("selectedIndex", -1);
}

function create_init_set_io_screen(ocnum, tempnum, timenum, ctrltype){
	var mtable = "";

	//개폐기 컨트롤러(SH2N) 설정 테이블을 만든다.
	if(ctrltype==1){
	$("#setocctrl").empty();
	mtable = "<table width='100%'>";
	mtable += "<tr><td>"
	mtable += "<table width='100%' class='tbl_list'>"
	mtable += "<tr><th width='15%'>&nbsp;</th><th class='tbl_header' width='45%'>채널이름</th><th width='20%'>열림온도</th><th width='20%'>닫힘온도</th></tr>";
	for(var i=1; i<=ocnum; i++){
		mtable += "<tr>";
		mtable += "<td>CH"+i+"</td>"
		mtable += "<td><input type='text' name='oc_name_"+i+"' id='oc_name_"+i+"'></td>";						//id = oc_name_1
		mtable += "<td><input type='number' step=0.1 name='oc_setopen_"+i+"' id='oc_setopen_"+i+"'></td>";		//id = oc_setopen_1
		mtable += "<td><input type='number' step=0.1 name='oc_setclose_"+i+"' id='oc_setclose_"+i+"'></td>";	//id = oc_setclose_1
		mtable += "</tr>";
	}
	mtable += "</table>"
	mtable += "</td></tr>"
	mtable += "</table>";
	$("#setocctrl").append(mtable);
	}
	
	//온도 컨트롤러(XR10) 설정 테이블을 만든다.
	if(ctrltype==2){
	$("#settempctrl").empty();
	mtable = "<table width='100%'>";
	mtable += "<tr><td>"
	mtable += "<table width='100%' class='tbl_list'>"
	mtable += "<tr><th width='15%'>&nbsp;</th><th class='tbl_header' width='55%'>채널이름</th><th width='30%'>동작온도</th></tr>";
	for(var i=1; i<=tempnum; i++){
		mtable += "<tr>";
		mtable += "<td>CH"+i+"</td>"
		mtable += "<td><input type='text' name='temp_name_"+i+"' id='temp_name_"+i+"'></td>";					//id = temp_name_1
		mtable += "<td><input type='number' step=0.1 name='temp_setopen_"+i+"' id='temp_setopen_"+i+"'></td>";	//id = temp_setopen_1
		mtable += "</tr>";
	}
	mtable += "</table>"
	mtable += "</td></tr>"
	mtable += "</table>";
	$("#settempctrl").append(mtable);
	}


	mtable += "<select style='width:20%;' name='timectrlnum' id='timectrlnum'>"
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "</select>";



	//타임 컨트롤러 설정 테이블을 만든다.
	if(ctrltype==3){
	$("#settimectrl").empty();
	mtable = "<table width='100%'>";
	mtable += "<tr><td>"
	mtable += "<table width='100%' class='tbl_list'>"
	mtable += "<tr><th width='15%'>&nbsp;</th><th class='tbl_header' width='55%'>채널이름</th><th width='30%'>동작모드</th></tr>";
	for(var i=1; i<=timenum; i++){
		mtable += "<tr>";
		mtable += "<td>CH"+i+"</td>"
		mtable += "<td><input type='text' name='time_name_"+i+"' id='time_name_"+i+"'></td>";					//id = time_name_1
		mtable += "<td>";
			mtable += "<select style='width:80%;' name='timemode"+i+"' id='timemode"+i+"'>";
			mtable += "<option value='10'>출력지속</option>";
			mtable += "<option value='11'>플 리 커</option>";
			mtable += "<option value='12'>5단 확장</option>";
			mtable += "</select>";
		mtable += "</td>";
		mtable += "</tr>";
		
		mtable += "<tr>";
		mtable += "<td>&nbsp;</td><td colspan='2'><div id='settimemode"+i+"' style='padding:10px 0px 20px 0px;'></div></td>";
		mtable += "</tr>";
	}
	mtable += "</table>"
	mtable += "</td></tr>"
	mtable += "</table>";
	$("#settimectrl").append(mtable);
	}
	
	
	//CSS Style 설정
	for(var i=1; i<=ocnum; i++){
		$("#oc_name_"+i).css({
			'width':'94%',
			'font-size':'0.9em',
			'text-align':'left',
			'padding-left':'2px'
		});
	}
	for(var i=1; i<=tempnum; i++){
		$("#temp_name_"+i).css({
			'width':'94%',
			'font-size':'0.9em',
			'text-align':'left',
			'padding-left':'2px'
		});
	}
	for(var i=1; i<=timenum; i++){
		$("#time_name_"+i).css({
			'width':'94%',
			'font-size':'0.9em',
			'text-align':'left',
			'padding-left':'2px'
		});
	}

	
	//CSS 컨트롤러 개수 설정 테이블의 행간격을 넗힌다.
	$("#setocctrl tr td").css({
		'padding':'10px 0px'
	});	
	
	//CSS 온도센서 설정 테이블의 행간격을 넗힌다.
	$("#settempctrl tr td").css({
		//'height':'60px'
		'padding':'10px 0px'
	});	
}

function create_init_set_time_screen(tmrchno, timemode){
	var mtable = "";
	$("#settimemode"+tmrchno).empty();
	
	mtable = "<table width='100%'>";
	if (timemode==10) {
		//출력지속 모드
		mtable += "<tr><td>";
		mtable += "열림 시작 시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset10_openhr"+tmrchno+"' id='tset10_openhr"+tmrchno+"' style='width:20%'> 시&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset10_openmn"+tmrchno+"' id='tset10_openmn"+tmrchno+"' style='width:20%'> 분";
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		mtable += "닫힘 시작 시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset10_closehr"+tmrchno+"' id='tset10_closehr"+tmrchno+"' style='width:20%'> 시&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset10_closemn"+tmrchno+"' id='tset10_closemn"+tmrchno+"' style='width:20%'> 분";
		mtable += "</td></tr>";
		//mtable += "<tr><td height='10px'></td></tr>";
	}else if (timemode==11) {
		//플리커 모드
		mtable += "<tr><td>";
		mtable += "모드 시작 시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset11_starthr"+tmrchno+"' id='tset11_starthr"+tmrchno+"' style='width:20%'> 시&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset11_startmn"+tmrchno+"' id='tset11_startmn"+tmrchno+"' style='width:20%'> 분";
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		mtable += "모드 종료 시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset11_endhr"+tmrchno+"' id='tset11_endhr"+tmrchno+"' style='width:20%'> 시&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset11_endmn"+tmrchno+"' id='tset11_endmn"+tmrchno+"' style='width:20%'> 분";
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		mtable += "동작시간 ";
		mtable += "<input type='number' step=1 name='tset11_runtime"+tmrchno+"' id='tset11_runtime"+tmrchno+"' style='width:15%'>";
		mtable += "<select style='width:12%;' name='tset11_rununit"+tmrchno+"' id='tset11_rununit"+tmrchno+"'>";
		mtable += "<option value='0'>초</option>";
		mtable += "<option value='1'>분</option>";
		mtable += "</select>";
		mtable += "&nbsp;&nbsp;&nbsp;정지시간 ";
		mtable += "<input type='number' step=1 name='tset11_stoptime"+tmrchno+"' id='tset11_stoptime"+tmrchno+"' style='width:15%'>";
		mtable += "<select style='width:12%;' name='tset11_stopunit"+tmrchno+"' id='tset11_stopunit"+tmrchno+"'>";
		mtable += "<option value='0'>초</option>";
		mtable += "<option value='1'>분</option>";
		mtable += "</select>";
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		//mtable += "<tr><td height='10px'></td></tr>";
	}else if (timemode==12) {
		//5단 확장 모드
		for(var i=1; i<=5; i++){
		mtable += "<tr><td>";
		mtable += i+"단계 시작시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset12_ex"+i+"hr"+tmrchno+"' id='tset12_ex"+i+"hr"+tmrchno+"' style='width:20%'> 시&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset12_ex"+i+"mn"+tmrchno+"' id='tset12_ex"+i+"mn"+tmrchno+"' style='width:20%'> 분";
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		mtable += i+"단계 동작시간&nbsp;&nbsp;";
		mtable += "<input type='number' step=1 name='tset12_ex"+i+"runtime"+tmrchno+"' id='tset12_ex"+i+"runtime"+tmrchno+"' style='width:20%'> 초&nbsp;&nbsp;";
		mtable += "출력";
		mtable += "<select style='width:19%;' name='tset12_ex"+i+"out"+tmrchno+"' id='tset12_ex"+i+"out"+tmrchno+"'>";
		mtable += "<option value='0'>열림</option>";
		mtable += "<option value='1'>닫힘</option>";
		mtable += "</select>";
		
		mtable += "</td></tr>";
		mtable += "<tr><td>";
		mtable += "<tr><td height='2px'></td></tr>";
		}
		//mtable += "<tr><td height='8px'></td></tr>";
	}
	mtable += "</table>";

	
	$("#settimemode"+tmrchno).append(mtable);

}

function create_init_set_alarm_screen(ocnum, tempnum, ctrltype){
	var mtable = "";

	//개폐기 컨트롤러(SH2N) 알람 설정 테이블을 만든다.
	if(ctrltype==1){
	$("#setocalarm").empty();
	mtable = "<table width='100%'>";
	mtable += "<tr><td>"
	mtable += "<table width='100%' class='tbl_list'>"
	mtable += "<tr><th width='15%'>&nbsp;</th><th class='tbl_header' width='35%'>고온알림온도</th><th width='35%'>저온알림온도</th><th width='15%'>사용</th></tr>";
	for(var i=1; i<=ocnum; i++){
		mtable += "<tr>";
		mtable += "<td>CH"+i+"</td>"
		mtable += "<td><input type='number' step=0.1 name='oc_alarmhigh_"+i+"' id='oc_alarmhigh_"+i+"'></td>";	//id = oc_alarmhigh_1
		mtable += "<td><input type='number' step=0.1 name='oc_alarmlow_"+i+"' id='oc_alarmlow_"+i+"'></td>";	//id = oc_alarmlow_1
		mtable += "<td><input type='checkbox' name='oc_alarmuse_"+i+"' value='oc_alarmuse_"+i+"' id='oc_alarmuse_"+i+"'>";	//id = oc_alarmuse_1
		mtable += "<label for='oc_alarmuse_"+i+"'></label></td>";
		mtable += "</tr>";
	}

	mtable += "</table>"
	mtable += "</td></tr>"
	mtable += "</table>";
	$("#setocalarm").append(mtable);
	}
	
	//온도 컨트롤러(XR10) 알람 설정 테이블을 만든다.
	if(ctrltype==2){
	$("#settempalarm").empty();
	mtable = "<table width='100%'>";
	mtable += "<tr><td>"
	mtable += "<table width='100%' class='tbl_list'>"
	mtable += "<tr><th width='15%'>&nbsp;</th><th class='tbl_header' width='35%'>고온알림온도</th><th width='35%'>저온알림온도</th><th width='15%'>사용</th></tr>";
	for(var i=1; i<=tempnum; i++){
		mtable += "<tr>";
		mtable += "<td>CH"+i+"</td>"
		mtable += "<td><input type='number' step=0.1 name='temp_alarmhigh_"+i+"' id='temp_alarmhigh_"+i+"'></td>";	//id = temp_alarmhigh_1
		mtable += "<td><input type='number' step=0.1 name='temp_alarmlow_"+i+"' id='temp_alarmlow_"+i+"'></td>";	//id = temp_alarmlow_1
		mtable += "<td><input type='checkbox' name='temp_alarmuse_"+i+"' value='temp_alarmuse_"+i+"' id='temp_alarmuse_"+i+"'>";	//id = temp_alarmuse_1
		mtable += "<label for='temp_alarmuse_"+i+"'></label></td>";
		mtable += "</tr>";
	}
	mtable += "</table>"
	mtable += "</td></tr>"
	mtable += "</table>";
	$("#settempalarm").append(mtable);
	}

	//푸시알람
	$("#setpush").empty();
	mtable = "<table width='100%' class='tbl_list'>";
	mtable += "<tr><th width='40%'>웹 푸시 알람</th><th class='tbl_header' width='60%'>";
	mtable += "<input type='button' id='setpush_alarm' value='웹 푸시알람 설정' ></th></tr>";

	mtable += "<tr><td colspan='2' style='font-family:\"맑은 고딕\", \"돋움\";font-size:1.1em; padding:10px 0px;'>";
	mtable += "<span>웹 푸시 알람을 수신하기 위해서는 <br>https://handfarm.net/webpush 에 접속하여 <br>";
	mtable += "로그인 후 푸시 알람 신청을 하여야 합니다.</span><br>";
	mtable += "<span style='color:red'>( hanfarm.net 회원가입 필수 )</span></td></tr>";

	mtable += "<tr><td colspan='2'>";

	mtable += "<table width='100%'><tr style='background-color:#f3f3f3;'>";
	mtable += "<td width='30%'>hadfarm.net ID</td>";
	mtable += "<td width='40%'><input type='text' name='hadfarm_id' id='hadfarm_id' style='margin-top:8px;'></td>";
	mtable += "<td width='30%'><input type='button' id='push_test' value='알람 테스트' style='margin-top:8px;'></td>";
	mtable += "</tr></table>";

	mtable += "</td></tr>";
	mtable += "</table>";
	$("#setpush").append(mtable);

	
	//CSS 컨트롤러 개수 설정 테이블의 행간격을 넗힌다.
	$("#setocalarm tr td").css({
		'padding':'10px 0px'
	});	
	
	//CSS 온도센서 설정 테이블의 행간격을 넗힌다.
	$("#settempalarm tr td").css({
		//'height':'60px'
		'padding':'10px 0px'
	});

	//CSS 푸시알람 설정버튼
	$("#setpush_alarm").css({
		'background-color': '#00BCD4',
		'color':'black',
		'padding':'15px 20px',
		'cursor':'pointer',
		'border-radius':'10px',
		'background-image':'url("/html/img/png_image/icon_alarm(64x64).png")',
		'background-repeat':'no-repeat',
		'background-position':'10px center',
		'padding-left':'70px'
	});
	//CSS 알람테스트 설정버튼
	$("#push_test").css({
		'background-color': '#006CA4',
		'color':'white',
		'padding':'10px 30px',
		'cursor':'pointer',
		'border-radius':'10px'
	});
}


function read_channeldata(ctrltype){
	$.ajax({
		type : 'POST',
		url : '/php/read_setchannel.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//alert(data);
			//console.log(data);
			//if (isEmpty(data)) return false;
			fill_channeldata(data, ctrltype);
		}
	}); //End of $.ajax({
	
}

function read_screendata(){
	$.ajax({
		type : 'POST',
		url : '/php/read_screeninfo.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//alert(data);
			//if (isEmpty(data)) return false;
			fill_screendata(data);
		}
	}); //End of $.ajax({
	
}

function read_wifilist(){
	// 로딩 애니메이션 표시
	document.getElementById('loader').style.display = 'block';

	$.ajax({
		type : 'POST',
		url : '/php/get_wifilist.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//alert(data);
			//if (isEmpty(data)) return false;
			//console.log(data);
			fill_wifilist(data);
		}
	}); //End of $.ajax({
	
}


function save_setio_data(){
	var set_temp;
	
	var sdata = "";
		
	//저장 전송 데이터 포맷
	//  occtrlnum,tempctrlnum,timectrlnum,
	//	(채널이름,열림온도,닫힘온도,고온알림온도,저온알림온도,알림사용)*occtrlnum,
	//	(채널이름,열림온도,닫힘온도,고온알림온도,저온알림온도,알림사용)*tempctrlnum,
	//	(채널이름,모드,시간단위,시작시간(시),시작시간(분),종료시간(시),종료시간(분),동작시간,멈춤시간,
	//		ex1_시작시간(시),ex1_시작시간(분),ex1_동작시간(초),ex1_출력,
	//		ex2_시작시간(시),ex2_시작시간(분),ex2_동작시간(초),ex2_출력,
	//		ex3_시작시간(시),ex3_시작시간(분),ex3_동작시간(초),ex3_출력,
	//		ex4_시작시간(시),ex4_시작시간(분),ex4_동작시간(초),ex4_출력,
	//		ex5_시작시간(시),ex5_시작시간(분),ex5_동작시간(초),ex5_출력)*timectrlnum
	sdata = occtrlnum + "," + tempctrlnum + "," + timectrlnum + ",";
	
	//개폐기 컨트롤러 설정 정보
	for(var i=1; i<=occtrlnum; i++){
		sdata += $("#oc_name_"+i).prop("value") +",";
		sdata += ($("#oc_setopen_"+i).prop("value"))*10 +",";
		
		//sdata += ($("#oc_setclose_"+i).prop("value"))*10 +",";
		set_temp = Number($("#oc_setclose_"+i).prop("value"))*10;
		if(set_temp<0){
			set_temp = 65536 + set_temp;
		}
		sdata += set_temp +",";
		sdata += ($("#oc_alarmhigh_"+i).prop("value"))*10 +",";
		
		//sdata += ($("#oc_alarmlow_"+i).prop("value"))*10 +",";
		set_temp = Number($("#oc_alarmlow_"+i).prop("value"))*10;
		if(set_temp<0){
			set_temp = 65536 + set_temp;
		}
		sdata += set_temp +",";
		sdata += (($("#oc_alarmuse_"+i).prop("checked")==true)? 1 : 0) + ",";
	}
	//온도 컨트롤러 설정 정보
	for(var i=1; i<=tempctrlnum; i++){
		sdata += $("#temp_name_"+i).prop("value") +",";
		sdata += ($("#temp_setopen_"+i).prop("value"))*10 +",";
		sdata += "0,";
		sdata += ($("#temp_alarmhigh_"+i).prop("value"))*10 +",";
		
		//sdata += ($("#temp_alarmlow_"+i).prop("value"))*10 +",";
		set_temp = Number($("#temp_alarmlow_"+i).prop("value"))*10;
		if(set_temp<0){
			set_temp = 65536 + set_temp;
		}
		sdata += set_temp +",";
		
		sdata += (($("#temp_alarmuse_"+i).prop("checked")==true)? 1 : 0) + ",";
	}
	
	//타이머 컨트롤러 설정 정보
	for(var i=1; i<=timectrlnum; i++){
		var tmrmode;
		sdata += $("#time_name_"+i).prop("value") +",";
		tmrmode = $("#timemode"+i).val();
		sdata += tmrmode +",";
		if (tmrmode == 10){
			//출력지속 모드
			sdata += "3,";											//분분 단위로 설정버튼
			sdata += $("#tset10_openhr"+i).prop("value") +",";		//열리는 시간 (시)
			sdata += $("#tset10_openmn"+i).prop("value") +",";		//열리는 시간 (분)
			sdata += $("#tset10_closehr"+i).prop("value") +",";		//닫히는 시간 (시)
			sdata += $("#tset10_closemn"+i).prop("value") +",";		//닫히는 시간 (분)
			sdata += "1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,";
		}else if (tmrmode == 11){
			//플리커 모드
			sdata += (Number($("#tset11_rununit"+i).prop("value"))*2 + Number($("#tset11_stopunit"+i).prop("value"))) + ",";
			sdata += $("#tset11_starthr"+i).prop("value") +",";		//시작 시간 (시)
			sdata += $("#tset11_startmn"+i).prop("value") +",";		//시작 시간 (분)
			sdata += $("#tset11_endhr"+i).prop("value") +",";		//정지 시간 (시)
			sdata += $("#tset11_endmn"+i).prop("value") +",";		//정지 시간 (분)
			sdata += $("#tset11_runtime"+i).prop("value") +",";		//동작 시간 (분or초)
			sdata += $("#tset11_stoptime"+i).prop("value") +",";	//멈춤 시간 (분or초)
			sdata += "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,";
		}else if (tmrmode == 12){
			//5단 확장 모드
			sdata += "3,";											//분분 단위로 설정버튼
			sdata += "9,0,18,0,1,1,"								//시작시간(시),시작시간(분),정지시간(시),정지시간(분),ON시간,OFF시간
			sdata += $("#tset12_ex1hr"+i).prop("value") +",";		//ex1 시작 시간 (시)
			sdata += $("#tset12_ex1mn"+i).prop("value") +",";		//ex1 시작 시간 (분)
			sdata += $("#tset12_ex1runtime"+i).prop("value") +",";	//ex1 동작 시간 (초)
			sdata += $("#tset12_ex1out"+i).val() +",";				//ex1 출력
			sdata += $("#tset12_ex2hr"+i).prop("value") +",";		//ex2 시작 시간 (시)
			sdata += $("#tset12_ex2mn"+i).prop("value") +",";		//ex2 시작 시간 (분)
			sdata += $("#tset12_ex2runtime"+i).prop("value") +",";	//ex2 동작 시간 (초)
			sdata += $("#tset12_ex2out"+i).val() +",";				//ex2 출력
			sdata += $("#tset12_ex3hr"+i).prop("value") +",";		//ex3 시작 시간 (시)
			sdata += $("#tset12_ex3mn"+i).prop("value") +",";		//ex3 시작 시간 (분)
			sdata += $("#tset12_ex3runtime"+i).prop("value") +",";	//ex3 동작 시간 (초)
			sdata += $("#tset12_ex3out"+i).val() +",";				//ex3 출력
			sdata += $("#tset12_ex4hr"+i).prop("value") +",";		//ex4 시작 시간 (시)
			sdata += $("#tset12_ex4mn"+i).prop("value") +",";		//ex4 시작 시간 (분)
			sdata += $("#tset12_ex4runtime"+i).prop("value") +",";	//ex4 동작 시간 (초)
			sdata += $("#tset12_ex4out"+i).val() +",";				//ex4 출력
			sdata += $("#tset12_ex5hr"+i).prop("value") +",";		//ex5 시작 시간 (시)
			sdata += $("#tset12_ex5mn"+i).prop("value") +",";		//ex5 시작 시간 (분)
			sdata += $("#tset12_ex5runtime"+i).prop("value") +",";	//ex5 동작 시간 (초)
			sdata += $("#tset12_ex5out"+i).val() +",";				//ex5 출력
		}
	}

	//console.log(sdata);
	
	$.ajax({
		type : 'POST',
		url : '/php/save_channeldata.php',
		data : {"chdata":sdata},
		dataType : 'json',
		success : function(data){
			alert(data);
			//console.log(data);
		}
	}); //End of $.ajax({
	
	return true;
}

function fill_timemodedata(data, channelno, timermode){
	var ch = channelno - 1;
	
	//$("#timemode"+(i+1)).prop("selectedIndex", data[i*29+124]-10);
	//create_init_set_time_screen(channelno, timermode);
	if(timermode == 10){
		//출력지속 모드
		//console.log("출력지속");
		//console.log(data[ch*29+126],  data[ch*29+127],  data[ch*29+128],  data[ch*29+129]);
		$("#tset10_openhr"+channelno).prop("value", data[ch*29+126]);
		$("#tset10_openmn"+channelno).prop("value", data[ch*29+127]);
		$("#tset10_closehr"+channelno).prop("value", data[ch*29+128]);
		$("#tset10_closemn"+channelno).prop("value", data[ch*29+129]);
	}else if(timermode == 11){
		//플리커 모드
		//console.log("플리커");
		$("#tset11_starthr"+channelno).prop("value", data[ch*29+126]);
		$("#tset11_startmn"+channelno).prop("value", data[ch*29+127]);
		$("#tset11_endhr"+channelno).prop("value", data[ch*29+128]);
		$("#tset11_endmn"+channelno).prop("value", data[ch*29+129]);

		$("#tset11_runtime"+channelno).prop("value", data[ch*29+130]);
		$("#tset11_stoptime"+channelno).prop("value", data[ch*29+131]);
		if( data[ch*29+125] == 0){
			$("#tset11_rununit"+channelno).prop("selectedIndex", 0);
			$("#tset11_stopunit"+channelno).prop("selectedIndex", 0);
		} else if( data[ch*29+125] == 1){
			$("#tset11_rununit"+channelno).prop("selectedIndex", 0);
			$("#tset11_stopunit"+channelno).prop("selectedIndex", 1);
		} else if( data[ch*29+125] == 2){
			$("#tset11_rununit"+channelno).prop("selectedIndex", 1);
			$("#tset11_stopunit"+channelno).prop("selectedIndex", 0);
		} else if( data[ch*29+125] == 3){
			$("#tset11_rununit"+channelno).prop("selectedIndex", 1);
			$("#tset11_stopunit"+channelno).prop("selectedIndex", 1);
		}
	}else if(timermode == 12){
		//5단 확장 모드
		//console.log("확장모드");
		$("#tset12_ex1hr"+channelno).prop("value", data[ch*29+132]);
		$("#tset12_ex1mn"+channelno).prop("value", data[ch*29+133]);
		$("#tset12_ex1runtime"+channelno).prop("value", data[ch*29+134]);
		$("#tset12_ex1out"+channelno).prop("selectedIndex", data[ch*29+135]);
		
		$("#tset12_ex2hr"+channelno).prop("value", data[ch*29+136]);
		$("#tset12_ex2mn"+channelno).prop("value", data[ch*29+137]);
		$("#tset12_ex2runtime"+channelno).prop("value", data[ch*29+138]);
		$("#tset12_ex2out"+channelno).prop("selectedIndex", data[ch*29+139]);

		$("#tset12_ex3hr"+channelno).prop("value", data[ch*29+140]);
		$("#tset12_ex3mn"+channelno).prop("value", data[ch*29+141]);
		$("#tset12_ex3runtime"+channelno).prop("value", data[ch*29+142]);
		$("#tset12_ex3out"+channelno).prop("selectedIndex", data[ch*29+143]);

		$("#tset12_ex4hr"+channelno).prop("value", data[ch*29+144]);
		$("#tset12_ex4mn"+channelno).prop("value", data[ch*29+145]);
		$("#tset12_ex4runtime"+channelno).prop("value", data[ch*29+146]);
		$("#tset12_ex4out"+channelno).prop("selectedIndex", data[ch*29+147]);

		$("#tset12_ex5hr"+channelno).prop("value", data[ch*29+148]);
		$("#tset12_ex5mn"+channelno).prop("value", data[ch*29+149]);
		$("#tset12_ex5runtime"+channelno).prop("value", data[ch*29+150]);
		$("#tset12_ex5out"+channelno).prop("selectedIndex", data[ch*29+151]);
	}
}

function fill_channeldata(data, ctrltype){
	switch(ctrltype){
		case 1:
			//동작설정(개폐기 컨트롤러 설정 정보)
			for(var i=0; i<occtrlnum; i++){
				$("#oc_name_"+(i+1)).prop("value", data[3+i]);
				$("#oc_setopen_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+28])).toFixed(1));
				$("#oc_setclose_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+29])).toFixed(1));
			}
			//알림설정(개폐기 컨트롤러 설정 정보)
			for(var i=0; i<occtrlnum; i++){
				$("#oc_alarmhigh_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+30])).toFixed(1));
				$("#oc_alarmlow_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+31])).toFixed(1));
				$("#oc_alarmuse_"+(i+1)).prop("checked", (data[i*6+32]==1)? true : false);
			}
			break;
		case 2:
			//동작설정(온도 컨트롤러 설정 정보)
			for(var i=0; i<tempctrlnum; i++){
				$("#temp_name_"+(i+1)).prop("value", data[11+i]);
				$("#temp_setopen_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+76])).toFixed(1));
			}
			//알림설정(온도 컨트롤러 설정 정보)
			for(var i=0; i<tempctrlnum; i++){
				$("#temp_alarmhigh_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+78])).toFixed(1));
				$("#temp_alarmlow_"+(i+1)).prop("value", (getTemperatureValue(data[i*6+79])).toFixed(1));
				$("#temp_alarmuse_"+(i+1)).prop("checked", (data[i*6+80]==1)? true : false);
			}
			break;
		case 3:
			//동작설정(타이머 컨트롤러 설정 정보)
			for(var i=0; i<timectrlnum; i++){
				$("#time_name_"+(i+1)).prop("value", data[19+i]);
				//console.log(data[i*29+124]);
				
				$("#timemode"+(i+1)).prop("selectedIndex", data[i*29+124]-10);
				$("#timemode"+(i+1)).change();
				//fill_timemodedata(data, (i+1), data[i*29+124]);
				/*
				create_init_set_time_screen((i+1), data[i*29+124]);
				if( (data[i*29+124]) == 10){
					//출력지속 모드
					//console.log("출력지속");
					//console.log(data[i*29+126],  data[i*29+127],  data[i*29+128],  data[i*29+129]);
					$("#tset10_openhr"+(i+1)).prop("value", data[i*29+126]);
					$("#tset10_openmn"+(i+1)).prop("value", data[i*29+127]);
					$("#tset10_closehr"+(i+1)).prop("value", data[i*29+128]);
					$("#tset10_closemn"+(i+1)).prop("value", data[i*29+129]);
				}else if( (data[i*29+124]) == 11){
					//플리커 모드
					//console.log("플리커");
					$("#tset11_starthr"+(i+1)).prop("value", data[i*29+126]);
					$("#tset11_startmn"+(i+1)).prop("value", data[i*29+127]);
					$("#tset11_endhr"+(i+1)).prop("value", data[i*29+128]);
					$("#tset11_endmn"+(i+1)).prop("value", data[i*29+129]);

					$("#tset11_runtime"+(i+1)).prop("value", data[i*29+130]);
					$("#tset11_stoptime"+(i+1)).prop("value", data[i*29+131]);
					if( data[i*29+125] == 0){
						$("#tset11_rununit"+(i+1)).prop("selectedIndex", 0);
						$("#tset11_stopunit"+(i+1)).prop("selectedIndex", 0);
					} else if( data[i*29+125] == 1){
						$("#tset11_rununit"+(i+1)).prop("selectedIndex", 0);
						$("#tset11_stopunit"+(i+1)).prop("selectedIndex", 1);
					} else if( data[i*29+125] == 2){
						$("#tset11_rununit"+(i+1)).prop("selectedIndex", 1);
						$("#tset11_stopunit"+(i+1)).prop("selectedIndex", 0);
					} else if( data[i*29+125] == 3){
						$("#tset11_rununit"+(i+1)).prop("selectedIndex", 1);
						$("#tset11_stopunit"+(i+1)).prop("selectedIndex", 1);
					}
				}else if( (data[i*29+124]) == 12){
					//5단 확장 모드
					console.log("확장모드");
					$("#tset12_ex1hr").prop("value", data[i*29+132]);
					$("#tset12_ex1mn").prop("value", data[i*29+133]);
					$("#tset12_ex1runtime").prop("value", data[i*29+134]);
					$("#tset12_ex1out").prop("selectedIndex", data[i*29+135]);

					$("#tset12_ex2hr").prop("value", data[i*29+136]);
					$("#tset12_ex2mn").prop("value", data[i*29+137]);
					$("#tset12_ex2runtime").prop("value", data[i*29+138]);
					$("#tset12_ex2out").prop("selectedIndex", data[i*29+139]);

					$("#tset12_ex3hr").prop("value", data[i*29+140]);
					$("#tset12_ex3mn").prop("value", data[i*29+141]);
					$("#tset12_ex3runtime").prop("value", data[i*29+142]);
					$("#tset12_ex3out").prop("selectedIndex", data[i*29+143]);

					$("#tset12_ex4hr").prop("value", data[i*29+144]);
					$("#tset12_ex4mn").prop("value", data[i*29+145]);
					$("#tset12_ex4runtime").prop("value", data[i*29+146]);
					$("#tset12_ex4out").prop("selectedIndex", data[i*29+147]);

					$("#tset12_ex5hr").prop("value", data[i*29+148]);
					$("#tset12_ex5mn").prop("value", data[i*29+149]);
					$("#tset12_ex5runtime").prop("value", data[i*29+150]);
					$("#tset12_ex5out").prop("selectedIndex", data[i*29+151]);
				}
				*/
			}
			break;
	}
}


function fill_screendata(data){
	$("#use_graph").prop("checked", (data[0]==1)? true : false);
	$("#use_text").prop("checked", (data[2]==1)? true : false);
	if(data[1] == 1){
		$("#graph_bottom").attr("checked", false);
		$("#graph_top").attr("checked", true);
	}else if(data[1] == 2){
		$("#graph_top").attr("checked", false);
		$("#graph_bottom").attr("checked", true);
	}else{
		$("#graph_top").attr("checked", false);
		$("#graph_bottom").attr("checked", false);
	}

	if(data[3] == 1){
		$("#text_bottom").attr("checked", false);
		$("#text_top").attr("checked", true);
	}else if(data[3] == 2){
		$("#text_top").attr("checked", false);
		$("#text_bottom").attr("checked", true);
	}else{
		$("#text_top").attr("checked", false);
		$("#text_bottom").attr("checked", false);
	}
}


function fill_wifilist(data){
	document.getElementById('state_msg').innerHTML = "검색된 WiFi 리스트";
	

	let item_index = [];
	item_index[0] = data[0].indexOf('IN-USE');
	item_index[1] = data[0].indexOf('BSSID');
	item_index[2] = data[0].indexOf('SSID', item_index[1]+5);
	item_index[3] = data[0].indexOf('MODE');
	item_index[4] = data[0].indexOf('CHAN');
	item_index[5] = data[0].indexOf('RATE');
	item_index[6] = data[0].indexOf('SIGNAL');
	item_index[7] = data[0].indexOf('BARS');
	item_index[8] = data[0].indexOf('SECURITY');

	let item_list = new Array();					
	for(var i=1; i<data.length; i++){
		item_list[i-1] = new Array();
					
		for(var n=0; n<(item_index.length-1); n++){
			item_list[i-1][n] = data[i].substring(item_index[n], item_index[n+1]).trim();
		}
		item_list[i-1][item_index.length-1] = data[i].substring(item_index[item_index.length-1], data[i].length).trim();
	}


	$("#wifi_list").empty();
	
	mtable = "";
	mtable += "<table width='100%' class='tbl_frame'>";
	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_list4' id='wifi_table'>";
	mtable += "<tr height='80px'><th class='tbl_header' width='60%'>이름</th><th width='20%'>강도</th><th width='20%'>사용중</th></tr>";
	for(var i=0; i<20; i++){
		if(item_list.length>i){
			mtable += "<tr>";
			/*
			mtable += `<td>${item_list[i][2]}</td>`;
			mtable += `<td>${item_list[i][6]}</td>`;
			mtable += `<td>${item_list[i][0]}</td>`;
			*/
			mtable += `<td>${item_list[i][2]}</td>`;
			
			var sigval;
			if(item_list[i][7].trim() == "****"){
				sigval = "strong";
			}else if(item_list[i][7].trim() == "***"){
				sigval = "medium";
			}else if(item_list[i][7].trim() == "**"){
				sigval = "weak";
			}else{
				sigval = "";
			}

			mtable += "<td style='display:flex;justify-content:center;align-items:center;height:40px;'><div class='signal-icon "+sigval+"'>";
			mtable += "<div class='signal-bar'></div>";
			mtable += "<div class='signal-bar'></div>";
			mtable += "<div class='signal-bar'></div>";
			mtable += "</div></td>";

			mtable += `<td>${item_list[i][0]}</td>`;
			
			mtable += "</tr>";
		}else{
			mtable += "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>";
		}
	}
	mtable += "</table>";
	mtable += "</td></tr>";

	mtable += "<tr><td>";
	mtable += "<table width='100%' class='tbl_list4' style='margin:20px 0'>";
	mtable += "<tr style='height:50px;'><td width='20%'>SSID</td><td width='60%'><input name='ssid' type='text' id='ssid' value='' style='font-size:1em' disabled></td>";
	mtable += "<td width='20%' rowspan='2'>";
	mtable += "<input type='button' id='setnetwork_save' value='설 정' style='width:100%;padding:15px 10px;background-color:#44c767;color:white;border-radius:20px;'>";
	mtable += "</td></tr>";
	mtable += "<tr style='height:50px;'><td>암호</td><td><input name='wifi_pw' type='password' id='wifi_pw' value='' style='font-size:1.2em'></td></tr>";
	mtable += "</table>";
	mtable += "</td></tr>";

	mtable += "<tr><td>";
	//mtable += "<br><br><br> <input type='button' id='setnetwork_save' value='설 정 저 장'><br><br><br>";
	mtable += "</td></tr>";
	mtable += "</table><br>";
	
	
	$("#wifi_list").append(mtable);
	rowClicked();


	//CSS Style 설정
	$(".signal-icon").css({
		//'border':'1px solid black',
		'height':'30px',
		'width':'24px',
		'display':'flex',
		'flex-direction':'row',
		'justify-content':'space-between',
		'align-items':'baseline'
		//'display':'inline-block'
	});
	$(".signal-icon .signal-bar").css({
		'width':'6px',
		'opacity':'30%',
		//'background':'white'
		'background':'black'
	});
	$(".signal-icon .signal-bar:nth-child(1)").css({
		'height':'40%'
	});
	$(".signal-icon .signal-bar:nth-child(2)").css({
		'height':'70%'
	});
	$(".signal-icon .signal-bar:nth-child(3)").css({
		'height':'100%'
	});

	$(".signal-icon.weak .signal-bar:nth-child(1),.signal-icon.medium .signal-bar:nth-child(1),.signal-icon.medium .signal-bar:nth-child(2),.signal-icon.strong .signal-bar:nth-child(1),.signal-icon.strong .signal-bar:nth-child(2),.signal-icon.strong .signal-bar:nth-child(3)").css({
		'opacity':'100%'
	});


	// 비동기 작업 완료 후 로딩 애니메이션 숨기기
	document.getElementById('loader').style.display = 'none';

	$("#setnetwork_save").click(function(){

		if(confirm("WiFi 암호를 설정하시겠습니까?")){
			document.getElementById('loader').style.display = 'block';

			var ssid = $("#ssid").prop("value").trim();
			var wifipw = $("#wifi_pw").prop("value").trim();
			
			$.ajax({
				type : 'POST',
				url : '/php/set_wifipassword.php',
				data : {"ssid":ssid, "pw":wifipw},
				dataType : 'json',
				success : function(data){
					alert(data);
					//console.log(data);					
				},
				error : function(){
					//console.log("request ./php/insert_user.php..... ajax error()");
					//console.log("error");
				},
				complete : function(){
					//console.log("request ./php/insert_user.php..... ajax complete()");
					//console.log("complete");
					document.getElementById('loader').style.display = 'none';
				}
			}); //End of $.ajax({
			
		}
		//console.log("setnetwork_save_click()");
	});
}

function rowClicked() {
	var table = document.getElementById('wifi_table');
	//var ssid = document.getElementById('ssid');
	//var pw = document.getElementById('wifi_pw');
			
	var rowList = table.rows; 	// *1)rows collection
		
	for (i=1; i<rowList.length; i++) {		//thead부분 제외.
		var row = rowList[i];
		var tdsNum = row.childElementCount;	// 자식요소 갯수 구하기.
			
		row.onclick = function(){ 
			return function(){ 
				//var str = "";  
				//for (var j = 0; j < tdsNum; j++){//row안에 있는 값 순차대로 가져오기.
				//	var row_value = this.cells[j].innerHTML; //*2)cells collection
				//	str += row_value+' ';//값을 하나의 text값으로 만듦
				//};//td for
				//alert(str);
				//console.log(str);
				$("#ssid").prop("value", this.cells[0].innerHTML);
				$("#wifi_pw").prop("value", "");
			};//return
		}(row);//onclick
	}//for		  
 }//function


function getTemperatureValue(temp){
	//temp : 0~65535
	if(temp < 32768){
		return (temp/10.0);
	}else{
		return ((temp - 65536)/10.0);
	}
}

function setTemperatureValue(temp){
	//소숫점 있는 온도 값을 x10 하여 저장
	if(temp<0.0){
		var intvalue = temp*10;	//마이너스 값이 저장된다.
		return 65536 + intvalue;
	}else{
		return temp * 10;
	}
}

function addOption_toSelect(objID, text, value){
	var objSel = document.getElementById(objID);
	var objOption = document.createElement("option");
	objOption.text = text;
	objOption.value = value;		
	objSel.options.add(objOption);
};


function SelectedRadio(radioname){
	var rn = document.getElementsByName(radioname);
	for(var i=0; i<rn.length; i++){
		if(rn[i].checked == true){			
			return (i+1);
		}
	}
	return 0;
};

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


function send_pushtest(){
		var recv_id = $("#hadfarm_id").prop("value");
		
		//var badge = "/webpush/img/badge64.png";
		//var icon = "/webpush/img/icon64.png";

		//var serverpage = notificationData['server_url'] + 
		//			"?id=" + notificationData['sender_id'] + 
		//			"&device=" + notificationData['sender_device'] +
		//			"&info=" + notificationData['sender_info'] +
		//			"&action=" + notificationEvent +
		//			"&actionreply=" + notificationReply;
		// click_eventdata 에 'server_url', 'sender_id' 등의 항목을 추가할 수 있다.

		var click_eventdata={
			"close_notification": "true",
			"link_page": "https://handfarm.net/webpush/"
			//,"server_url": "https://handfarm.net/"
			//,"sender_info": "test_user"
		};
		
		//var actions = [
		//	{ action: 'open', title: '열기' },
		//	{ action: 'dismiss', title: '닫기' }
		//];
		var actions = [];
		var vibrate=[];
		
		var optiondata={
			"title" : "푸시 알람 테스트",
			"body" : "푸시 알람이 정상적으로 전송되었습니다.",
			"icon" : "../img/icon64.png",
			"badge" : "../img/badge64.png",
			"image" : "",
			"tag" : "",
			"vibrate" : "",
			"sound" : "",
			"data" : click_eventdata,
			"actions" : actions
		};
		optiondata = JSON.stringify(optiondata);
		
		$.ajax({
			type : 'POST',
			url : '/php/send_pushalarm_test.php',
			data : {"id":recv_id, "optiondata":optiondata},
			dataType : 'json',
			success : function(data){
				//console.log(data);
				//alert(data);
				if(data.includes("Push message sent.")){
					alert("푸시 알람이 정상적으로 전송되었습니다.");
				}else{
					alert("푸시 알람이 전송되지 않았습니다.");
				}
			},
			error : function(){
				//console.log("ajax error()");
			},
			complete : function(){
				//console.log("ajax complete()");
			}
		}); //End of $.ajax
}
