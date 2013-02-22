$(document).ready(
  function(){
    window.Tweet = Backbone.Model.extend();
    window.TweetCollection = Backbone.Collection.extend({
      model : Tweet,
      sync : function(method, model, options){
	options.dataType = 'jsonp';
	options.url = 'http://search.twitter.com/search.json?callback=?';
	return Backbone.sync(method, model, options);
      },
      parse : function(response){
	$.each(response['results'], function(index, t){
	  var image = response['results'][index]['profile_image_url'].replace(/normal/,'mini');
	  response['results'][index]['profile_image_url'] = image;
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
	    "search/:q"       : "list",
	    "tweet/:id" : "tweetDetails"
	},
	list:function (q) {
	    this.tweetList = new TweetCollection();
	    this.tweetListView = new TweetListView({model:this.tweetList});
	    this.tweetList.fetch({ data: $.param({ q: $('#search').val() }) });
	    $('#content').html(this.tweetListView.render().el);
	},
	tweetDetails:function (id) {
	    this.tweet = this.tweetList.get(id);
	    this.tweetView = new TweetView({model:this.wine});
	    $('#content-details').html(this.tweetView.render().el);
	}
    });
     
    var app = new AppRouter();
    Backbone.history.start();
  }
)
