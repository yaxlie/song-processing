

var file = "";


var file;

fetch('/input.wav.txt')
  .then(res => res.text())
  .then(data => file = data)

   
console.log(file);
parser = new DOMParser();

var midiFile = "";
fetch('input.xml')
  .then(response => response.text())
  .then(text => midiFile = text)
  .then(t => midiFile = parser.parseFromString(midiFile,"text/xml"));
  

var midiValues =[];
var fileIterator = -1;
var takeEveryOr = 10; 
var beginTimeOr = 0;
var endTimeOr = 6;
var time;
function transformMitiToArray(midi, beginTime,endTime){
	var output = [];
	var j = 0;
	while(midiFile.getElementsByTagName("BLE")[0].children[j] != null){
		this.midiValues.push(midi.getElementsByTagName("BLE")[0].children[j].children[3].textContent);
		output[j] = [];
		var obj = {
			y: calculateFreqFromMidi(midi.getElementsByTagName("BLE")[0].children[j].children[3].textContent)
		  , x: midi.getElementsByTagName("BLE")[0].children[j].children[0].textContent
			};
		if(obj.x > endTime){
			break;
		}
		if(obj.x > beginTime){	
			output[j].push(obj);
		}
		obj = {
			y: calculateFreqFromMidi(midi.getElementsByTagName("BLE")[0].children[j].children[3].textContent)
		  , x: parseFloat(midi.getElementsByTagName("BLE")[0].children[j].children[0].textContent) + parseFloat(midi.getElementsByTagName("BLE")[0].children[j].children[1].textContent)
			};
		output[j].push(obj);
		j = j + 1;
	}	
	return output;
}

function getData(time, value, beginTime, endTime){
	var j = 0;
	var data = [];
	var newTime = [];
	while(j < time.length){
		if(time[j] > beginTime && time[j] < endTime){
			var obj = {x: time[j], y: value[j]};
			data.push(obj);
			newTime.push(time[j]);
		}
		
		j = j + 1;
	}
	this.time = newTime;
	return data;
}

function filter(data, timelaps){
	var j = 0;
	var output = [];
	while(j < time.length){
		if(j % timelaps === 0){
			output.push(data[j]);
		}
		j++;
	}
	return output;
}

function getDataSet(label, midi){
	var data = [];
	var i = 0;
	while(i < midi.length){
		var obj = {data: midi[i], borderColor: "#ac2b2b",fill: false}
		data.push(obj);
		i = i + 1;
	}
	var obj = {data: label, pointStyle: "circle",borderColor: "#3e95cd",fill: false};
	data.push(obj);
	return data;
}

function generateDataSet(midiFileT, beginTime, endTime, file, takeEvery){
	var midi = transformMitiToArray(midiFileT, beginTime, endTime)
	var line = file.split(" ");
	
	var lineTemp = line.filter(function(li){
		if(li != null && li != "" && li != "\n"){
			return li;
		}
	});
	var i = -1;
	var time = lineTemp.filter(function(li){
		i = i + 1;
		if(i % 2 === 0){
			return li;
		}
	});
	i = -1;
	var value = lineTemp.filter(function(li){
		i = i + 1;
			if(i % 2 === 1){
			return li;
		}
	});
	var dat = getData(time, value, beginTime, endTime);
	console.log(getData(time, value, beginTime, endTime));
	//var dat2 = filter(dat,takeEvery);
	dat = filter(dat,takeEvery);
	time = filter(time,1);
	return(getDataSet(dat,midi));
}

//var dataset = generateDataSet(midiFile, beginTimeOr, endTimeOr, file, takeEveryOr);
var dataset = "";
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    labels: time,
	
    datasets: dataset
  },
    options: {
        showLines: true, // disable for all datasets
		events: ['click'],
		
		legend: {
            display: false
         }
	},
	scale: {    
		yAxes:[{
        ticks: {
            display: false
        }
		}]
    }
});
var activePoint = null;

var yInput = document.getElementById("edit-y");
var midib = document.getElementById("edit-midi-begin");
var midie = document.getElementById("edit-midi-end");
var midiv = document.getElementById("edit-midi-value");

var chartv = document.getElementById("chart-every");
var chartTimeb = document.getElementById("chart-time-begin");
var chartTimee = document.getElementById("chart-time-end");

var buttonApply = document.getElementById("apply-changes");
var overrideMidi = document.getElementById("override-midi");

chartTimeb.value = beginTimeOr;
chartTimee.value = endTimeOr;

function recalculateDateSet(){
	midiValues = [];
	//nie pytać działa...
	var dataset4 = generateDataSet(midiFile, parseFloat(chartTimeb.value), parseFloat(chartTimee.value), file, takeEveryOr);
	dataset = dataset4
	myChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    labels: time,
	
    datasets: dataset4
  },
    options: {
        showLines: true, // disable for all datasets
		events: ['click'],
		
		legend: {
            display: false
         }
	},
	scale: {    
		yAxes:[{
        ticks: {
            display: false
        }
		}]
    }
});
myChart.update();
}

function deleteMidi(datasetIndex){
	dataset.splice(datasetIndex, 1);
	midiValues.splice(datasetIndex , 1);

}

function deleteMidi(){
	if(activePoint){
		if(activePoint[0] != null){
			var datasetIndex = activePoint[0]._datasetIndex;
			dataset.splice(datasetIndex, 1);
			midiValues.splice(datasetIndex, 1);
			myChart.update();
			resetActivePoint();
		}
	}
}

function calculateFreqFromMidi(midiValue){
	if(midiValue >= 0 && midiValue <= 129)
	var val = ((midiValue-69)/12)
	return (Math.pow(2, val) * 440);
}

function appyMidiValue(){
	if(activePoint){
		if(activePoint[0] != null){
			if(midiv.value){
				var datasetIndex = activePoint[0]._datasetIndex;
				midiValues[datasetIndex] = parseFloat(midiv.value);
				var freq = calculateFreqFromMidi(parseFloat(midiv.value));
				dataset[datasetIndex].data[0].y = freq;
				dataset[datasetIndex].data[1].y = freq;
				myChart.update();
			}
		}
	}
}

function resetActivePoint(){
	if(activePoint && activePoint[0]){
		activePoint = null;
		midib.value = "";
		midie.value = "";
		midiv.value = "";
	}
}

function splitMidi(){
	if(activePoint && activePoint[0]){
		var datasetIndex = activePoint[0]._datasetIndex;
		var newMidib = (((parseFloat(midib.value))+ parseFloat(midie.value))/2)
		var lebel = [
		{y: dataset[datasetIndex].data[0].y ,x: newMidib},
		{y: dataset[datasetIndex].data[1].y ,x: dataset[datasetIndex].data[1].x} 
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset[datasetIndex].data[1].x = newMidib;
		dataset.splice( (datasetIndex +1), 0, obj);
		midiValues.splice( (datasetIndex +1), 0, midiValues[datasetIndex]);
		myChart.update();
		resetActivePoint();
		
	}
}
function addMidiBefore(){
	if(activePoint && activePoint[0]){
		var datasetIndex = activePoint[0]._datasetIndex;
		var lebel = [
		{y: dataset[datasetIndex].data[0].y ,x: dataset[datasetIndex].data[0].x - 1},
		{y: dataset[datasetIndex].data[0].y ,x: dataset[datasetIndex].data[0].x}
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset.splice( (datasetIndex ), 0, obj);
		midiValues.splice( (datasetIndex ), 0, midiValues[datasetIndex]);
		myChart.update();
	}
}

function addMidiAfter(){
	if(activePoint && activePoint[0]){
		var datasetIndex = activePoint[0]._datasetIndex;
		var lebel = [
		{y: dataset[datasetIndex].data[0].y ,x: dataset[datasetIndex].data[1].x},
		{y: dataset[datasetIndex].data[0].y ,x: dataset[datasetIndex].data[1].x + 1}
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset.splice( (datasetIndex + 1), 0, obj);
		midiValues.splice( (datasetIndex + 1), 0, midiValues[datasetIndex]);
		myChart.update();
	}
}

function midiTimeValueChanger(datasetIndex){
	var i = 1;
	while((datasetIndex - i) >= 0){	
		if(parseFloat(dataset[datasetIndex - i].data[0].x) > parseFloat(midib.value)){
			dataset.splice(parseInt(datasetIndex - i),1);
		}else if(parseFloat(dataset[datasetIndex - i].data[1].x) > parseFloat(midib.value)){
			dataset[datasetIndex - i].data[1].x = parseFloat(midib.value);
		}else{
			break;
		}
		i = i + 1;
	}
	console.log(datasetIndex);
	while((datasetIndex + 1) < parseInt(dataset.length)){
		if(!dataset[datasetIndex + 1].data[0]){
			break;
		}
		if(parseFloat(dataset[parseInt(datasetIndex + 1)].data[0].x) < parseFloat(midie.value)){
			dataset.splice(parseInt(datasetIndex + 1),1);
		}else if(parseFloat(dataset[datasetIndex + 1].data[1].x) < parseFloat(midie.value)){
			dataset[datasetIndex + 1].data[1].x = parseFloat(midie.value);
			break;
		}else{
			break;
		}
	}
	
}

function applyMidiTime(){
	if(activePoint){
		if(midib.value && midie.value){
			if(parseFloat(midib.value) >= 0 && parseFloat(midie.value) >= 0){
				if(parseFloat(midib.value) < (parseFloat(midie.value) - 0.01)){
					var datasetIndex = activePoint[0]._datasetIndex;
					dataset[datasetIndex].data[0].x = parseFloat(midib.value);
					dataset[datasetIndex].data[1].x = parseFloat(midie.value);
					if(overrideMidi.checked){
						midiTimeValueChanger(datasetIndex);
					}
					myChart.update();
				}
			}
		}
	}
}

ctx.onclick = function(evt){
	activePoint = myChart.getElementAtEvent(evt);
	var activePoints = myChart.getElementsAtEvent(evt);
	if(activePoint[0] != null){
		var datasetIndex = activePoint[0]._datasetIndex;
		var index = activePoint[0]._index;
		yInput.value = dataset[datasetIndex].data[index].y;
		if(activePoints[1]){
			midiv.value = midiValues[datasetIndex];
			midib.value = dataset[datasetIndex].data[0].x;
			midie.value = dataset[datasetIndex].data[1].x;
		}else{
			midib.value = "";
			midie.value = "";
		}
	}
	console.log("dupa");
};

function playMidi(){

time = 0;
var ij = 0;
while ( ij < dataset.length - 2){
	time = parseFloat(dataset[ij].data[0].x);
	var audioContext = new AudioContext();
	var o = audioContext.createOscillator();
	console.log(dataset.length);
	o.frequency.setTargetAtTime(dataset[ij].data[1].y, audioContext.currentTime, 0);
	o.connect(audioContext.destination);
	o.start(time);
	console.log(parseFloat(dataset[ij].data[1].x) - parseFloat(dataset[ij].data[0].x));
	time = parseFloat(dataset[ij].data[1].x)
	console.log(time);
	o.stop(time);
	ij++;
	console.log("ok");
}
}