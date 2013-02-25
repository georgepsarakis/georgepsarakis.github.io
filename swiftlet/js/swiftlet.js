$(document).ready(
  function(){
    window.Tweet = Backbone.Model.extend();
    window.TweetCollection = Backbone.Collection.extend({
      model : Tweet,
      sync : function(method, model, options){
	options.dataType = 'jsonp';
	options.url = 'http://search.twitter.com/search.json?rpp=50&callback=?';
	return Backbone.sync(method, model, options);
      },
      parse : function(response){
        var search_terms = $('#search').val().replace(/\*/,'').split(/\s+/);
	$.each(response['results'], function(index, t){
	  var profile_link = 'https://twitter.com/' + t['from_user'];
	  response['results'][index]['user_profile_link'] = profile_link;
	  var td = new Date(t['created_at']);
	  var hour = td.getHours();
	  var minute = td.getMinutes();
	  minute = ( minute < 10 ) ? '0' + minute : minute;
	  hour = ( hour < 10 ) ? '0' + hour : hour;
	  td = [ [ td.getDate(), td.getMonth() + 1, td.getFullYear() ], [ hour, minute ] ];
	  response['results'][index]['created_at'] = td[0].join('/') + ' ' + td[1].join(':');
	  // highlighting/entity parsing
	  var tweet_text = t['text'];
	  var p_link = new RegExp('\\s*((http|https)://[^\\s]+)','gi');
	  var links = tweet_text.match(p_link);
	  if ( links !== null ) {
	    $.each(links, function(index, link) {
              tweet_text = tweet_text.replace( link, linkify(link, link) );
	    });
	  }
	  var p_hashtag = new RegExp('(#[a-z0-9]+)', 'gi');
	  var hashtags = tweet_text.match(p_hashtag);
	  if ( hashtags !== null ) {
            $.each(hashtags, function(index, hashtag) {
	      var link = linkify('https://twitter.com/search?src=hash&q=' + encodeURIComponent(hashtag), hashtag);
              tweet_text = tweet_text.replace( hashtag, link ); 
	    });
	  }
          var p_mention = new RegExp('(@[a-z0-9_]+)', 'gi');
	  var mentions = tweet_text.match(p_mention);
	  if ( mentions !== null ) {
            $.each(mentions, function(index, mention) {
	      var link = linkify('https://twitter.com/' + mention.replace('@', ''), mention);
              tweet_text = tweet_text.replace( mention, link ); 
	    });
	  }
	  $.each(search_terms, function(index, term) {
	    var p = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
            tweet_text = tweet_text.replace(p, '<span class="hl">$1</span>');
	  });
	  //cleanup html
	  var split_text = tweet_text.split('<a href="');
	  if ( ( split_text.length > 1 ) && split_text !== null) {
	    $.each(split_text, function(index, p){
	      c = p.split('blank">');
	      if ( c.length > 1 ) {
                c[0] = c[0].replace('<span class="hl">', '').replace('</span>', '');
	        split_text[index] = c.join('blank">');	      
	      } else {
		split_text[index] = c.join('');
	      }
	    });
	    tweet_text = split_text.join('<a href="');	    
	  }
	  response['results'][index]['parsed_text'] = tweet_text;
	});
        return response['results'];
      }
    });
  
    // Views
    window.TweetListView = Backbone.View.extend({   
	tagName:'ul',   
	initialize:function () {
	  this.model.bind("reset", this.render, this);
	},   
	render:function (eventName) {
	    _.each(this.model.models, function (tweet) {
		$(this.el).attr('id', 'tweet-list').addClass('clearfix unstyled').append(new TweetListItemView({ model : tweet }).render().el);
	    }, this);
	    return this;
	}   
    });

    window.TweetListItemView = Backbone.View.extend({ 
      tagName:"li", 
      template:_.template($('#tweet-item').html()),
      render:function (eventName) {
	  $(this.el).addClass('clearfix').html(this.template(this.model.toJSON()));
	  return this;
      }
    });

    window.TweetView = Backbone.View.extend({
	template:_.template($('#tweet-details').html()),
	render:function (eventName) {
	    $(this.el).html(this.template(this.model.toJSON()));
	    return this;
	}
    });
     
    // Router
    var AppRouter = Backbone.Router.extend({
	routes:{
	    "search/:q/:page/:lang" : "list",
	    "tweet/:id" : "tweetDetails"
	},
	list : function (q, p, l) {
	    if (q.replace(/\s+/,'') == '')
	      return false;
	    this.tweetList = new TweetCollection();
	    this.tweetListView = new TweetListView({model:this.tweetList});
	    this.tweetList.fetch({ data: $.param({ lang: l, q: $('#search').val(), page : p }) });
	    $('#content').html(this.tweetListView.render().el);
	    $.unblockUI();
	},
	tweetDetails : function (id) {
	    this.tweet = this.tweetList.get(id);
	    this.tweetView = new TweetView({model:this.wine});
	    $('#content-details').html(this.tweetView.render().el);
	}
    });
     
    var app = new AppRouter();
    Backbone.history.start();
  }
)
