/* eslint-disable no-global-assign */
var scroll=false;
function scrollToBottom() {
    console.log('scrolled to bottom');
    var pos=window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo(0, pos+300);
}

// for passing message to iframe
function passMessage(data) {
	var elem = document.getElementById("tff_frame");
	elem.contentWindow.postMessage(data, "*");
}

function enableSubmit() {
	var data = {};
	data.todo = "enable_submit";
	passMessage(data);
}

// function for disabling start clicking buttons
function disableSubmit() {
	var data = {};
	data.todo = "disable_submit";
	passMessage(data);
}


// final function for clicking
function singleClickFinalAlgo1(){
    var clicked=false;
    var buttons=document.getElementsByTagName('a');
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var text=target.innerText.trim();
        if(text=="Poke"||text=="Poke back"){
            target.click();
            //target.focus();
            clicked=true;
            break;
        }
    }
    if(clicked){
        return true;
    }else{
        return false;
    }
}

function clicAllAlgo1(delay) {
    if(scroll) {
        scrollToBottom();
    }
    disableSubmit();
	if(singleClickFinalAlgo1()){
        // some button found and it is clicked
        setTimeout(function(){
            clicAllAlgo1(delay);
        }, delay);
        var tmp='"Poke" button is clicked.';
        toastr.success(tmp);
    }else{
        // no button found it is not clicked
        var tmp2='No "Poke" buttons found for clicking.';
        toastr.error(tmp2);
        alert(tmp2);
        enableSubmit();
    }
}
//for clicking button
// eslint-disable-next-line no-unused-vars
function clickPokeAlgo1(delayStr, scroll2) {
    scroll=scroll2;
    var delay=parseInt(delayStr) * 1000 || 1000;
	clicAllAlgo1(delay);
}

//
//
//  Functions for algorithm 2
//
//
var all_clicked = "All poke buttons are clicked.";
function clickAllPokeButtonsAlgo2(delay) {
    disableSubmit();
    var counterList=[];
    var hrefElements=document.getElementsByTagName("a");
	for (var counter = 0; hrefElements[counter]; counter++) {
		if (hrefElements[counter].innerText == "Poke") {
            counterList.push(counter);
			// document.getElementsByTagName("a")[counter].click();
		}
	}
	for (var counter2 = 0; hrefElements[counter2]; counter2++) {
		if (hrefElements[counter2].innerText == "Poke Back") {
            counterList.push(counter2);
			// document.getElementsByTagName("a")[counter].click();
		}
    }
    if(counterList.length==0){
        // no button found it is not clicked
        var tmp2='No "Poke" buttons found for clicking.';
        toastr.error(tmp2);
        alert(tmp2);
        enableSubmit();
    }
    var a=-1;
    function clickCounter(counter){
        var tmp='"Poke" button is clicked.';
        toastr.success(tmp);
        hrefElements[counter].click();
    }
    function clickStart(){
        if(scroll) {
            scrollToBottom();
        }
        a++;
        if(a<counterList.length&&counterList[a]!=null){
            clickCounter(counterList[a]);
            setTimeout(clickStart, delay);
        }else{
            enableSubmit();
            toastr.success(all_clicked);
            alert(all_clicked);
        }
    }
    clickStart();
}
// eslint-disable-next-line no-unused-vars
function clickPokeAlgo2(delayStr, scroll2) {
    scroll=scroll2;
    var delay=parseInt(delayStr) * 1000 || 1000;
	clickAllPokeButtonsAlgo2(delay);
}