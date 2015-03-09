(function($){
  var Profile = Backbone.Model.extend({
    defaults: {
      //default to our fearless leader Gabe
      steam_id:"76561197960287930",
      avatar_full:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_full.jpg",
      avatar_medium:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c5/c5d56249ee5d28a07db4ac9f7f60af961fab5426_medium.jpg",
      persona_name:"Rabscuttle",
      real_name:"Gabe",
      game_count:0,
      games:[]
    }
  })

  var List = Backbone.Collection.extend({
    model: Profile
  })

  var ProfileView = Backbone.View.extend({
    tagName:'div',
    initialize: function(){
      _.bindAll(this,'render', 'update_element', 'get_friends', 'unrender_friends', 'unrender_chosen')
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
      this.unrender_chosen()
      this.collection.reset()
      $("div#user_info").append(this.render().el)
      this.get_friends()
    },
    get_friends: function(){
      var self = this
      if(this.model.get('steam_id') != this.model.defaults.steam_id){
        $.getJSON(window.location+"api/v1/friends", {steam_id:this.model.get('steam_id')}).done(function(data){
          if(data.success == true){
            var friends_ids = []
            data.friends.forEach(function(friend){
              friends_ids[friends_ids.length] = friend.steam_id
            })
            $.getJSON(window.location+"api/v1/profiles", {steam_ids:friends_ids.join(",")}).done(function(data){
              if(data.success){
                self.collection.reset()
                self.unrender_friends()
                data.profiles.forEach(function(profile){
                  var friend_profile = new Profile()
                  friend_profile.set(profile)
                  self.collection.add(friend_profile)
                })
                $('div#num_friends').html("Showing <strong>"+self.collection.length+"</strong>/<small>"+self.collection.length+"</small> friends")
              }
            })
          }
        })
      }else{
        $('div#num_friends').html("")
      }
    },
    append_friend: function(friend){
      var friendView = new ProfileView({model:friend})
      $('div#friends', this.el).last().append(friendView.render().el)
    },
    unrender_friends: function(){
      $('div#friends').empty()
      $('input#search_friends').val("")
      $('div#num_friends').html("<h2>Loading friends...</h2>")
    },
    unrender_chosen: function(){
      $('div#user_info').empty()
    }
  })

  var MainView = Backbone.View.extend({
    el: $("body"),
    events: {
      'click button#find':'find_user',
      'keyup input#search_friends':'filter_friends',
      'click div.steamify':'choose_friends',
      'click button#compare':'compare_games',
      'click button#reset':'reset'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'find_user', 'filter_friends', 'load_library', 'choose_friends', 'compare_games', 'reset')
      this.current_profile_model = new Profile()
      this.current_profile_view = new ProfileView({model:this.current_profile_model})
      this.chosen_friends = new List()
      this.render()
    },
    render: function(){
      $(this.el).append("<div class='container' id='title'></div><div class='container' id='find_user' /><div class='container' id='user_info' /><div class = 'ambidex' /><div class='container centered hidden' id='common_games'><button id='reset'>Go Back</button></div><div id='friends_div' class='container outline fill_gray'><div class='centered'><input id='search_friends' placeholder='Search within friends' /><div id='num_friends'></div><div class='container centered' id='friends' /></div>")
      $('div#title', this.el).append("<h1>Let's play!</h1>")
      $('div#find_user', this.el).append("<div class='lefty'><button id='find'>Find me!</button></div><div class='lefty'><input class='form-control' id='user' placeholder='steam id or custom url'/></div><div class='lefty hidden' id='compare_button'><button id='compare'>Find games!</button></div></div>")
      $('div#user_info').append(this.current_profile_view.render().el)
    },

    find_user: function(){
      $('div#compare_button').addClass('hidden')
      this.chosen_friends.reset()
      var user_input = $('#user').val()
      var currentModel = this.current_profile_model
      var self = this
      var updateModel = function(data){
        if(data.success == true){
          currentModel.set(data.profile)
          self.load_library()
        }
      }
      if(user_input.length == 17 && user_input.search(/[0-9]{17}/) == 0) { //raw id input
        $.getJSON(window.location+"api/v1/profile", {steam_id:this.steam_id}).done(updateModel)
      } else{
        $.getJSON(window.location+"api/v1/steam_id", {vanity_url:user_input}).done(function(data){
          if(data.success == true){
            $.getJSON(window.location+"api/v1/profile", {steam_id:data['steam_id']}).done(updateModel)
          }
        })
      }
    },
    load_library: function(){
      var self = this
      $.getJSON(window.location+"api/v1/games", {steam_id:self.current_profile_model.get("steam_id")}).done(function(data){
        if(data.success == true){
          self.current_profile_model.set(data,{silent:true})
        }
      })
    },
    filter_friends: function(event){
      var friend_to_find = $('input#search_friends').val().toUpperCase()
      var current_profile = this.current_profile_view
      var shown_counter = 0
      current_profile.collection.forEach(function(item){
        var name = item.get('persona_name').toUpperCase()
        if(friend_to_find != "" && name.indexOf(friend_to_find) == -1){
          $("div#"+item.get('steam_id'), "div#friends").addClass("hidden")
        }else{
          $("div#"+item.get('steam_id'), "div#friends").removeClass("hidden")
          shown_counter += 1
        }
      })
      $("div#num_friends", this.el).html("Showing <strong>"+shown_counter+"</strong>/<small>"+current_profile.collection.length+"</small> friends")

    },
    choose_friends: function(event){
      var self = this
      if($('div#user_info').find('div#'+event.currentTarget.id).length == 0){
        if(event.currentTarget.id != this.current_profile_model.get('steam_id')){
          $.getJSON(window.location+"api/v1/profile", {steam_id:event.currentTarget.id}).done(function(data){
            if(data.success == true){
              var chosen_one_profile = new Profile()
              chosen_one_profile.set(data.profile)
              $.getJSON(window.location+"api/v1/games", {steam_id:chosen_one_profile.get('steam_id')}).done(function(data){
                if(data.success == true){
                  chosen_one_profile.set(data)
                  var chosen_one = new ProfileView({model: chosen_one_profile})
                  self.chosen_friends.add(chosen_one)
                  $('div#user_info').append(chosen_one.render().el)
                  $('div#compare_button', 'div#find_user').removeClass('hidden')
                }
              })
            }
          })
        }
      }
    },
    compare_games: function(){
      $('div#friends_div').addClass("hidden")
      $('div#common_games').removeClass('hidden')
      $('div#compare_button').addClass('hidden')
    },
    reset: function(){
      $('div#friends_div').removeClass('hidden')
      $('div#common_games').addClass('hidden')
      $('input#search_friends').val("")
      this.filter_friends()
      $('input#user').val("")
      this.current_profile_model.clear({silent:true}).set(this.current_profile_model.defaults)
      this.chosen_friends.reset()
    }
  })

  var mainView = new MainView()

//checks for an enter press on the user input so trigger the button click.
  $("input#user").keyup(function(event){
    if(event.keyCode == 13){
        $("#find").click();
    }
});

})(jQuery)
