var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment')
    visTypes = require('./visTypes.js');

exports.viewByAssignmentNumber = function(req, res) {
    var assignmentNumber;

    // var getUsername = function(users, usernames, cb) {
    //     if (users.length == 0) return cb(usernames)
    //     var user = users.pop()
    //     User
    //         .findOne({
    //             "email": user
    //         })
    //         .exec(function(err, user) {
    //             if (err) return null;
    //             if (user) usernames.push(user.username)
    //             getUsername(users, usernames, cb)
    //         })
    // }

    var getAssignmentsEmailAndUsernameMap = function(users, usernamesmap, cb) {
        if (users.length == 0) return cb(usernamesmap)
        var user = users.pop()
        User
            .findOne({
                "email": user
            })
            .exec(function(err, user) {
                if (err) return null;
                if (user){
                  // usernames.push(user.username)
                  usernamesmap[user.email] = user.username
                }
                getAssignmentsEmailAndUsernameMap(users, usernamesmap, cb)
            })
    }

    if (!req.params.assignmentNumber) {
      return next("No assignment number given");


    } else {

      assignmentNumber = req.params.assignmentNumber;

      Assignment
          .find({
              assignmentNumber: assignmentNumber,
              subAssignment: "00",
              shared: true
          }, {
              title: 1,
              assignmentNumber: 1,
              email:1,
              "data.visual":1,
              "data.dims":1,
           })
          .exec(function(err, assignmentResult) {

              if (err) return next(err)
              if (!assignmentResult) return next("could not find " +
                  "assignment " + req.params.assignmentNumber)

              if(assignmentResult.length == 0) {
                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignments": "",
                      "assignmentNumber":-1
                  })
              }

              if(assignmentResult.length <= 0) {
                  return res.redirect('/username/'+req.user.username);
              }

              var users = []
              for (i = 0; i < assignmentResult.length; i++)
                  users.push(assignmentResult[i].email)

              // getUsername(users, [], function(usernames) {
              //
              //     return res.render('assignments/gallery', {
              //         "title": "Assignment gallery",
              //         "user":req.user,
              //         "usernames": usernames,
              //         "assignmentNumber":req.params.assignmentNumber,
              //         "assignments":assignmentResult
              //     })
              // })

              var usernamesmap = {};
              getAssignmentsEmailAndUsernameMap(users, usernamesmap, function(usernamesmap) {

                  for(assignmentResultItem in assignmentResult){
                      assignmentResult[assignmentResultItem]['username'] = usernamesmap[assignmentResult[assignmentResultItem]['email']];

                      var $thisVistype = visTypes.getVisType(assignmentResult[assignmentResultItem]['data'][0]['visual']);
                      if($thisVistype == "Alist") $thisVistype = visTypes.checkIfHasDims(assignmentResult[assignmentResultItem]['data'][0]);
                      assignmentResult[assignmentResultItem]['vistype'] = $thisVistype;
                      // assignmentResult[assignmentResultItem]['thumbnail'] = assignmentResult[assignmentResultItem]['vistype'];
                  }

                  console.log("assignmentResult: " + assignmentResult);


                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignmentNumber":req.params.assignmentNumber,
                      "assignments":assignmentResult
                  })
              })
          })
        }
}

//assignmentNumber is and is treated as the user's username in this method
exports.viewByUserName = function(req, res) {

    if (!req.params.assignmentNumber) {
      return next("No assignment number given");


    } else {

      var assignmentNumber = req.params.assignmentNumber;
      // var user;

      User
          .findOne({username:assignmentNumber})
          .exec(function (err, user) {
              if (err) return next(err)
              if (user) {

                  Assignment
                      .find({
                          email:user.email,
                          shared:true
                      },{
                        title: 1,
                        assignmentNumber: 1,
                        "data.visual":1,
                        "data.dims":1
                      })
                      .exec(function(err, assignmentResult) {
                          // console.log("assignmentResult: " + assignmentResult);

                          if (err) return next(err)
                          if (!assignmentResult) return next("could not find " +
                              "assignment " + req.params.assignmentNumber)

                          if(assignmentResult.length == 0) {
                              return res.render('assignments/gallery', {
                                  "title": "Assignment gallery",
                                  "user":req.user,
                                  "assignments": "",
                                  "assignmentNumber":-1
                              })
                          }

                          if(assignmentResult.length <= 0) {
                              return res.redirect('/user/'+req.user.username);
                          }


                          for(var i = 0; i < assignmentResult.length; i++) {
                              // add new resource info
                              var $thisVistype = visTypes.getVisType(assignmentResult[i].data[0].visual);
                              if($thisVistype == "Alist") $thisVistype = visTypes.checkIfHasDims(assignmentResult[i].data[0]);
                              assignmentResult[i]['vistype'] = $thisVistype;
                          }
                          // console.log("assignmentResult: " + assignmentResult);


                          return res.render('assignments/publicUserGallery', {
                              "title": "Assignment gallery",
                              "user":user,
                              "assignmentNumber":req.params.assignmentNumber,
                              "assignments":assignmentResult
                          })

                      })

              }
          })
      // console.log("assignmentNumber: " + assignmentNumber);

    }
}
