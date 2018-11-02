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
function singleClickFinal(){
    var clicked=false;
    var buttons=document.getElementsByClassName('UFILikeLink');
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var liked=false;
        if(target.className.match(/UFILinkBright/ig)){
            liked=true;
        }
        var text=target.innerText.trim();
        if(text=="Like"&&liked==false){
            target.click();
          //  target.focus();
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

function click_all_like_buttons(delay, scroll) {
    disableSubmit();
	if(singleClickFinal()){
        // some button found and it is clicked
        setTimeout(function(){
            click_all_like_buttons(delay, scroll);
        }, delay);
        tmp='"Like" button is clicked.';
        toastr.success(tmp);
        if(scroll) {
            scrollToBottom();
        }
    }else{
        // no button found it is not clicked
        tmp='No "Like" buttons found for clicking.';
        toastr.error(tmp);
        alert(tmp);
        enableSubmit();
    }
}


//for clicking button
// eslint-disable-next-line no-unused-vars
function clickNow(delayStr, scroll) {
    var delay=parseInt(delayStr) * 1000 || 1000;
	click_all_like_buttons(delay, scroll);
}

/*
old code

// message to be shown when all visible like buttons are clicked
var btnsClicked = "All visible like buttons are clicked.";

function click_all_like_buttons() {
	for (var tempIndex = 0; document.getElementsByClassName('UFILikeLink')[tempIndex]; tempIndex++) {
		var target = document.getElementsByClassName('UFILikeLink')[tempIndex];
		if (target.innerHtml != "Unike") {
			if (!target.getAttribute('class').match('UFILinkBright')) {
				target.click();
			}
		}
	}
	for (var counter = 0; document.getElementsByTagName("button")[counter]; counter++) {
		if (document.getElementsByTagName("button")[counter].innerText == "Like") {
			document.getElementsByTagName("button")[counter].click();
		}
	}
	for (var counter2 = 0; document.getElementsByTagName("button")[counter2]; counter2++) {
		if (document.getElementsByTagName("button")[counter2].innerText == "Like Page") {
			document.getElementsByTagName("button")[counter2].click();
		}
	}
	toastr.success(btnsClicked);
}
//for clicking button
// eslint-disable-next-line no-unused-vars
function clickNow() {
	click_all_like_buttons();
}

*/