var contentUrl = 'https://raw.githubusercontent.com/Fehu4/Kik/master/TP0052B_01.mp3';
var root=contentUrl.split("/")
var rootEl=root[root.length-1]
var rootElement = "Song_" + rootEl.replace(".mp3","")
console.log(rootElement)
file = "";
midiFile = "";

var fileTXTAddr=contentUrl.replace(".mp3",".txt")
var fileXMLAddr=contentUrl.replace(".mp3",".xml")
var fileMP3Addr=contentUrl;
   
fetch(fileTXTAddr).then(function(dogBiscuits) {
  dogBiscuits.text().then(function(text) {
	  
    file = text;
	console.log(file);
	start();
  });
});
   
console.log(file);
parser = new DOMParser();

fetch(fileXMLAddr).then(function(dogBiscuits) {
  dogBiscuits.text().then(function(text) {
	  
    midiFile = text;
	midiFile = parser.parseFromString(midiFile,"text/xml")
	console.log(midiFile);
	start();
  });
});

var notes = [];
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
var selectedValue = 0;
var redColor = "#ac2b2b"
var orangeColor = "#ff9933"

function transformMitiToArray(midi, beginTime,endTime){
	var output = [];
	var j = 0;
	notes = [];
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
			notes.push(midi.getElementsByTagName(rootElement)[0].children[j].children[4].textContent);
			output[j].push(obj);
		
			obj = {
				y: calculateFreqFromMidi(midi.getElementsByTagName(rootElement)[0].children[j].children[3].textContent)
			  , x: parseFloat(midi.getElementsByTagName(rootElement)[0].children[j].children[0].textContent) + parseFloat(midi.getElementsByTagName(rootElement)[0].children[j].children[1].textContent)
				};
			output[j].push(obj);
		}
		j = j + 1;
	}	
	// console.log(notes);
	// console.log(midiValues);
	// console.log(midiValuesNotes);
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
	// console.log(data);
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
	// console.log(midi);
	// console.log(label);
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
	// console.log(midiData)
	while(i < label.length){
		if(label[i].length > 10){
			var obj = {data: label[i], radius:0, borderColor: "#3e95cd",fill: false};
			data.push(obj);
		}
		i = i + 1;
	}
	// console.log(data);
	return data;
}

function generateDataSet(midiFileT, beginTime, endTime, file, takeEvery){
	var midi = transformMitiToArray(midiFileT, beginTime, endTime)
	file = file.replace(/\n/ig, '').replace( /\s\s+/g, ' ' );
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
	time = filter(time,1);
	return(getDataSet(dat,midi));
}

//var dataset = generateDataSet(midiFile, beginTimeOr, endTimeOr, file, takeEveryOr);
var dataset = "";
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
	showTooltips: false,
  type: 'scatter',
  data: {
    labels: time,
	
    datasets: dataset
  },
    options: {
           
        showLines: true, // disable for all datasets
		events: [],
		
		legend: {
            display: false
         },
		    
	   tooltips: {
		  displayColors: false,
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
// console.log(myChart);
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
	//nie pytac dziala...
	var dataset4 = generateDataSet(midiFile, parseFloat(chartTimeb.value), parseFloat(chartTimee.value), file, takeEveryOr);
	// console.log(dataset4);
	dataset = dataset4
	myChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    labels: time,
	
    datasets: dataset4
  },
    options: {
		tooltips:{
			enabled:false
			},
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
			notesBar.innerHTML += '<b style="color:white"> ' + note(midiValuesNotes[i]) +' </b>';
		}
	}
}

function pointNote(id){
	// console.log(id);
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

function deleteMidi(selectedValue){
	dataset.splice(selectedValue, 1);
	midiValues.splice(selectedValue , 1);
	notes.splice(selectedValue, 1);
	midiData.splice(selectedValue, 1);
	midiValuesNotes.splice(selectedValue , 1);
	myChart.update();
	updateNotesBar();
	

}

function deleteMidi(){
	if(selectedValue >= 0){
		dataset.splice(selectedValue, 1);
		midiValues.splice(selectedValue, 1);
		notes.splice(selectedValue, 1);
		midiData.splice(selectedValue, 1);
		midiValuesNotes.splice(selectedValue , 1);
		yInput.value = dataset[selectedValue].data[0].y;
			midiv.value = midiValues[selectedValue];
			midib.value = dataset[selectedValue].data[0].x;
			midie.value = dataset[selectedValue].data[1].x;
		dataset[selectedValue].borderColor = orangeColor;
		myChart.update();
		//resetActivePoint();
		updateNotesBar()
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
				midiValues[selectedValue] = parseFloat(midiv.value);
				midiValuesNotes[selectedValue] = parseFloat(midiv.value);
				var freq = calculateFreqFromMidi(parseFloat(midiv.value));
				dataset[selectedValue].data[0].y = freq;
				dataset[selectedValue].data[1].y = freq;
				myChart.update();
				updateNotesBar();
			}
		}
	}
}

function resetActivePoint(){
		midib.value = "";
		midie.value = "";
		midiv.value = "";
}

function splitMidi(){
	if(selectedValue > 0){
		var newMidib = (((parseFloat(midib.value))+ parseFloat(midie.value))/2)
		var lebel = [
		{y: dataset[selectedValue].data[0].y ,x: newMidib},
		{y: dataset[selectedValue].data[1].y ,x: dataset[selectedValue].data[1].x} 
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset[selectedValue].data[1].x = newMidib;
		dataset.splice( (selectedValue +1), 0, obj);
		midiValues.splice( (selectedValue +1), 0, midiValues[selectedValue]);
		midiValuesNotes.splice( (selectedValue +1), 0, midiValues[selectedValue]);
		myChart.update();
		//resetActivePoint();
		updateNotesBar();
		
	}
}
function addMidiBefore(){
	if(selectedValue >= 0){
		var lebel = [
		{y: dataset[selectedValue].data[0].y ,x: dataset[selectedValue].data[0].x - 1},
		{y: dataset[selectedValue].data[0].y ,x: dataset[selectedValue].data[0].x}
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset.splice( (selectedValue ), 0, obj);
		midiValues.splice( (selectedValue ), 0, midiValues[selectedValue]);
		midiValuesNotes.splice( (selectedValue +1), 0, midiValues[selectedValue]);
		myChart.update();
		updateNotesBar();
	}
}

function addMidiAfter(){
	if(activePoint && activePoint[0]){
		var lebel = [
		{y: dataset[selectedValue].data[0].y ,x: dataset[selectedValue].data[1].x},
		{y: dataset[selectedValue].data[0].y ,x: dataset[selectedValue].data[1].x + 1}
		]
		var obj = {data: lebel, pointStyle: "circle",borderColor: "#ac2b2b",fill: false};
		dataset.splice( (selectedValue + 1), 0, obj);
		midiValues.splice( (selectedValue + 1), 0, midiValues[selectedValue]);
		midiValuesNotes.splice( (selectedValue +1), 0, midiValues[selectedValue]);
		myChart.update();
		updateNotesBar();
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
	if(selectedValue >= 0){
		if(midib.value && midie.value){
			if(parseFloat(midib.value) >= 0 && parseFloat(midie.value) >= 0){
				if(parseFloat(midib.value) < (parseFloat(midie.value) - 0.01)){
					dataset[selectedValue].data[0].x = parseFloat(midib.value);
					dataset[selectedValue].data[1].x = parseFloat(midie.value);
					if(overrideMidi.checked){
						midiTimeValueChanger(selectedValue);
					}
					myChart.update();
				}
			}
		}
	}
}

ctx.onclick = function(evt){
	dataset[selectedValue].borderColor = redColor;
	console.log(myChart.data)
	activePoint = myChart.getElementAtEvent(evt);
	var activePoints = myChart.getElementsAtEvent(evt);
	if(activePoint[0] != null){
		selectedValue = activePoint[0]._datasetIndex;
		var index = activePoint[0]._index;
		yInput.value = dataset[selectedValue].data[index].y;
		if(activePoints[1]){
			midiv.value = midiValues[selectedValue];
			midib.value = dataset[selectedValue].data[0].x;
			midie.value = dataset[selectedValue].data[1].x;
			dataset[selectedValue].borderColor = orangeColor;
		}else{
			midib.value = "";
			midie.value = "";
		}
	}
	myChart.update();
};

function stopMidi(){
	var doublePlay = document.getElementById('double-sound').checked;
	if (doublePlay){
		document.getElementById('audio-player').load();
	}

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
	var doublePlay = document.getElementById('double-sound').checked;
	// Odtwarzanie jest zapauzowane 
	if(play && pause) {
		if (doublePlay){
			document.getElementById('audio-player').play();
		}
	    audioContext.resume().then(function() {
	    	pause = false;
	      	//audioChecker(1000);
	    }); 
	}

	// Nagranie jest odtwarzane, chcemy dać pauzę
	else if(play && !pause){
		pause = true;
		if (doublePlay){
			document.getElementById('audio-player').pause();
		}
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
			if (doublePlay){
				var player = document.getElementById('audio-player');
				//player.currentTime = beginTime;
				player.play();
			}
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
	updateNotesBar();
	
}

function saveToFile(){
	//console.log(new XMLSerializer().serializeToString(midiFile));(new XMLSerializer()).serializeToString(midiFile);
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
	saveChanges()
	var newTimeb = chartTimeb.value;
	var newTimee = chartTimee.value;
	chartTimeb.value = newTimee;
	chartTimee.value = parseFloat(newTimee) + (parseFloat(newTimee) - parseFloat(newTimeb));
	recalculateDateSet()
}

function goLeft(){
	saveChanges()
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

function nextMidi(){
	if(selectedValue > -1 && dataset && dataset[parseInt(selectedValue + 1)] && dataset[parseInt(selectedValue + 1)].data[0]){
		dataset[selectedValue].borderColor = redColor;
		var index = 0;
		selectedValue = parseInt(selectedValue) + 1;
		yInput.value = dataset[selectedValue].data[index].y;
			midiv.value = midiValues[selectedValue];
			midib.value = dataset[selectedValue].data[0].x;
			midie.value = dataset[selectedValue].data[1].x;
		dataset[selectedValue].borderColor = orangeColor;
		myChart.update();
	}
	updateNotesBar();
}
function prevMidi(){ // TODO
	if(selectedValue > 0){
		dataset[selectedValue].borderColor = redColor;
		selectedValue = parseInt(selectedValue) - 1;
		var index = 0;
		yInput.value = dataset[selectedValue].data[index].y;
			midiv.value = midiValues[selectedValue];
			midib.value = dataset[selectedValue].data[0].x;
			midie.value = dataset[selectedValue].data[1].x;
		dataset[selectedValue].borderColor = orangeColor;
		myChart.update();
	}
	updateNotesBar();
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
			//document.getElementById("input-xml").remove();
		};
		reader.readAsText(f);
	}else if(evt.dataTransfer.files[0].type === 'text/plain'){
		var f = evt.dataTransfer.files[0],
			reader = new FileReader();
		reader.onload = function(event) {
			file = event.target.result;
			start();
			//document.getElementById("input-plane").remove();
		};
		reader.readAsText(f);
		start();
	}
	
}
function changeEventHandler(evt){
	console.log(evt);
	if(evt.srcElement.files[0].type === 'text/xml'){
		var f = evt.srcElement.files[0],
			reader = new FileReader();
		reader.onload = function(event) {
			var res = event.target.result;
			midiFile = parser.parseFromString(res,"text/xml");
			start();
			document.getElementById("input-xml").remove();
		};
		reader.readAsText(f);
	}else if(evt.srcElement.files[0].type === 'text/plain'){
		var f = evt.srcElement.files[0],
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

function note(value){
	var notes = {};
	notes[12] = "C";
	notes[13] = "C#";
	notes[14] = "D";
	notes[15] = "D#";
	notes[16] = "E";
	notes[17] = "F";
	notes[18] = "F#";
	notes[19] = "G";
	notes[20] = "G#";
	notes[21] = "A";
	notes[22] = "A#";
	notes[23] = "H";

    var octave = 0;
    // klawiatura fortepianu ma zakres <21;108> w midi. Zaczynam od 12 dla ułatwienia.
    if (value >= 12 && value < 109)
    {
        while (notes[value] == undefined){
            octave++;
            value -= 12; // Oktawa ma 12 półtonów
        }
        return notes[value] + octave.toString();;
    }

    return "¯\\_(ツ)_/¯";
}

function loadSong(){
	var player = document.getElementById('audio-player');
	player.src = fileMP3Addr;
	//
	chartTimee.value = 10;
	recalculateDateSet();
}


window.addEventListener('load', function() {
	loadSong();
    console.log('loading complete')
})
// Setup the dnd listeners.
var dropZone = document.getElementById('myChart');
var loadFiles2 = document.getElementById('loadFiles');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
// loadFiles2.addEventListener('DOMContentLoaded',changeEventHandler, false);
