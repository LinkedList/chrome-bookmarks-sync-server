$(document).ready(function () {
	//user id
	var key = $("#key").data("key");
	var currentFolderId = null;
	var currentBookmark = 0;
	var STEP = 20;

	var orgBookmarks = {};

	$(".folder").on("click", function (event) {
		event.preventDefault();

		$("#search").val("");

		var parentId = $(this).attr("id");

		if(currentFolderId !== parentId) {

			$(".bookmarks").empty();

			$(".pure-menu-selected").removeClass("pure-menu-selected");
			$(this).closest("li").addClass("pure-menu-selected");

			currentBookmark = 0;
			currentFolderId = parentId;

			if(typeof orgBookmarks[parentId] === 'undefined') {
				orgBookmarks[parentId] = $.grep(bookmarks, function (bookmark) {
					return bookmark.parentId === parentId;
				});
			}

			currentBookmark = addBookmarks(currentBookmark, orgBookmarks[parentId], STEP);
			showAddPageButton(currentBookmark, orgBookmarks[parentId]);
		}
	});

	$("#addPage").on("click", function (event) {
		currentBookmark = addBookmarks(currentBookmark, orgBookmarks[currentFolderId], STEP);
		showAddPageButton(currentBookmark, orgBookmarks[currentFolderId]);
	});

	$(".folder").first().trigger('click');
	currentFolderId = $(".folder").first().attr('id');

	//search
	var fuse = new Fuse(bookmarks, {keys: ['title', 'url']});

	$("#search").on("focus", function (event) {
		$(this).val("");
	});

	$("#search").on('keypress', function (event) {
		var $this = $(this);

		$(".pure-menu-selected").removeClass("pure-menu-selected");
		currentFolderId = null;

		typewatch(function () {
			var _search = $this.val();
			var result = fuse.search(_search);

			orgBookmarks.search = result;
			currentBookmark = 0;
			currentFolderId = 'search';
			$(".bookmarks").empty();

			currentBookmark = addBookmarks(currentBookmark, orgBookmarks.search, STEP);
			showAddPageButton(currentBookmark, orgBookmarks[currentFolderId]);
		}, 500);
	});

	document.getElementById("search").onkeydown = function (event) {
		event = event || window.event;
		if(event.keyCode === 27) {
			$("#search").val("");
			$('#' + currentFolderId).trigger('click');
		}
	};
});

var typewatch = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

function addBookmarks (currentBookmark, bookmarks, STEP) {
	var html = '';
	for(var i = currentBookmark; i < currentBookmark + STEP && i < bookmarks.length ; i++) {
		var bookmark = bookmarks[i];
		var a = document.createElement('a');
		a.href = bookmark.url;
		html += '<li><img width="16" height="16" src="http://g.etfv.co/http://'+ a.hostname + '" /><a class="bookmark" target="_blank" href="' + bookmark.url + '">' + bookmark.title + ' <span class="hostname">' + a.hostname.replace('www.', '') +'</span></a></li>';
	}
	$(".bookmarks").append(html);
	return i;
}

function showAddPageButton (currentBookmark, bookmarks) {
	if(currentBookmark === bookmarks.length) {
		$("#addPage").hide();
	} else {
		$("#addPage").show();
	}
}
