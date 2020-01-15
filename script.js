var AccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZlZDVlZGE0ZDkzYWE4YWI1Y2IxMWRkOTMyYzc1YmRlNzg4NjhiYjE5ZDYzNGQ3Njk5ODE0Mzk2ODBiOGU1NzBkYzJkZTc1MTZiODA3MzQ4In0.eyJhdWQiOiIyIiwianRpIjoiZmVkNWVkYTRkOTNhYThhYjVjYjExZGQ5MzJjNzViZGU3ODg2OGJiMTlkNjM0ZDc2OTk4MTQzOTY4MGI4ZTU3MGRjMmRlNzUxNmI4MDczNDgiLCJpYXQiOjE1NzYwNzU3NzQsIm5iZiI6MTU3NjA3NTc3NCwiZXhwIjoxNjA3Njk4MTc0LCJzdWIiOiIyMTQiLCJzY29wZXMiOltdfQ.p2mItMF5X6RcXG17Votue9IZKi8Y4DLCmTEF16kdyXzd5hyCibXTFAzDS7IDYrG8UtSG0dN-M4OjE17lIflVxtPe5R3vu3tJpxp4UhD_7RnHVSYhNnEYDwZeYfU5cym9eaAaG7na2Ek9oJ-IDnZ8Qc8azpu6SdB37-OrVOrahr1-ZR_JvhtHnRPQAfaCOC9RIS69k2qSAIZoU0s4qDoBqOIxguoGqOXJ81sy17hktLDkdHM_L_eIgeDKVoYJpqtXKvpGMSs9M-DMX2Bx3Ihl43XK3BYkj1JeM7_NiqQ6bNFFf7-JA1mmhKxzG2ZbkgzVkCyjnqD6v81eh9Hl3Yu4t8q31C1j6EQ8suFSwHKadbnUH3pOZOT3x-qjA1p96WLnxrQmq1WNk6ACmLmv8bPLAGIPAmhnJuQTGqBM4xYoSJr3jSwrKr60v6KMm0p6eo7tKCYdTA1nK2waQ2IAo2-62emGWJ1c_3wI2ed1Q8NQvD-KAp1uddCT3QqMxWul5i21BFV94LNYOyv0CpgUb8qM4_1yDLWhzgzIHYA0l6ibnh_wo7UpDNW9R4ltTyo_Bp-3TCKfnQh1Sn2JzZnKJ13kL0k8i3fpysS5_F2VFjS7MoC6y6DKLjx0eGDLDR179sinyo7H4M2LMGWI1Io3DW6CPaKEu5sUzuIaKqlPPeEhMnQ";
var macaddr = "?macaddr=" + "aa4ce564";
var today_data;
var stepsEveryHour = [];
var cal,  battery_remain;
var uluru = [];
var d = new Date();
var m = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ]
var options = {
  useEasing : true,
  useGrouping : true,
  separator : ',',
  decimal: '.',
  prefix : '',
  suffix : ''
  };
var urlkeyw = location.hash;
var date;
if(urlkeyw == "#demo"){
  date = "2020-1-13";
} else if(urlkeyw.length == 7){
  date = "20"+urlkeyw.slice(1, 3)+"-"+urlkeyw.slice(3, 5)+"-"+urlkeyw.slice(5, 7);
} else{
  date = d.getFullYear()+"-"+(m[d.getMonth()])+"-"+d.getDate();
}
document.getElementById("lastupdate").innerHTML = date;
function getData(date){
  $.ajax({
    type: "POST",
    url: "https://campus.kits.tw/ICN_API" + macaddr + "&date_filter=" + date + " 00:00:00" + "+-+" + date + " 23:59:59",
    dataType: "json",
    async: false,
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + AccessToken
    },
    success: function(response) {
      today_data = response;
      cal = 0;
      data2Steps();
      for(var i=0; i<24; i++){
        stepsEveryHour[i] = parseInt(stepsEveryHour[i]);
      }
      updateSteps();
      updateCal();
      updateHour();
      updateBat();
    },
    error: function(jqXHR) {
      if(jqXHR.status == '200')
        alert("API calling error: macaddr or url format error!");
      else
        alert("API is sleeping !");
    }
  });
  return "successful";
};

function data2Steps(){
  //frame cnt
  var frame_cnt = 1;
  var last_frame_cnt = 0;
  
  var flag = false;
  var lastsec = 0;
  var lastmin = 0;
  var lasttime = 0;
  
	for(var i = 0; i < 24; i++){//clear the array
		stepsEveryHour[i] = 0;
	}
	for(var i = 0; i < today_data.length; i++){//iterate all elements in data
    
     // frame_cnt++
    frame_cnt++;
    last_frame_cnt++;
    
    // get time
    var hour = parseInt(today_data[i]['created_at'].slice(11, 13)); 
    var min = parseInt(today_data[i]['created_at'].slice(14, 16)); 
    var sec = parseInt(today_data[i]['created_at'].slice(17, 19));
    
    // get vibration in three different directions
    var x = Math.pow(today_data[i]['acc_x'], 2);
    var y = Math.pow(today_data[i]['acc_y'], 2);
    var z = Math.pow(today_data[i]['acc_z'], 2);
    // compute vibration
    var vibrate = Math.sqrt(x+y+z);
     
    if(min < lastmin) min += 60;
    var time = min * 100 + sec;
   
    
	if(today_data[i]['acc_x'] != null){
      if(time - lasttime > 24) flag = false;
      // if it has been vibrated in 24 seconds we assume that the person was      
      // walking
      if(flag == true && time- lasttime < 24) {
          if(time - lasttime > 10 && frame_cnt - last_frame_cnt == 1) continue;
          var steps;
          if(vibrate < 1) {
            steps = (time - lasttime) * 2; // walking 
            cal += steps*0.042;
            
          } 
          else if(vibrate < 1.8) {
            steps = (time - lasttime) * 2.5; // slow run
            cal += steps*0.0615;
          } 
          else {
            steps = (time - lasttime) * 3; // fast run
            cal += steps*0.0762;
          } 
          stepsEveryHour[hour-1]+=steps;   
      }
    
      // deal with lastmin lasttime 
      if(min >= 60) lastmin = min - 60;
      else lastmin = min;
      if(time > 6000) lasttime = time - 6000;
      else lasttime = time;
			flag = true;  // set flag to true
		} 
    else {
      // didn't vibrate
      if(time > 6000) lasttime = time - 6000;
      else lasttime = time;
      if(min >= 60) lastmin = min - 60;
      else lastmin = min;
    }
  }
};


function updateSteps(){
  var step = 0;
  for(var i = 0; i < 24; i++){
    step += stepsEveryHour[i];
  }
  
  var demo = new CountUp("stepnum", 0, step, 0, 1.5, options);
  demo.start();
  var ctx = document.getElementById("stepchart");
  var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [step, 10000-step],
        borderWidth: 10,
        backgroundColor: 'rgba(0, 0, 0, 0)', 
        borderColor: ['rgba(75, 142,  222, 0.8)', 'rgba(0, 0, 0, 0)'],  
      }],
    },
  options: {
    cutoutPercentage: 100,
    animation: {
      duration: 1500
    }
  }
});
};


function updateCal(){
  var demo = new CountUp("calnum", 0, cal, 0, 1.5, options);
  demo.start();
}



function updateHour() {
  var ctx = document.getElementById("hourchart");
  var hour = []
  for(var i = 1; i <= 24; i++){
    if(!(i %3))
      hour.push(String(i));
    else
      hour.push(' ');
  }
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hour,
        datasets: [ {
          label: '本日步數',
          data: stepsEveryHour,
          backgroundColor:  'rgba(75, 142,  222, 0.2)',
          borderColor: 'rgb(75, 142,  222)',
          borderWidth: 1,
          hoverBorderWidth: 2,
        }]
      },
      options: {
        legend: {
          display: false,
        },
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
              //display: false
            },
            gridLines: { //網格
              color: "rgba(0, 0, 0, 0)"
          }
          }]
        ,
        xAxes: [{
          gridLines: { //網格
          color: "rgba(0, 0, 0, 0)",
        }}],
      }
      }
    });
};

function updateBat() {
  var volt, i;
  for (i = today_data.length-1;today_data[i].data == null;i--);
  volt = today_data[i].data*0.0069;
  var temp = (volt-3.3)/(4-3.3);
  if (temp > 1) battery_remain = 100;
  else battery_remain = Math.round(temp*100);
  
  var demo = new CountUp("batnum", 0, battery_remain, 0, 1.5, options);
  demo.start();
}

function setupMap(){
  for(var i = 0; i < today_data.length; i++){
    if(today_data[i]['lat'] != null){
      uluru.push({lat: parseFloat(today_data[i]['lat']), lng: parseFloat(today_data[i]['lng'])});
    }
  }

  var pos = {lat: 0.0, lng: 0.0};
  for(var i = 0; i < uluru.length; i++){
    pos['lat'] += uluru[i]['lat'];
    pos['lng'] += uluru[i]['lng'];
  }
  pos['lat'] /= uluru.length;
  pos['lng'] /= uluru.length;
  var map = new google.maps.Map(document.getElementById('mapcontainer'), {
    zoom: 16,
    center: pos,
    mapTypeControl: false,
    streetViewControl: false,
    styles: (d.getHours() > 16) ? night : []
  });
  for(var i = 0; i < uluru.length; i++){
    var marker = new google.maps.Marker({
      position: uluru[i],
      map: map,
      animation: (i == uluru.length-1) ? google.maps.Animation.BOUNCE : null
    });
  }
  var polylinePath = new google.maps.Polyline({
    map: map, 
    path: uluru,
    geodesic: true,
    strokeColor: 'rgb(75, 142,  222)',
    strokeOpacity: 0.8,
    strokeWeight: 10,
  });
}

function initHere(){
  $( document ).ready(function() {
    //console.log("boom");
    getData(date);
    setTimeout(function(){
      setupMap();
    },1000);
});
};

initHere();


var night = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
];