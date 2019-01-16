
var rootElement = "BLE";
var file = "";


/*fetch('/input.wav.txt')
  .then(res => res.text())
  .then(data => file = data)*/

   
console.log(file);
parser = new DOMParser();

var midiFile = "";
/*fetch('input.xml')
  .then(response => response.text())
  .then(text => midiFile = text)
  .then(t => midiFile = parser.parseFromString(midiFile,"text/xml"));
*/  

var midiValues = [];
var midiValuesNotes = []
var fileIterator = -1;
var takeEveryOr = 10; 
var beginTimeOr = 0;
var endTimeOr = 0;
var chartCutConst = 7;
var time;
var pause = false;
var play = false;
var audioContext = new AudioContext();
var currentPlayingIdx = -1;
var midiData = [];

function transformMitiToArray(midi, beginTime,endTime){
	var output = [];
	var j = 0;
	midiValuesNotes = [];
	while(midiFile.getElementsByTagName(rootElement)[0].children[j] != null){
		this.midiValues.push(midi.getElementsByTagName(rootElement)[0].children[j].children[3].textContent);
		output[j] = [];
		var obj = {
			y: calculateFreqFromMidi(midi.getElementsByTagName(rootElement)[0].children[j].children[3].textContent)
		  , x: midi.getElementsByTagName(rootElement)[0].children[j].children[0].textContent
			};
		if(obj.x > endTime){
			break;
		}
		if(obj.x > beginTime){	
			midiValuesNotes.push(midi.getElementsByTagName(rootElement)[0].children[j].children[3].textContent);
			output[j].push(obj);
		
			obj = {
				y: calculateFreqFromMidi(midi.getElementsByTagName(rootElement)[0].children[j].children[3].textContent)
			  , x: parseFloat(midi.getElementsByTagName(rootElement)[0].children[j].children[0].textContent) + parseFloat(midi.getElementsByTagName("BLE")[0].children[j].children[1].textContent)
				};
			output[j].push(obj);
		}
		j = j + 1;
	}	
	console.log(midiValues);
	console.log(midiValuesNotes);
	return output;
}

function getData(time, value, beginTime, endTime){
	var j = 0;
	var data = [];
	var dataTemp = [];
	var newTime = [];
	while(j < time.length){
		if(time[j] > beginTime && time[j] < endTime){
			var obj = {x: time[j], y: value[j]};
			dataTemp.push(obj);
			newTime.push(time[j]);
			if(((value[j] - value[j+1]) > chartCutConst) || ((value[j] - value[j+1]) < -chartCutConst)){
				data.push(dataTemp);
				dataTemp = [];
			}
		}
		
		j = j + 1;
	}
	if(!(dataTemp === [])){
		data.push(dataTemp)
	}
	this.time = newTime;
	console.log(data[1]);
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
	console.log(midi);
	console.log(label);
	var data = [];
	midiData = [];
	var i = 0;
	while(i < midi.length){
		var obj = {data: midi[i], borderColor: "#ac2b2b",fill: false}
		data.push(obj);
		midiData.push(obj);
		i = i + 1;
	}
	i = 0;
	console.log(midiData)
	while(i < label.length){
		if(label[i].length > 10){
			var obj = {data: label[i], radius:0, borderColor: "#3e95cd",fill: false};
			data.push(obj);
		}
		i = i + 1;
	}
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
	console.log(dat);
	//var dat2 = filter(dat,takeEvery);
	//dat = filter(dat,takeEvery);
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
var cutChart = document.getElementById("override-midi");
chartTimeb.value = beginTimeOr;
chartTimee.value = endTimeOr;



function recalculateDateSet(){
	midiValues = [];
	//nie pytać działa...
	var dataset4 = generateDataSet(midiFile, parseFloat(chartTimeb.value), parseFloat(chartTimee.value), file, takeEveryOr);
	console.log(dataset4);
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
updateNotesBar();
}

function updateNotesBar(){
	var notesBar = document.getElementById("notes-bar");
	while (notesBar.firstChild) {
		notesBar.removeChild(notesBar.firstChild);
	}

	for(var i=0; i<dataset.length-1; i++){
		if(midiValuesNotes[i] != null){
			notesBar.innerHTML += '<b style="color:white"> ' + midiValuesNotes[i] +' </b>';
		}
	}
}

function pointNote(id){
	console.log(id);
	var notesBar = document.getElementById("notes-bar");
	if(id>0){
		var prevNote = notesBar.childNodes[id-1];
		prevNote.style["color"] = "white";
	}
	var newNote = notesBar.childNodes[id];
	if(newNote != null){
		newNote.style["color"] = "red";
	}
}

function deleteMidi(datasetIndex){
	dataset.splice(datasetIndex, 1);
	midiValues.splice(datasetIndex , 1);
	updateNotesBar()
	

}

function deleteMidi(){
	if(activePoint){
		if(activePoint[0] != null){
			var datasetIndex = activePoint[0]._datasetIndex;
			dataset.splice(datasetIndex, 1);
			midiValues.splice(datasetIndex, 1);
			myChart.update();
			resetActivePoint();
			updateNotesBar()
		}
	}
}

function calculateFreqFromMidi(midiValue){
	if(midiValue >= 0 && midiValue <= 129)
	var val = ((midiValue-69)/12)
	return (Math.pow(2, val) * 440);
}


function appyMidiValue(toneChange=0){
	if(activePoint){
		if(activePoint[0] != null){
			if(midiv.value){
				midiv.value = +midiv.value + toneChange;
				var datasetIndex = activePoint[0]._datasetIndex;
				midiValues[datasetIndex] = parseFloat(midiv.value);
				var freq = calculateFreqFromMidi(parseFloat(midiv.value));
				dataset[datasetIndex].data[0].y = freq;
				dataset[datasetIndex].data[1].y = freq;
				myChart.update();
				updateNotesBar()
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
		updateNotesBar()
		
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
		updateNotesBar()
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
		updateNotesBar()
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
	console.log(myChart.data)
	activePoint = myChart.getElementAtEvent(evt);
	var activePoints = myChart.getElementsAtEvent(evt);
	if(activePoint[0] != null){
		console.log(activePoint[0]._datasetIndex);
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
};

function stopMidi(){
	pause = false;
	play = false;
	var button = document.getElementById("play-button").src = "img/play.png";
	audioContext.close();
	var notesBar = document.getElementById("notes-bar");
	for(var i=0; i<notesBar.childNodes.length; i++){
		notesBar.childNodes[i].style["color"] = "white";
	}
}

function playMidi(){

	// Odtwarzanie jest zapauzowane 
	if(play && pause) {
	    audioContext.resume().then(function() {
	    	pause = false;
	      	//audioChecker(1000);
	    }); 
	}

	// Nagranie jest odtwarzane, chcemy dać pauzę
	else if(play && !pause){
		pause = true;
	  	audioContext.suspend().then(function() {
      		button.src = "img/resume.png";
    	});
	}

	// Nagranie jest puste. Zakończyło się, lub nie było jeszcze włączane.
	else if(!play && !pause)
	{
		currentPlayingIdx = 0;
		pointNote(0);
		console.log(midiData);
		button = document.getElementById("play-button");
		audioContext = new AudioContext();
		time = 0;
		var i = 0;
		var id = 0;
		var maxI = midiData.length - 1;
			while ((i < maxI) && !pause){
				if(midiData[i] && midiData[i].data && midiData[i].data[0]){
					time = parseFloat(midiData[i].data[0].x);
					var o = audioContext.createOscillator();
					o.frequency.setTargetAtTime(midiData[i].data[1].y, audioContext.currentTime, 0);
					o.connect(audioContext.destination);
					o.start(time);
					//console.log(parseFloat(dataset[ij].data[1].x) - parseFloat(dataset[ij].data[0].x));
					time = parseFloat(midiData[i].data[1].x)
					//console.log(time);
					o.stop(time);

					o.onended = function() {
							id += 1;
							button.src = button.src.split("/").pop() === "pause.png"? "img/pause2.png" : "img/pause.png";
							pointNote(id);
						}
				}
				i++;

				if(i===maxI){
					o.onended = function() {
						id += 1;
						play = false;
						pause = false;
						button = document.getElementById("play-button");
						button.src = "img/play.png";
						currentPlayingIdx = -1;
						pointNote(id);
					}
				}
				
			}
			play = !play;
			//audioChecker(1000);
	}
}

// function timer(ms) {
//  return new Promise(res => setTimeout(res, ms));
// }

// // Głównie do 
// async function audioChecker (delay) {
// 	var even=true;
// 	button = document.getElementById("play-button");
//   	while (play && !pause) {
// 	    var icon = even? "img/pause.png" : "img/pause2.png";
// 		button.src = icon;
// 		even=!even;
// 	    await timer(delay);
// }

function saveChanges(){
	console.log(midiFile);
	var j = 0;
	while(midiFile.getElementsByTagName(rootElement)[0].children[j] != null){
		
		if(parseFloat(midiFile.getElementsByTagName(rootElement)[0].children[j].children[0].textContent) > parseFloat(chartTimeb.value) && parseFloat(midiFile.getElementsByTagName(rootElement)[0].children[j].children[0].textContent) < parseFloat(chartTimee.value)){
			if(dataset && dataset[j] && dataset[j].data && dataset[j].data[0] && dataset[j].data[0].x){
				midiFile.getElementsByTagName(rootElement)[0].children[j].children[0].textContent = parseFloat(dataset[j].data[0].x);
				midiFile.getElementsByTagName(rootElement)[0].children[j].children[1].textContent =  parseFloat(dataset[j].data[1].x) - parseFloat(dataset[j].data[0].x);
				midiFile.getElementsByTagName(rootElement)[0].children[j].children[3].textContent =  midiValues[j];
			}
		}
		j = j + 1;
	}
	myChart.update();
	updateNotesBar()
	
}

function saveToFile(){
	console.log(new XMLSerializer().serializeToString(midiFile));(new XMLSerializer()).serializeToString(midiFile);
	var file = new Blob([new XMLSerializer().serializeToString(midiFile)], {type: "text/xml"});
	saveAs(file,"test.xml");
}

function scalePlus(){
	if (parseFloat(chartTimeb.value) > 0.5){
		chartTimeb.value = parseFloat(chartTimeb.value) - 0.5;
		chartTimee.value = parseFloat(chartTimee.value) + 0.5;
	}else{
		chartTimeb.value = 0;
		chartTimee.value = parseFloat(chartTimee.value) + 1;
	}
	recalculateDateSet()
}

function scaleMinus(){
	chartTimeb.value = parseFloat(chartTimeb.value) + 0.5;
	chartTimee.value = parseFloat(chartTimee.value) - 0.5;
	recalculateDateSet()
}

function goRight(){
	var newTimeb = chartTimeb.value;
	var newTimee = chartTimee.value;
	chartTimeb.value = newTimee;
	chartTimee.value = parseFloat(newTimee) + (parseFloat(newTimee) - parseFloat(newTimeb));
	recalculateDateSet()
}

function goLeft(){
	var newTimeb = chartTimeb.value;
	var newTimee = chartTimee.value;
	if((parseFloat(newTimeb) + parseFloat(newTimeb - newTimee)) > 0){
		chartTimee.value = newTimeb;
		chartTimeb.value = parseFloat(newTimeb) + (parseFloat(newTimeb) - parseFloat(newTimee));
		recalculateDateSet();
	}else{
		chartTimeb.value = 0;
		chartTimee.value = parseFloat(newTimee) - parseFloat(newTimeb);
		recalculateDateSet();
	}
}

function nextMidi(){ // TODO
	if(activePoint == null || activePoint[0] == null){
		var datasetIndex = 0;
		var index = 0;
		yInput.value = dataset[datasetIndex].data[index].y;
			midiv.value = midiValues[datasetIndex];
			midib.value = dataset[datasetIndex].data[0].x;
			midie.value = dataset[datasetIndex].data[1].x;
	}else{
		if(dataset[parseInt(activePoint[0]._datasetIndex) + 1].data[0] != null){
			activePoint[0]._datasetIndex = parseInt(activePoint[0]._datasetIndex) + 1;
			var datasetIndex = activePoint[0]._datasetIndex
			var index = 0
			yInput.value = dataset[datasetIndex].data[index].y;
				midiv.value = midiValues[datasetIndex];
				midib.value = dataset[datasetIndex].data[0].x;
				midie.value = dataset[datasetIndex].data[1].x;
		}
	}
}
function prevMidi(){ // TODO
	if(activePoint == null || activePoint[0] == null){
		var datasetIndex = 0;
		var index = 0;
		yInput.value = dataset[datasetIndex].data[index].y;
			midiv.value = midiValues[datasetIndex];
			midib.value = dataset[datasetIndex].data[0].x;
			midie.value = dataset[datasetIndex].data[1].x;
	}else{
		if(activePoint[0]._datasetIndex > 0){
			activePoint[0]._datasetIndex = parseInt(activePoint[0]._datasetIndex) - 1
			var datasetIndex = activePoint[0]._datasetIndex
			var index = 0
			yInput.value = dataset[datasetIndex].data[index].y;
				midiv.value = midiValues[datasetIndex];
				midib.value = dataset[datasetIndex].data[0].x;
				midie.value = dataset[datasetIndex].data[1].x;
		}
	}
}


//Section to drag and drop files
function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	if(evt.dataTransfer.files[0].type === 'text/xml'){
		var f = evt.dataTransfer.files[0],
			reader = new FileReader();
		reader.onload = function(event) {
			var res = event.target.result;
			midiFile = parser.parseFromString(res,"text/xml");
			start();
			document.getElementById("input-xml").remove();
		};
		reader.readAsText(f);
	}else if(evt.dataTransfer.files[0].type === 'text/plain'){
		var f = evt.dataTransfer.files[0],
			reader = new FileReader();
		reader.onload = function(event) {
			file = event.target.result;
			start();
			document.getElementById("input-plane").remove();
		};
		reader.readAsText(f);
		start();
	}
	
}

function start(){
	if(file != "" && midiFile != ""){
		chartTimee.value = 10;
		recalculateDateSet();
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

// Setup the dnd listeners.
var dropZone = document.getElementById('myChart');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);