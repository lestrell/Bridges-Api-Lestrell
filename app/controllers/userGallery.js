var mongoose = require('mongoose'),
    Assignment = mongoose.model('Assignment'),
    visTypes = require('./visTypes.js');

exports.view = function(req, res, next) {
  Assignment
      .find({
          email: req.user.email,
          subAssignment: "00"
      }, {
          assignmentID: 1,
          title: 1,
          dateCreated:1,
          // description: 1,
          assignmentNumber: 1,
          "data.visual": 1,
          "data.dims":1,
          vistype: 1,
          shared: 1,
      })
      //Do we want to load every single whole number assignment, or just some? Query might be time intensive.
      // .limit( 25 )
      .exec(function(err, assignmentResult) {
          if (err) return next(err);
          if (!assignmentResult) return next("could not find " + "assignment " + req.params.userNameRes);

          // sort on assignment ID since assignmentID could be String
          // sort on dateCreated in milliseconds
          assignmentResult.sort(function(a, b) {
              return Date.parse(b.dateCreated) - Date.parse(a.dateCreated);
              // return parseFloat(a.assignmentID) - parseFloat(b.assignmentID);
          });

          for(var assignmentResultItem in assignmentResult){
              var $thisVistype = visTypes.getVisType(assignmentResult[assignmentResultItem]['data'][0]['visual']);
              if($thisVistype == "Alist") $thisVistype = visTypes.checkIfHasDims(assignmentResult[assignmentResultItem]['data'][0]);
              assignmentResult[assignmentResultItem]['vistype'] = $thisVistype;
          }

          return res.render('assignments/userGallery', {
            "title": "Assignment gallery",
            "user":req.user,
            "username": req.params.userNameRes,
            "assignments":assignmentResult
          });
      });
};
