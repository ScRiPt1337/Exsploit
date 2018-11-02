/* eslint-disable no-global-assign */
var unable_to_find='Unable to find "Share" buttons.';
var clicked='"Share" button is clicked.';
var all_clicked='All "Share" buttons are clicked.';

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

// for passing message to iframe
function passMessage(data) {
	var elem = document.getElementById("tff_frame");
	if(elem){
        elem.contentWindow.postMessage(data, "*");
    }
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

//
//
//  For clicking using algorithm 2 start
//
//

// for automatically clicking close buttons when add button is clicked
function clickShareNow() {
    try{
        var btnList=document.getElementsByTagName('span');
        for(var index=0, len=btnList.length; index<len; index++){
            var elem=btnList[index];
            var elemText=elem.innerText.trim();
            // console.log(elemText);
            if(elemText=="Share Now"){
                elem.click();
            }
        }
    }catch(e){
        //
    }
}

//for clicking correct buttons from validcounter
function clickAddFriendButtons(validCounter, delay){
	var counter=0;
	function click(){
		var target=document.getElementsByTagName('a')[validCounter[counter]];
        target.click();
        setTimeout(clickShareNow, 500);
		toastr.success(clicked);
		counter++;
		if(validCounter[counter]!=undefined){
			setTimeout(click, delay);
		}else{
            toastr.info(all_clicked);
            enableSubmit();
		}
	}
	click();
}

//for clicking all active add friend buttons
function click_all_add_friend_buttons(delay) {
    disableSubmit();
    // for storing index values for buttons 
    // that can be clicked
	var validCounter=[];
	var button=document.getElementsByTagName("a");
	for(var counter=0; counter<button.length; counter++){
		var mat=button[counter].innerText.match(/Share/ig);
		var mat2=button[counter].href.match(/sharer\.php/ig);
		if(mat&&mat2){
			if(mat[0]){
				validCounter.push(counter);
			}else{
				console.log('stopped');
			}
		}else{
			console.log('stopped');
		}
	}
	console.log("validCounter");
	console.log(validCounter);
	//check if buttons are found
	if(validCounter.length){
		clickAddFriendButtons(validCounter, delay);
	}else{
        toastr.error(unable_to_find);
        enableSubmit();
	}
}

//for clicking button
// eslint-disable-next-line no-unused-vars
function clickNowAlgo1(delayStr) {
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
	// for clicking add friend buttons on group member sections as well
	click_all_add_friend_buttons(delay);
}