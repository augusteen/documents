/********************************************************************************
This work contains or references Vistaar generic components or Vistaar API, and 
is developed in accordance with Vistaar best practices and solution development
guidelines. This work is designed and intended to be used only with licensed 
Vistaar software.
********************************************************************************/
/* Workflow Task and Notification assignment Script*/
/* Author: Abhishek Singh*/

/**
     * @fileOverview This files contain Workflow Task and Notification assignment Script
     * @author anadar
     * @version 1.0.0
     */

/**
 * @module WF_NS_PriceStructure
 * @requires module:WF_NS_PS_Generic
 */

var VAR_DOCPROVIDER = "vistaar.documentServiceProvider";

/**
 * Runs from process definition is used to get the Max Approval Level of the Price Plan which is stored in the entity
 * @function
 * @name WF_NS_PriceStructure_getMaxSequence
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 * @example
 * <action name="executeStartTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
 *          <javascript>
 *           <!--@
 *          println("# Inside node enter of Start!!");
 *           
 *           var LogUserInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
            var LogUserName = LogUserInfo.getUserName();
            var LogUserRole = LogUserInfo.roleName;
            println("# Price structure Created by -: "+LogUserName+" / Role " + LogUserRole);
            executionContext.setVariable("PS_Creator",LogUserName);
            executionContext.setVariable("PS_CreatorRole",LogUserRole);
            executionContext.setVariable("isAutoPublish", true);
            
            var TotalApprovalLevel = WF_NS_PriceStructure_getMaxSequence(executionContext);
            println("# Total number of approval level -: " + TotalApprovalLevel);
            executionContext.setVariable("MaxApproval",TotalApprovalLevel);
            //var requiredFieldsArray = createTemplatePSAttributeList();
            putTemplateRequiredInfoFromReportInExecutionContext("PricePlanView",executionContext);
            
 */
function WF_NS_PriceStructure_getMaxSequence(executionContext) {
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var contextInstance = getContextInstance(executionContext);
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
    var libraryName = executionContext.getVariable("libraryName");
    /* Get the maximum sequence number */
    var libName = "Task_Node_Master";
    var colValMap = new java.util.HashMap();

    colValMap.put("Definition_Type", libraryName);

    var options = new java.util.HashMap();
    var result_Seq = java.lang.reflect.Array.newInstance(java.lang.String, 1000);
    var result_Seq = docProvider.getAllDocs(libName, colValMap, userInfo, options);
    if (result_Seq != null) {
        var TotalApprovalLevel = result_Seq.length;
        println("# Total number of approval level -: " + TotalApprovalLevel);
        // Return the Max sequence number to the caller Process Definition
        return TotalApprovalLevel.toString();
    } else {
        println("# No Sequence found");
    }
}

/**
 * It is called from `WF_NS_PriceStructure_getSubmitRoleOnRejectionState` it creates Task for all the Delegates with  
 * submit permission on the Price Plan
 * @function
 * @name WF_NS_PriceStructure_getSubmitRole
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 */
function WF_NS_PriceStructure_getSubmitRole(executionContext) {
    println("WF_NS_PriceStructure # I am inside Node Enter event of WIP");
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var contextInstance = getContextInstance(executionContext);
    var taskAssineeString = "";
    var RoleString = "";
    var helper = new com.vistaar.workflow.util.WorkflowHelper();

    var definitionType = "PricePlan"; //executionContext.getVariable("libraryName");
    println("definitionType >> " + definitionType);
    var scope = executionContext.getVariable("Scope");
    var scopeJSONObj = new org.json.JSONObject(scope);
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
    println("userInfo >> " + userInfo);
    var permissionAdapter = new PermissionMtxAdapter_Intf();
    permissionAdapter.Init(docProvider, userInfo);
    var result = permissionAdapter.getCreator(definitionType, scopeJSONObj);
    print("ExecuteScript Result: " + result + "\n");
    var validRoles = result.get("Delegates");

    var getAllUserFromScope = new Array();
    var getFormattedRoles = new Array(); //CR 28468	
    if (validRoles.length() != 0) {

        for (var j = 0; j < validRoles.length(); j++) {
            var Role_JsonResult = validRoles.get(j);
            println("# Roles for Scope-: " + Role_JsonResult);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            var k = 0;
            if (usersArray != null && usersArray.length != 0) {
                for (k = 0; k < usersArray.length; k++) {
                    getAllUserFromScope.push(usersArray[k]);
                }
            }
            getFormattedRoles.push("@RoleName{" + Role_JsonResult + "}");
        }

        helper.createTaskInstance(getFormattedRoles, executionContext, "Submit Task");
        taskAssineeString = taskUserString(getAllUserFromScope);
        println("# Task created for Submit PS");
        executionContext.setVariable("CurrentRole", RoleString);
        println("# Role string is -: " + RoleString);
        //return taskAssineeString.toString();
        return "";
    } else {
        println("# No Role found for the given Geography for submit task");
        println("# Assigning the submit task to Administrator");
        var getAdminRole_User = helper.getUsersForRole("Administrator");
        taskAssineeString = taskUserString(getAdminRole_User);
        helper.createTaskInstance(['@RoleName{Administrator}'], executionContext, "Submit Task");
        println("# Task created for Submit PS");
        RoleString = "Administrator";
        executionContext.setVariable("CurrentRole", RoleString);
        println("# Role string is -: " + RoleString);
        //return taskAssineeString.toString();	
        return "";
    }

}


/**
 * Runs from process definition 
 * @function
 * @name WF_NS_PriceStructure_getSubmitRoleOnRejectionState
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 * @example
 * <task-node name="WIP" create-tasks="false" end-tasks="true">
        <task name="Submit Task">
            <description>Task for Submit the price structure</description>
        </task>
        <event type="node-enter">
            <action name="setSubmitterRoles_PS" class="com.vistaar.workflow.handlers.ScriptHandler">
            <javascript>
            <!--@
            executionContext.setVariable("CurrentState","WIP");
            println("Processdefinition Step 1 : Create Submit Task !!");
            var App_Level =1;
            executionContext.setVariable("Approve_Level",String(App_Level));
            var MailUserString = WF_NS_PriceStructure_getSubmitRoleOnRejectionState(executionContext);
            
            println("Mail Users String: "+ MailUserString);
            executionContext.setVariable("UserDecision","");
            executionContext.setVariable("SubmitMailUser",MailUserString);
            @-->
            </javascript>
            </action>
 */
function WF_NS_PriceStructure_getSubmitRoleOnRejectionState(executionContext) {

    println("WF_NS_PriceStructure # WF_NS_PriceStructure_getSubmitRoleOnRejectionState");

    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);
    var helper = new com.vistaar.workflow.util.WorkflowHelper();
    var RejectMailUserString = executionContext.getVariable("RejectMailUser");
    if (RejectMailUserString != null && !executionContext.getVariable("RejectMailUser").equals("")) {
        var RolesForTaskJSONArray = new org.json.JSONArray(executionContext.getVariable("RejectionRoles"));
        var RolesForTaskArray = new Array();
        var RolesForTaskJSONArrayLength = RolesForTaskJSONArray.length();
        for (var itr1 = 0; itr1 < RolesForTaskJSONArrayLength; itr1++) {
            RolesForTaskArray.push(RolesForTaskJSONArray.get(itr1));
        }
        helper.createTaskInstance(RolesForTaskArray, executionContext, "Submit Task");
        RejectMailUserString = getUniqueMalString(RejectMailUserString.toString());
        return "";
    } else {
        var taskAssineeString = WF_NS_PriceStructure_getSubmitRole(executionContext);
        taskAssineeString = getUniqueMalString(taskAssineeString.toString());
        return "";
    }
}


/**
 * Runs from process definition 
 * @function
 * @name WF_NS_PriceStructure_getRejectRole
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 * @example
 * <node name="Rejected">
        <event type="node-enter">
            
            <action name="setMailUsers" class="com.vistaar.workflow.handlers.ScriptHandler">
            <javascript>
            <!--@   
            var isRejectFlg = executionContext.getVariable("isRejectFlg");
            if(isRejectFlg == true){
                executionContext.setVariable("CurrentState","Rejected");
                var MailUserString = WF_NS_PriceStructure_getRejectRole(executionContext);
                
                println("#### Rejected Node - Mail Users String: "+ MailUserString);
                executionContext.setVariable("UserDecision","");
                executionContext.setVariable("RejectMailUser",MailUserString);
                executionContext.setVariable("RejectSubject","Rejected");
                println("#### Rejected Node javascript end");
            }else{
                executionContext.setVariable("CurrentState","Recall");
                var MailUserString = WF_NS_PriceStructure_getRecallRole(executionContext);
                
                println("#### Recall Node - Mail Users String: "+ MailUserString);
                executionContext.setVariable("UserDecision","");
                executionContext.setVariable("RejectMailUser",MailUserString);
                executionContext.setVariable("RejectSubject","Recalled");
                println("#### Recall Node javascript end");
            }
            
            @-->
            </javascript>
 */
function WF_NS_PriceStructure_getRejectRole(executionContext) {
    println("WF_NS_PriceStructure_getRejectRole # I am inside Node Enter event of Rejected");
    executionContext.setVariable("ApproverRoles", "");

    //CR#27174
    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);

    var blnSentNotification = true;

    var PS_CreatorRole = executionContext.getVariable("PS_CreatorRole");
    var Approve_Level = executionContext.getVariable("Approve_Level");

    try {
        println("executionContext >> " + executionContext.toString());
        blnSentNotification = executionContext.getVariable("blnSentNotification");
    } catch (e) {
        println("Got Exception for blnSentNotification");
        blnSentNotification = true;
    }
    println("blnSentNotification >> " + blnSentNotification);
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var contextInstance = getContextInstance(executionContext);
    var taskAssineeString = "";
    var RoleString = "";
    var helper = new com.vistaar.workflow.util.WorkflowHelper();

    var definitionType = "PricePlan"; //executionContext.getVariable("libraryName");
    println("definitionType >> " + definitionType);
    var scope = executionContext.getVariable("Scope");
    var scopeJSONObj = new org.json.JSONObject(scope);
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");

    var permissionAdapter = new PermissionMtxAdapter_Intf();
    permissionAdapter.Init(docProvider, userInfo);
    var result = permissionAdapter.getCreator(definitionType, scopeJSONObj);
    print("ExecuteScript Result: " + result + "\n");
    var isRejectFlg = executionContext.getVariable("isRejectFlg");

    println("isRejectFlg > " + isRejectFlg);

    //if(isRejectFlg == true){
    //	var validRoles = result.get("Delegates");
    //}else{
    //
    var validRoles = new JSONArray();

    validRoles.put(PS_CreatorRole);

    var Max_Level = parseInt(executionContext.getVariable("MaxApproval"));
    var ActorHistoryInfo = new JSONObject(executionContext.getVariable("ActorHistoryInfo"));
    println("Max_Level ..... " + Max_Level);
    for (var itr = ActorHistoryInfo.keys(); itr.hasNext();) {
        var key = itr.next();
        var roles = ActorHistoryInfo.get(key);
        var roleArrObj = new JSONArray(roles);
        var Level = Number(key.replace('Level', ''));

        if (Level <= Approve_Level) {

            println("Level " + Level + " < Approvel Level" + Approve_Level);

            for (var i = roleArrObj.length() - 1; i >= 0; i--) {
                validRoles.put(roleArrObj.get(i));
            }
        }
        println("ActorHistoryInfo ..... " + ActorHistoryInfo.get(key));
    }
    //var validRoles = result.get("Delegates");
    //}


    var getAllUserFromScope = new Array();
    var getFormattedRoles = new org.json.JSONArray(); //CR 28468	

    if (validRoles.length() != 0) {

        for (var j = 0; j < validRoles.length(); j++) {
            var Role_JsonResult = validRoles.get(j);
            println("# Roles for Scope-: " + Role_JsonResult);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            var k = 0;
            if (usersArray != null && usersArray.length != 0) {
                for (k = 0; k < usersArray.length; k++) {
                    getAllUserFromScope.push(usersArray[k]);
                }
            }
            getFormattedRoles.put("@RoleName{" + Role_JsonResult + "}");
        }

        var getAllUserFromScopeforRejectRejectionRoles = new Array();
        var getRejectionRoles = new org.json.JSONArray(); //CR 28468			

        var rejectRoles = result.get("Delegates");

        for (var j = 0; j < rejectRoles.length(); j++) {
            var Role_JsonResult = rejectRoles.get(j);
            println("# Roles for Scope-: " + Role_JsonResult);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            var k = 0;
            if (usersArray != null && usersArray.length != 0) {
                for (k = 0; k < usersArray.length; k++) {
                    getAllUserFromScopeforRejectRejectionRoles.push(usersArray[k]);
                }
            }
            getRejectionRoles.put("@RoleName{" + Role_JsonResult + "}");
        }

        executionContext.setVariable("RejectionRoles", getRejectionRoles.toString());


        taskAssineeString = taskUserString(getAllUserFromScope);
        println("taskAssineeString1 >> " + taskAssineeString);
        executionContext.setVariable("CurrentRole", RoleString);
        println("##### Role string after Rejection is -: " + RoleString);



        taskAssineeString = getUniqueMalString(taskAssineeString.toString());



        if (blnSentNotification == false) {
            taskAssineeString = "";
        }

        println("taskAssineeString2 >> " + taskAssineeString);


        return taskAssineeString;

    } else {
        println("#### No Creator Roles found after rejection ######");
        println("# Assigning the submit task to Administrator");
        var getAdminRole_User = helper.getUsersForRole("Administrator");
        taskAssineeString = taskUserString(getAdminRole_User);
        println("taskAssineeString1 >> " + taskAssineeString);
        executionContext.setVariable("RejectionRoles", "[\"@RoleName{Administrator}\"]");

        RoleString = "Administrator";
        executionContext.setVariable("CurrentRole", RoleString);
        println("# Role string is -: " + RoleString);
        taskAssineeString = getUniqueMalString(taskAssineeString.toString());


        if (blnSentNotification == false) {
            taskAssineeString = "";
        }

        println("taskAssineeString2 >> " + taskAssineeString);
        return taskAssineeString;
    }

}
/**
 * Runs from process definition 
 * @function
 * @name WF_NS_PriceStructure_getRecallRole
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 * @example
 * <node name="Rejected">
        <event type="node-enter">
            
            <action name="setMailUsers" class="com.vistaar.workflow.handlers.ScriptHandler">
            <javascript>
            <!--@   
            var isRejectFlg = executionContext.getVariable("isRejectFlg");
            if(isRejectFlg == true){
                executionContext.setVariable("CurrentState","Rejected");
                var MailUserString = WF_NS_PriceStructure_getRejectRole(executionContext);
                
                println("#### Rejected Node - Mail Users String: "+ MailUserString);
                executionContext.setVariable("UserDecision","");
                executionContext.setVariable("RejectMailUser",MailUserString);
                executionContext.setVariable("RejectSubject","Rejected");
                println("#### Rejected Node javascript end");
            }else{
                executionContext.setVariable("CurrentState","Recall");
                var MailUserString = WF_NS_PriceStructure_getRecallRole(executionContext);
                
                println("#### Recall Node - Mail Users String: "+ MailUserString);
                executionContext.setVariable("UserDecision","");
                executionContext.setVariable("RejectMailUser",MailUserString);
                executionContext.setVariable("RejectSubject","Recalled");
                println("#### Recall Node javascript end");
            }
            
            @-->
            </javascript>
 */
function WF_NS_PriceStructure_getRecallRole(executionContext) {
    var PS_CreatorRole = executionContext.getVariable("PS_CreatorRole");
    var Approve_Level = executionContext.getVariable("Approve_Level");


    println("# I am inside Node Enter event of Recall");
    executionContext.setVariable("ApproverRoles", "");
    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);

    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var contextInstance = getContextInstance(executionContext);
    var taskAssineeString = "";
    var RoleString = "";
    var helper = new com.vistaar.workflow.util.WorkflowHelper();

    var definitionType = "PricePlan"; //executionContext.getVariable("libraryName");
    println("definitionType >> " + definitionType);
    var scope = executionContext.getVariable("Scope");
    var scopeJSONObj = new org.json.JSONObject(scope);
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");


    var permissionAdapter = new PermissionMtxAdapter_Intf();
    permissionAdapter.Init(docProvider, userInfo);
    var result = permissionAdapter.getCreator(definitionType, scopeJSONObj);
    print("ExecuteScript Result: " + result + "\n");
    var blnSentNotification = true;

    try {
        println("executionContext >> " + executionContext.toString());
        blnSentNotification = executionContext.getVariable("blnSentNotification");
    } catch (e) {
        println("Got Exception for blnSentNotification");
        blnSentNotification = true;
    }
    println("blnSentNotification >> " + blnSentNotification);
    var ActorHistoryInfo = executionContext.getVariable("ActorHistoryInfo");
    var ActorHistoryInfoJSON = new JSONObject(ActorHistoryInfo);
    var validRoles = new JSONArray(); //get all userRoles from "ActorHistoryInfo" : [ApprovalLevel , Role]

    validRoles.put(PS_CreatorRole);

    println("ActorHistoryInfoJSON > " + ActorHistoryInfoJSON);

    for (var attributeItr = ActorHistoryInfoJSON.keys(); attributeItr.hasNext();) {

        var key = attributeItr.next();
        var roles = ActorHistoryInfoJSON.get(key);
        var roleArrObj = new JSONArray(roles);
        var Level = Number(key.replace('Level', ''));

        if (Level < Approve_Level) {

            println("Level " + Level + " < Approvel Level" + Approve_Level);

            for (var i = roleArrObj.length() - 1; i >= 0; i--) {
                validRoles.put(roleArrObj.get(i));
            }
        }
    }
    println("###### NS WF_PS validRoles > " + validRoles);
    var getAllUserFromScope = new Array();
    var getFormattedRoles = new org.json.JSONArray(); //CR 28468	

    for (var j = 0; j < validRoles.length(); j++) {
        var Role_JsonResult = validRoles.get(j);
        println("# Roles for Scope-: " + Role_JsonResult);
        if (RoleString == "") {
            RoleString = Role_JsonResult;
        } else {
            RoleString = RoleString + "," + Role_JsonResult;
        }
        var usersArray = helper.getUsersForRole(Role_JsonResult);
        var k = 0;
        if (usersArray != null && usersArray.length != 0) {
            for (k = 0; k < usersArray.length; k++) {
                getAllUserFromScope.push(usersArray[k]);
            }
        }
        getFormattedRoles.put("@RoleName{" + Role_JsonResult + "}");
    }

    var getAllUserFromScopeforRejectRejectionRoles = new Array();
    var getRejectionRoles = new org.json.JSONArray(); //CR 28468			

    var rejectRoles = result.get("Delegates");

    for (var j = 0; j < rejectRoles.length(); j++) {
        var Role_JsonResult = rejectRoles.get(j);
        println("# Roles for Scope-: " + Role_JsonResult);
        if (RoleString == "") {
            RoleString = Role_JsonResult;
        } else {
            RoleString = RoleString + "," + Role_JsonResult;
        }
        var usersArray = helper.getUsersForRole(Role_JsonResult);
        var k = 0;
        if (usersArray != null && usersArray.length != 0) {
            for (k = 0; k < usersArray.length; k++) {
                getAllUserFromScopeforRejectRejectionRoles.push(usersArray[k]);
            }
        }
        getRejectionRoles.put("@RoleName{" + Role_JsonResult + "}");
    }

    executionContext.setVariable("RejectionRoles", getRejectionRoles.toString());
    taskAssineeString = taskUserString(getAllUserFromScope);

    executionContext.setVariable("CurrentRole", RoleString);
    println("##### Role string after Rejection is -: " + RoleString);
    taskAssineeString = getUniqueMalString(taskAssineeString.toString());

    if (blnSentNotification == false) {
        taskAssineeString = "";
    }

    return taskAssineeString;
}
/**
 * It is called from `WF_NS_PS_Generic.PendingApproval_NodeEnter_Execute` it creates Task for all the Delegates with  
 * approval permission on the Price Plan
 * @function
 * @name WF_NS_PriceStructure_createTaskForApprovalRoles
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 */
function WF_NS_PriceStructure_createTaskForApprovalRoles(approverRoles, executionContext) {
    println("# Price structure creator is :" + executionContext.getVariable("PS_Creator"));

    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);	
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var contextInstance = getContextInstance(executionContext);
    var helper = new com.vistaar.workflow.util.WorkflowHelper();
    var taskAssineeString = "";
    var RoleString = "";
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");

    var result = new org.json.JSONObject();
    var permissionValid = true;
    var validRoles;
    validRoles = approverRoles;
    validRoles = new org.json.JSONArray(validRoles.toString());

    if (validRoles.length() == 0)
        permissionValid = false;

    println("validRoles fetched");
    result.put("IsPermissionValid", permissionValid);
    result.put("ValidRoles", validRoles);
    result = result.toString();

    var resultObj = new org.json.JSONObject(result);
    var result_Approver = new org.json.JSONArray();
    result_Approver = resultObj.get("ValidRoles");
    var getUserForApproval = new Array();
    var getFormattedApprovalRoles = new Array(); //CR 28468

    if (result_Approver.length() != 0) {
        println("# Length of Aprover result -: " + result_Approver.length());
        var i = 0;
        for (i = 0; i < result_Approver.length(); i++) {
            var Role_JsonResult = result_Approver.get(i);
            println("############ In WF_NS_PriceStructure_createTaskForApprovalRoles : i : " + i + ", Role_JsonResult :" + Role_JsonResult);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            var j = 0;
            if (usersArray != null && usersArray.length != 0) {
                for (j = 0; j < usersArray.length; j++) {
                    getUserForApproval.push(usersArray[j]);
                }
            }
            getFormattedApprovalRoles.push("@RoleName{" + Role_JsonResult + "}"); //CR 28468
        }
        if (getUserForApproval.length != 0) {
            helper.createTaskInstance(getFormattedApprovalRoles, executionContext, "Approve-Reject Task");
            taskAssineeString = taskUserString(getUserForApproval);
            println("#Task created for Approve-Reject" + executionContext.getVariable("Approve_Level") + "PS");
            executionContext.setVariable("CurrentRole", RoleString);
            println("# Role string is -: " + RoleString);
            return taskAssineeString.toString();
        } else {
            println("# No User found for the given role");
            return;
        }
    } else {
        println("# No Role found for the given scope for approval");
        println("# Assigning tha approval task to Administrator");
        var getAdminRole_User = helper.getUsersForRole("Administrator");
        taskAssineeString = taskUserString(getAdminRole_User);
        helper.createTaskInstance(['@RoleName{Administrator}'], executionContext, "Approve-Reject Task");
        RoleString = "Administrator";
        executionContext.setVariable("CurrentRole", RoleString);
        println("# Role string is -: " + RoleString);
        return taskAssineeString.toString();
    }
}
/**
 * It is called from `WF_NS_PS_Generic.Approved_NodeEnter_Execute` it creates Task for all the Delegates with  
 * approval permission on the Price Plan
 * @function
 * @name WF_NS_PriceStructure_createTaskForPublisher
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 */
function WF_NS_PriceStructure_createTaskForPublisher(publisherRoles, executionContext) {
    println("#I am inside Node Enter event of Published");
    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);
    var contextInstance = getContextInstance(executionContext);
    var taskAssineeString = "";
    var RoleString = "";
    var helper = new com.vistaar.workflow.util.WorkflowHelper();

    var result_Publisher = publisherRoles;
    var getUserForPublish = new Array();
    var getFormattedPubishRoles = new Array(); //CR 28468	
    if (result_Publisher.length() != 0) {
        println("# Length of Aprover result -: " + result_Publisher.length());
        var i = 0;
        for (i = 0; i < result_Publisher.length(); i++) {
            var Role_JsonResult = result_Publisher.get(i);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            var j = 0;
            if (usersArray != null && usersArray.length != 0) {
                for (j = 0; j < usersArray.length; j++) {
                    getUserForPublish.push(usersArray[j]);
                }
            }
            getFormattedPubishRoles.push("@RoleName{" + Role_JsonResult + "}"); //CR 28468
        }
        if (getUserForPublish.length != 0) {
            helper.createTaskInstance(getFormattedPubishRoles, executionContext, "Publish Task"); //CR 28468
            taskAssineeString = taskUserString(getUserForPublish);
            println("#Task created for Publish" + "PS");
            executionContext.setVariable("CurrentRole", RoleString);
            println("# Role string is -: " + RoleString);
            return taskAssineeString.toString();
        } else {
            println("# No User found for the given role");
            return;
        }
    } else {
        println("# No Role found for the given scope for pubish");
        println("# Assigning the publish task to Administrator");
        var getAdminRole_User = helper.getUsersForRole("Administrator");
        taskAssineeString = taskUserString(getAdminRole_User);
        helper.createTaskInstance(['@RoleName{Administrator}'], executionContext, "Publish Task"); //CR 28468
        RoleString = "Administrator";
        executionContext.setVariable("CurrentRole", RoleString);
        println("# Role string is -: " + RoleString);
        return taskAssineeString.toString();
    }
}

function taskUserString(usersArray) {
    println("# taskUserString Called");
    var i = 0;
    var AssineeString = "";
    for (i = 0; i < usersArray.length; i++) {
        if (AssineeString == "") {
            AssineeString = usersArray[i];
        } else {
            AssineeString = AssineeString + ";" + usersArray[i];
        }
    }
    return AssineeString.toString();
}
/**
 * Runs from process definition 
 * @function
 * @name WF_NS_PriceStructure_getNotificationUserString
 * @memberof module:WF_NS_PriceStructure
 * @param {Object} executionContext Workflow Execution Context
 * @example
 * <state name="Published">
        <event type="node-enter">
            <action name="setPublisherRoles_PS" class="com.vistaar.workflow.handlers.ScriptHandler">
            <javascript>
            <!--@   
            executionContext.setVariable("CurrentState","Published");
            var NotifierString = WF_NS_PriceStructure_getNotificationUserString(executionContext);  
            println("Notifier User String : " + NotifierString);
            executionContext.setVariable("NotifyMailUser",NotifierString);
            @-->
            </javascript>
            </action>
 */
function WF_NS_PriceStructure_getNotificationUserString(executionContext) {


    var PricePlanUser = executionContext.getVariable("PricePlanUser");

    println("# Notification routine called ");
    var requiredFieldsArray = createTemplatePSAttributeList();
    //putTemplateRequiredInfoFromReportInExecutionContext(requiredFieldsArray,"PriceStructureExt",executionContext);	
    var RoleString = "";
    var taskAssineeString = "";
    var DefinitionType = "PricePlan";
    var workflow_State = executionContext.getVariable("CurrentState");
    var scope = executionContext.getVariable("Scope");
    var scopeJSONObj = new org.json.JSONObject(scope);
    var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var permissionAdapter = new PermissionMtxAdapter_Intf();
    permissionAdapter.Init(docProvider, userConnInfo);
    var notifierInfo = permissionAdapter.getNotifier(DefinitionType, scopeJSONObj, workflow_State);
    var helper = new com.vistaar.workflow.util.WorkflowHelper();
    println("notifierInfo: " + notifierInfo);
    var notifierRoles;
    var blnSentNotification = true;

    try {
        println("executionContext >> " + executionContext.toString());
        blnSentNotification = executionContext.getVariable("blnSentNotification");
    } catch (e) {
        println("Got Exception for blnSentNotification");
        blnSentNotification = true;
    }

    println("blnSentNotification >> " + blnSentNotification);

    if (notifierInfo.has("Delegates")) {
        notifierRoles = notifierInfo.get("Delegates");
        notifierRoles = new org.json.JSONArray(notifierRoles.toString());
    } else
        notifierRoles = new org.json.JSONArray();

    var getUserForNotification = new Array();

    var ps_creatorRole = executionContext.getVariable("PS_CreatorRole");
    notifierRoles.put(ps_creatorRole);
    if (executionContext.getVariable("isAutoPublish") == false) {
        notifierRoles.put("Administrator");
    }
    //println("executionContext.getApprover >>> " + executionContext.getVariable("isAutoPublish"));
    //
    var ActorHistoryInfo = executionContext.getVariable("ActorHistoryInfo");
    var ActorHistoryInfoJSON = new JSONObject(ActorHistoryInfo);
    
    for (var attributeItr = ActorHistoryInfoJSON.keys(); attributeItr.hasNext();) {

        var key = attributeItr.next();
        var roles = ActorHistoryInfoJSON.get(key);
        var roleArrObj = new JSONArray(roles);
        var Level = Number(key.replace('Level', ''));

        for (var i = roleArrObj.length() - 1; i >= 0; i--) {
            notifierRoles.put(roleArrObj.get(i));
        }
    }

    
    println("notifierRoles >> " + notifierRoles);
    if (notifierRoles.length() != 0) {
        println("# Length of Notifier result -: " + notifierRoles.length());
        for (var i = 0, resultNitifierLength = notifierRoles.length(); i < resultNitifierLength; i++) {
            var Role_JsonResult = notifierRoles.get(i);
            if (RoleString == "") {
                RoleString = Role_JsonResult;
            } else {
                RoleString = RoleString + "," + Role_JsonResult;
            }
            var usersArray = helper.getUsersForRole(Role_JsonResult);
            if (usersArray != null && usersArray.length != 0) {
                for (var j = 0, usersArrayLength = usersArray.length; j < usersArrayLength; j++) {
                    getUserForNotification.push(usersArray[j]);
                }
            }
        }
        if (getUserForNotification.length != 0) {
            taskAssineeString = taskUserString(getUserForNotification);
            println("# Role string is -: " + RoleString);
            println("# Task Assinee string is -: " + taskAssineeString);
            if (blnSentNotification == false) {
                taskAssineeString = "";
                return taskAssineeString;
            }
            println("Final taskAssineeString >> " + taskAssineeString);
            if (PricePlanUser == null)
                return getUniqueMalString(taskAssineeString.toString());
            return getUniqueMalString(taskAssineeString.toString() + ";" + PricePlanUser);
        } else {
            println("# No Notifier found for the given role");
            return;
        }
    } else {
        println("# No Role found for the given scope for Notification");
        var getAdminRole_User = "";
        taskAssineeString = taskUserString(getAdminRole_User);

        if (blnSentNotification == false) {
            taskAssineeString = "";
        }
        println("Final taskAssineeString >> " + taskAssineeString);
        return taskAssineeString.toString();
    }
}

function putTemplateRequiredInfoFromReportInExecutionContext(library, executionContext) {

    println("WF_NS_PriceStructure---putTemplateRequiredInfoFromReportInExecutionContext");
    var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
    var userInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
    var colValMap = new java.util.HashMap();
    var options = new java.util.HashMap();
    colValMap.put("Document Id", executionContext.getVariable("documentId"));
    try {
        var requiredFieldsArray = new JSONArray();
        requiredFieldsArray.put("Region Name");
        requiredFieldsArray.put("Pricing Market Name");
        requiredFieldsArray.put("Price Category Name");
        requiredFieldsArray.put("Year");
        var comboPSDocument = docProvider.getAllDocs(library, colValMap, userInfo, options);
        var comboPSJSONDocument = new org.json.JSONArray(comboPSDocument);
        var comboDoc = new org.json.JSONObject(comboPSJSONDocument.get(0));
        println("Combo Doc " + comboDoc);
        if (comboPSJSONDocument != null && comboPSJSONDocument.length() != 0) {
            for (var index = 0; index < requiredFieldsArray.length(); index++) {
                if (comboDoc.has(requiredFieldsArray.get(index))) {
                    if (comboDoc.get(requiredFieldsArray.get(index)) != null && org.json.JSONObject.NULL != comboDoc.get(requiredFieldsArray.get(index))) {
                        executionContext.setVariable(requiredFieldsArray.get(index), org.json.JSONObject(comboPSJSONDocument.get(0)).get(requiredFieldsArray.get(index)));
                        println("#############" + org.json.JSONObject(comboPSJSONDocument.get(0)).get(requiredFieldsArray.get(index)) + "#################");
                    } else {
                        executionContext.setVariable(requiredFieldsArray.get(index), "");
                        println("############# NULL VALUE SET #################");
                    }
                } else {
                    executionContext.setVariable(requiredFieldsArray.get(index), "");
                    println("############# NULL VALUE SET #################");
                }
            }
        } else {
            println("No record exists for given DocID!!");
        }
    } catch (error) {
        println("execution of getAllDocs api failed!!!");
        throw (error);
    }


}

function createTemplatePSAttributeList() {
    println("WF_NS_PriceStructure ---- createTemplatePSAttributeList ");
    attributeList = new org.json.JSONArray();
    attributeList.put("Distributor");
    attributeList.put("Effective Date");
    attributeList.put("Proof");
    attributeList.put("Supply Type");
    attributeList.put("Geography");
    attributeList.put("Product");
    return attributeList;
}

//This function takes the system fields of a document as an input and performs a WF task as per the Action specified.
/**
 * Execute Workflow Operation 
 * @param  {object} systemFieldsObject System Fields
 * @param  {object} wfConnectionObj    Workflow Connection Object
 * @param  {object} userConnInfo       User Connection Info
 */
function g_ExecuteWorkflowOperation(systemFieldsObject, wfConnectionObj, userConnInfo) {
    var wfConnectionObj = com.vistaar.workflow.core.WorkflowManagerImpl.getInstance();
    var action = systemFieldsObject.get("Action");
    var comment = systemFieldsObject.get("Comments");

    if (systemFieldsObject.has("What")) {
        var What = systemFieldsObject.get("What");
    } else {
        var What = "";
    }
    if (systemFieldsObject.has("HTMLComments")) {
        var HTMLComments = systemFieldsObject.get("HTMLComments");
    } else {
        var HTMLComments = "";
    }

    if (systemFieldsObject.has("RejectRecallSubject")) {
        var RejectRecallSubject = systemFieldsObject.get("RejectRecallSubject");
    } else {
        var RejectRecallSubject = "";
    }
    if (systemFieldsObject.has("RejectRecallMsg1")) {
        var RejectRecallMsg1 = systemFieldsObject.get("RejectRecallMsg1");
    } else {
        var RejectRecallMsg1 = "";
    }
    if (systemFieldsObject.has("RejectRecallMsg2")) {
        var RejectRecallMsg2 = systemFieldsObject.get("RejectRecallMsg2");
    } else {
        var RejectRecallMsg2 = "";
    }

    if (systemFieldsObject.has("RejectRecallRole")) {
        var RejectRecallRole = systemFieldsObject.get("RejectRecallRole");
    } else {
        var RejectRecallRole = "";
    }
    if (systemFieldsObject.has("wfTransition")) {
        var wfTransition = systemFieldsObject.get("wfTransition");
    } else {
        var wfTransition = "";
    }
    if (systemFieldsObject.has("IsNonPostingMarket")) {
        var IsNonPostingMarket = systemFieldsObject.get("IsNonPostingMarket");
    } else {
        var IsNonPostingMarket = "";
    }
    if (systemFieldsObject.has("IsFuturePlanning")) {
        var IsFuturePlanning = systemFieldsObject.get("IsFuturePlanning");
    } else {
        var IsFuturePlanning = "";
    }
    if (systemFieldsObject.has("Product Name")) {
        var productName = systemFieldsObject.get("Product Name");
    } else {
        var productName = "";
    }
    if (systemFieldsObject.has("Geography Name")) {
        var geographyName = systemFieldsObject.get("Geography Name");
    } else {
        var geographyName = "";
    }
    if (systemFieldsObject.has("Year")) {
        var year = systemFieldsObject.get("Year");
    } else {
        var year = "";
    }
    if (systemFieldsObject.has("Region Name")) {
        var regionName = systemFieldsObject.get("Region Name");
    } else {
        var regionName = "";
    }

    if (systemFieldsObject.has("Time Code")) {
        var timeCode = systemFieldsObject.get("Time Code");
    } else {
        var timeCode = "";
    }
    if (systemFieldsObject.has("Geography Code")) {
        var geographyCode = systemFieldsObject.get("Geography Code");
    } else {
        var geographyCode = "";
    }
    if (systemFieldsObject.has("Product Code")) {
        var productCode = systemFieldsObject.get("Product Code");
    } else {
        var productCode = "";
    }
    if (systemFieldsObject.has("Region Code")) {
        var regionCode = systemFieldsObject.get("Region Code");
    } else {
        var regionCode = "";
    }
    if (systemFieldsObject.has("Brand Code")) {
        var brandCode = systemFieldsObject.get("Brand Code");
    } else {
        var brandCode = "";
    }



    if (systemFieldsObject.get("System Fields").has("Document Id")) {
        var docID = systemFieldsObject.get("System Fields").get("Document Id");
    } else {
        var docID = "";
    }



    if (systemFieldsObject.has("URL")) {

        var webURL = systemFieldsObject.get("URL");
        var rgSpace = RegExp(/\s/g);
        var rgDoubleQuote = RegExp(/"/g);

        webURL = webURL + '?PricePlan={"Operation":"Open Price Plan","Input":{"ScopeData":{"Geography Level":"Market","Geography Code":"' + geographyCode + '","Time Level":"Year","Time":"' + timeCode + '","Product Code":"' + productCode + '","Product Level":"Price Category","Region Code":"' + regionCode + '","Brand Code":"' + brandCode + '"}}}';

        webURL = webURL.replace(rgSpace, '%20');
        webURL = webURL.replace(rgDoubleQuote, '%22');

    } else {
        var webURL = "";
    }
    println("webURL > " + webURL);
    var processInstanceKey = systemFieldsObject.get("System Fields").get("WorkFlowProcessInstanceKey");
    var processDefinitionName = systemFieldsObject.get("System Fields").get("WorkFlowProcessDef");

    println("processInstanceKey >> " + processInstanceKey);
    println("processDefinitionName >> " + processDefinitionName);

    var activeNodesInfo = wfConnectionObj.getActiveNodes(processDefinitionName, processInstanceKey);
    println("activeNodesInfo >> " + activeNodesInfo);
    var actNodeInfo = activeNodesInfo[0];
    var activeNodeId = actNodeInfo.getNodeId();
    var processInstanceId = actNodeInfo.getInstanceId();
    systemFieldsObject.put("ProcessInstanceId", processInstanceId);
    var contextVariables = wfConnectionObj.getContextVariables(processInstanceId);
    //println("contextVariables >> " + contextVariables);
    //println(">>> " + actNodeInfo.nodeType);
    //
    var PricePlanUser = contextVariables.get("PricePlanUser");

    println('Price Plan User >' + PricePlanUser);

    if (PricePlanUser == null) {
        PricePlanUser = userConnInfo.getUserName();
    } else {
        PricePlanUser = PricePlanUser + ";" + userConnInfo.getUserName();
    }

    if (actNodeInfo.nodeType.equals("Task")) {
        contextVariables.put("Comments", comment);

        contextVariables.put("What", What);
        contextVariables.put("HTMLComments", HTMLComments);
        contextVariables.put("RejectRecallSubject", RejectRecallSubject);
        contextVariables.put("RejectRecallMsg1", RejectRecallMsg1);
        contextVariables.put("RejectRecallMsg2", RejectRecallMsg2);
        contextVariables.put("RejectRecallRole", RejectRecallRole);

        contextVariables.put("UserDecision", action);
        contextVariables.put("IsNonPostingMarket", IsNonPostingMarket);
        contextVariables.put("IsFuturePlanning", IsFuturePlanning);
        contextVariables.put("Product Name", productName);
        contextVariables.put("Geography Name", geographyName);
        contextVariables.put("Region Name", regionName);
        contextVariables.put("Year", year);
        contextVariables.put("Geography Code", geographyCode);
        contextVariables.put("Product Code", productCode);
        contextVariables.put("Time Code", timeCode);
        contextVariables.put("Document Id", docID);
        contextVariables.put("URL", webURL);
        contextVariables.put("PricePlanUser", PricePlanUser);
        //ET#1534
        contextVariables.put("MyActorId", userConnInfo.getUserName());


        println(">>>>>>>>>>>>>>>>>>>>>>>>>>>before executeTasks");

        if (wfTransition == "Reject") {
            contextVariables.put("isRejectFlg", true);
        } else if (wfTransition == "Recall") {
            contextVariables.put("isRejectFlg", false);
        }

        var taskInstanceInfo = wfConnectionObj.getTasksForNode(processInstanceId, activeNodeId);
        var taskInfo = new com.vistaar.workflow.dataobjects.TaskExecutionInfo(taskInstanceInfo[0].getTaskId(), comment, null, contextVariables);
        var taskInfoList = new Array();
        taskInfoList[0] = taskInfo;
        var actorId = userConnInfo.getUserName();
        println("taskInfoList : " + taskInfoList);
        try {
            wfConnectionObj.executeTasks(taskInfoList, actorId, userConnInfo);
        } catch (e) {
            throw new Error(e);
        }
    } else if (actNodeInfo.nodeType.equals("State")) {
        var l_LocalPropsMap = new java.util.HashMap();
        var removablePersistantPropsArray = new Array();

        if (systemFieldsObject.has("persistentParamMap")) {
            var persistentParamMapObject = systemFieldsObject.get("persistentParamMap");
            var persistantProps = new java.util.HashMap();
            var removablePersistantPropsArrayCounter = 0;

            for (var itr = persistentParamMapObject.keys(); itr.hasNext();) {
                var key = itr.next();
                persistantProps.put(key, persistentParamMapObject.get(key).get("Value"));
                println("Adding Persistent Property: " + key + " " + persistentParamMapObject.get(key).get("Value"));
                if (persistentParamMapObject.get(key).has("DeletePostWFExecution") && persistentParamMapObject.get(key).get("DeletePostWFExecution") == true) {
                    removablePersistantPropsArray[removablePersistantPropsArrayCounter] = key;
                    removablePersistantPropsArrayCounter++;
                }
            }

            if (persistantProps.size() != 0) {
                println("------------context variables set---------------");
                wfConnectionObj.setContextVariables(processInstanceId, persistantProps);
            }
        }
        if (systemFieldsObject.has("localParamMap")) {
            l_LocalPropsMap = systemFieldsObject.get("localParamMap");
        }

        try {
            println("***************** Execute Transition called for State Node *****************");
            if (wfTransition == "Reject") {
                persistantProps.put("isRejectFlg", true);
            } else if (wfTransition == "Recall") {
                persistantProps.put("isRejectFlg", false);
            }
            wfConnectionObj.executeTransition(processInstanceId, activeNodeId, action, l_LocalPropsMap, persistantProps, userConnInfo);
        } catch (e) {
            throw new Error("Execute Transition has failed.");
            println(e);
        }

        if (removablePersistantPropsArray.length != 0) {
            println("-------------Removing Context Variables---------------" + removablePersistantPropsArray);
            wfConnectionObj.deleteContextVariables(processInstanceId, removablePersistantPropsArray);
        }
    }
}

function getApprovalLevel(systemFieldsObject, wfConnectionObj) {
    var wfConnectionObj = com.vistaar.workflow.core.WorkflowManagerImpl.getInstance();

    var processInstanceKey = systemFieldsObject.get("System Fields").get("WorkFlowProcessInstanceKey");
    var processDefinitionName = systemFieldsObject.get("System Fields").get("WorkFlowProcessDef");

    //println("processInstanceKey >> " + processInstanceKey);
    //println("processDefinitionName >> " + processDefinitionName);

    var activeNodesInfo = wfConnectionObj.getActiveNodes(processDefinitionName, processInstanceKey);
    //println("activeNodesInfo >> " + activeNodesInfo);
    var actNodeInfo = activeNodesInfo[0];
    var activeNodeId = actNodeInfo.getNodeId();
    var processInstanceId = actNodeInfo.getInstanceId();
    systemFieldsObject.put("ProcessInstanceId", processInstanceId);
    var contextVariables = wfConnectionObj.getContextVariables(processInstanceId);
    var approvalLevel = contextVariables.get("Approve_Level");

    return approvalLevel;
}

function g_checkLockDocument(executionContext) {
    var startTime = new Date();
    println("---------------------------CheckLockDocument Script Started-------------------------------");
    var PSExpiryObject = g_getPSExpiryObject(g_activePSDefinition);
    println("PSExpiryObject : " + PSExpiryObject);
    if (PSExpiryObject.length() != 0) {
        var libraryName = executionContext.getVariable("libraryName");
        var psDocument = WF_NS_PS_Generic.GetPriceStructure(executionContext);
        var psDefinitionName = g_activePSDefinition; // executionContext.getVariable("PSDefinitionName");
        var docServerManager = getJBPMConfigObject(VAR_DOCPROVIDER);
        var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");

        scope = g_getScopeFromDocument(psDocument, psDefinitionName);

        var lastPublishedPSDocument = g_getLastOrNextPublishedData(libraryName, scope, psDefinitionName, false, docServerManager, userConnInfo);

        if (lastPublishedPSDocument.has("System Fields")) {
            var lockUser = lastPublishedPSDocument.get("System Fields").get("Lock Owner");

            if (!lockUser.equals("")) {
                if (!lockUser.equals(userConnInfo.getUserName())) {
                    //executionContext.setVariable("Lock User", lockUser);
                    //var scopeString = generateScopeString(lastPublishedPSDocument);
                    var message = "Price Structure Publish operation could not be completed successfully because system could not update previous Published Price Structure which is currently being used by user " + lockUser;
                    if (PSExpiryObject.has("JSMessage") && PSExpiryObject.get("JSMessage").has("LockDocument")) {
                        var message = PSExpiryObject.get("JSMessage").get("LockDocument").get("FailureMessage");
                        var Config = PSExpiryObject.get("JSMessage").get("LockDocument").get("ScopeStringConfig");
                        var scopeString = generateScopeString(lastPublishedPSDocument, Config);
                        message = message.replace("<scopeString>", scopeString);
                        message = message.replace("<lockUser>", lockUser);
                    }
                    throw message;
                }
            }
        }
    }
    println("---------------------------CheckLockDocument Script Ended-------------------------------");
    var endTime = new Date();
    println("Time taken for CheckLockDocument : " + (endTime - startTime));
}

function generateScopeString(PSDocument, Config) {
    var scope = "";
    var length = Config.get("Config").length();
    var separator = Config.get("Separator");
    for (var iCount = 0; iCount < length; iCount++) {
        var obj = Config.get("Config").get(iCount);
        var fetchType = obj.get("Fetch Type");
        if (fetchType.equals("Master Entity")) {
            var master = obj.get("Master");
            var level = obj.get("Level") + "";
            var levelArray = level.split(".");
            var value = new JSONObject(PSDocument.toString());
            for (var jCount = 0; jCount < levelArray.length; jCount++) {
                value = value.get(levelArray[jCount]);
            }
            level = value;

            value = new JSONObject(PSDocument.toString());
            var code = obj.get("Code") + "";
            var codeArray = code.split(".");
            for (var jCount = 0; jCount < codeArray.length; jCount++) {
                value = value.get(codeArray[jCount]);
            }
            code = value;

            var outputKey = obj.get("Output");
            if (NormalizedHierachiesMap.containsKey(master) && NormalizedHierachiesMap.get(master).containsKey(level)) {
                value = NormalizedHierachiesMap.get(master).get(level).get(code).get(outputKey);
            } else {
                //Query for Master Entity.
                var queryString = '{"ConditionOperator":"And","Condition":[{"FieldName":"Code","Value":{"Type":"Text","Content":"' + code + '"},"ConditionType":"="},{"FieldName":"Level Code","Value":{"Type":"Text","Content":"' + level + '"},"ConditionType":"="}]}';
                var optionsParam = new HashMap();
                optionsParam.put("ColumnOptions", "DocumentColumn");
                var result = docServerManager.getJSONDocsByQuery(master, queryString, userConnInfo, optionsParam);
                value = result.get(0).get(outputKey);
            }

            value = NormalizedHierachiesMap.get(master).get(level).get(code).get(outputKey);
        } else if (fetchType.equals("Document")) {
            var value = new JSONObject(PSDocument.toString());
            var out = obj.get("Output") + "";
            var keyArray = out.split(".");
            for (var jCount = 0; jCount < keyArray.length; jCount++)
                value = value.get(keyArray[jCount]);
        }
        if (typeof(updateScopeValueForCustomMessage) === 'function') //if solution function defined to update value.
        {
            value = updateScopeValueForCustomMessage(value, obj);
        }
        scope = scope + value;

        if (iCount < length - 1)
            scope = scope + separator;
    }
    return scope;
}

function getUniqueMalString(stringValue) {
    var sourceString = stringValue.split(";");
    var mailStringJSON = new JSONObject();
    var mailStringArr = new JSONArray();
    var mailString = "";
    for (var i = 0; i < sourceString.length; i++) {
        if (!mailStringJSON.has(sourceString[i])) {
            mailStringJSON.put(sourceString[i], sourceString[i]);
            mailStringArr.put(sourceString[i]);
        }
    }
    for (var m = 0; m < mailStringArr.length(); m++) {
        mailString = mailString + ";" + mailStringArr.get(m) + ";";
    }
    //var mailString = mailStringArr.toString();
    //mailString = mailString.replace(",", ";");
    return mailString;
}
