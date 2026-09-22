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

//'#131E3A'(검은색), '#FF2200'(붉은색), '#6688FF'(하늘색), '#EE55EE'(보라색), '#228040'(초록색), '#FFA000'(겨자색), '#4C00DD'(파랑색), '#FF7000'(주황색)
var series_color = ['#FF2200', '#4C00DD', '#228040', '#FF7000', '#EE55EE', '#FFA000', '#131E3A', '#6688FF', '#FF2200', '#4C00DD', '#228040', '#FF7000'];
//					 붉은색		 파랑색		초록색	   주황색	  보라색		 겨자색      검정색      하늘색      붉은색		  파랑색		 초록색      주황색	

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


	$.jqplot.config.enablePlugins = true;

});	//End of $(document).ready(function(){

$(window).resize(function(){
	plot1.replot();
	plot2.replot();
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
	mtable += "<div class='div_selectterm'>";	
	mtable += "<table width='100%' class='tbl_selectterm'>";
	mtable += "<tr>";
	mtable += "<td height='100px'>날짜 &nbsp;";
	mtable += "<input type='date' id='graph_startdate' value='"+formattedDate+"'> 부터 &nbsp;<br>";
	mtable += "</td>";
	mtable += "<td rowspan='2'>";
	mtable += "<input type='button' id='btn_viewgraph' value='그래프 보기'>";
	mtable += "</td>"
	mtable += "</tr>"
	
	mtable += "<tr><td>&nbsp;";	
	mtable += "<input type='radio' id='graph_term_month' name='graph_term' value='month'>";
	mtable += "<label for='graph_term_month'>1달 보기</label>";
	mtable += "<input type='radio' id='graph_term_week' name='graph_term' value='week' checked>";
	mtable += "<label for='graph_term_week'>1주 보기</label>";
	mtable += "<input type='radio' id='graph_term_day' name='graph_term' value='oneday'>";
	mtable += "<label for='graph_term_day'>1일 보기</label> &nbsp;";	
	mtable += "</td></tr>";
	mtable += "<tr><td colspan='2' style='font-size:6px;'>&nbsp;</td></tr>";
	mtable += "</table><br>";
	mtable += "</div>";
	/////////////////////////////////////////////////////////////////////////////////////////////////
	
	//그래프 영역 (개폐기 컨트롤러 온도 그래프)
	mtable += "<table width='100%' class='chart_area'>";
	mtable += "<tr>";
	for(i=1; i<=4; i++){
		mtable += "<td>";
		mtable += "<input type='checkbox' name='chk_occtrl"+i+"' value='chk_occtrl"+i+"' id='chk_occtrl"+i+"' class='check_sensor1'>";
		mtable += "<label for='chk_occtrl"+i+"'>CH"+i+"</label>";
		mtable += "</td>";
	}
	mtable += "</tr>";
	mtable += "<tr>";
	for(i=5; i<=8; i++){
		mtable += "<td>";
		mtable += "<input type='checkbox' name='chk_occtrl"+i+"' value='chk_occtrl"+i+"' id='chk_occtrl"+i+"' class='check_sensor1'>";
		mtable += "<label for='chk_occtrl"+i+"'>CH"+i+"</label>";
		mtable += "</td>";
	}
	mtable += "</tr>";
	mtable += "<tr>";
	mtable += "<td colspan='4'>";
	mtable += "<div id='graph_sensor1' style='width:100%; height:400px'></div>";
	mtable += "</td>";
	mtable += "</tr>";
	mtable += "</table><br>";
	
	//그래프 영역 (온도 컨트롤러 온도 그래프)
	mtable += "<table width='100%' class='chart_area'>";
	mtable += "<tr>";	
	for(i=1; i<=4; i++){
		mtable += "<td>";
		mtable += "<input type='checkbox' name='chk_tempctrl"+i+"' value='chk_tempctrl"+i+"' id='chk_tempctrl"+i+"' class='check_sensor2'>";
		mtable += "<label for='chk_tempctrl"+i+"'>CH"+i+"</label>";
		mtable += "</td>";
	}
	mtable += "<tr>";
	mtable += "<tr>";	
	for(i=5; i<=8; i++){
		mtable += "<td>";
		mtable += "<input type='checkbox' name='chk_tempctrl"+i+"' value='chk_tempctrl"+i+"' id='chk_tempctrl"+i+"' class='check_sensor2'>";
		mtable += "<label for='chk_tempctrl"+i+"'>CH"+i+"</label>";
		mtable += "</td>";
	}
	mtable += "<tr>";
	mtable += "<td></td>";
	mtable += "</tr>";

	mtable += "<tr>";
	mtable += "<td colspan='4'>";
	mtable += "<div id='graph_sensor2' style='width:100%; height:400px'></div>";
	mtable += "</td>";
	mtable += "</tr>";
	mtable += "</table><br>";
	
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
			plot1.series[i].show = false;
			if($("#chk_occtrl"+(i+1)).is(":checked")){
				plot1.series[i].show = true;
			}
		}
		plot1.replot();
	});

	$("input.check_sensor2").change(function(){
		for(var i=0; i<8; i++){
			plot2.series[i].show = false;
			if($("#chk_tempctrl"+(i+1)).is(":checked")){
				plot2.series[i].show = true;
			}
		}
		plot2.replot();
	});
	

	for(var i=1; i<=occtrlnum; i++){
		$("#chk_occtrl"+i).prop("checked", true);
	}
	for(var i=1; i<=tempctrlnum; i++){
		$("#chk_tempctrl"+i).prop("checked", true);
	}
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

	var mtable = "";

	
	// 날짜 선택
	mtable += "<div class='div_selectterm'>";	
	mtable += "<table width='100%' class='tbl_selectterm'>";
	mtable += "<tr><td colspain=3 style='font-size:12px;'>&nbsp;</td></tr>";
	mtable += "<tr>";
	mtable += "<td rowspan='2' width='13%'>";
	mtable += "검&nbsp;색<br>기&nbsp;간";
	mtable += "</td>";
	mtable += "<td width='47%'>";
	mtable += "<input type='date' id='dwload_startdate' value='"+formattedDate_end+"'> 부터";
	mtable += "</td>";
	mtable += "<td width='40%' rowspan='2'>";
	mtable += "<input type='button' id='btn_datadownload' value='데이타 다운로드'>";
	mtable += "</td>";
	mtable += "</tr>";

	mtable += "<tr>";
	mtable += "<td>";
	mtable += "<input type='date' id='dwload_enddate' value='"+formattedDate+"'> 까지";
	mtable += "</td>";
	mtable += "</tr>";

	mtable += "<tr>";
	mtable += "<td colspan='3' align='center'><br><p style='color:blue; font-size: 1.2em;'>데이타는 .xls 파일로 저장이 됩니다.</p>";
	mtable += "<p style='color:red; font-size: 0.8em;'>.xls 파일을 열 수 없는 모바일 장치에서는 데이타를 볼 수 없습니다.</p>";
	mtable += "</td>";
	mtable += "</tr>";
	mtable += "</table>";
	
	mtable += "</div>";


	$("#data_download_content").append(mtable);
	/////////////////////////////////////////////////////////////////////////////////////////////////

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
	
	// 날짜 선택
	mtable += "<div class='div_selectterm'>";	
	mtable += "<table width='100%' class='tbl_selectterm'>";
	mtable += "<tr'>";
	mtable += "<td height='100px' width='65%'>날짜 &nbsp;";
	mtable += "<input type='date' id='startdate2' value='"+formattedDate+"'> 부터 &nbsp;<br>";
	mtable += "</td>";
	mtable += "<td rowspan='2'>";
	mtable += "<input type='button' id='btn_pushsearch' value='푸시 알람 검색'>";
	mtable += "</td>"
	mtable += "</tr>"
	
	mtable += "<tr><td>";	
	mtable += "<input type='radio' id='term_month2' name='term2' value='month'>";
	mtable += "<label for='term_month2'>1달 보기</label>";
	mtable += "<input type='radio' id='term_week2' name='term2' value='week' checked>";
	mtable += "<label for='term_week2'>1주 보기</label>";
	mtable += "<input type='radio' id='term_day2' name='term2' value='oneday'>";
	mtable += "<label for='term_day2'>1일 보기</label>";
	mtable += "</td></tr>";
	mtable += "</table>";
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
		className: 'paginationjs-theme-green paginationjs-big',
		formatNavigator: '<%= rangeStart %>-<%= rangeEnd %> of <%= totalNumber %> items',
		callback: function (response, pagination) {
			//ajax success 에서 done(response)에 의해서 자동 호출됨
			//window.console && console.log(response, pagination);


			var dataHtml = "<table id='dataTable1' style='width:100%;'>";
			dataHtml += "<thead>";
			dataHtml += "<th width='30%;'>Date Time</th>";
			dataHtml += "<th width='20%;'>제 목</th>";
			dataHtml += "<th width='50%;'>내 용</th>";
			dataHtml += "</thead>";
			dataHtml += "<tbody>";
			for(var i=0; i<response.length; i++){
				dataHtml += "<tr>";
				dataHtml += "<td>" + response[i][0] + "</td>";
				dataHtml += "<td>" + response[i][1] + "</td>";
				dataHtml += "<td>" + response[i][2] + "</td>";
				dataHtml += "</tr>";
			}
			dataHtml += "</tbody>";
			dataHtml += "</table>";
			container1.prev().html(dataHtml);
		}
	};

	container1.pagination(options);
}


function draw_chartdata(startday, termtype){
	document.getElementById("btn_viewgraph").setAttribute("disabled","disabled");

	
	$.ajax({
		type: 'post',
		url: '/php/read_logdata.php',
		data : {"startdate":startday, "termtype":termtype},
		dataType: 'json',
		success: function(data){
			das_data = data.slice();
			document.getElementById("btn_viewgraph").removeAttribute("disabled");

			temp1 = das_data[0].slice();
			temp2 = das_data[1].slice();
			temp3 = das_data[2].slice();
			temp4 = das_data[3].slice();
			temp5 = das_data[4].slice();
			temp6 = das_data[5].slice();
			temp7 = das_data[6].slice();
			temp8 = das_data[7].slice();
			temp9 = das_data[8].slice();
			temp10 = das_data[9].slice();
			temp11 = das_data[10].slice();
			temp12 = das_data[11].slice();
			temp13 = das_data[12].slice();
			temp14 = das_data[13].slice();
			temp15 = das_data[14].slice();
			temp16 = das_data[15].slice();

			plot_ch1('graph_sensor1', temp1,temp2,temp3,temp4,temp5,temp6,temp7,temp8, formatString, tickInterval);
			plot_ch2('graph_sensor2', temp9,temp10,temp11,temp12,temp13,temp14,temp15,temp16, formatString, tickInterval);

			for(var i=0; i<8; i++){
				plot1.series[i].show = false;
				if($("#chk_occtrl"+(i+1)).is(":checked")){
					plot1.series[i].show = true;
				}
			}		
			plot1.replot();

			for(var i=0; i<8; i++){
				plot2.series[i].show = false;
				if($("#chk_tempctrl"+(i+1)).is(":checked")){
					plot2.series[i].show = true;
				}
			}		
			plot2.replot();
			
		},	//End of success: function(data){
		error: function (request, status, error) {
			document.getElementById("view_graph").removeAttribute("btn_viewgraph");
			//alert("error");
		}
	});	//End of $.ajax({
	
	
	return true;
};

function plot_ch1(chartid, t1,t2,t3,t4,t5,t6,t7,t8, xaxis_format, xaxis_tickinterval){
	//개폐기 컨트롤러 (온도) 그래프	
	if(plot1){plot1.destroy();};
	plot1 = $.jqplot (chartid, [t1,t2,t3,t4,t5,t6,t7,t8], {
		title: "[개폐기 컨트롤러 (온도)] 데이타",
		seriesDefaults: {
			rendererOptions: {
				smooth: true,
				animation: {
					show: false
				}
			},
			showMarker: false
		},
		//captureRightClick: true,		
		//markerOptions : style "circle", "filledCircle", "diamond", "filledDiamond", "square", "filledSquare"
		series: [
			{label: '온도1(℃)', color: series_color[0], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도2(℃)', color: series_color[1], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도3(℃)', color: series_color[2], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도4(℃)', color: series_color[3], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도5(℃)', color: series_color[4], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도6(℃)', color: series_color[5], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도7(℃)', color: series_color[6], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도8(℃)', color: series_color[7], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } }
		],
		grid: {
			background: 'rgba(255,255,250,1)',
			drawBorder: true,
			shadow: false,
			gridLineColor: '#BBBBBB',
			gridLineWidth: 0.5
        },
		legend: {
			show: true,
			renderer: $.jqplot.EnhancedLegendRenderer,
			rendererOptions: {numberColumns: 4, numberRows: 2},
			//rendererOptions: {numberColumns: 1},
			//placement: 'inside',
			//placement: 'outside',
			placement: 'outsideGrid',
			//rowSpacing: '2px',
			location: 'n',
			rowSpacing: '0px'
		},
		axes:{
			xaxis:{
				label: '날  짜 (년/월/일)',
				//renderer:$.jqplot.CategoryAxisRenderer,
				renderer:$.jqplot.DateAxisRenderer,
				rendererOptions: {
					tickRenderer:$.jqplot.CanvasAxisTickRenderer
				},
				tickOptions: {
					fontSize:'10pt',
					fontFamily:'Tahoma',
					//formatString: (seltype==3)? '%H:%M:%S' : '%Y-%m-%d'
					formatString: xaxis_format
					//angle: 30
				},
				tickInterval: xaxis_tickinterval
				//tickInterval: '1 days'
			},
			yaxis:{
				tickOptions:{
					//formatString:'%.1f'
					formatString:'%d'
				},
				label: 'Temperature (℃)',
				labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
				labelOptions:{
					fontSize: '18pt',
					angle: -90
				},
				min: Min_Temperature,
				max: Max_Temperature,
				//tickInterval: 20
				tickInterval: Chart_tickInterval
			}
		},
		cursor:{
			show: true,
			showTooltip: false,
			style: 'crosshair',
			tooltipLocation:'sw',
			//tooltipAxisGroups: [['xaxis', 'yaxis', 'y2axis', 'y3axis']],
			showHorizontalLine: true,
			showVerticalLine: true,
			zoom:true,
			looseZoom: true
		}
		,highlighter: {
			show: true,
			showMarker: true,
			sizeAdjust: 0,
			tooltipLocation: 'ne',
            tooltipContentEditor: function(str, seriesIndex, pointIndex, jqPlot) {

				// 1. 현재 포인트의 픽셀 좌표 가져오기
				var xPixel = plot1.series[seriesIndex].gridData[pointIndex][0];
				// 2. 차트 전체 너비의 절반 계산
				var halfWidth = plot1._width / 2;
				// 3. 툴팁 요소 선택 (jqPlot이 생성한 div)
				var $tooltip = $('.jqplot-highlighter-tooltip');

				if (xPixel < halfWidth) {
					// 차트 왼쪽 영역에 마우스가 있을 때 -> 툴팁을 오른쪽에 표시
					$tooltip.css({
						'transform': 'translate(10px, -5px)',	// 오른쪽으로 살짝 이동
						'left': 'auto'							// jqPlot이 계산한 기본값 유지 보조
					});
				} else {
					// 차트 오른쪽 영역에 마우스가 있을 때 -> 툴팁을 왼쪽에 표시
					$tooltip.css({
						'transform': 'translate(-100%, -5px)',	// 왼쪽으로 전체 이동
						'left': 'auto'							// jqPlot이 계산한 기본값 유지 보조
					});
				}

				var str = '<table class="jqplot-highlighter">';
					str += '<tr><td colspan=2>'+t1[pointIndex][0]+'<br><hr width="100%" color="#999"></td></tr>';
					str += '<tr><td>온도1:</td><td style="color:'+series_color[0]+';">'+getVerifiedTemp(t1[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도2:</td><td style="color:'+series_color[1]+';">'+getVerifiedTemp(t2[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도3:</td><td style="color:'+series_color[2]+';">'+getVerifiedTemp(t3[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도4:</td><td style="color:'+series_color[3]+';">'+getVerifiedTemp(t4[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도5:</td><td style="color:'+series_color[4]+';">'+getVerifiedTemp(t5[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도6:</td><td style="color:'+series_color[5]+';">'+getVerifiedTemp(t6[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도7:</td><td style="color:'+series_color[6]+';">'+getVerifiedTemp(t7[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도8:</td><td style="color:'+series_color[7]+';">'+getVerifiedTemp(t8[pointIndex][1])+'</td></tr>';
					str += '</table>';
                return (str);
            }
		}
		
	});
	return true;
};

function plot_ch2(chartid, t9,t10,t11,t12,t13,t14,t15,t16, xaxis_format, xaxis_tickinterval){
	//온도 컨트롤러 (온도) 그래프	
	if(plot2){plot2.destroy();};
	plot2 = $.jqplot (chartid, [t9,t10,t11,t12,t13,t14,t15,t16], {
		title: "[온도 컨트롤러 (온도)] 데이타",
		seriesDefaults: {
			rendererOptions: {
				smooth: true,
				animation: {
					show: false
				}
			},
			showMarker: false
		},
		//captureRightClick: true,		
		//markerOptions : style "circle", "filledCircle", "diamond", "filledDiamond", "square", "filledSquare"
		series: [
			{label: '온도1(℃)', color: series_color[0], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도2(℃)', color: series_color[1], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도3(℃)', color: series_color[2], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도4(℃)', color: series_color[3], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도5(℃)', color: series_color[4], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도6(℃)', color: series_color[5], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도7(℃)', color: series_color[6], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } },
			{label: '온도8(℃)', color: series_color[7], lineWidth:1, markerOptions: { size: 10, style:"filledCircle" } }
		],
		grid: {
			background: 'rgba(255,255,250,1)',
			drawBorder: true,
			shadow: false,
			gridLineColor: '#BBBBBB',
			gridLineWidth: 0.5
        },
		legend: {
			show: true,
			renderer: $.jqplot.EnhancedLegendRenderer,
			rendererOptions: {numberColumns: 4, numberRows: 2},
			//rendererOptions: {numberColumns: 1},
			//placement: 'inside',
			//placement: 'outside',
			placement: 'outsideGrid',
			//rowSpacing: '2px',
			location: 'n',
			rowSpacing: '0px'
		},
		axes:{
			xaxis:{
				label: '날  짜 (년/월/일)',
				//renderer:$.jqplot.CategoryAxisRenderer,
				renderer:$.jqplot.DateAxisRenderer,
				rendererOptions: {
					tickRenderer:$.jqplot.CanvasAxisTickRenderer
				},
				tickOptions: {
					fontSize:'10pt',
					fontFamily:'Tahoma',
					//formatString: (seltype==3)? '%H:%M:%S' : '%Y-%m-%d'
					formatString: xaxis_format
					//angle: 30
				},
				tickInterval: xaxis_tickinterval
				//tickInterval: '1 days'
			},
			yaxis:{
				tickOptions:{
					//formatString:'%.1f'
					formatString:'%d'
				},
				label: 'Temperature (℃)',
				labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
				labelOptions:{
					fontSize: '18pt',
					angle: -90
				},
				min: Min_Temperature,
				max: Max_Temperature,
				//tickInterval: 20
				tickInterval: Chart_tickInterval
			}
		},
		cursor:{
			show: true,
			showTooltip: false,
			style: 'crosshair',
			tooltipLocation:'sw',
			//tooltipAxisGroups: [['xaxis', 'yaxis', 'y2axis', 'y3axis']],
			showHorizontalLine: true,
			showVerticalLine: true,
			zoom:true,
			looseZoom: true
		}
		,highlighter: {
			show: true,
			showMarker: true,
			sizeAdjust: 0,
			tooltipLocation: 'ne',
            tooltipContentEditor: function(str, seriesIndex, pointIndex, jqPlot) {

				// 1. 현재 포인트의 픽셀 좌표 가져오기
				var xPixel = plot2.series[seriesIndex].gridData[pointIndex][0];
				// 2. 차트 전체 너비의 절반 계산
				var halfWidth = plot2._width / 2;
				// 3. 툴팁 요소 선택 (jqPlot이 생성한 div)
				var $tooltip = $('.jqplot-highlighter-tooltip');

				if (xPixel < halfWidth) {
					// 차트 왼쪽 영역에 마우스가 있을 때 -> 툴팁을 오른쪽에 표시
					$tooltip.css({
						'transform': 'translate(10px, -5px)',	// 오른쪽으로 살짝 이동
						'left': 'auto'							// jqPlot이 계산한 기본값 유지 보조
					});
				} else {
					// 차트 오른쪽 영역에 마우스가 있을 때 -> 툴팁을 왼쪽에 표시
					$tooltip.css({
						'transform': 'translate(-100%, -5px)',	// 왼쪽으로 전체 이동
						'left': 'auto'							// jqPlot이 계산한 기본값 유지 보조
					});
				}

				var str = '<table class="jqplot-highlighter">';
					str += '<tr><td colspan=2>'+t9[pointIndex][0]+'<br><hr width="100%" color="#999"></td></tr>';
					str += '<tr><td>온도1:</td><td style="color:'+series_color[0]+';">'+getVerifiedTemp(t9[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도2:</td><td style="color:'+series_color[1]+';">'+getVerifiedTemp(t10[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도3:</td><td style="color:'+series_color[2]+';">'+getVerifiedTemp(t11[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도4:</td><td style="color:'+series_color[3]+';">'+getVerifiedTemp(t12[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도5:</td><td style="color:'+series_color[4]+';">'+getVerifiedTemp(t13[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도6:</td><td style="color:'+series_color[5]+';">'+getVerifiedTemp(t14[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도7:</td><td style="color:'+series_color[6]+';">'+getVerifiedTemp(t15[pointIndex][1])+'</td></tr>';
					str += '<tr><td>온도8:</td><td style="color:'+series_color[7]+';">'+getVerifiedTemp(t16[pointIndex][1])+'</td></tr>';
					str += '</table>';
                return (str);
            }
		}
		
	});
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