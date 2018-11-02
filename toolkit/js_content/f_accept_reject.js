var tmp="";

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
function acceptSingleClickFinal(){
    var clicked=false;
    var buttons=document.getElementsByTagName("button");
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var text=target.innerText.trim();
        if(text=="Confirm"){
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

function acceptAllFRequestsFinal(delay, scroll) {
    disableSubmit();
	if(acceptSingleClickFinal()){
        // some button found and it is clicked
        setTimeout(function(){
            acceptAllFRequestsFinal(delay, scroll);
        }, delay);
        tmp='"Confirm" button is clicked.';
        toastr.success(tmp);
        if(scroll) {
            scrollToBottom();
        }
    }else{
        // no button found it is not clicked
        tmp='No "Confirm" buttons found for clicking.';
        toastr.error(tmp);
        alert(tmp);
        enableSubmit();
    }
}

// final function for clicking
function rejectSingleClickFinal(){
    var clicked=false;
    var buttons=document.getElementsByTagName("button");
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var text=target.innerText.trim();
        if(text=="Delete Request"){
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

function rejectAllFRequestsFinal(delay, scroll) {
    disableSubmit();
	if(rejectSingleClickFinal()){
        // some button found and it is clicked
        setTimeout(function(){
            rejectAllFRequestsFinal(delay, scroll);
        }, delay);
        tmp='"Delete Request" button is clicked.';
        toastr.success(tmp);
        if(scroll) {
            scrollToBottom();
        }
    }else{
        // no button found it is not clicked
        tmp='No "Delete Request" buttons found for clicking.';
        toastr.error(tmp);
        alert(tmp);
        enableSubmit();
    }
}
// functions to be called by dart

// for removing invisible add friend buttons from screen
function removeUnnecessary(){
    $("#fbRequestsFlyout").remove();
    $("#fbRequestsJewel").remove();
}

// eslint-disable-next-line no-unused-vars
function AcceptAllStart(delayStr, scroll) {
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
    disableSubmit();
    removeUnnecessary();
	acceptAllFRequestsFinal(delay, scroll);
}

// eslint-disable-next-line no-unused-vars
function RejectAllStart(delayStr, scroll) {
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
    disableSubmit();
    removeUnnecessary();
	rejectAllFRequestsFinal(delay, scroll);
}
console.log("Content script for f_accept_reject is loaded");