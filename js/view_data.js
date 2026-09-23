//const MaxModule = 4;		//최대 릴레이모듈 개수
//const MaxRelay = 16;		//릴레이모듈 1개의 릴레이 개수
//const MaxTempSensor = 7;	//온도모듈에 장착될 수 있는 최대 온도센서 개수
//const MaxSoilSensor = 4;	//최대 함수율센서 개수

const Min_Temperature = -15;
const Max_Temperature = 60;
const Chart_tickInterval = 15;

var search_text;
var container1 = $('#pagination-demo1');

var bComplete = false;
var das_data;



var temp1=[], temp2=[], temp3=[], temp4=[], temp5=[], temp6=[], temp7=[], temp8=[];
var temp9=[], temp10=[], temp11=[], temp12=[], temp13=[], temp14=[], temp15=[], temp16=[];


let occtrlnum = 0;
let tempctrlnum = 0;





var graph_seldate, graph_selterm;
var dwload_seldate, dwload_selterm;
var formatString, tickInterval;
var plot1, plot2, plot3;

var series_color = [
	'#EF4444', // Temp.1: Red
	'#7C3AED', // Temp.2: Purple
	'#15803D', // Temp.3: Green
	'#F97316', // Temp.4: Orange
	'#EC4899', // Temp.5: Pink/Magenta
	'#EAB308', // Temp.6: Yellow
	'#1E3A8A', // Temp.7: Navy Blue
	'#3B82F6', // Temp.8: Light Blue
	'#EF4444', '#7C3AED', '#15803D', '#F97316'
];

$(document).ready(function(){
	$('.animsition').animsition();

	$.ajax({
		type : 'POST',
		url : '/php/read_setconfig.php',
		data : '',
		dataType : 'json',
		success : function(data){
			//alert(data);
			//if (isEmpty(data)) return false;
			
			occtrlnum = data[0];
			tempctrlnum = data[1];
			
			create_chartdata();
			create_downloaddata();
			
			create_push_termslect();
		}
	}); //End of $.ajax({


	if (typeof $.jqplot !== 'undefined' && $.jqplot.config) {
		$.jqplot.config.enablePlugins = true;
	}

});	//End of $(document).ready(function(){

$(window).resize(function(){
	if (plot1 && typeof plot1.resize === 'function') plot1.resize();
	if (plot2 && typeof plot2.resize === 'function') plot2.resize();
});


function create_chartdata(){
	const today = new Date();			// 오늘 날짜 객체 생성
	today.setDate(today.getDate() - 6);	// 6일 전으로 설정

	// 년-월-일 형식으로 변환
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줌
	const day = String(today.getDate()).padStart(2, '0'); 		// 일도 두 자릿수로 설정

	// 년-월-일 형식으로 출력
	const formattedDate = `${year}-${month}-${day}`;
	//console.log(formattedDate);

	var mtable = "";
	
	// 날짜 선택
	// Modern Date & Term Filter Panel (Flexbox)
	mtable += "<div class='filter_panel_modern'>";
	mtable += "  <div class='filter_row_primary'>";
	mtable += "    <span class='filter_label'>Date</span>";
	mtable += "    <input type='date' id='graph_startdate' class='ctrl_date_input' value='" + formattedDate + "'>";
	mtable += "    <span class='filter_label'>From</span>";
	mtable += "    <input type='date' id='graph_enddate' class='ctrl_date_input' placeholder='YYYY-MM-DD'>";
	mtable += "    <span class='filter_label'>To</span>";
	mtable += "    <input type='button' id='btn_viewgraph' class='btn_show_graph' value='Show Graph'>";
	mtable += "  </div>";
	mtable += "  <div class='filter_term_group'>";
	mtable += "    <input type='radio' id='graph_term_day' name='graph_term' value='oneday'>";
	mtable += "    <label for='graph_term_day' class='term_pill'>1 Day</label>";
	mtable += "    <input type='radio' id='graph_term_week' name='graph_term' value='week' checked>";
	mtable += "    <label for='graph_term_week' class='term_pill'>1 Week</label>";
	mtable += "    <input type='radio' id='graph_term_month' name='graph_term' value='month'>";
	mtable += "    <label for='graph_term_month' class='term_pill'>1 Month</label>";
	mtable += "  </div>";
	mtable += "</div>";
	/////////////////////////////////////////////////////////////////////////////////////////////////
	
	//그래프 영역 (개폐기 컨트롤러 온도 그래프)
	mtable += "<div class='chart_area_card'>";
	mtable += "  <div class='sensor_checkbox_grid'>";
	for(i=1; i<=8; i++){
		mtable += "    <div class='sensor_check_item'>";
		mtable += "      <input type='checkbox' name='chk_occtrl"+i+"' value='chk_occtrl"+i+"' id='chk_occtrl"+i+"' class='check_sensor1'>";
		mtable += "      <label for='chk_occtrl"+i+"' class='sensor_check_label'>CH"+i+"</label>";
		mtable += "    </div>";
	}
	mtable += "  </div>";
	mtable += "  <div class='chart_plot_wrapper'>";
	mtable += "    <canvas id='graph_sensor1'></canvas>";
	mtable += "  </div>";
	mtable += "</div>";
	
	//그래프 영역 (온도 컨트롤러 온도 그래프)
	mtable += "<div class='chart_area_card'>";
	mtable += "  <div class='sensor_checkbox_grid'>";
	for(i=1; i<=8; i++){
		mtable += "    <div class='sensor_check_item'>";
		mtable += "      <input type='checkbox' name='chk_tempctrl"+i+"' value='chk_tempctrl"+i+"' id='chk_tempctrl"+i+"' class='check_sensor2'>";
		mtable += "      <label for='chk_tempctrl"+i+"' class='sensor_check_label'>CH"+i+"</label>";
		mtable += "    </div>";
	}
	mtable += "  </div>";
	mtable += "  <div class='chart_plot_wrapper'>";
	mtable += "    <canvas id='graph_sensor2'></canvas>";
	mtable += "  </div>";
	mtable += "</div>";
	
	$("#view_graph_content").append(mtable);
	/////////////////////////////////////////////////////////////////////////////////////////////////

	// 이벤트 등록
	$("#btn_viewgraph").click(function(){
		graph_seldate = document.getElementById("graph_startdate").value;
		graph_selterm = SelectedRadio("graph_term");
		switch(graph_selterm){
			case 1:	//1달 보기
				formatString = "%Y-%m-%d";
				tickInterval = "4 days";
				break;
			case 2:	//1주 보기
				formatString = "%Y-%m-%d";
				tickInterval = "1 days";
				break;
			case 3:	//1일 보기
				formatString = "%H:%M";
				tickInterval = "2 hour";
				break;
		}
		
		//alert("seldate = "+graph_seldate+", selterm="+graph_selterm);		
		draw_chartdata(graph_seldate, graph_selterm);
		return true;
	});
	
	$("input[type=date][id=graph_startdate]").change(function(){
		graph_seldate = document.getElementById("graph_startdate").value;
		//alert("Selected Date  =" + graph_seldate);
	});

	$("input[type=radio][name=graph_term]").change(function(){
		var d1 = new Date();
		graph_selterm = SelectedRadio("graph_term");
		//alert("Selected Terms = " + graph_selterm);
		switch(graph_selterm){
			case 1:	//1달 보기
				formatString = "%Y-%m-%d";
				tickInterval = "4 days";
				d1.setMonth(d1.getMonth()-1);
				break;
			case 2:	//1주 보기
				formatString = "%Y-%m-%d";
				tickInterval = "1 days";
				d1.setDate(d1.getDate()-6);
				break;
			case 3:	//1일 보기
				formatString = "%H:%M";
				tickInterval = "2 hour";
				break;
		}
		document.getElementById("graph_startdate").value = d1.getFullYear() + "-" + pad((d1.getMonth()+1),2) + "-" + pad(d1.getDate(),2);
	});
	


	$("input.check_sensor1").change(function(){
		for(var i=0; i<8; i++){
			if (plot1 && typeof plot1.setDatasetVisibility === 'function') {
				var isChecked = $("#chk_occtrl"+(i+1)).is(":checked");
				plot1.setDatasetVisibility(i, isChecked);
			}
		}
		if (plot1 && typeof plot1.update === 'function') {
			plot1.update();
		}
	});

	$("input.check_sensor2").change(function(){
		for(var i=0; i<8; i++){
			if (plot2 && typeof plot2.setDatasetVisibility === 'function') {
				var isChecked = $("#chk_tempctrl"+(i+1)).is(":checked");
				plot2.setDatasetVisibility(i, isChecked);
			}
		}
		if (plot2 && typeof plot2.update === 'function') {
			plot2.update();
		}
	});
	

	for(var i=1; i<=occtrlnum; i++){
		$("#chk_occtrl"+i).prop("checked", true);
	}
	for(var i=1; i<=tempctrlnum; i++){
		$("#chk_tempctrl"+i).prop("checked", true);
	}

	// Initial graph load
	$("#btn_viewgraph").trigger("click");
}

function create_downloaddata(){
	var mtable = "";

	const today = new Date();				// 오늘 날짜 객체 생성	
	const today_end = new Date();			// 오늘 날짜 객체 생성	
	
	today.setDate(today.getDate());			// 오늘 날짜로 설정
	today_end.setDate(today.getDate() - 6);	// 6일 전으로 설정

	// 년-월-일 형식으로 변환
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줌
	const day = String(today.getDate()).padStart(2, '0'); 		// 일도 두 자릿수로 설정

	const year_end = today_end.getFullYear();
	const month_end = String(today_end.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줌
	const day_end = String(today_end.getDate()).padStart(2, '0'); 		// 일도 두 자릿수로 설정

	// 년-월-일 형식으로 출력
	const formattedDate = `${year}-${month}-${day}`;
	const formattedDate_end = `${year_end}-${month_end}-${day_end}`;

	// Modern Two-Card UI matching user mockup exactly
	mtable += "<div class='download_tab_wrapper'>";

	// Card 1: Set Search Period
	mtable += "  <div class='download_card'>";
	mtable += "    <div class='download_card_title'>Set Search Period</div>";
	mtable += "    <div class='download_date_row'>";
	mtable += "      <div class='date_picker_group'>";
	mtable += "        <label for='dwload_startdate' class='download_field_label'>Start Date</label>";
	mtable += "        <input type='date' id='dwload_startdate' class='download_date_input' value='" + formattedDate_end + "'>";
	mtable += "      </div>";
	mtable += "      <span class='date_range_tilde'>~</span>";
	mtable += "      <div class='date_picker_group'>";
	mtable += "        <label for='dwload_enddate' class='download_field_label'>End Date</label>";
	mtable += "        <input type='date' id='dwload_enddate' class='download_date_input' value='" + formattedDate + "'>";
	mtable += "      </div>";
	mtable += "    </div>";
	mtable += "    <div class='download_term_row'>";
	mtable += "      <input type='radio' id='dwload_term_day' name='dwload_term' value='oneday'>";
	mtable += "      <label for='dwload_term_day' class='download_term_pill'>1 Day</label>";
	mtable += "      <input type='radio' id='dwload_term_week' name='dwload_term' value='week' checked>";
	mtable += "      <label for='dwload_term_week' class='download_term_pill'>1 Week</label>";
	mtable += "      <input type='radio' id='dwload_term_month' name='dwload_term' value='month'>";
	mtable += "      <label for='dwload_term_month' class='download_term_pill'>1 Month</label>";
	mtable += "    </div>";
	mtable += "    <div class='download_divider'></div>";
	mtable += "    <div class='download_action_row'>";
	mtable += "      <button type='button' id='btn_datadownload' class='btn_download_submit'>";
	mtable += "        <svg class='download_btn_icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path><polyline points='7 10 12 15 17 10'></polyline><line x1='12' y1='15' x2='12' y2='3'></line></svg>";
	mtable += "        <span>Download Data</span>";
	mtable += "      </button>";
	mtable += "    </div>";
	mtable += "  </div>";

	// Card 2: File Information
	mtable += "  <div class='file_info_card'>";
	mtable += "    <div class='excel_badge_icon'>";
	mtable += "      <svg width='38' height='38' viewBox='0 0 40 40' fill='none'>";
	mtable += "        <rect width='40' height='40' rx='8' fill='#107C41'/>";
	mtable += "        <path d='M22 9H31C32.1 9 33 9.9 33 11V29C33 30.1 32.1 31 31 31H22V9Z' fill='#21A366'/>";
	mtable += "        <rect x='23' y='13' width='7' height='1.5' rx='0.5' fill='#FFFFFF' fill-opacity='0.85'/>";
	mtable += "        <rect x='23' y='17' width='7' height='1.5' rx='0.5' fill='#FFFFFF' fill-opacity='0.85'/>";
	mtable += "        <rect x='23' y='21' width='7' height='1.5' rx='0.5' fill='#FFFFFF' fill-opacity='0.85'/>";
	mtable += "        <rect x='23' y='25' width='7' height='1.5' rx='0.5' fill='#FFFFFF' fill-opacity='0.85'/>";
	mtable += "        <rect x='7' y='11' width='18' height='18' rx='4' fill='#107C41' stroke='#166534' stroke-width='1'/>";
	mtable += "        <path d='M12.5 15.5L15 20L12.5 24.5H14.5L16 21.5L17.5 24.5H19.5L17 20L19.5 15.5H17.5L16 18.5L14.5 15.5H12.5Z' fill='#FFFFFF'/>";
	mtable += "      </svg>";
	mtable += "    </div>";
	mtable += "    <div class='file_info_text_content'>";
	mtable += "      <div class='file_info_title'>File Information</div>";
	mtable += "      <div class='file_info_desc'>The downloaded file is in .xls format (Excel file).</div>";
	mtable += "      <div class='file_info_warning'>Excel files cannot be opened on mobile devices.</div>";
	mtable += "    </div>";
	mtable += "  </div>";

	mtable += "</div>";

	$("#data_download_content").append(mtable);
	/////////////////////////////////////////////////////////////////////////////////////////////////

	// Quick term change handler for data download
	$("input[type=radio][name=dwload_term]").change(function(){
		var termVal = $(this).val();
		var endDateVal = $("#dwload_enddate").val();
		if (!endDateVal) {
			var now = new Date();
			endDateVal = now.getFullYear() + "-" + pad((now.getMonth()+1),2) + "-" + pad(now.getDate(),2);
			$("#dwload_enddate").val(endDateVal);
		}
		var parts = endDateVal.split('-');
		var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
		if (termVal === 'oneday') {
			// same day
		} else if (termVal === 'week') {
			d.setDate(d.getDate() - 6);
		} else if (termVal === 'month') {
			d.setMonth(d.getMonth() - 1);
		}
		$("#dwload_startdate").val(d.getFullYear() + "-" + pad((d.getMonth()+1),2) + "-" + pad(d.getDate(),2));
	});

	// 이벤트 등록
	$("#btn_datadownload").click(function(){
		dwload_startdate = document.getElementById("dwload_startdate").value;
		dwload_enddate = document.getElementById("dwload_enddate").value;
		
		if(dwload_enddate < dwload_startdate){
			alert("검색기간 설정이 잘못되었습니다.\n날짜를 확인하세요.");
			return;
		}
		
		var param = "startdate=" + dwload_startdate + "&enddate=" + dwload_enddate + "&occtrlnum=" + occtrlnum + "&tempctrlnum=" + tempctrlnum;
		//alert(param);
		
		location.href="/php/data_download.php?" + param;
		return true;
	});

}

function create_push_termslect(){
	const today = new Date();			// 오늘 날짜 객체 생성
	today.setDate(today.getDate() - 6);	// 6일 전으로 설정

	// 년-월-일 형식으로 변환
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줌
	const day = String(today.getDate()).padStart(2, '0'); 		// 일도 두 자릿수로 설정

	// 년-월-일 형식으로 출력
	const formattedDate = `${year}-${month}-${day}`;
	//console.log(formattedDate);

	var mtable = "";
	
	// Modern Flexbox filter panel matching mockup
	mtable += "<div class='filter_panel_modern'>";
	mtable += "  <div class='filter_row_primary'>";
	mtable += "    <span class='filter_label'>Date</span>";
	mtable += "    <input type='date' id='startdate2' class='ctrl_date_input' value='" + formattedDate + "'>";
	mtable += "    <span class='filter_label'>From ~</span>";
	mtable += "    <input type='date' id='enddate2' class='ctrl_date_input' placeholder='YYYY-MM-DD'>";
	mtable += "    <span class='filter_label'>To</span>";
	mtable += "    <input type='button' id='btn_pushsearch' class='btn_show_graph' value='Search Alerts'>";
	mtable += "  </div>";
	mtable += "  <div class='filter_term_group'>";
	mtable += "    <input type='radio' id='term_day2' name='term2' value='oneday'>";
	mtable += "    <label for='term_day2' class='term_pill'>1 Day</label>";
	mtable += "    <input type='radio' id='term_week2' name='term2' value='week' checked>";
	mtable += "    <label for='term_week2' class='term_pill'>1 Week</label>";
	mtable += "    <input type='radio' id='term_month2' name='term2' value='month'>";
	mtable += "    <label for='term_month2' class='term_pill'>1 Month</label>";
	mtable += "  </div>";
	mtable += "</div>";
	/////////////////////////////////////////////////////////////////////////////////////////////////
	
	$("#push_searchterm").append(mtable);
	/////////////////////////////////////////////////////////////////////////////////////////////////

	// 이벤트 등록
	$("#btn_pushsearch").click(function(){
		var seldate = document.getElementById("startdate2").value;
		var selterm = SelectedRadio("term2");
		search_push_data(seldate, selterm);
		return true;
	});
	
	$("input[type=radio][name=term2]").change(function(){
		var d1 = new Date();
		var selterm = SelectedRadio("term2");
		//alert("Selected Terms = " + selterm);
		switch(selterm){
			case 1:	//1달 보기
				d1.setMonth(d1.getMonth()-1);
				break;
			case 2:	//1주 보기
				d1.setDate(d1.getDate()-6);
				break;
			case 3:	//1일 보기
				break;
		}

		document.getElementById("startdate2").value = d1.getFullYear() + "-" + pad((d1.getMonth()+1),2) + "-" + pad(d1.getDate(),2);
	});
	
}

function search_push_data(startday, termtype){
	container1 = $('#pagination-demo1');
	var options = {
		dataSource: function(done){
			$.ajax({
				type: 'POST',
				data : {"startdate":startday, "termtype":termtype},
				dataType : 'json',
				url: '/php/read_search_push.php',
				success: function(response){
					//alert(response);
					//if(search_text){
					//	response = searchString_fromArray(response, search_text);
					//	search_text = "";
					//}
					done(response);
				},
				error : function(){
					//console.log("search_push_data()..... ajax error()");
				},
				complete : function(){
					//console.log("search_push_data()..... ajax complete()");
				}
			});
		},
		pageSize: 15,			//1페이지에 표시될 데이터 개수
		//pageNumber: 2,		//처음 선택될 페이지 번호
		showGoInput: true,	//지정 페이지로 바로가기 시 페이지 번호
		showGoButton: true,	//지정 페이지로 바로가기 버튼 생성
		showNavigator: true,	//현재페이지에 표시되는 데이터 번호와 총데이터 개수 출력
		showSizeChanger: true,	//페이지에 표시될 데이터 개수 선택 셀렉트박스 출력
		sizeChangerOptions: [10, 15, 20, 30],
		prevText: '<',
		nextText: '>',
		className: 'paginationjs-theme-green paginationjs-big',
		formatNavigator: '<%= rangeStart %>-<%= rangeEnd %> of <%= totalNumber %> items',
		callback: function (response, pagination) {
			//ajax success 에서 done(response)에 의해서 자동 호출됨
			//window.console && console.log(response, pagination);

			var dataHtml = "<div class='alert_table_card'>";
			dataHtml += "<table id='dataTable1' class='alert_data_table'>";
			dataHtml += "<thead><tr>";
			dataHtml += "<th style='width:22%;'>Date & Time</th>";
			dataHtml += "<th style='width:26%;'>Status</th>";
			dataHtml += "<th style='width:52%;'>Details</th>";
			dataHtml += "</tr></thead><tbody>";

			if (!response || response.length === 0) {
				dataHtml += "<tr><td colspan='3' style='text-align:center; padding: 40px; color: #64748B; font-size: 14px;'>No alert records found.</td></tr>";
			} else {
				for (var i = 0; i < response.length; i++) {
					var rawDate = (response[i][0] !== undefined && response[i][0] !== null) ? String(response[i][0]).trim() : '';
					var dateFormatted = rawDate;
					if (dateFormatted.indexOf(' ') > -1) {
						dateFormatted = dateFormatted.replace(' ', '<br>');
					} else if (dateFormatted.indexOf('T') > -1) {
						dateFormatted = dateFormatted.replace('T', '<br>');
					}

					var title = (response[i][1] !== undefined && response[i][1] !== null) ? String(response[i][1]).trim() : '';
					var content = (response[i][2] !== undefined && response[i][2] !== null) ? String(response[i][2]).trim() : '';

					dataHtml += "<tr>";
					dataHtml += "<td class='col_datetime'>" + dateFormatted + "</td>";
					dataHtml += "<td class='col_status'>" + (title ? "<span class='alert_status_badge'>" + title + "</span>" : "") + "</td>";
					dataHtml += "<td class='col_details'>" + content + "</td>";
					dataHtml += "</tr>";
				}
			}
			dataHtml += "</tbody></table></div>";
			container1.prev().html(dataHtml);

			// Format size changer select options: e.g. "15 / page"
			container1.find('.J-paginationjs-size-select option').each(function () {
				var val = $(this).val();
				if ($(this).text().indexOf('/ page') === -1) {
					$(this).text(val + ' / page');
				}
			});
		}
	};

	container1.pagination(options);

	// Ensure Go button refreshes current page when input box is hidden
	$(document).off('click.goFix', '#pagination-demo1 .J-paginationjs-go-button').on('click.goFix', '#pagination-demo1 .J-paginationjs-go-button', function () {
		var pInput = container1.find('.J-paginationjs-go-pagenumber');
		if (!pInput.length || !pInput.val()) {
			var curPage = container1.pagination('getSelectedPageNum') || 1;
			container1.pagination('go', curPage);
		}
	});
}


function draw_chartdata(startday, termtype){
	graph_seldate = startday;
	graph_selterm = termtype;

	document.getElementById("btn_viewgraph").setAttribute("disabled","disabled");

	$.ajax({
		type: 'post',
		url: '/php/read_logdata.php',
		data : {"startdate":startday, "termtype":termtype},
		dataType: 'json',
		success: function(data){
			document.getElementById("btn_viewgraph").removeAttribute("disabled");
			if (!data || !Array.isArray(data) || data.length === 0) {
				return;
			}
			das_data = data.slice();

			temp1 = (das_data[0] && Array.isArray(das_data[0])) ? das_data[0].slice() : [];
			temp2 = (das_data[1] && Array.isArray(das_data[1])) ? das_data[1].slice() : [];
			temp3 = (das_data[2] && Array.isArray(das_data[2])) ? das_data[2].slice() : [];
			temp4 = (das_data[3] && Array.isArray(das_data[3])) ? das_data[3].slice() : [];
			temp5 = (das_data[4] && Array.isArray(das_data[4])) ? das_data[4].slice() : [];
			temp6 = (das_data[5] && Array.isArray(das_data[5])) ? das_data[5].slice() : [];
			temp7 = (das_data[6] && Array.isArray(das_data[6])) ? das_data[6].slice() : [];
			temp8 = (das_data[7] && Array.isArray(das_data[7])) ? das_data[7].slice() : [];
			temp9 = (das_data[8] && Array.isArray(das_data[8])) ? das_data[8].slice() : [];
			temp10 = (das_data[9] && Array.isArray(das_data[9])) ? das_data[9].slice() : [];
			temp11 = (das_data[10] && Array.isArray(das_data[10])) ? das_data[10].slice() : [];
			temp12 = (das_data[11] && Array.isArray(das_data[11])) ? das_data[11].slice() : [];
			temp13 = (das_data[12] && Array.isArray(das_data[12])) ? das_data[12].slice() : [];
			temp14 = (das_data[13] && Array.isArray(das_data[13])) ? das_data[13].slice() : [];
			temp15 = (das_data[14] && Array.isArray(das_data[14])) ? das_data[14].slice() : [];
			temp16 = (das_data[15] && Array.isArray(das_data[15])) ? das_data[15].slice() : [];

			plot_ch1('graph_sensor1', temp1,temp2,temp3,temp4,temp5,temp6,temp7,temp8, formatString, tickInterval);
			plot_ch2('graph_sensor2', temp9,temp10,temp11,temp12,temp13,temp14,temp15,temp16, formatString, tickInterval);

			for(var i=0; i<8; i++){
				if (plot1 && typeof plot1.setDatasetVisibility === 'function') {
					plot1.setDatasetVisibility(i, $("#chk_occtrl"+(i+1)).is(":checked"));
				}
				if (plot2 && typeof plot2.setDatasetVisibility === 'function') {
					plot2.setDatasetVisibility(i, $("#chk_tempctrl"+(i+1)).is(":checked"));
				}
			}		
			if (plot1 && typeof plot1.update === 'function') plot1.update();
			if (plot2 && typeof plot2.update === 'function') plot2.update();
			
		},
		error: function (request, status, error) {
			document.getElementById("btn_viewgraph").removeAttribute("disabled");
		}
	});
	
	return true;
};

function formatChartTimestamp(ts, termtype) {
	if (!ts || typeof ts !== 'string') return ts || '';
	var s = ts.replace(/\//g, '-').trim();
	// termtype: 1 = month, 2 = week, 3 = day
	if (termtype === 3) {
		return s.length >= 16 ? s.substring(11, 16) : s;
	} else if (termtype === 1) {
		return s.length >= 10 ? s.substring(5, 10) : s;
	} else {
		// Week or default: MM-DD HH:mm (e.g. 08-19 00:00) exactly as shown in the TO-BE mockup
		return s.length >= 16 ? s.substring(5, 16) : (s.length >= 10 ? s.substring(5, 10) : s);
	}
}

function buildSensorChart(canvasId, titleText, seriesArrays, termtype) {
	var canvas = document.getElementById(canvasId);
	if (!canvas) return null;

	// Destroy existing chart instance safely if attached
	if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
		var existing = Chart.getChart(canvas);
		if (existing) {
			existing.destroy();
		}
	}

	// 1. Collect all unique timestamps across series in chronological order
	var timeMap = {};
	var masterTimestamps = [];
	for (var s = 0; s < seriesArrays.length; s++) {
		var sData = seriesArrays[s];
		if (sData && sData.length) {
			for (var p = 0; p < sData.length; p++) {
				var pt = sData[p];
				if (pt && pt[0]) {
					var rawT = pt[0];
					if (!timeMap[rawT]) {
						timeMap[rawT] = true;
						masterTimestamps.push(rawT);
					}
				}
			}
		}
	}
	masterTimestamps.sort();

	// 2. Format display labels for X-axis
	var displayLabels = masterTimestamps.map(function(ts) {
		return formatChartTimestamp(ts, termtype);
	});

	// 3. Build 8 datasets (CH1 to CH8)
	var datasets = [];
	for (var s = 0; s < 8; s++) {
		var sData = (s < seriesArrays.length) ? seriesArrays[s] : null;
		var valMap = {};
		if (sData && sData.length) {
			for (var p = 0; p < sData.length; p++) {
				var pt = sData[p];
				if (pt && pt.length >= 2) {
					var tVal = pt[1];
					if (tVal !== null && tVal !== undefined && tVal > -40) {
						valMap[pt[0]] = parseFloat(Number(tVal).toFixed(1));
					}
				}
			}
		}

		var dataPoints = masterTimestamps.map(function(ts) {
			return valMap.hasOwnProperty(ts) ? valMap[ts] : null;
		});

		var color = series_color[s] || '#228040';

		datasets.push({
			label: 'Temp.' + (s + 1) + ' (℃)',
			data: dataPoints,
			borderColor: color,
			backgroundColor: color,
			borderWidth: 2,
			tension: 0.3,
			pointRadius: 0,
			pointHoverRadius: 4,
			pointHoverBackgroundColor: color,
			pointHoverBorderColor: '#FFFFFF',
			pointHoverBorderWidth: 2,
			fill: false,
			spanGaps: true
		});
	}

	var ctx = canvas.getContext('2d');
	var newChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: displayLabels,
			datasets: datasets
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			interaction: {
				mode: 'index',
				intersect: false
			},
			plugins: {
				title: {
					display: true,
					text: titleText,
					color: '#1F2937',
					font: {
						size: 18,
						weight: 'bold',
						family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
					},
					padding: {
						top: 6,
						bottom: 14
					}
				},
				legend: {
					display: true,
					position: 'top',
					align: 'center',
					labels: {
						usePointStyle: true,
						pointStyle: 'line',
						boxWidth: 22,
						padding: 16,
						font: {
							size: 13,
							weight: '500',
							family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
						},
						color: '#374151'
					},
					onClick: function(e, legendItem, legend) {
						var index = legendItem.datasetIndex;
						var ci = legend.chart;
						var isVisible = ci.isDatasetVisible(index);
						ci.setDatasetVisibility(index, !isVisible);
						ci.update();

						// Synchronize corresponding checkbox state
						var chkPrefix = (canvasId === 'graph_sensor1') ? '#chk_occtrl' : '#chk_tempctrl';
						$(chkPrefix + (index + 1)).prop('checked', !isVisible);
					}
				},
				tooltip: {
					enabled: true,
					mode: 'index',
					intersect: false,
					backgroundColor: 'rgba(255, 255, 255, 0.96)',
					titleColor: '#1E293B',
					titleFont: {
						size: 13,
						weight: 'bold'
					},
					bodyColor: '#334155',
					bodyFont: {
						size: 12
					},
					borderColor: '#E2E8F0',
					borderWidth: 1,
					padding: 10,
					boxPadding: 4,
					usePointStyle: true,
					callbacks: {
						title: function(items) {
							if (!items || !items.length) return '';
							var dataIndex = items[0].dataIndex;
							return masterTimestamps[dataIndex] || items[0].label;
						},
						label: function(context) {
							var valStr = (context.parsed.y !== null && context.parsed.y !== undefined)
								? context.parsed.y.toFixed(1) + ' ℃'
								: '-';
							return ' ' + context.dataset.label + ': ' + valStr;
						}
					}
				}
			},
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date (MM/DD)',
						color: '#374151',
						font: {
							size: 14,
							weight: '600'
						},
						padding: { top: 8 }
					},
					ticks: {
						maxTicksLimit: 7,
						autoSkip: true,
						maxRotation: 0,
						minRotation: 0,
						color: '#4B5563',
						font: {
							size: 12
						}
					},
					grid: {
						color: '#F8FAFC'
					},
					border: {
						display: true,
						color: '#CBD5E1'
					}
				},
				y: {
					min: Min_Temperature,
					max: Max_Temperature,
					ticks: {
						stepSize: Chart_tickInterval,
						color: '#4B5563',
						font: {
							size: 12
						}
					},
					title: {
						display: true,
						text: 'Temperature (℃)',
						color: '#374151',
						font: {
							size: 14,
							weight: '600'
						},
						padding: { bottom: 8 }
					},
					grid: {
						color: '#F1F5F9'
					},
					border: {
						display: true,
						color: '#CBD5E1'
					}
				}
			}
		}
	});

	return newChart;
}

function plot_ch1(chartid, t1,t2,t3,t4,t5,t6,t7,t8, xaxis_format, xaxis_tickinterval){
	if (plot1 && typeof plot1.destroy === 'function') {
		plot1.destroy();
	}
	plot1 = buildSensorChart(chartid, '[Vent Controller (Temperature)] Data', [t1,t2,t3,t4,t5,t6,t7,t8], graph_selterm);
	return true;
}

function plot_ch2(chartid, t9,t10,t11,t12,t13,t14,t15,t16, xaxis_format, xaxis_tickinterval){
	if (plot2 && typeof plot2.destroy === 'function') {
		plot2.destroy();
	}
	plot2 = buildSensorChart(chartid, '[Temperature Controller (Temperature)] Data', [t9,t10,t11,t12,t13,t14,t15,t16], graph_selterm);
	return true;
};


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

function getVerifiedTemp(temp){
	if(temp>-40){
		return temp.toFixed(1);
	}else{
		return '';
	}
}


function SelectedRadio(radioname){
	var rn = document.getElementsByName(radioname);
	for(var i=0; i<rn.length; i++){
		if(rn[i].checked == true){
			if(radioname === "graph_term" || radioname === "term2"){
				if(rn[i].value === "month") return 1;
				if(rn[i].value === "week") return 2;
				if(rn[i].value === "oneday") return 3;
			}
			return (i+1);
		}
	}
	return 0;
};

function pad(n, width) {
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}	

function isEmpty(str){
	if(typeof str == "undefined" || str == null || str == ""){
		return true;
	}else{
		//return false ;
		for(var i=0; i<str.length; i++){
			if(str[i] != null) return false;
		}
	}
	return true;
}
