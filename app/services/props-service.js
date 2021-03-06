angular.module('dueprops.services').factory('Props', ['$rootScope', '$firebaseArray', 'Refs', 'Feed', function($rootScope, $firebaseArray, Refs, Feed) {
  var service = {
    // initialized below
    user: null,

    init: function(user) {
      this.user = user;
      if (user) {
        var self = this;
        Feed.forUser(this.user).then(function(result) {
          self.user.feed = result[0];
        });
        this.user.props = $firebaseArray(Refs.props);
      }
    },

    draft: function(prop) {
      return {
        name: prop.name,
        description: prop.description,
        icon: prop.icon,
        thumb: prop.thumb,
        large: prop.large,
        habitat: prop.habitat,
        sender: {
          uid: this.user.uid,
          name: this.user.name,
          email: this.user.email,
          picture: this.user.picture
        },
        sent_at: Firebase.ServerValue.TIMESTAMP,
      };
    },

    love: function(prop) {
      prop.$ref.child('lovers').child(this.user.id).set(true); // save remotely
    },

    loved: function(prop) {
      return prop.lovers && !!prop.lovers[this.user.id];
    },

    send: function(draftProps) {
      for(var i = 0; i < draftProps.to.length; i++) {
        Refs.receivedProps(draftProps.to[i].text).child('received').push(draftProps);
        
        // create a variable for the API call parameters
        var params = {
          message: {
            from_email: 'dueprops@andela.co',
            to:[{email: draftProps.to[i].text}],
            subject: 'Sending a text email from Dueprops',
            text: 'You just got a prop for ' + draftProps.reason + '.'
          }
        };

        var m = new mandrill.Mandrill('TOUUcftjdOYJFoKFbR72pA');
        m.messages.send(params, function(res) {
          
        }, function(err) {
          alert('Oops! Sorry, something went wrong. Please try again.');
        });
      }
    },

    validate: function(draftProps) {
      return !!draftProps.to && !!draftProps.reason && draftProps.reason.length <= 140;
    }
  };

  return service;
}]);
