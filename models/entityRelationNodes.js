var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var entityRelationNodesSchema = new Schema({
entityAccountId: String,
childEntityAccountId:String,
index:String,
});
module.exports = mongoose.model("entityRelationNodes", entityRelationNodesSchema, "entityRelation");
