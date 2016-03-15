(function(){
	var auto = $("#auto");
	var music = $("#music");
	var playlist = $("#playlist");
	var input = $("#input");

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
		var val = input.val();
		if(val){
			if(method == "auto"){
				if(val.indexOf("song") > -1){
					method = "id";
				}else if(val.indexOf("playlist") > -1){
					method = "playlist";
				}else{
					alert("Auto detect failed, maybe specific it.");
					return;
				}
			}

			getInfo("/cloudmusic/get?" + method + "=" + val);
		}else{
			alert("You must input something");
		}
	}

	var getInfo = function(u){
		$.ajax({
			method: "GET",
			dataType: "json"
			url: u,
			success : function (data) {
				console.log(data);
			}
		});
	}
})();

