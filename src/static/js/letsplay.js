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

  var FriendItem = Backbone.Model.extend({
    defaults:{
      steam_id:"",
      since:0
    }
  })

  var List = Backbone.Collection.extend({
    model: ProfileItem
  })


//controls the display of the player items.
  var ProfileItemView = Backbone.View.extend({
    tagName:'div',
    initialize: function(){
      _.bindAll(this,'render', 'update_element', 'get_friends', 'unrender_friends')
      this.model.bind('change', this.update_element)
      this.collection = new List()
      this.collection.bind('add', this.append_friend)
      this.render()
    },

    render: function(){
      var html = "<div class='lefty'><h4>"
        +this.model.get('persona_name')
        +"<br /><small>"
        +(this.model.get('real_name') ==null?"":this.model.get('real_name'))
        +"</small></h4></div><div class='lefty wrap_content'><img src='"
        +this.model.get('avatar_medium')
        +"' /></div>"
      $(this.el).html(html)
      $(this.el).addClass("lefty")
      $(this.el).attr('id', this.model.get('steam_id'))
      $(this.el).addClass("steamify")
      return this
    },
    update_element: function(){
      this.unrender_friends()
      this.collection.reset()
      this.render()
      this.get_friends()
    },
    get_friends: function(){
      var self = this
      $.getJSON(window.location+"api/v1/friends", {steam_id:this.model.get('steam_id')}).done(function(data){
        if(data.success == true){
          var friends_ids = []
          data.friends.forEach(function(friend){
            friends_ids[friends_ids.length] = friend.steam_id
          })
          $.getJSON(window.location+"api/v1/profiles", {steam_ids:friends_ids.join(",")}).done(function(data){
            if(data.success){
              data.profiles.forEach(function(profile){
                var friend_profile = new ProfileItem()
                friend_profile.set(profile)
                self.collection.add(friend_profile)
              })
            }
          })
        }
      })
    },
    append_friend: function(friend){
      var friendView = new ProfileItemView({model:friend})
      $('div#friends', this.el).last().append(friendView.render().el);
    },
    unrender_friends: function(){
      $('div#friends').empty()
    }
  })

//High level stuff.
  var MainView = Backbone.View.extend({
    el: $("body"),
    events: {
      'click button#find':'find_user',
      'keyup input#search_friends':'filter_friends'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'find_user', 'filter_friends')
      this.steam_id = ""
      this.current_profile_model = new ProfileItem()
      this.current_profile_view = new ProfileItemView({model:this.current_profile_model})
      this.render()
    },
    render: function(){
      $(this.el).append("<div class='container' id='title'></div><div class='container' id='find_user'></div><div class='container' id='user_info'></div><div class = 'ambidex' /><div class='container outline fill_gray'><div class='centered'><input id='search_friends' placeholder='Search within friends' /><div class='lefty' id='num_frineds' /><div class='container-fluid centered' id='friends' /></div>")
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
    },
    filter_friends: function(event){
      var friend_to_find = $('input#search_friends').val()
      var current_profile = this.current_profile_view
      var shown_counter = 0
      current_profile.collection.forEach(function(item){
        var name = item.get('persona_name')
        if(friend_to_find != "" && name.indexOf(friend_to_find) == -1){
          $("div#"+item.get('steam_id')).addClass("hidden")
        }else{
          $("div#"+item.get('steam_id')).removeClass("hidden")
          shown_counter += 1
        }
      })
      var wrapper = $('div#friends')
      var visible = wrapper.find('div#friend:visible')
      var invisible = wrapper.find('div#friend').not(':visible')
      visible.appendTo($(wrapper))
      invisible.appendTo($(wrapper))
      $('div#num_friends').html("Showing <strong>"+shown_counter+"</strong friends")
    }
  })

  var mainView = new MainView()

  $("#user").keyup(function(event){
    if(event.keyCode == 13){
        $("#find").click();
    }
});

})(jQuery)
