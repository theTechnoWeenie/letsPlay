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
      $(this.el).addClass("steamify bordered")
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
                $('input#search_friends').removeClass('hidden')
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
      'mousedown div.steamify':'click_div',
      'mouseup div.steamify':'unclick_div',
      'click button#compare':'compare_games',
      'click button#reset':'reset'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'find_user', 'filter_friends', 'load_library', 'choose_friends', 'compare_games', 'reset', 'click_div', 'unclick_div')
      this.current_profile_model = new Profile()
      this.current_profile_view = new ProfileView({model:this.current_profile_model})
      this.chosen_friends = new List()
      this.chosen_friends.bind('add', this.append_chosen)
      this.render()
    },
    render: function(){
      $(this.el).append("<div class='container' id='title'></div><div class='container' id='find_user' /><div class='container' id='user_info' /><div class = 'ambidex' /><div class='container hidden' id='common_games'><div class='ambidex' /><div class='lefty centered' id='message' /><div class='ambidex' /><div class='container-fluid' id='games' /></div><div id='friends_div' class='container outline'><div class='centered'><input id='search_friends' class='hidden' placeholder='Search within friends' /><div id='num_friends'></div><div class='container centered' id='friends' /></div>")
      $('div#title', this.el).append("<h1>Let's play!</h1>")
      $('div#find_user', this.el).append("<div class='lefty'><input class='form-control' id='user' placeholder='steam id or custom url'/></div><div class='lefty'><button id='find'>Find me!</button><button id='reset' class='hidden'>Go Back</button></div><div class='lefty hidden' id='compare_button'><button id='compare'>Find games!</button></div></div>")
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
    click_div: function(event){
      $(event.currentTarget).css('border-color', '#3498db')
    },
    unclick_div: function(event){
      setTimeout(function(){$(event.currentTarget).css('border-color', '#27ae60')}, 150)
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
                  self.chosen_friends.add(chosen_one_profile)
                  $('div#compare_button', 'div#find_user').removeClass('hidden')
                }
              })
            }
          })
        }
      }
    },
    append_chosen: function(friend){
      var friendView = new ProfileView({model:friend})
      $('div#user_info').append(friendView.render().el)
    },
    compare_games: function(){
      $('button#find').addClass('hidden')
      $('button#reset').removeClass('hidden')
      $('div#friends_div').addClass("hidden")
      $('div#common_games').removeClass('hidden')
      $('div#message', 'div#common_games').html("<h2>Loading common games...</h2>")
      $('div#message', 'div#common_games').removeClass('hidden')
      $('div#compare_button').addClass('hidden')
      var my_games = this.current_profile_model.get('games')
      var common = $.map(my_games, function(element, index){
        return element.app_id
      })
      _(this.chosen_friends.models).each(function(friend){
        var friends_games = friend.get('games')
        friends_games = $.map(friends_games, function(element, index){
          return element.app_id
        })
        common = $.grep(common, function(element){
          return friends_games.indexOf(element) != -1
        })
      }, this)
      common = shuffleArray(common)
      var total = common.length
      $('div#message', 'div#common_games').html("<h2>0 out of "+total+" games loaded</h2>")
      common.forEach(function(app_id){
        $.getJSON(window.location+"api/v1/game_info", {app_id:app_id}).done(function(data){
          if(data.success == true){
            if(data.game.is_multiplayer == true){
              $('div#games', 'div#common_games').append("<div class='row'><div class='col-md-6'><h4>"+data.game.title+"</h4></div><div class='col-md-6'>"+data.game.image+"</div></div>")
            }
          }
          $('div#message', 'div#common_games').html("<h2>"+(common.length-total)+" out of "+common.length+" games loaded</h2>")
          total -= 1
          if(total <= 0){
            $('div#message', 'div#common_games').addClass("hidden")
          }
        })
      })
    },
    reset: function(){
      $('button#reset').addClass('hidden')
      $('button#find').removeClass('hidden')
      $('div#friends_div').removeClass('hidden')
      $('div#common_games').addClass('hidden')
      $('div#games', 'div#common_games').empty()
      $('input#search_friends').addClass('hidden')
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

//used to shuffle the common games so that we don't always get the same order.
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
