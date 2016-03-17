(function(){
	var toggle = $("#toggle");
	var auto = $("#auto");
	var music = $("#music");
	var playlist = $("#playlist");
	var input = $("#input");
	var songlist = $("#songlist");
	var result = $("#result");

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
			goMethod("playlist");
		}
	});

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
					method = "playlist";
				}else{
					alert("Auto detect failed, maybe specific it.");
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
		var str =  '<a href="${durl}" download="${name}" target="_blank" class="list-group-item list-group-item-info songItem">\
						<h4 class="list-group-item-heading text-center">${name}</h4>\
					</a>';
        $(".songItem").remove();
		$.ajax({
			method: "GET",
			dataType: "json",
			url: u,
			success : function (data) {
				var num = data.songs.length;
				var songs = data.songs;
				var res = data.result;
				var dom = [];
				songlist.slideDown();
				if(res == "true"){
					$("#num").html(num);
					for (var i = 0; i < num; i++) {
						var s = songs[i];
						var d = s["durl"];
						var n = s["name"];
                        console.log(s);
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

