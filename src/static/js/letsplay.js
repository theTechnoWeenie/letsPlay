(function($){

//model for a players profile.
  var ProfileItem = Backbone.Model.extend({
    defaults: {
      //default to our fearless leader Gabe
      steam_id:"76561197960287930",
      avatar_full:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_full.jpg",
      avatar_medium:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_medium.jpg",
      persona_name:"Rabscuttle",
      real_name:"Gabe"
    }
  })

//controls the display of the player items.
  var ProfileItemView = Backbone.View.extend({
    tagName:'div',
    initialize: function(){
      _.bindAll(this,'render')
      this.model.bind('change', this.render)
      this.render()
    },

    render: function(){
      var html = "<div class='steamify'><div class='lefty'><h4>"
        +this.model.get('persona_name')
        +"<br /><small>"
        +(this.model.get('real_name') ==null?"":this.model.get('real_name'))
        +"</small></h4></div><div class='lefty wrap_content'><img src='"
        +this.model.get('avatar_medium')
        +"' /></div></div>"
      $(this.el).html(html)
      return this
    }
  })

//High level stuff.
  var ListView = Backbone.View.extend({
    el: $("body"),
    events: {
      'click button#find':'find_user'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'find_user')
      this.steam_id = ""
      this.current_profile_model = new ProfileItem()
      this.current_profile_view = new ProfileItemView({model:this.current_profile_model})
      this.render()
    },
    render: function(){
      $(this.el).append("<div class='container' id='title'></div><div class='container' id='find_user'></div><div class='container' id='user_info'></div>")
      $('div#title', this.el).append("<h1>Let's play!</h1>")
      $('div#find_user', this.el).append("<div class='lefty'><button id='find'>Find me!</button></div><div class='lefty'><input class='form-control' id='user' placeholder='steam id or custom url'/></div>")
      $('div#user_info').append(this.current_profile_view.render().el)
    },

    find_user: function(){
      var user_input = $('#user').val()
      var currentModel = this.current_profile_model
      var updateModel = function(data){
        if(data.success == true){
          currentModel.set(data.profile)
        }
      }
      if(user_input.length == 17 && user_input.search(/[0-9]{17}/) == 0) { //raw id input
        this.steam_id = user_input
        $.getJSON(window.location+"api/v1/profile", {steam_id:this.steam_id}).done(updateModel)
      } else{
        $.getJSON(window.location+"api/v1/steam_id", {vanity_url:user_input})
        .done(function(data){
          if(data.success == true){
            $.getJSON(window.location+"api/v1/profile", {steam_id:data['steam_id']}).done(updateModel)
          }
        })
      }
    }
  })

  var listView = new ListView()

  $("#user").keyup(function(event){
    if(event.keyCode == 13){
        $("#find").click();
    }
});

})(jQuery)
