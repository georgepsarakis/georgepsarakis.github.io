$(document).ready(
  function(){
    if (window.location.hash != '') {
      if ( window.location.hash.match(/^#search\//) ) 
        $('#search').val(window.location.hash.split('/')[1]);
    }
    $('#search').keydown(function(e) {
      if ( e.keyCode == 13 ) {
	window.location.hash = 'search/' + $(this).val();
      }
    });
  }
);        

