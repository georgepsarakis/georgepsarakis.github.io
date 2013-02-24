var search_width = 0;
var current_tweet_scroll_index = 0;
$(document).ready(
  function() {    
    search_width = $('#search').width();
    $('#language-select').change(
      function(){
	window.location.hash = hashManage({ ':lang' : $(this).children('option:selected').val() });
      }
    );
    initCache();
    $.ajax({
      dataType: "json",
      url: 'json/languages.json',
      async: false,
      success: function(data){
        $.each(data, function(index, lang){
  	  var selected = (lang['code'] == 'en') ? 'selected' : '';
	  var option = '<option ' + selected + ' value="' + lang['code'] + '"><a href="javascript:void(0);">' + lang['name']  + '</a></option>    ';
          $('#language-select').append( option );
        });
      }
    });
    $(document).keydown(function(e) {
      var hook = ($(document.activeElement).prop('tagName') == 'BODY');
      var scroll_options = { 'axis' : 'y', 'duration' : 1000, 'margin' : true , 'offset' : { 'top' : -60, 'left' : 0 } };
      if ( hook && ( e.keyCode == 40 ) ) {
	current_tweet_scroll_index++;
	if ( current_tweet_scroll_index > $('#tweet-list li').length - 1 )
	  current_tweet_scroll_index = $('#tweet-list li').length - 1;
        $.scrollTo('#tweet-list li:eq(' + current_tweet_scroll_index + ')', scroll_options );
	e.preventDefault();
      }
      else if ( hook && ( e.keyCode == 38 ) ) {
	current_tweet_scroll_index--;
	if ( current_tweet_scroll_index < 0 )
	  current_tweet_scroll_index = 0;
	$.scrollTo('#tweet-list li:eq(' + current_tweet_scroll_index + ')', scroll_options );
	e.preventDefault();
      } else {
	current_tweet_scroll_index = 0;
      }
    });    
    // Infinite scroll
    $(window).scroll(function() {
      var height = $(document).height() - $(window).height() - 10;
      var scroll_condition = ($(window).scrollTop() >= height);
      scroll_condition = scroll_condition && ($('.blockUI').css('display') != 'none');
      if ( scroll_condition ) {
        Reload(hashManage({ ':page' : parseInt(fetchHashParam(':page'), 10) + 1 } ));
      }
    });
    // restore controls based on hash
    if (window.location.hash != '') {
      if ( window.location.hash.match(/^#\/search\//) ) {
        var h = window.location.hash.replace(/^#\/search\//, '');
	h = _.map(h.split('/'), decodeURIComponent);
        $('#search').val(h[0]);
	$('#language-select').val(h[1]);
      }
    }
    $('#search').keydown(function(e) {
      if ( e.keyCode == 13 ) {
        var params = {':q' : $(this).val(), ':lang' : $('#language-select option:selected').val(), ':page' : 1 };
        Reload(hashManage(params));
        setCacheArray('swiftlet', $(this).val());
      }
    });
    $('#search').focus(
      function(){
	$(this).css('width', $(this).parents('.navbar-inner').width()/2);
    }).blur(function() {
      $(this).css('width', search_width);
    });
    $('.selectpicker').selectpicker();
  }
);        

function Reload(hash) {
  window.location.hash = hash;
  var blockui_css = { 
        padding:         0, 
        margin:          0, 
        width:           '30%', 
        top:             '40%', 
        left:            '35%', 
        textAlign:       'center', 
        color:           '#000', 
        border:          'none', 
        backgroundColor: 'transparent', 
        cursor:          'wait' 
    };
  // styles for the overlay 
  var blockui_overlay =  { 
    backgroundColor: '#f3f3f3', 
    opacity:         0.6, 
    cursor:          'wait' 
  };
  $.blockUI({ overlayCSS : blockui_overlay, 
              css: blockui_css , 
              message: '<img src="img/ajax-loader.png" />' 
            }); 
}

var search_template = ":q/:page/:lang";

function fetchHashParam(p){
  return hashParse()[p];
}

function hashParse(){
  var h = {};
  var hash = _.map(window.location.hash.replace(/^#\/search\//, '').split('/'), decodeURIComponent);
  $.each(search_template.split('/'), function(i, p) {
    h[p] = hash[i];
  });
  return h;
}

function hashManage(h) {
  var defaults = { ':q' : $('#search').val(), ':page' : 1, ':lang' : 'en' };
  var search_params = search_template.split('/');
  var search_modified_hash = ['search'];
  $.each(search_params, function(i, p) {
    if (p in h) {
      search_modified_hash.push( h[p] );
    } else {
      search_modified_hash.push(defaults[p]);
    }
  });
  search_modified_hash = _.map(search_modified_hash, encodeURIComponent);
  return _.reduce(search_modified_hash, function(h, p){ return h + '/' + p; }, '');
}

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
