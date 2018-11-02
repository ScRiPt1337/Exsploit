// uncomment this in production
// var toastr={};
// toastr.error=function(a) {
//     console.log(a);
// };
// toastr.success=function(a) {
//     console.log(a);
// };
// toastr.info=function(a) {
//     console.log(a);
// };

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
function rejectSingleClickFinal(){
    var clicked=false;
    var buttons=document.getElementsByTagName("button");
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var text=target.innerText.trim();
        if(text=="Undo"){
            target.click();
            target.remove();
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
        var tmp='"Undo" button is clicked.';
        toastr.success(tmp);
        if(scroll) {
            scrollToBottom();
        }
    }else{
        // no button found it is not clicked
        var tmp2='No "Undo" buttons found for clicking.';
        toastr.error(tmp2);
        alert(tmp2);
        enableSubmit();
    }
}

// eslint-disable-next-line no-unused-vars
function undoAllStart(delayStr, scroll) {
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
    disableSubmit();
    rejectAllFRequestsFinal(delay, scroll);
}

console.log("Content script for cancelling pending friend request is loaded");