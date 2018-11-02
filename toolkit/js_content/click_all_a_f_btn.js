/* eslint-disable no-global-assign */
var unable_to_find="Unable to find add friend buttons.";
var clicked="Add friend button is clicked.";
var all_clicked='All add friend buttons are clicked.';

// whether to auto scroll or not
var scroll=false;

// whether to click confirm buttons or not
var confirm=false;

// whether to click close buttons or not
var clickClose=false;

// for automatically clicking confirm buttons when add button is clicked
function autoClickConfirm() {
    if(!confirm){
        return;
    }
    try{
        var btnList=document.getElementsByTagName('button');
        for(var index=0, len=btnList.length; index<len; index++){
            var elem=btnList[index];
            var elemText=elem.innerText.trim();
           // console.log(elemText);
            if(elemText=="Confirm"){
                elem.click();
                clicked=true;
            }
        }

        var btnList2=document.getElementsByTagName('a');
        for(var index2=0, len2=btnList2.length; index2<len2; index2++){
            var elem2=btnList2[index2];
            var elemText2=elem2.innerText.trim();
            // console.log(elemText);
            if(elemText2=="Confirm"){
                elem2.click();
                clicked=true;
            }
        }
    }catch(e){
        //
    }
    // auto click close button if not clicked already
    // if(!clicked){
        setTimeout(autoClickClose, 200);
    // }
}

// for automatically clicking close buttons when add button is clicked
function autoClickClose() {
    if(!clickClose){
        return;
    }
    try{
        var btnList=document.getElementsByTagName('button');
        for(var index=0, len=btnList.length; index<len; index++){
            var elem=btnList[index];
            var elemText=elem.innerText.trim();
            //console.log(elemText);
            if(elemText=="Close"){
                elem.click();
            }
        }
        var btnList2=document.getElementsByTagName('a');
        for(var index2=0, len2=btnList2.length; index2<len2; index2++){
            var elem2=btnList2[index2];
            var elemText2=elem2.innerText.trim();
            //console.log(elemText);
            if(elemText2=="Close"){
                elem2.click();
            }
        }
    }catch(e){
        //
    }
}

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

// for removing invisible add friend buttons from screen
function removeUnnecessary(){
    $("#fbRequestsFlyout").remove();
    $("#fbRequestsJewel").remove();
}

//
//
//  For clicking using algorithm 1 start
//
//
// final function for clicking
function startClickAlgo1Final(){
    var clicked=false;
    var buttons=document.getElementsByTagName("button");
    for(var counter=0; counter<buttons.length; counter++){
        var target=buttons[counter];
        var text=target.innerText.trim();
        if(text=="Add Friend"){
            target.click();
            //target.focus();
            clicked=true;
            target.remove();
            break;
        }
    }
    if(clicked){
        return true;
    }else{
        return false;
    }
}

function startClickAlgo1(delay) {
    autoClickConfirm();
    if(scroll) {
        scrollToBottom();
    }

    disableSubmit();
	if(startClickAlgo1Final()){
        var tmp='"Add Friend" button is clicked.';
        toastr.success(tmp);
        // some button found and it is clicked
        setTimeout(function(){
            startClickAlgo1(delay);
        }, delay);
    }else{
        // no button found it is not clicked
        var tmp2='No "Add Friend" buttons found for clicking.';
        toastr.error(tmp2);
        alert(tmp2);
        enableSubmit();
    }
}

//for clicking button
// eslint-disable-next-line no-unused-vars
function clickNowAlgo1(delayStr, scroll2, confirm2, close) {
    scroll=scroll2;
    confirm=confirm2;
    clickClose=close;
    removeUnnecessary();
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
	startClickAlgo1(delay);
	// for clicking add friend buttons on group member sections
	// click_all_add_friend_buttons_2();
}
//
//
//  For clicking using algorithm 2 start
//
//
//for clicking correct buttons from validcounter
function clickAddFriendButtons(validCounter, delay){
	var counter=0;
	function click(){
        autoClickConfirm();
        if(scroll) {
            scrollToBottom();
        }
		var target=document.getElementsByTagName('button')[validCounter[counter]];
        target.click();
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
	var button=document.getElementsByTagName("button");
	for(var counter=0; counter<button.length; counter++){
		var mat=button[counter].innerText.match(/add friend/ig);
		if(mat){
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
function clickNowAlgo2(delayStr, scroll2, confirm2, close) {
    scroll=scroll2;
    confirm=confirm2;
    clickClose=close;
    removeUnnecessary();
    console.log("delayStr = "+delayStr);
    var delay=parseInt(delayStr) *1000||1000;
	// for clicking add friend buttons on group member sections as well
	click_all_add_friend_buttons(delay);
}