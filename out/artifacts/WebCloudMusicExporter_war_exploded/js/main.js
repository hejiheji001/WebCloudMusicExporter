(function(){
	var toggle = $("#toggle");
	var auto = $("#auto");
	var music = $("#music");
	var playlist = $("#playlist");
	var input = $("#input");
	var songlist = $("#songlist");
	var result = $("#result");
	var exp = $("#export");
	var cookiePop = $("#cookiePop");
	var tokenPop = $("#tokenPop");
	var pathPop = $("#pathPop");
	var save = $("#saveSetting");
	var settings = $("#settings");
	var cookie = localStorage.getItem("cookie");
	var token = localStorage.getItem("token");
	var path = localStorage.getItem("path");

	if(cookie){
		$("#cookies").val(cookie);
	}

	if(token){
		$("#token").val(token);
	}

	if(path){
		$("#path").val(path);
	}

	var popC = '<div style="color: black">\
					<p>1. Login to your <a href="http://pan.baidu.com/disk/home" target="_blank">Baidu Pan</a></p>\
					<p>2. Ensure you are at http://pan.baidu.com/disk/home</p>\
					<p>3. Type(NOT COPY & PASTE) <code>javascript:</code> in your browser\'s address bar</p>\
					<p>4. Copy & paste <code>document.write(document.cookie)</code> afterwards</p>\
					<p>5. Press <kbd>Enter</kbd> and paste all text here</p>\
				</div>';
	cookiePop.popover({
		content: popC,
		title: "<span style='color:black'>How To Get Baidu Yun Cookies</span>"
	});

	var popT = '<div style="color: black">\
					<p>1. Login to your <a href="http://pan.baidu.com/disk/home" target="_blank">Baidu Pan</a></p>\
					<p>2. Ensure you are at http://pan.baidu.com/disk/home</p>\
					<p>3. Type(NOT COPY & PASTE) <code>javascript:</code> in your browser\'s address bar</p>\
					<p>4. Copy & paste <code>document.write(yunData.MYBDSTOKEN)</code> afterwards</p>\
					<p>5. Press <kbd>Enter</kbd> and paste all text here</p>\
				</div>';
	tokenPop.popover({
		content: popT,
		title: "<span style='color:black'>How To Get Baidu Yun Cookies</span>"
	});

	var popP = '<div style="color: black">\
					<p>1. Type / if you want to save to root path</p>\
					<p>2. Type /Music if you want to save to folder Music</p>\
					<p>3. New folder will be created if not exists</p>\
					<p style="color: red">4. Only support English currently</p>\
				</div>';
	pathPop.popover({
		content: popP,
		title: "<span style='color:black'>How To Set Save Path</span>"
	});

	save.on({
		click: function(e){
			saveSetting();
		}
	});

	auto.on({
		click: function(e){
			goMethod("auto");
		}
	});

	music.on({
		click: function(e){
			goMethod("id");
		}
	});

	playlist.on({
		click: function(e){
			goMethod("playlistExtra");
		}
	});

    input.on({
        keydown: function(e){
            if(e.keyCode == 13){
                goMethod("auto");
            }
        }
    });

	exp.on({
		click: function(e){
			exportList();
		}
	});

	var saveSetting = function(){
		var c = $("#cookies").val();
		var t = $("#token").val();
		var p = $("#path").val();
		if(c && t && p){
			settings.modal("hide");
			localStorage.setItem("cookie", c);
			localStorage.setItem("token", t);
			localStorage.setItem("path", p);
		}else{
			alert("You must provide cookies, token and path");
		}
	}

	var exportList = function(){
		var a = $("[name='aria2c']");
		var w = $("[name='wget']");
		var c = $("[name='curl']");
		var aList = [];
		var wList = [];
		var cList = [];
		if(songs){
			var num = songs.length;
			for (var i = 0; i < num; i++) {
				var s = songs[i];
				var d = s["durl"];
				var n = s["name"];
				aList.push("aria2c -c -s10 -k1M -x10 -o \"" + n + "\" --header \"Referer: http://music.163.com\" \"" + d + "\"");
				wList.push("wget -o \"" + n + "\" --referer=http://music.163.com \"" + d + "\"");
				cList.push("curl -o \"" + n + "\" -e http://music.163.com \"" + d + "\"");
			}
			aList.push("\r\n");
			wList.push("\r\n");
			cList.push("\r\n");
		}
		a.text(aList.join("\r\n"));
		w.text(wList.join("\r\n"));
		c.text(cList.join("\r\n"));
	}

	var goMethod = function(method){
		songlist.slideUp();
		var val = input.val();
		if(val){
			auto.addClass("disabled");
            auto.html("Working");
			toggle.addClass("disabled");
			if(method == "auto"){
				if(val.indexOf("song") > -1){
					method = "id";
				}else if(val.indexOf("playlist") > -1){
					method = "playlistExtra";
				}else{
					alert("Auto detect failed, maybe specific it.");
					auto.removeClass("disabled");
					auto.html("Go Auto");
					toggle.removeClass("disabled");
					return;
				}
				val = /=(\d+)?/.exec(val)[1];
			}
			getInfo("get?" + method + "=" + val);
		}else{
			alert("You must input something");
		}
	};

	var getInfo = function(u){
		var str =  '<div class="list-group-item list-group-item-info text-center list-inline">\
						<a href="${durl}" download="${name}" target="_blank" class="songItem" style="font-size: 16px;font-weight: 500">${name}</a>\
						<a class="btn btn-default save" style="right: 15px;position: absolute;padding: 0px 12px;" data="${durl}" onclick="saveToPan(this)">Save To Pan</a>\
					</div>';
        $(".songItem").remove();
		$.ajax({
			method: "GET",
			dataType: "json",
			url: u,
			success : function (data) {
				var num = data.songs.length;
				window.songs = data.songs;
				var res = data.result;
				var list = data.listname;
				var dom = [];
				var hint = "";
				songlist.slideDown();
				if(res == "true"){
					if(list){
						hint = "WOW! In List: " + list + " We Got " + num + " Songs!";
					}else{
						hint = "WOW! We Got " + num + " Song!";
					}
					$("#num").html(hint);
					for (var i = 0; i < num; i++) {
						var s = songs[i];
						var d = s["durl"];
						var n = s["name"];
						tem = str.replace(/\$\{durl\}/g, d);
						tem = tem.replace(/\$\{name\}/g, n);
						dom.push(tem);
					}
				}

				auto.removeClass("disabled");
                auto.html("Go Auto");
				toggle.removeClass("disabled");
				result.append(dom.join(""));
			}
		});
	};

	window.saveToPan = function(o){
		var l = $(o).attr("data");
		var c = localStorage.getItem("cookie");
		var p = localStorage.getItem("path");
		var t = localStorage.getItem("token");
		if(l){
			if(c && t && p){
				var BAIDUYUN_URL = "http://yun.baidu.com/";
				var BAIDUPAN_SAVE_URL = "http://pan.baidu.com/rest/2.0/services/cloud_dl?channel=chunlei&clienttype=0&web=1";
				var bdstoken = localStorage.getItem("bdstoken");
				var vcodeTabId = null;
				var postData = {
					method: "add_task",
					app_id: 250528,
					save_path: p
				};
				var resUrl = null;

				var onMenuItemClick = function() {
					saveToBaiduPan({url:resUrl, token:token});
				}

				var saveToBaiduPan = function(data) {
					var destUrl = BAIDUPAN_SAVE_URL + "&bdstoken=" + t;
					postData.source_url = l;
					data.vcode&&(postData.vcode = data.vcode);
					data.input&&(postData.input = data.input);
					_ajaxPost(destUrl, postData);
				}

				var _ajaxPost = function(url, data) {
					$.ajax({
						type : "POST",
						url : url,
						data: _makeForm(data),
						xhrFields: {
							withCredentials: true
						},
						beforeSend : function(xhr) {
							xhr.setRequestHeader('Cookie', c);
						},
						complete : function(res) {
							console.log("Over: " + res);
						}
					});
				}

				var _makeForm = function(data) {
					var form = "";
					for (var k in data) {
						form += k;
						form += ("=" + encodeURIComponent(data[k]) + "&");
					}
					form.slice(0, -1);
					return form;
				}

				onMenuItemClick();
			}else{
				alert("Please Click Menu - Settings to setup parameters");
			}
		}
	}
})();

