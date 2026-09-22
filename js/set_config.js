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

	//WiFi 리스트 새로고침 버튼
	$(document).on("click", "#btn_refresh_wifi", function(e){
		e.preventDefault();
		read_wifilist();
	});

	//네트워크 설정 저장 버튼 (Apply)
	$(document).on("click", "#setnetwork_save", function(){
		if(confirm("WiFi 암호를 설정하시겠습니까?")){
			if(document.getElementById("loader")) document.getElementById("loader").style.display = "block";

			var ssid = $("#ssid").prop("value").trim();
			var wifipw = $("#wifi_pw").prop("value").trim();
			
			$.ajax({
				type : "POST",
				url : "/php/set_wifipassword.php",
				data : {"ssid":ssid, "pw":wifipw},
				dataType : "json",
				success : function(data){
					alert(data);
				},
				error : function(){
				},
				complete : function(){
					if(document.getElementById("loader")) document.getElementById("loader").style.display = "none";
				}
			});
		}
	});


	//동작 설정 저장 버튼
	$("#setio_save").click(function(){
		//alert("channelsave_click()");
		save_setio_data();
	});
	//알람 설정 저장 버튼
	$(document).on("click", "#setalarm_save", function(){
		//alert("alarmsave_click()");
		save_setio_data();
	});

	//Handfarm.net 접속(푸시알람 설정) 버튼
	$(document).on("click", "#setpush_alarm", function(e){
		e.preventDefault();
		//alert("푸시알람");
		//window.parent.postMessage("푸시알람");
		window.open("https://handfarm.net/webpush/login.html", "_blank");
	});

	//웹 푸시알람 테스트 버튼
	$(document).on("click", "#push_test", function(e){
		e.preventDefault();
		send_pushtest();
		//alert("push_test()");
	});


	//암호 설정 저장 버튼
	$(document).on("click", "#set_password_save", function(){
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

	//시스템 재시작 버튼
	$(document).on("click", "#system_reset", function(){
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

	//비밀번호 보이기/숨기기 토글
	$(document).on("click", ".btn_toggle_pw", function(e){
		e.preventDefault();
		var targetId = $(this).data("target");
		var input = $("#" + targetId);
		if(input.attr("type") === "password"){
			input.attr("type", "text");
			$(this).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
		} else {
			input.attr("type", "password");
			$(this).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>');
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
	var mtable = "<div class='config_page_container'>";

	// 1. 개폐기 컨트롤러 (Vent Controller SH2N)
	mtable += "<div class='config_section'>";
	mtable += "  <div class='config_section_header'>";
	mtable += "    <span class='config_section_title'>Vent Controller (SH2N) Count</span>";
	mtable += "    <select class='config_count_select' name='occtrlnum' id='occtrlnum'>";
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "    </select>";
	mtable += "  </div>";
	mtable += "  <div id='setocctrl'></div>";
	mtable += "</div>";
	
	// 2. 온도 컨트롤러 (Temperature Controller XR10)
	mtable += "<div class='config_section'>";
	mtable += "  <div class='config_section_header'>";
	mtable += "    <span class='config_section_title'>Temperature Controller (XR10) Count</span>";
	mtable += "    <select class='config_count_select' name='tempctrlnum' id='tempctrlnum'>";
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "    </select>";
	mtable += "  </div>";
	mtable += "  <div id='settempctrl'></div>";
	mtable += "</div>";

	// 3. 타이머 컨트롤러 (Timer Controller)
	mtable += "<div class='config_section'>";
	mtable += "  <div class='config_section_header'>";
	mtable += "    <span class='config_section_title'>Timer Controller Count</span>";
	mtable += "    <select class='config_count_select' name='timectrlnum' id='timectrlnum'>";
	for(var i=0; i<=8; i++){
		mtable += "<option value='"+i+"'>"+i+"</option>";
	}
	mtable += "    </select>";
	mtable += "  </div>";
	mtable += "  <div id='settimectrl'></div>";
	mtable += "</div>";

	// 4. 저장 버튼 (Save Settings)
	mtable += "<div class='config_save_bar'>";
	mtable += "  <button type='button' id='setio_save' class='btn_config_save'>";
	mtable += "    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'></path><polyline points='17 21 17 13 7 13 7 21'></polyline><polyline points='7 3 7 8 15 8'></polyline></svg>";
	mtable += "    <span>Save Settings</span>";
	mtable += "  </button>";
	mtable += "</div>";
	
	mtable += "</div>";
	
	$("#set_io_content").html(mtable);
	$("#occtrlnum").prop("selectedIndex", -1);
	$("#tempctrlnum").prop("selectedIndex", -1);
	$("#timectrlnum").prop("selectedIndex", -1);
}

function create_set_alarm_screen(){
	var mtable = "<div class='config_page_container'>";
	
	// 1. 개폐기 컨트롤러(SH2N) 알람 설정 카드
	mtable += "<div class='alarm_panel_card'>";
	mtable += "  <div class='alarm_panel_title'>Vent Controller (SH2N) Alert Settings</div>";
	mtable += "  <div id='setocalarm'></div>";
	mtable += "</div>";
	
	// 2. 온도 컨트롤러(XR10) 알람 설정 카드
	mtable += "<div class='alarm_panel_card'>";
	mtable += "  <div class='alarm_panel_title'>Temperature Controller (XR10) Alert Settings</div>";
	mtable += "  <div id='settempalarm'></div>";
	mtable += "</div>";

	// 3. 웹 푸시 알람 카드
	mtable += "<div class='alarm_panel_card'>";
	mtable += "  <div class='alarm_panel_title'>Web Push Alert Settings</div>";
	mtable += "  <div id='setpush'>";
	mtable += "    <div class='push_settings_wrapper'>";
	mtable += "      <div class='push_info_box'>";
	mtable += "        <div class='push_bell_icon_wrapper'>";
	mtable += "          <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z'/></svg>";
	mtable += "        </div>";
	mtable += "        <div class='push_info_text'>";
	mtable += "          <div class='push_info_main'>To receive web push alerts, you must log in to <a href='https://handfarm.net/webpush' target='_blank' id='setpush_alarm' class='link_webpush'>https://handfarm.net/webpush</a> and apply for alerts.</div>";
	mtable += "          <div class='push_info_notice'>( Membership registration on hanfarm.net is required )</div>";
	mtable += "        </div>";
	mtable += "      </div>";
	mtable += "      <div class='push_action_row'>";
	mtable += "        <div class='push_label_id'>hadfarm.net ID</div>";
	mtable += "        <input type='text' name='hadfarm_id' id='hadfarm_id' class='push_input_id' placeholder='Enter your ID'>";
	mtable += "        <button type='button' id='push_test' class='btn_push_test'>Test Alert</button>";
	mtable += "      </div>";
	mtable += "    </div>";
	mtable += "  </div>";
	mtable += "</div>";

	// 4. 설정 저장 버튼
	mtable += "<div class='config_save_bar'>";
	mtable += "  <button type='button' id='setalarm_save' class='btn_config_save'>";
	mtable += "    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'></path><polyline points='17 21 17 13 7 13 7 21'></polyline><polyline points='7 3 7 8 15 8'></polyline></svg>";
	mtable += "    <span>Save Settings</span>";
	mtable += "  </button>";
	mtable += "</div>";

	mtable += "</div>";
	
	$("#set_alarm_content").html(mtable);
}

function create_init_set_io_screen(ocnum, tempnum, timenum, ctrltype){
	var mtable = "";

	// 1. 개폐기 컨트롤러(SH2N) 설정 테이블
	if(ctrltype==1){
		$("#setocctrl").empty();
		if(ocnum > 0){
			mtable = "<div class='config_table_card'>";
			mtable += "<table class='config_data_table'>";
			mtable += "<thead><tr>";
			mtable += "<th style='width: 12%;'></th>";
			mtable += "<th style='width: 36%;'>Channel Name</th>";
			mtable += "<th style='width: 26%;'>Open Temp. (°C)</th>";
			mtable += "<th style='width: 26%;'>Close Temp. (°C)</th>";
			mtable += "</tr></thead><tbody>";
			for(var i=1; i<=ocnum; i++){
				mtable += "<tr>";
				mtable += "<td class='col_channel_label'>CH" + i + "</td>";
				mtable += "<td><input type='text' class='config_input_text' name='oc_name_"+i+"' id='oc_name_"+i+"'></td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='oc_setopen_"+i+"' id='oc_setopen_"+i+"'></td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='oc_setclose_"+i+"' id='oc_setclose_"+i+"'></td>";
				mtable += "</tr>";
			}
			mtable += "</tbody></table></div>";
			$("#setocctrl").html(mtable);
		}
	}
	
	// 2. 온도 컨트롤러(XR10) 설정 테이블
	if(ctrltype==2){
		$("#settempctrl").empty();
		if(tempnum > 0){
			mtable = "<div class='config_table_card'>";
			mtable += "<table class='config_data_table'>";
			mtable += "<thead><tr>";
			mtable += "<th style='width: 12%;'></th>";
			mtable += "<th style='width: 44%;'>Channel Name</th>";
			mtable += "<th style='width: 44%;'>Operation Temp. (°C)</th>";
			mtable += "</tr></thead><tbody>";
			for(var i=1; i<=tempnum; i++){
				mtable += "<tr>";
				mtable += "<td class='col_channel_label'>CH" + i + "</td>";
				mtable += "<td><input type='text' class='config_input_text' name='temp_name_"+i+"' id='temp_name_"+i+"'></td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='temp_setopen_"+i+"' id='temp_setopen_"+i+"'></td>";
				mtable += "</tr>";
			}
			mtable += "</tbody></table></div>";
			$("#settempctrl").html(mtable);
		}
	}

	// 3. 타이머 컨트롤러 설정 테이블
	if(ctrltype==3){
		$("#settimectrl").empty();
		if(timenum > 0){
			mtable = "<div class='config_table_card'>";
			mtable += "<table class='config_data_table'>";
			mtable += "<thead><tr>";
			mtable += "<th style='width: 12%;'></th>";
			mtable += "<th style='width: 44%;'>Channel Name</th>";
			mtable += "<th style='width: 44%;'>Operation Mode</th>";
			mtable += "</tr></thead><tbody>";
			for(var i=1; i<=timenum; i++){
				mtable += "<tr>";
				mtable += "<td class='col_channel_label'>CH" + i + "</td>";
				mtable += "<td><input type='text' class='config_input_text' name='time_name_"+i+"' id='time_name_"+i+"'></td>";
				mtable += "<td>";
				mtable += "<select class='config_select_mode' name='timemode"+i+"' id='timemode"+i+"'>";
				mtable += "<option value='10'>출력지속 (Continuous)</option>";
				mtable += "<option value='11'>플 리 커 (Flicker)</option>";
				mtable += "<option value='12'>5단 확장 (5-Step)</option>";
				mtable += "</select>";
				mtable += "</td>";
				mtable += "</tr>";
				
				mtable += "<tr>";
				mtable += "<td></td><td colspan='2'><div id='settimemode"+i+"' class='timer_mode_subpanel'></div></td>";
				mtable += "</tr>";
			}
			mtable += "</tbody></table></div>";
			$("#settimectrl").html(mtable);
		}
	}
}

function create_init_set_time_screen(tmrchno, timemode){
	var mtable = "";
	$("#settimemode"+tmrchno).empty();
	
	if (timemode == 10) {
		// 출력지속 (Continuous Mode)
		mtable += "<div class='timer_mode_card'>";
		mtable += "  <div class='timer_field_row'>";
		mtable += "    <div class='timer_field_label'>Open Start Time (열림 시작)</div>";
		mtable += "    <div class='timer_time_group'>";
		mtable += "      <input type='number' step='1' min='0' max='23' name='tset10_openhr"+tmrchno+"' id='tset10_openhr"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>시 (hr)</span>";
		mtable += "      <input type='number' step='1' min='0' max='59' name='tset10_openmn"+tmrchno+"' id='tset10_openmn"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>분 (min)</span>";
		mtable += "    </div>";
		mtable += "  </div>";
		mtable += "  <div class='timer_field_row'>";
		mtable += "    <div class='timer_field_label'>Close Start Time (닫힘 시작)</div>";
		mtable += "    <div class='timer_time_group'>";
		mtable += "      <input type='number' step='1' min='0' max='23' name='tset10_closehr"+tmrchno+"' id='tset10_closehr"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>시 (hr)</span>";
		mtable += "      <input type='number' step='1' min='0' max='59' name='tset10_closemn"+tmrchno+"' id='tset10_closemn"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>분 (min)</span>";
		mtable += "    </div>";
		mtable += "  </div>";
		mtable += "</div>";
	} else if (timemode == 11) {
		// 플리커 (Flicker Mode)
		mtable += "<div class='timer_mode_card'>";
		mtable += "  <div class='timer_field_row'>";
		mtable += "    <div class='timer_field_label'>Mode Start Time (시작 시간)</div>";
		mtable += "    <div class='timer_time_group'>";
		mtable += "      <input type='number' step='1' min='0' max='23' name='tset11_starthr"+tmrchno+"' id='tset11_starthr"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>시 (hr)</span>";
		mtable += "      <input type='number' step='1' min='0' max='59' name='tset11_startmn"+tmrchno+"' id='tset11_startmn"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>분 (min)</span>";
		mtable += "    </div>";
		mtable += "  </div>";
		mtable += "  <div class='timer_field_row'>";
		mtable += "    <div class='timer_field_label'>Mode End Time (종료 시간)</div>";
		mtable += "    <div class='timer_time_group'>";
		mtable += "      <input type='number' step='1' min='0' max='23' name='tset11_endhr"+tmrchno+"' id='tset11_endhr"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>시 (hr)</span>";
		mtable += "      <input type='number' step='1' min='0' max='59' name='tset11_endmn"+tmrchno+"' id='tset11_endmn"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "      <span class='timer_unit_text'>분 (min)</span>";
		mtable += "    </div>";
		mtable += "  </div>";
		mtable += "  <div class='timer_field_row timer_field_dual'>";
		mtable += "    <div class='timer_subfield'>";
		mtable += "      <div class='timer_field_label'>Run Time (동작시간)</div>";
		mtable += "      <div class='timer_unit_combo'>";
		mtable += "        <input type='number' step='1' min='0' name='tset11_runtime"+tmrchno+"' id='tset11_runtime"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "        <select name='tset11_rununit"+tmrchno+"' id='tset11_rununit"+tmrchno+"' class='timer_select_unit'>";
		mtable += "          <option value='0'>초 (sec)</option>";
		mtable += "          <option value='1'>분 (min)</option>";
		mtable += "        </select>";
		mtable += "      </div>";
		mtable += "    </div>";
		mtable += "    <div class='timer_subfield'>";
		mtable += "      <div class='timer_field_label'>Stop Time (정지시간)</div>";
		mtable += "      <div class='timer_unit_combo'>";
		mtable += "        <input type='number' step='1' min='0' name='tset11_stoptime"+tmrchno+"' id='tset11_stoptime"+tmrchno+"' class='timer_input_num' placeholder='0'>";
		mtable += "        <select name='tset11_stopunit"+tmrchno+"' id='tset11_stopunit"+tmrchno+"' class='timer_select_unit'>";
		mtable += "          <option value='0'>초 (sec)</option>";
		mtable += "          <option value='1'>분 (min)</option>";
		mtable += "        </select>";
		mtable += "      </div>";
		mtable += "    </div>";
		mtable += "  </div>";
		mtable += "</div>";
	} else if (timemode == 12) {
		// 5단 확장 (5-Step Mode)
		mtable += "<div class='timer_mode_card timer_mode_card_steps'>";
		for(var i=1; i<=5; i++){
			mtable += "<div class='timer_step_item'>";
			mtable += "  <div class='timer_step_badge'>Step " + i + "</div>";
			mtable += "  <div class='timer_step_fields'>";
			mtable += "    <div class='timer_step_field'>";
			mtable += "      <span class='timer_field_minilabel'>Start Time:</span>";
			mtable += "      <div class='timer_time_group'>";
			mtable += "        <input type='number' step='1' min='0' max='23' name='tset12_ex"+i+"hr"+tmrchno+"' id='tset12_ex"+i+"hr"+tmrchno+"' class='timer_input_num' placeholder='0'>";
			mtable += "        <span class='timer_unit_text'>시</span>";
			mtable += "        <input type='number' step='1' min='0' max='59' name='tset12_ex"+i+"mn"+tmrchno+"' id='tset12_ex"+i+"mn"+tmrchno+"' class='timer_input_num' placeholder='0'>";
			mtable += "        <span class='timer_unit_text'>분</span>";
			mtable += "      </div>";
			mtable += "    </div>";
			mtable += "    <div class='timer_step_field'>";
			mtable += "      <span class='timer_field_minilabel'>Run Time:</span>";
			mtable += "      <div class='timer_time_group'>";
			mtable += "        <input type='number' step='1' min='0' name='tset12_ex"+i+"runtime"+tmrchno+"' id='tset12_ex"+i+"runtime"+tmrchno+"' class='timer_input_num' placeholder='0'>";
			mtable += "        <span class='timer_unit_text'>초</span>";
			mtable += "      </div>";
			mtable += "    </div>";
			mtable += "    <div class='timer_step_field'>";
			mtable += "      <span class='timer_field_minilabel'>Output:</span>";
			mtable += "      <select name='tset12_ex"+i+"out"+tmrchno+"' id='tset12_ex"+i+"out"+tmrchno+"' class='timer_select_out'>";
			mtable += "        <option value='0'>열림 (Open)</option>";
			mtable += "        <option value='1'>닫힘 (Close)</option>";
			mtable += "      </select>";
			mtable += "    </div>";
			mtable += "  </div>";
			mtable += "</div>";
		}
		mtable += "</div>";
	}
	
	$("#settimemode"+tmrchno).html(mtable);
}

function create_init_set_alarm_screen(ocnum, tempnum, ctrltype){
	var mtable = "";

	// 1. 개폐기 컨트롤러(SH2N) 알람 설정 테이블
	if(ctrltype==1){
		$("#setocalarm").empty();
		if(Number(ocnum) > 0){
			mtable = "<div class='config_table_card'>";
			mtable += "<table class='config_data_table alarm_data_table'>";
			mtable += "<thead><tr>";
			mtable += "<th style='width: 16%;'>Channel</th>";
			mtable += "<th style='width: 35%;'>High Temp. Alert (°C)</th>";
			mtable += "<th style='width: 35%;'>Low Temp. Alert (°C)</th>";
			mtable += "<th style='width: 14%;'>Use</th>";
			mtable += "</tr></thead><tbody>";
			for(var i=1; i<=ocnum; i++){
				mtable += "<tr>";
				mtable += "<td class='col_channel_label'>CH" + i + "</td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='oc_alarmhigh_"+i+"' id='oc_alarmhigh_"+i+"'></td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='oc_alarmlow_"+i+"' id='oc_alarmlow_"+i+"'></td>";
				mtable += "<td class='col_checkbox_cell'>";
				mtable += "<input type='checkbox' class='custom_check_input' name='oc_alarmuse_"+i+"' value='oc_alarmuse_"+i+"' id='oc_alarmuse_"+i+"'>";
				mtable += "</td>";
				mtable += "</tr>";
			}
			mtable += "</tbody></table></div>";
			$("#setocalarm").html(mtable);
		}
	}
	
	// 2. 온도 컨트롤러(XR10) 알람 설정 테이블
	if(ctrltype==2){
		$("#settempalarm").empty();
		if(Number(tempnum) > 0){
			mtable = "<div class='config_table_card'>";
			mtable += "<table class='config_data_table alarm_data_table'>";
			mtable += "<thead><tr>";
			mtable += "<th style='width: 16%;'>Channel</th>";
			mtable += "<th style='width: 35%;'>High Temp. Alert (°C)</th>";
			mtable += "<th style='width: 35%;'>Low Temp. Alert (°C)</th>";
			mtable += "<th style='width: 14%;'>Use</th>";
			mtable += "</tr></thead><tbody>";
			for(var i=1; i<=tempnum; i++){
				mtable += "<tr>";
				mtable += "<td class='col_channel_label'>CH" + i + "</td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='temp_alarmhigh_"+i+"' id='temp_alarmhigh_"+i+"'></td>";
				mtable += "<td><input type='number' step='0.1' class='config_input_num' name='temp_alarmlow_"+i+"' id='temp_alarmlow_"+i+"'></td>";
				mtable += "<td class='col_checkbox_cell'>";
				mtable += "<input type='checkbox' class='custom_check_input' name='temp_alarmuse_"+i+"' value='temp_alarmuse_"+i+"' id='temp_alarmuse_"+i+"'>";
				mtable += "</td>";
				mtable += "</tr>";
			}
			mtable += "</tbody></table></div>";
			$("#settempalarm").html(mtable);
		}
	}

	// 3. 웹 푸시알람 (존재하지 않거나 비어있는 경우에만 렌더링하여 사용자 입력값 유지)
	if($("#setpush").is(':empty') || $("#hadfarm_id").length === 0){
		var prevId = $("#hadfarm_id").val() || "";
		var pushHtml = "<div class='push_settings_wrapper'>";
		pushHtml += "  <div class='push_info_box'>";
		pushHtml += "    <div class='push_bell_icon_wrapper'>";
		pushHtml += "      <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z'/></svg>";
		pushHtml += "    </div>";
		pushHtml += "    <div class='push_info_text'>";
		pushHtml += "      <div class='push_info_main'>To receive web push alerts, you must log in to <a href='https://handfarm.net/webpush' target='_blank' id='setpush_alarm' class='link_webpush'>https://handfarm.net/webpush</a> and apply for alerts.</div>";
		pushHtml += "      <div class='push_info_notice'>( Membership registration on hanfarm.net is required )</div>";
		pushHtml += "    </div>";
		pushHtml += "  </div>";
		pushHtml += "  <div class='push_action_row'>";
		pushHtml += "    <div class='push_label_id'>hadfarm.net ID</div>";
		pushHtml += "    <input type='text' name='hadfarm_id' id='hadfarm_id' class='push_input_id' placeholder='Enter your ID' value='" + prevId + "'>";
		pushHtml += "    <button type='button' id='push_test' class='btn_push_test'>Test Alert</button>";
		pushHtml += "  </div>";
		pushHtml += "</div>";
		$("#setpush").html(pushHtml);
	}
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
	if(document.getElementById('state_msg')){
		document.getElementById('state_msg').style.display = 'none';
	}
	
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

	var mtable = "<div class='config_page_container'>";

	// 1. Available Wi-Fi Networks Card
	mtable += "<div class='alarm_panel_card'>";
	mtable += "  <div class='wifi_card_title_row'>";
	mtable += "    <div class='wifi_header_left'>";
	mtable += "      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#0D652D' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12.55a11 11 0 0 1 14.08 0'></path><path d='M1.42 9a16 16 0 0 1 21.16 0'></path><path d='M8.53 16.11a6 6 0 0 1 6.95 0'></path><line x1='12' y1='20' x2='12.01' y2='20' stroke-width='3'></line></svg>";
	mtable += "      <div class='alarm_panel_title' style='margin-bottom: 0;'>Available Wi-Fi Networks</div>";
	mtable += "    </div>";
	mtable += "    <button type='button' id='btn_refresh_wifi' class='btn_refresh_wifi' title='Refresh Wi-Fi Networks'>";
	mtable += "      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19'/></svg>";
	mtable += "    </button>";
	mtable += "  </div>";

	mtable += "  <div class='config_table_card'>";
	mtable += "    <table class='config_data_table wifi_data_table' id='wifi_table'>";
	mtable += "      <thead><tr>";
	mtable += "        <th style='width: 55%; text-align: left; padding-left: 20px;'>Network Name (SSID)</th>";
	mtable += "        <th style='width: 25%; text-align: center;'>Signal Strength</th>";
	mtable += "        <th style='width: 20%; text-align: center;'>In Range</th>";
	mtable += "      </tr></thead><tbody>";

	var hasRows = false;
	for(var i=0; i<item_list.length; i++){
		var ssidName = item_list[i][2] || "";
		if(ssidName === "" || ssidName === "--") continue;
		hasRows = true;

		var inUse = (item_list[i][0] && item_list[i][0].includes('*'));
		var barsStr = (item_list[i][7] || "").trim();
		var sigNum = parseInt(item_list[i][6], 10);
		var barCount = 1;
		if(barsStr === "****" || sigNum >= 75){
			barCount = 4;
		}else if(barsStr === "***" || sigNum >= 50){
			barCount = 3;
		}else if(barsStr === "**" || sigNum >= 25){
			barCount = 2;
		}else{
			barCount = 1;
		}

		mtable += "      <tr class='wifi_row' data-ssid='" + ssidName.replace(/'/g, "&apos;") + "'>";
		mtable += "        <td class='wifi_ssid_cell' style='text-align: left; padding-left: 20px;'>" + ssidName + "</td>";
		mtable += "        <td style='text-align: center;'>";
		mtable += "          <div class='wifi_signal_bars bars-" + barCount + "'>";
		mtable += "            <span class='signal_bar bar-1'></span>";
		mtable += "            <span class='signal_bar bar-2'></span>";
		mtable += "            <span class='signal_bar bar-3'></span>";
		mtable += "            <span class='signal_bar bar-4'></span>";
		mtable += "          </div>";
		mtable += "        </td>";
		mtable += "        <td class='col_checkbox_cell'>";
		mtable += "          <input type='checkbox' class='custom_check_input' " + (inUse ? "checked" : "") + " tabindex='-1'>";
		mtable += "        </td>";
		mtable += "      </tr>";
	}

	if(!hasRows){
		mtable += "      <tr><td colspan='3' style='text-align: center; padding: 24px; color: #94A3B8; font-size: 14.5px;'>No Wi-Fi networks detected. Click refresh to scan again.</td></tr>";
	}

	mtable += "      </tbody></table>";
	mtable += "  </div>";
	mtable += "</div>";

	// 2. Wi-Fi Connection Settings Card
	mtable += "<div class='alarm_panel_card' style='margin-bottom: 40px;'>";
	mtable += "  <div class='wifi_card_title_row'>";
	mtable += "    <div class='wifi_header_left'>";
	mtable += "      <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' style='color: #0D652D;'><path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/></svg>";
	mtable += "      <div class='alarm_panel_title' style='margin-bottom: 0;'>Wi-Fi Connection Settings</div>";
	mtable += "    </div>";
	mtable += "  </div>";

	mtable += "  <div class='wifi_connect_panel'>";
	mtable += "    <div class='wifi_connect_fields'>";
	mtable += "      <div class='wifi_connect_row'>";
	mtable += "        <label class='wifi_connect_label' for='ssid'>SSID</label>";
	mtable += "        <input name='ssid' type='text' id='ssid' value='' placeholder='Enter SSID' class='wifi_input_text'>";
	mtable += "      </div>";
	mtable += "      <div class='wifi_connect_row'>";
	mtable += "        <label class='wifi_connect_label' for='wifi_pw'>Password</label>";
	mtable += "        <input name='wifi_pw' type='password' id='wifi_pw' value='' placeholder='Enter password' class='wifi_input_text'>";
	mtable += "      </div>";
	mtable += "    </div>";
	mtable += "    <button type='button' id='setnetwork_save' class='btn_wifi_apply'>";
	mtable += "      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12.55a11 11 0 0 1 14.08 0'></path><path d='M1.42 9a16 16 0 0 1 21.16 0'></path><path d='M8.53 16.11a6 6 0 0 1 6.95 0'></path><line x1='12' y1='20' x2='12.01' y2='20' stroke-width='3'></line></svg>";
	mtable += "      <span>Apply</span>";
	mtable += "    </button>";
	mtable += "  </div>";
	mtable += "</div>";

	mtable += "</div>";

	$("#wifi_list").html(mtable);
	rowClicked();

	// 비동기 작업 완료 후 로딩 애니메이션 숨기기
	if(document.getElementById("loader")){
		document.getElementById("loader").style.display = "none";
	}
}

function rowClicked() {
	var table = document.getElementById('wifi_table');
	if(!table) return;
	var rowList = table.rows;
	for (var i=1; i<rowList.length; i++) {
		var row = rowList[i];
		row.onclick = function(){ 
			return function(){ 
				var ssidVal = this.cells[0] ? (this.cells[0].innerText || this.cells[0].textContent).trim() : "";
				$("#ssid").prop("value", ssidVal);
				$("#wifi_pw").prop("value", "").focus();
				$("#wifi_table tbody tr").removeClass("wifi_row_selected");
				$(this).addClass("wifi_row_selected");
			};
		}(row);
	}
}


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
