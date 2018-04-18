var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var OrgHierarchyNodeSchema = new Schema({
description: String,
parentOrgHierarchyId:Schema.Types.ObjectId,
});
module.exports = mongoose.model("OrgHierarchyNode", OrgHierarchyNodeSchema, "OrgHierarchy");
