(function(){
	var toggle = $("#toggle");
	var auto = $("#auto");
	var music = $("#music");
	var playlist = $("#playlist");
	var album = $("#album");
	var input = $("#input");
	var songlist = $("#songlist");
	var result = $("#result");
	var exp = $("#export");
	var locationPop = $("#locationPop");
	var cookiePop = $("#cookiePop");
	var tokenPop = $("#tokenPop");
	var pathPop = $("#pathPop");
	var save = $("#saveSetting");
	var settings = $("#settings");
	var notifier = $("#notifier");
	window.place = localStorage.getItem("place");
	var CN = $("#loc1");
	var WW = $("#loc2");
	var cookie = localStorage.getItem("cookie");
	var token = localStorage.getItem("token");
	var path = localStorage.getItem("path");

	var aria2c = $("[name='aria2c']");
	var wget = $("[name='wget']");
	var curl = $("[name='curl']");

	var aList = [];
	var wList = [];
	var cList = [];

	if(cookie){
		$("#cookies").val(cookie);
	}

	if(token){
		$("#token").val(token);
	}

	if(path){
		$("#path").val(path);
	}

	var popL = '<div style="color: black">\
					<p>1. I will guess your location automatically</p>\
					<p>2. If you cannot download or preview you can change your location</p>\
				</div>';
	locationPop.popover({
		content: popL,
		title: "<span style='color:black'>Select Your Location</span>"
	});

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
		title: "<span style='color:black'>How To Get Baidu Yun Token</span>"
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

	album.on({
		click: function(e){
			goMethod("album");
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

	var getLocation = function(){
		$.ajax({
			method: "GET",
			dataType: "json",
			url: "https://freegeoip.net/json/",
			success : function (data) {
				place = place || data.country_code;
				if(place != "CN"){
					notifier.show();
					WW.toggleClass("active");
				}else{
					CN.toggleClass("active");
				}
			}
		});
	}

	var saveSetting = function(){
		var c = $("#cookies").val();
		var t = $("#token").val();
		var p = $("#path").val();
		if(c && t && p){
			settings.modal("hide");
			localStorage.setItem("cookie", c);
			localStorage.setItem("token", t);
			localStorage.setItem("path", p);
			localStorage.setItem("place", place);
		}else{
			settings.modal("hide");
			// alert("You must provide cookies, token and path");
		}
	}

	var exportList = function(){
		if(!aria2c){
			aria2c = $("[name='aria2c']");
		}
		aria2c.text("");
		wget.text("");
		curl.text("");

		if(songs){
			var num = songs.length;
			for (var i = 0; i < num; i++) {
				var s = songs[i];
				var d = place == "CN" ? s["durl"] : s["durl"].replace("http://m","http://p");
				var a = s["artist"] + " - ";
				var n = s["name"].replace(/\//g, "\\/").replace(/\"/g, '\\"').replace(/\'/g, "\\'");
				aList.push("aria2c -c -k1M -x10 -o \"" + a + n + "\" --header \"Referer: http://music.163.com\" \"" + d + "\"");
				wList.push("wget -o \"" + n + "\" --referer=http://music.163.com \"" + d + "\"");
				cList.push("curl -o \"" + n + "\" -e http://music.163.com \"" + d + "\"");
			}
			aList.push("\r\n\r\n");
			wList.push("\r\n\r\n");
			cList.push("\r\n\r\n");
		}
		aria2c.text(aList.join("\r\n\r\n"));
		wget.text(wList.join("\r\n\r\n"));
		curl.text(cList.join("\r\n\r\n"));
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
					method = "song";
				}else if(val.indexOf("playlist") > -1){
					method = "playlist";
				}else if(val.indexOf("album") > -1){
					method = "album";
				}else if(val.indexOf("artist") > -1){
					method = "artist";
				}else{
					alert("Auto detect failed, maybe specific it.");
					auto.removeClass("disabled");
					auto.html("Go Auto");
					toggle.removeClass("disabled");
					return;
				}

				var r = new RegExp("=(\\d+)?");

				//if(val.indexOf("userid") > -1){
				//	r = new RegExp(method + "\/(\\d+)?\/");
				//}

				if(val.indexOf(method + "/") > -1){
					r = new RegExp(method + "\/(\\d+)\/?");
				}

				val = r.exec(val)[1];
			}
			getInfo("get?" + method + "=" + val);
		}else{
			alert("You must input something");
		}
	};

	var getInfo = function(u){
		var str =  '<li class="list-group-item list-group-item-info text-center" style="display: list-item;margin-left: 15px;">\
						<a href="${durl}" download="${artist}${name}" target="_blank" class="songItem" style="font-size: 16px;font-weight: 500">${artist} - ${name}</a>\
						<a class="btn btn-default preview" style="right: 130px;position: absolute;padding: 0px 12px;" data="${durl}" onclick="preview(this)">Preview</a>\
						<a class="btn btn-default save" style="right: 15px;position: absolute;padding: 0px 12px;" data="${durl}" onclick="saveToPan(this)">Save To Pan</a>\
					</li>';
		var error = '<div class="alert alert-warning">\
						<p>If you are using a <b>SONG</b> id, try again by add this song into a <b>PLAYLIST</b> or find a <b>PLAYLIST</b> or <b>ALBUM</b> contains this song.</p>\
						<p>If still not working, try to connect this site with a Chinese proxy and try again.</p>\
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
				var title = data.listname;
				var dom = [];
				var hint = "";
				result.html("");
				songlist.slideDown();
				localStorage.setItem("place", place);
				if(res == "true"){
					if(title){
						hint = "😎 WOW! In List: " + title + " We Got " + num + " Songs!";
					}else{
						hint = "😎 WOW! We Got " + num + " Song!";
					}
					for (var i = 0; i < num; i++) {
						var s = songs[i];
						var d = place == "CN" ? s["durl"] : s["durl"].replace("http://m","http://p");
						var n = s["name"];
						var a = s["artist"];
						tem = str.replace(/\$\{durl\}/g, d);
						tem = tem.replace(/\$\{name\}/g, n);
						if(tem.indexOf(a) == -1){
							tem = tem.replace(/\$\{artist\}/g, a + " - ");
						}else{
							tem = tem.replace(/\$\{artist\}/g, "");
						}
						dom.push(tem);
					}
				}else{
					hint = "😷 Opps, nothing found :(";
					dom.push(error);
				}
				$("#num").html(hint);
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
				var SERVER_URL = "save";
				var BAIDUPAN_SAVE_URL = "http://pan.baidu.com/rest/2.0/services/cloud_dl?channel=chunlei&clienttype=0&web=1&bdstoken=" + t;
				var postData = {
					method: "add_task",
					app_id: 250528,
					save_path: p,
					source_url: l
				};
				var resUrl = null;

				var saveDirectly = function() {
					_ajaxPost(BAIDUPAN_SAVE_URL, postData);
				}

				var saveViaServer = function(){
					postData.cookie = c;
					postData.token = t;
					_ajaxPost(SERVER_URL, postData);
				}

				var _ajaxPost = function(url, data) {
					$.ajax({
						type : "POST",
						url : url,
						data: _makeForm(data),
						crossDomain: true,
						xhrFields: {
							withCredentials: true
						},
						beforeSend : function(xhr) {
							//xhr.setRequestHeader('Cookie', c);
							//xhr.setRequestHeader("Referer", "http://pan.baidu.com/disk/home");
							//xhr.setRequestHeader("User-Agent", "netdisk;4.6.2.0;PC;PC-Windows;10.0.10240;WindowsBaiduYunGuanJia");
						},
						complete : function(res) {
							console.log(res);
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

				//saveDirectly();
				saveViaServer();
			}else{
				settings.modal("show");
			}
		}
	}

	window.preview = function(o){
		var s = $(o).attr("data");
		var p = $("#preview");
		p.attr("src", s);
		if(p.is(':hidden')){
			p.fadeIn();
		}
	}

	getLocation();

	if(location.hash){
		var param = location.hash.substring(2).split("?");
		var method = param[0];
		var val = param[1].substring(3);
		auto.addClass("disabled");
		getInfo("get?" + method + "=" + val);
		return;
	}
})();

