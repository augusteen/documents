/** 
 * @fileOverview This files contain Approver Matrix functions for BRMS Approver deployment
 * @author anadar
 * @version 1.0.0
 */


/**
 * @module ApproverMatrix
 */
importPackage(com.vistaar.docserver.util);
importPackage(org.json);
importPackage(java.lang);

/*

The script to add Approver Matrix
 */

var inpRoles = new org.json.JSONArray(docServerManager.getAllRolesDetails());
var BRMSConnector = VistaarJSUtils.getBRMSConnector(userConnInfo);

/*

Commenting out delete RuleBundles
var rulebundlesCodes= new Array ();
rulebundlesCodes[0] = "CWF_RB";
BRMSConnector.deleteRuleBundles(rulebundlesCodes) ;

var retVal = BRMSConnector.createRuleBundle("DOA_ApproverMatrix_RB","CWF_RB");
println("Returned Value is" + retVal);

var arrRuleSetName=[];

BRMSConnector.addRuleSet("DOA_ApproverMatrix_RB", "CWF_ApproverMatrix_DT");
BRMSConnector.addRuleSet("DOA_ApproverMatrix_RB", "Default Approver Setup");
BRMSConnector.addRuleSet("DOA_ApproverMatrix_RB", "CWF_Common");

*/

var ApproverMatrix = "CWF_ApproverMatrix_DT";
var creatorRuleSetObject = BRMSConnector.loadRuleSet(ApproverMatrix);

//println("\n\n\n\n=========creatorRuleSet"+creatorRuleSet);
var creatorRuleSetObjectJSON = new org.json.JSONObject(creatorRuleSetObject.toString());
creatorRuleSetObjectJSON.get("DecisionTableInfo").put("Data", []);

addToCreatorMatrix(inpRoles, creatorRuleSetObjectJSON);
var CreatorMatrixRuleSet = new com.vistaar.rules.dataObjects.RuleSet(creatorRuleSetObjectJSON.toString());
BRMSConnector.saveRuleSet(CreatorMatrixRuleSet);

var retVal = BRMSConnector.registerRules("DOA_ApproverMatrix_RB", 1, true);

println("Returned Value is" + retVal);

output = "success";

function addToCreatorMatrix(inpRoles, CreatorMatrix_DT) {
    try {
        var ruleSetData = JSON.parse(CreatorMatrix_DT.get("DecisionTableInfo").get("Data"));

        var l_inpRolesLen = inpRoles.length();
        var l_role = null;
        for (var roleItr = 0; roleItr < l_inpRolesLen; roleItr++) {
            l_role = String(inpRoles.get(roleItr).get("roleName"));
            //if(l_role=="Administrator" || l_role=="ADMIN-ALL GEOGRAPHY-ALL")
            if (l_role == "ADMIN-ALL GEOGRAPHY-ALL") {
                var tempAP1 = ["PricePlan", "All Geography", "All Geography", "All Product", "All Product", true, "Level1", null, "", ""];
                var tempAP2 = ["PricePlan", "All Geography", "All Geography", "All Product", "All Product", true, "Level2", null, "", ""];
                var tempAP3 = ["PricePlan", "All Geography", "All Geography", "All Product", "All Product", true, "Level3", null, "", ""];
                tempAP1[8] = tempAP2[8] = tempAP3[8] = l_role;
                addRuleName(tempAP1, l_role);
                addRuleName(tempAP2, l_role);
                addRuleName(tempAP3, l_role);
                ruleSetData.push(tempAP1);
                ruleSetData.push(tempAP2);
                ruleSetData.push(tempAP3);
                createApprover(tempAP3[9], l_role);
                continue;
            }
            var l_roleSplitArr = l_role.split("-");
            var l_cust = l_roleSplitArr[0];

            if (l_cust == "AP1" || l_cust == "AP2" || l_cust == "AP3") {
                var geographyArr = l_roleSplitArr[1].split("_");
                var productArr = l_roleSplitArr[2].split("_");
                var geographyArrLen = geographyArr.length;
                var productArrLen = productArr.length;
                var l_ruleName;
                for (var geoItr = 0; geoItr < geographyArrLen; geoItr++) {
                    var CreatorMatrixEntry = ["PricePlan", "", "", "", "", true, "", null, "", ""];
                    CreatorMatrixEntry[8] = l_role;
                    addLevel(CreatorMatrixEntry, l_cust);
                    addRuleName(CreatorMatrixEntry, l_role);
                    l_ruleName = CreatorMatrixEntry[9];
                    var geog = geographyArr[geoItr];
                    addGeography(CreatorMatrixEntry, geog);
                    for (var prodItr = 0; prodItr < productArrLen; prodItr++) {
                        var finalCreatorMatrixEntry = JSON.parse(JSON.stringify(CreatorMatrixEntry));
                        var prod = productArr[prodItr];
                        addProduct(finalCreatorMatrixEntry, prod);
                        ruleSetData.push(finalCreatorMatrixEntry);
                    }
                }


                println("Creating Approver Ruleset");

                createApprover(l_ruleName, l_role);

            }
        }
        CreatorMatrix_DT.get("DecisionTableInfo").put("Data", ruleSetData);
    } catch (err) {
        println('Failed to delete Ruleset ' + err);
    }

}

function createApprover(p_ruleName, p_RoleName) {
    try {

        var isDeletedRuleSet = deleteDeleteRuleSet(p_ruleName);

        if (isDeletedRuleSet) {

            var conditionalRuleSet = BRMSConnector.createRuleSet(p_ruleName, p_ruleName, "Decision Table", "CWF_DOA_Template");

            var approver = fetchApproverRules(p_RoleName);

            println("Approver" + approver);

            println(conditionalRuleSet.toString());

            //var ruleSetData = JSON.parse(conditionalRuleSet.get("DecisionTableInfo").get("Data"));

            //conditionalRuleSet.get("DecisionTableInfo").get("Data").push(JSON.parse(approver));
            conditionalRuleSet.get("DecisionTableInfo").put("Data", JSON.parse(approver));

            conditionalRuleSet.put("Content", null);

            println(conditionalRuleSet.toString());

            var conditionalRuleSetObj = new com.vistaar.rules.dataObjects.RuleSet(conditionalRuleSet.toString());

            BRMSConnector.saveRuleSet(conditionalRuleSetObj);

            BRMSConnector.addRuleSet("DOA_ApproverMatrix_RB", p_ruleName);

        }
    } catch (err) {
        println('Failed to delete Ruleset ' + err);
    }
}

function deleteDeleteRuleSet(p_ruleName) {

    try {
        var arr = [];
        arr.push(p_ruleName);
        BRMSConnector.deleteRuleSets(arr);

        return true;
    } catch (err) {
        println('Failed to delete Ruleset ' + err);
        return false;
    }

}

function fetchApproverRules(p_RoleName) {
    try {
        var AP1 = '[["Level1","ROLENAME",null,null,null,null,null,null,null,null,null,null,null,null,"ROLENAME"]]';

        var AP2 = '[["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent[this.Channels].MIN_NET_FOB_GUIDLINE, this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Priceline NET FOB is below Min FOB guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_GUIDLINE, this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Avg. full year Net FOB at Pricecat level is below Avg FOB guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_PREVIOUS_YEAR_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Avg. full year Net FOB at Pricecat level is below Last Year"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent[this.Channels].MIN_NET_LIST_GUIDLINE, this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 NET List is below Min Net List guidance."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent.Parent[this.Channels].MinCurrentNetFOB, this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"][\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Proposed priceline is deeper (NET FOB) than any current."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent.Parent[this.Channels].MinCurrentNetList, this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"][\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Proposed priceline is deeper Net List than any current."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.RAB, this.Parent[this.Channels].MIN_RAB_GUIDLINE, this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Priceline RAB is below guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_CURRENT_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Current FOB comparison"],["Level2", "ROLENAME", "this.Level==\\"Summary\\" && this.isPermissionCheckOnly", "==", "true", null, null, null, null, null, null, null, null, null, "By Pass Threshold"]]';

        var AP3 = '[["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent[this.Channels].MIN_NET_FOB_GUIDLINE, this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Priceline NET FOB is below Min FOB guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_GUIDLINE, this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Avg. full year Net FOB at Pricecat level is below Avg FOB guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_PREVIOUS_YEAR_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Avg. full year Net FOB at Pricecat level is below Last Year"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent[this.Channels].MIN_NET_LIST_GUIDLINE, this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 NET List is below Min Net List guidance."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent.Parent[this.Channels].MinCurrentNetFOB, this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"][\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Proposed priceline is deeper (NET FOB) than any current."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent.Parent[this.Channels].MinCurrentNetList, this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"][\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Proposed priceline is deeper Net List."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.RAB, this.Parent[this.Channels].MIN_RAB_GUIDLINE, this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Priceline RAB is below guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_CURRENT_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Current FOB comparison"],["Level3", "ROLENAME", "this.Level==\\"Summary\\" && this.isPermissionCheckOnly", "==", "true", null, null, null, null, null, null, null, null, null, "By Pass Threshold"]]';


        var l_Admin = '[["Level1","ROLENAME",null,null,null,null,null,null,null,null,null,null,null,null,"ROLENAME"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent[this.Channels].MIN_NET_FOB_GUIDLINE, this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Priceline NET FOB is below Min FOB guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_GUIDLINE, this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Avg. full year Net FOB at Pricecat level is below Avg FOB guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_PREVIOUS_YEAR_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Avg. full year Net FOB at Pricecat level is below Last Year"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent[this.Channels].MIN_NET_LIST_GUIDLINE, this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 NET List is below Min Net List guidance."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent.Parent[this.Channels].MinCurrentNetFOB, this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"][\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Proposed priceline is deeper (NET FOB) than any current."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent.Parent[this.Channels].MinCurrentNetList, this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"][\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Proposed priceline is deeper (NET FOB or Net List) than any current First condition."],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.RAB, this.Parent[this.Channels].MIN_RAB_GUIDLINE, this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Priceline RAB is below guidance"],["Level2", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_CURRENT_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD[\\"Level 2\\"]", null, null, null, null, null, null, null, null, null, "Level2 Current FOB comparison"],["Level2", "ROLENAME", "this.Level==\\"Summary\\" && this.isPermissionCheckOnly", "==", "true", null, null, null, null, null, null, null, null, null, "By Pass Threshold"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent[this.Channels].MIN_NET_FOB_GUIDLINE, this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Priceline NET FOB is below Min FOB guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_GUIDLINE, this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Avg. full year Net FOB at Pricecat level is below Avg FOB guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_PREVIOUS_YEAR_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_VS_PRIOR_YEAR_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Avg. full year Net FOB at Pricecat level is below Last Year"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent[this.Channels].MIN_NET_LIST_GUIDLINE, this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_NETLIST_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 NET List is below then Min Net List guidance."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_FOB, this.Parent.Parent[this.Channels].MinCurrentNetFOB, this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_FOB_THRESHOLD\\"][\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Proposed priceline is deeper (NET FOB) than any current."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.Net_List_ATAX, this.Parent.Parent[this.Channels].MinCurrentNetList, this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"].UOM)", ">=", "this.Parent.Parent[this.Channels][\\"DEEPEST_NETLIST_THRESHOLD\\"][\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Proposed priceline is deeper Net List than any current."],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Proposed.RAB, this.Parent[this.Channels].MIN_RAB_GUIDLINE, this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD.UOM)", ">=", "this.Parent[this.Channels].MIN_RAB_VS_GUIDANCE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Priceline RAB is below guidance"],["Level3", "ROLENAME", "this.Level==\\"Deal\\" && getDiffByType(this.Parent.Parent[this.Channels].AVG_FOB_PROPOSED_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_CURRENT_CALCULATED, this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD.UOM)", ">=", "this.Parent.Parent[this.Channels].AVG_FOB_DECREASE_THRESHOLD[\\"Level 3\\"]", null, null, null, null, null, null, null, null, null, "Level3 Current FOB comparison"],["Level3", "ROLENAME", "this.Level==\\"Summary\\" && this.isPermissionCheckOnly", "==", "true", null, null, null, null, null, null, null, null, null, "By Pass Threshold"]]';

        var l_roleSplitArr = p_RoleName.split("-");
        var l_cust = l_roleSplitArr[0];

        if (l_cust == "AP3") {
            var regRoleName = RegExp(/ROLENAME/g);
            AP3 = AP3.replace(regRoleName, p_RoleName);
            return AP3;
        } else if (l_cust == "AP2") {
            var regRoleName = RegExp(/ROLENAME/g);
            AP2 = AP2.replace(regRoleName, p_RoleName);
            return AP2;
        } else if (l_cust == "AP1") {
            var regRoleName = RegExp(/ROLENAME/g);
            AP1 = AP1.replace(regRoleName, p_RoleName);
            return AP1;
        } else if (l_cust == "ADMIN" || l_cust == "Administrator") {
            var regRoleName = RegExp(/ROLENAME/g);
            l_Admin = l_Admin.replace(regRoleName, p_RoleName);
            return l_Admin;
        }
    } catch (err) {
        println('Failed to delete Ruleset ' + err);
    }
}

function addGeography(CreatorMatrixEntry, geog) {
    if (geog == "ALL GEOGRAPHY") {
        CreatorMatrixEntry[1] = "All Geography";
        CreatorMatrixEntry[2] = "All Geography";
    } else if (geog.charAt(0) == "S") {
        CreatorMatrixEntry[1] = "State";
        CreatorMatrixEntry[2] = geog;
    } else if (geog.charAt(0) == "R") {
        CreatorMatrixEntry[1] = "Region";
        CreatorMatrixEntry[2] = geog;
    } else {
        throw "GEOGRAPHY LEVEL is not supported";
    }
}

function addProduct(CreatorMatrixEntry, prod) {
    if (prod == "ALL") {
        CreatorMatrixEntry[3] = "All Product";
        CreatorMatrixEntry[4] = "All Product";
    } else {
        CreatorMatrixEntry[3] = "Business Unit";
        CreatorMatrixEntry[4] = prod;
    }
}

function addLevel(CreatorMatrixEntry, l_cust) {
    if (l_cust == "AP1") {
        CreatorMatrixEntry[6] = "Level1";
    } else if (l_cust == "AP2") {
        CreatorMatrixEntry[6] = "Level2";
    } else {
        CreatorMatrixEntry[6] = "Level3";
    }
}

function addRuleName(CreatorMatrixEntry, l_role) {
    var rgUnderscoe = RegExp(/-/g);
    var l_rulename = l_role.replace(rgUnderscoe, "_");
    l_rulename = l_rulename.replace("Geography", "Geo");
    CreatorMatrixEntry[9] = l_rulename + "_Ruleset";
}
