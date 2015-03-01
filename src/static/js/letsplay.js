(function($){
  var ListView = Backbone.View.extend({
    el: $("body"),
    events: {
      'click button#find':'find_user'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'find_user')
      this.render()
    },
    render: function(){
      $(this.el).append("<div class='container' id='title'></div><div class='container' id='find_user'></div>")
      $('div#title', this.el).append("<h1>Let's play!</h1>")
      $('div#find_user', this.el).append("<button id='find'>Find steam user</button><input id='user' />")
      $('#user').watermark('steam id or custom url')
    },

    find_user: function(){
      alert("You would be finding a user right now but it's 2 am, and bed time.")
    }
  })

  var listView = new ListView()
})(jQuery)
