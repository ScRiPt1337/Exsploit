if(toastr){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
    };
}

var emojiMessages={};
emojiMessages.copied="Text copied to your clipboard";
emojiMessages.cleared="Text cleared";
emojiMessages.added='Emoticon is added to text area';

// Copy text as text
function executeCopy(text) {
    var input = document.createElement('textarea');
    input.style.position = "fixed";
    input.style.height = "0px";
    input.style.width = "0px";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
    var message = 'Copied to clipboard';
    var postData = {};
    postData.name = 'showMessage';
    postData.message = 'Text copied to clipboard';
    postData.messageType = 'info';
    top.postMessage(postData, "*");
    toastr.success(message);
}

function loaded(){
    //emoji
    var emojiElem = document.getElementsByClassName("emoji");
    //event listeners for emoji clicks
    for (var counter = 0; emojiElem[counter]; counter++) {
        emojiElem[counter].addEventListener('click', function(e) {
            var data_c = e.srcElement.getAttribute('data-c');
            document.getElementById("copyText").value += data_c;
        });
    }
    //main form to be submitted
    document.getElementById("mainForm").addEventListener('submit', function(e) {
        e.preventDefault();
    });
    //copy text button
    document.getElementById("copyTextButton").addEventListener('click', function(e) {
        executeCopy(document.getElementById("copyText").value);
    });
    //clear text button
    document.getElementById("clearTextButton").addEventListener('click', function(e) {
        document.getElementById("copyText").value = "";
        toastr.success(emojiMessages.cleared);
    });
    $('.emoji').click(function(){
        toastr.info(emojiMessages.added);
    });
}
window.onload=loaded;
