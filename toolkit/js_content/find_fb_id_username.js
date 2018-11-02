function getParam(sname, location_search) {
    if (location_search && sname) {
        var params = location_search.substr(location_search.indexOf("?") + 1);
        var sval = "";
        params = params.split("&");
        // split param and value into individual pieces
        for (var i = 0; i < params.length; i++) {
            var temp = params[i].split("=");
            if ([temp[0]] == sname) {
                sval = temp[1];
            }
        }
        return sval;
    } else {
        return '';
    }
}

// for add new HTML to page
function append_html_code(title, result_id) {
    if (!title) {
        return;
    }
    if (!result_id) {
        return;
    }
    // valid
    $("#result_panel").show();
    console.log("title=" + title);
    console.log("result=" + result_id);

    var result_link = '<p><a target="_blank" href="http://facebook.com/' + result_id + '">' + result_id + '</a></p>';
    var out = '';
    out += '    <div class="card">';
    out += '    <div class="card-header text-center">';
    out += title;
    out += '    </div>';
    out += '    <div class="card-body">';
    out += result_link;
    out += '<button type="reset" class="btn btn-success float-right copy-btns" data-id="' + result_id + '">';
    out += '<span class="glyphicon glyphicon-copy" aria-hidden="true"></span>';
    out += 'Copy to Clipboard';
    out += '</button>';

    out += '    </div>';
    out += '</div>';
    out += '<br>';
/*
    out += '<div class="panel panel-default">';
    out += '<div class="panel-heading">' + title + '</div>';
    out += '<div class="panel-body">';
    out += result_link;
    out += '<button type="reset" class="btn btn-success float-right copy-btns" data-id="' + result_id + '">';
    out += '<span class="glyphicon glyphicon-copy" aria-hidden="true"></span>';
    out += 'Copy to Clipboard';
    out += '</button>';

    out += '</div>';
    out += '</div>';
*/
console.log(out);
    $("#panel-result-body").append(out);

    eventListenersForCopyBtn();
}

// for getting page ID and then appending it to DOM
function extract_page_id(page_id) {
    if (isNaN(page_id)) {
        return;
    }
    console.log("page id=" + page_id);
    var title = "Page ID";
    append_html_code(title, page_id);
}

function extract_post_id(post_id) {
    if (isNaN(post_id)) {
        return;
    }
    console.log("post_id=" + post_id);
    var title = "Post id";
    append_html_code(title, post_id);
}

function event_post_id_append(post_id) {
    if (isNaN(post_id)) {
        return;
    }
    console.log("event_post_id=" + post_id);
    var title = "Event post id";
    append_html_code(title, post_id);
}

function group_post_id_append(post_id) {
    if (!isNaN(post_id)) {
        console.log("group_post_id=" + post_id);
        var title = "Group post id";
        append_html_code(title, post_id);
    }
}

function id_extract_event(account_username) {
    if (!isNaN(account_username)) {
        console.log("Event id is:" + account_username);
        var title = "Event ID";
        append_html_code(title, account_username);
    }
}

function extract_video_id(video_id) {
    if (!isNaN(video_id)) {
        console.log("video id is=" + video_id);
        var title = "Post ID / Video id";
        append_html_code(title, video_id);
    }
}

function id_extract_group(account_username) {
    if (isNaN(account_username)) {
        var pageurl = "https://mbasic.facebook.com/groups/" + account_username;
        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", pageurl, true);
        xhr2.onreadystatechange = function() {
            if (xhr2.readyState == 4 && xhr2.status == 200) {
                if (xhr2.responseText.match(/\/groups\/\d+/g)) {
                    var responsa = xhr2.responseText.match(/\/groups\/\d+/g)[0];
                    responsa = responsa.replace("/groups/", "");
                    var title = "Group ID";
                    console.log(title + "=" + responsa);
                    append_html_code(title, responsa);
                } else {
                    var message = 'Unable to find Group ID';
                    toastr.error(message);
                }
            }
        };
        xhr2.send();
    } else {
        var title = "Group ID";
        console.log(title + "=" + account_username);
        append_html_code(title, account_username);
    }
}

function id_extract_account(account_username) {
    if (isNaN(account_username)) {
        var pageurl = "/" + account_username;
        var xhr4 = new XMLHttpRequest();
        xhr4.open("GET", pageurl, true);
        xhr4.onreadystatechange = function () {
            if (xhr4.readyState == 4 && xhr4.status == 200) {
                var responsa = xhr4.responseText;
                if (responsa.match(/fb:\/\/page\/\?id=\d+/ig)) {
                    var page_id = responsa.match(/fb:\/\/page\/\?id=\d+/ig);
                    page_id = page_id[0].replace(/fb:\/\/page\/\?id=/ig, "");
                    page_id = parseInt(page_id);
                    if (!isNaN(page_id)) {
                        var title = "Page ID";
                        console.log(title + "=" + page_id);
                        append_html_code(title, page_id);
                    }
                }
                if (responsa.match(/"profile_id":\d+/g)) {
                    var account_id = responsa.match(/"profile_id":\d+/g)[0];
                    account_id = parseInt(account_id.replace('"profile_id":', ""));
                    if (!isNaN(account_id)) {
                        title = "Account ID";
                        console.log(title + "=" + account_id);
                        append_html_code(title, account_id);
                    }
                }
            }
        };
        xhr4.send();
    } else {
        var title = "Account ID:";
        append_html_code(title, account_username);
    }
}

function extraction_process_url_params(url_array_collect) {
    if (url_array_collect[2]) {
        if (url_array_collect[2] == "permalink") {
            if (url_array_collect[0] == "groups") {
                id_extract_group(url_array_collect[1]);
                if (!isNaN(url_array_collect[3])) {
                    group_post_id_append(url_array_collect[3]);
                }
            }
            if (url_array_collect[0] == "events") {
                id_extract_event(url_array_collect[1]);
                if (!isNaN(url_array_collect[3])) {
                    event_post_id_append(url_array_collect[3]);
                }
            }
        }
        if (url_array_collect[1] == "videos") {
            id_extract_account(url_array_collect[0]);
            if (!isNaN(url_array_collect[2])) {
                extract_video_id(url_array_collect[2]);
            } else if (!isNaN(url_array_collect[3])) {
                extract_video_id(url_array_collect[3]);
            }
        }
        if (url_array_collect[0] == "pages") {
            if (!isNaN(url_array_collect[2])) {
                extract_page_id(url_array_collect[2]);
            }
        }
        if (url_array_collect[1] == "posts") {
            if (url_array_collect[0]) {
                id_extract_account(url_array_collect[0]);
            }
            if (!isNaN(url_array_collect[2])) {
                extract_post_id(url_array_collect[2]);
            }
        }
    } else {
        if (url_array_collect[1]) {
            if (url_array_collect[0] == "groups") {
                id_extract_group(url_array_collect[1]);
            }
            if (url_array_collect[0] == "events") {
                id_extract_event(url_array_collect[1]);
            }
        } else {
            id_extract_account(url_array_collect[0]);
        }
    }
}

// for cleaning resutl div
function clearResultDiv() {
    $("#panel-result-body").html('');
    $("#result_panel").hide();
}

// Copy text as text
function executeCopy(text) {
    var input = document.createElement('textarea');
    input.style.position = "fixed";
    input.style.height = "0px";
    input.style.width = "0px";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.value = text;
    //input.focus();
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

function eventListenersForCopyBtn() {
    $('.copy-btns').off('click');
    $(".copy-btns").click(function () {
        var id = $(this).attr("data-id");
        executeCopy(id);
    });
}

// eslint-disable-next-line no-unused-vars
function processUrlData(original_url) {
    console.log("Passed URL is" + original_url);
    clearResultDiv();
    var original_url_split = original_url.split("/");
    var url = original_url;
    var url_array_collect = [];
    url = url.replace("https://", "").replace("http://", "").replace("://", "");
    url = url.split("/");
    for (var temp_var = 1; url[temp_var]; temp_var++) {
        console.log("url[" + temp_var + "]=" + url[temp_var].split("?")[0]);
        if (url[temp_var].split("?")[0] && url[temp_var].split("?")[0] != "") {
            url_array_collect.push(url[temp_var].split("?")[0]);
        }
        if (url[temp_var].split("?")[1] && url[temp_var].split("?")[1] != "") {
            var location_search = "?" + url[temp_var].split("?")[1];
        }
    }
    var parmData = {};
    parmData.post_id = getParam('fbid', location_search);
    parmData.set = getParam('set', location_search);
    parmData.story_fbid = getParam('story_fbid', location_search);
    parmData.account_id = getParam('id', location_search);
    console.log("original_url");
    console.log(original_url);
    console.log("original_url_split");
    console.log(original_url_split);
    console.log("url_array_collect");
    console.log(url_array_collect);
    console.log("url");
    console.log(url);
    console.log("location_search");
    console.log(location_search);
    console.log("parmData");
    console.log(parmData);
    // block that uses parms start
    if (parmData.account_id) {
        if (!isNaN(parmData.account_id)) {
            var title = "Account ID";
            append_html_code(title, parmData.account_id);
        }
    }
    if (parmData.story_fbid) {
        if (!isNaN(parmData.story_fbid)) {
            title = "Post ID";
            append_html_code(title, parmData.story_fbid);
        }
    }
    if (parmData.post_id != "") {
        var photo_parmDatapost_id = parmData.post_id;
        if (!isNaN(photo_parmDatapost_id)) {
            title = "Post ID / Photo ID";
            append_html_code(title, photo_parmDatapost_id);
        }
    }
    if (parmData.set) {
        parmData.set = parmData.set.split(".");
        if (parmData.set) {
            var account_id = parmData.set[3];
            if (!isNaN(account_id)) {
                title = "Account ID";
                append_html_code(title, account_id);
            }
        }
    }
    // block that uses parms ends
    //to detect facebook notes
    if (url[1] == "notes") {
        if (!isNaN(url[4])) {
            title = "Note ID";
            append_html_code(title, url[4]);
        }
        if (!isNaN(url[3])) {
            title = "Note ID";
            append_html_code(title, url[3]);
        }
    }
    if (original_url.match("profile.php")) {
        account_id = getParam('id', location_search);
        if (!isNaN(account_id)) {
            append_html_code("User ID", account_id);
        }
    }
    if (original_url.match("/photos/")) {
        var splited = original_url.split("/");
        var photo_id = splited[splited.length - 2];
        if (!isNaN(photo_id)) {
            title = "Photo ID";
            append_html_code(title, photo_id);
        }
        // for getting account ID
        if (!isNaN(parseInt(original_url_split[3]))) {
            append_html_code("Account ID", original_url_split[3]);
        } else {
            //extract ID from account username
            id_extract_account(original_url_split[3]);
        }
    }
    extraction_process_url_params(url_array_collect);
}
console.log("find fb id username js loaded");