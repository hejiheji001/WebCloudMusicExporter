(function(){
	var toggle = $("#toggle");
	var auto = $("#auto");
	var music = $("#music");
	var playlist = $("#playlist");
	var input = $("#input");
	var songlist = $("#songlist");
	var result = $("#result");
	var exp = $("#export");

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
						<a class="btn btn-default" style="right: 15px;position: absolute;padding: 0px 12px;">Save To Pan</a>\
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
                        //console.log(s);
						tem = str.replace("${durl}", d);
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
})();

