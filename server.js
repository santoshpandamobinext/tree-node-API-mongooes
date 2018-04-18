var express = require('express');
var app = express();
var router = express.Router();
var _ = require('lodash');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var orgHierarchyNodes = require('./models/orgHierarchyNodes');
var entityRelationNodes = require('./models/entityRelationNodes');
var dbURI = 'mongodb://localhost:27017/iguru';

mongoose.connect(dbURI);


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3300;
var treeData, finalTree;


var treeStruct = function (array) {
  var map = {}
  for (var i = 0; i < array.length; i++) {
    var obj = array[i]
    if (!(obj.Id in map)) {
      map[obj.Id] = obj
      map[obj.Id].children = []
    }

    var parent = obj.Parent || '-';
    if (!(parent in map)) {
      map[parent] = {}
      map[parent].children = []
    }

    map[parent].children.push(map[obj.Id])
  }
 var result = map['-'].children; 
  return _.keyBy(result, 'Id');
}
var searchTree = function (tree, id) {
    if (tree.Id == id) {
      return tree;
    } else if (tree.children != null) {
      var i;
      var result;
      for (i = 0; (!result)&& i < tree.children.length; i++) {
        result = searchTree(tree.children[i], id);
      }
      return result;
    }
    return null;
}

// DB CONNECTION EVENT, When successfully connected
mongoose.connection.on('connected', function () {
  console.log('\n Mongoose default connection open to ' + dbURI + '\n');
  orgHierarchyNodes.find({}, function (err, results) {
    var nodeMap = {};
    if (err) return next(err);
    treeData = results.map((data) => {
      if (data.parentOrgHierarchyId) {
        return { "Id": data._id, "title": data.description, "Parent": data.parentOrgHierarchyId.toString(), expanded: true };
      } else {
        return { "Id": data._id, "title": data.description, "Parent": '', expanded: true };
      }
    });
    finalTree = treeStruct(treeData);
    console.log(JSON.stringify(finalTree));
  });
});


/* GET ALL OrgHierarchyNode */
router.get('/treeData', function (req, res, next) {
  res.json(finalTree);
});

/* get all node as per entity id*/
router.get('/treeData/:id', function (req, res, next) {  
  entityRelationNodes.findOne({"entityAccountId":req.params.id},function (err, results){
  // let searchTreeResult = searchTree(finalTree[results.index],results.childEntityAccountId );
   res.json(finalTree[results.childEntityAccountId]);
  });
 

});

//associate router to url path
app.use('/api', router);
//start the Express server
app.listen(port);
console.log('Listening on port ' + port);