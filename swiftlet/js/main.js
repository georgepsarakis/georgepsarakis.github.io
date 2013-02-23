var search_width = 0;
var current_tweet_scroll_index = 0;
$(document).ready(
  function() {
    search_width = $('#search').width();
    initCache();
    $.ajax({
      dataType: "json",
      url: 'json/languages.json',
      async: false,
      success: function(data){
        $.each(data, function(index, lang){
  	  var selected = (lang['code'] == 'en') ? 'selected' : '';
	  var option = '<option ' + selected + ' value="' + lang['code'] + '">' + lang['name']  + '</option>    ';
          $('#language-select').append( option );
        });
      }
    });
    $('.selectpicker').selectpicker();
    $(document).keydown(function(e) {
      var scroll_options = { 'axis' : 'y', 'duration' : 1000, 'margin' : true , 'offset' : { 'top' : -60, 'left' : 0 } };
      if ( e.keyCode == 40 ) {
	current_tweet_scroll_index++;
	if ( current_tweet_scroll_index > $('#tweet-list li').length - 1 )
	  current_tweet_scroll_index = $('#tweet-list li').length - 1;
        $.scrollTo('#tweet-list li:eq(' + current_tweet_scroll_index + ')', scroll_options );
	e.preventDefault();
      }
      else if ( e.keyCode == 38 ) {
	current_tweet_scroll_index--;
	if ( current_tweet_scroll_index < 0 )
	  current_tweet_scroll_index = 0;
	$.scrollTo('#tweet-list li:eq(' + current_tweet_scroll_index + ')', scroll_options );
	e.preventDefault();
      } else {
	current_tweet_scroll_index = 0;
      }
    });
    /*
    $(document).on('click', '.display-tweet-trigger', function(){
      var id = $(this).attr('class').match(/id-[0-9]+/)[0].replace('id-', '');
      var user = $(this).attr('class').match(/user-[a-zA-Z0-9_]+/)[0].replace('user-', '');
      var url = 'https://twitter.com/' + user + '/status/' + id;
      $('#display-tweet .modal-body').html('<iframe src="' + url  + '"></iframe>');
    });
    */
    if (window.location.hash != '') {
      if ( window.location.hash.match(/^#search\//) ) 
        $('#search').val(decodeURIComponent(window.location.hash.split('/')[1]));
    }
    $('#search').keydown(function(e) {
      if ( e.keyCode == 13 ) {
	window.location.hash = 'search/' + encodeURIComponent($(this).val());
        setCacheArray('swiftlet', $(this).val());
      }
    });
    $('#search').focus(
      function(){
	$(this).css('width', $(this).parents('.navbar-inner').width()/2);
    }).blur(function() {
      $(this).css('width', search_width);
    });
  }
);        

function clearCache() {
  $.localStorage.clear();
  $.sessionStorage.clear();
  initCache();
}

function initCache() {
  if ( getCache('swiftlet') === null)
    setCache('swiftlet', { 'searches' : [] } );
}

function setCache(k, v) {
  if (typeof v != 'string')
    v = JSON.stringify(v)
  $.localStorage.setItem(k, v);
}

function getCache(k) {
  return JSON.parse($.localStorage.getItem(k));
}

function setCacheArray(k, v) {
  var c = getCache(k);
  if ( ( c !== null ) && !(v in c) )
    setCache(c['searches'].push(v));
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function linkify(href, text){
  return '<a href="' + href + '" target="_blank">' + text + '</a>';
}
