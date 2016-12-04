/********************************************************************************
This work contains or references Vistaar generic components or Vistaar API, and 
is developed in accordance with Vistaar best practices and solution development
guidelines. This work is designed and intended to be used only with licensed 
Vistaar software.
********************************************************************************/

 /**
     * @fileOverview Generic Functions for Workflow Process definition inline scripts
     * @author anadar
     * @version 1.0.0
     */

/**
 * ![Process Defintion](img/processDefinitionImage.jpg)
 * @class WF_NS_PS_Generic
 * @requires GWF_Normalize
 * @requires BRMSConnector
 * @requires WF_NS_PriceStructure
 */
function WF_NS_PS_Generic()
{	
	/**
	 * It is called from process definition and it executes `ApprovalDecision_NodeEnter_Execute` function
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name  ApprovalDecision_NodeEnter
	 * @param {object} executionContext Workflow Execution Context
	 * @example
	 * <super-state name="super-state1">	
		<decision name="Approval Decision" expression="#{ApprovalDecisionTransition}">
			<event type="node-enter">
				<action name="DecideTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
						<!--@ 
						WF_NS_PS_Generic.ApprovalDecision_NodeEnter(executionContext);
						@-->
					</javascript>
				</action>
			</event>
			<transition to="Pending Approval" name="Approval Required"></transition>
			<transition to="Publish Decision" name="Approve"></transition>
	 */
	this.ApprovalDecision_NodeEnter = function (executionContext)
	{
		//throw("Document is updated by another user. ");
		try
		{
			var startTime = new Date();
			
			this.ApprovalDecision_NodeEnter_Execute(executionContext);
			
			var endTime = new Date();
			var executionTime = endTime - startTime;
			println("#### ApprovalDecision_NodeEnter End : Execution Time (milliseconds) : " + executionTime);
		}
		catch (error)
		{
			println("#### Error occured in ApprovalDecision_NodeEnter : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.setVariable("ApproveMailUser", "");
			executionContext.leaveNode("Reject");
			throw(error);
		}
	}
	
	/**
	 * This where approval decesion starts following things are done here
	 *   * Check if its Future Planning if it is then auto publish the plan
	 *   * Check the current Level of the Price Plan 
	 *   * Look up Delegates for the the current Level of the Price Plan 
	 *   * If there are Delegates do a transition to Pending Approval
	 *   * If thera are no Delegates do a transition to Approved/Published based on Posting Market Information
	 * @name  ApprovalDecision_NodeEnter_Execute
	 * @memberof WF_NS_PS_Generic
	 * @function 
	 * @param {object} executionContext Workflow Execution Context
	 */
	this.ApprovalDecision_NodeEnter_Execute = function(executionContext)
	{
		//Place Transition name in ApprovalDecisionTransition
		//Setting default to Reject
		println("START :: ApprovalDecision_NodeEnter_Execute");
		

		var ActorHistoryInfo = executionContext.getVariable("ActorHistoryInfo");
		if(ActorHistoryInfo != null){
			ActorHistoryInfo = new JSONObject(ActorHistoryInfo);
			println("##Inside IF");
		}else{
			println("##Inside ELSE");	
			ActorHistoryInfo = new JSONObject();
		}

		var approvalDecisionTransition = "Reject";
		var module = "ApproverMatrix";
		executionContext.setVariable("CurrentState", "Approval Decision");
		
		var userDecision = executionContext.getVariable("UserDecision");
		if (userDecision == null)
			userDecision = "";
			
		var IsNonPostingMarket = executionContext.getVariable("IsNonPostingMarket");
		var IsFuturePlanning = executionContext.getVariable("IsFuturePlanning");
		println("IsNonPostingMarket >> " + IsNonPostingMarket + " / IsFuturePlanning >> " + IsFuturePlanning);
		
		var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
		
		

		var ppdocID=executionContext.getVariable("Document Id");
		
		var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
		println("Document Id > " + ppdocID);
		println("userConnInfo > " + userConnInfo);
		println("docProvider > " + docProvider);

		var Current_Level = parseInt(executionContext.getVariable("Approve_Level"));
		var Max_Level = parseInt(executionContext.getVariable("MaxApproval"));
		var isScopeValid = true;
		println("Max_Level > " + Max_Level);
		println("Current_Level || " + Current_Level);
		//Planning year condition for auto-approval
		if(IsFuturePlanning == 1){
			println("####################### In ApprovalDecision_NodeEnter_Execute: IsFuturePlanning SYSTEM Approve");
			executionContext.setVariable("ApproveMailUser", "");
			executionContext.setVariable("ApproverRoles","");
			approvalDecisionTransition = "Approve";
			executionContext.setVariable("isAutoPublish", true);
			
			
			/* println("\n\n \n saveHistoricData Start > =====================" );
			var historicImpactObj = new HistoricImapact();
			historicImpactObj.saveHistoricData(ppdocID, docProvider, userConnInfo);
			println(" saveHistoricData end > =====================" ); */
			
			
		}else{
			
					
		
			//println("Max_Level > " + Max_Level);
			//println("Current_Level || " + Current_Level);
			for (;Current_Level <= Max_Level; Current_Level++)
			{
			//================================================================
			//Get Approver Roles from BRMS and set executionContext variables - START
			//================================================================
			
			// update Approve_Level in executionContext
			executionContext.setVariable("Approve_Level", String(Current_Level));
			
			//Get Price Structure Doc
			var priceStructureDoc = this.GetPriceStructure(executionContext);
			
			var approverLevelNumber = executionContext.getVariable("Approve_Level");
			var approverLevel = "Level" + approverLevelNumber;
			println("Approval Level ....>> " + approverLevelNumber);
			//Get BRMS Input Object
			var DefinitionType = "PricePlan";
			var scope = executionContext.getVariable("Scope");
			var scopeJSONObj = new org.json.JSONObject(scope);
			println("scopeJSONObj > " + scopeJSONObj);
			var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
			var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
			var permissionAdapter = new PermissionMtxAdapter_Intf();
			permissionAdapter.Init(docProvider, userConnInfo);
			var approversInfo = permissionAdapter.getApprover(DefinitionType, scopeJSONObj, priceStructureDoc, ApproverMatrixConditional, approverLevel);
			println("approversInfo: " + approversInfo);
			var approverRoles;
			if (approversInfo.has("Delegates"))
			{
				approverRoles = approversInfo.get("Delegates");
				approverRoles = new org.json.JSONArray(approverRoles.toString());
			}
			else
				approverRoles = new org.json.JSONArray();
				
			
			//Get approverMessages from approversInfo
			var approverMessages;
			if (approversInfo.has("Messages"))
			{
				approverMessages = approversInfo.get("Messages");
				approverMessages = new org.json.JSONArray(approverMessages.toString());
			}
			else
				approverMessages = new org.json.JSONArray();

			if(approverLevelNumber > 1){
				var currentUserRole = userConnInfo.getRoleName();
				var oldLevelNumber = approverLevelNumber - 1;
				var oldApproverLevel = "Level" + oldLevelNumber;
				executionContext.setVariable(oldApproverLevel, currentUserRole.toString());
			}
				
			println("###### in ApprovalDecision_NodeEnter_Execute : approverRoles : " + approverRoles.toString());
			println("###### in ApprovalDecision_NodeEnter_Execute : approverMessages : " + approverMessages.toString());

			var approverMessagesString = this.FormatUserMessage(approverMessages);
			if(approverMessagesString!=null)
				executionContext.setVariable("ApproverRoleMessagesString", approverMessagesString.toString());
			
			//Add audit logs
			println("###### in ApprovalDecision_NodeEnter_Execute : Add audit logs");
			var auditLogDocIds = this.AddAuditLog("Approver Matrix", approverRoles, approverMessages, executionContext);
			
			var auditLogMessageIDs = new org.json.JSONObject();
			auditLogMessageIDs.put("MessageIds", auditLogDocIds);
			println("###### in ApprovalDecision_NodeEnter_Execute : auditLogMessageIDs : " + auditLogMessageIDs.toString());
			
			if(auditLogMessageIDs != null) 
				executionContext.setVariable("AuditLogMessages", auditLogMessageIDs.toString());
		
			println("###### in ApprovalDecision_NodeEnter_Execute : Take Transition based on output");
			
			isScopeValid = approversInfo.get("isScopeValid");
			
			if (approverRoles.length() != 0)
			{
				ActorHistoryInfo.put(approverLevel, approverRoles.toString());
			}
			println("ActorHistoryInfo put called : " + ActorHistoryInfo);
			println("Current_Level >> " + Current_Level);
			
			if(isScopeValid == false)
			{
				println("####################### No Scope Matched #######################");
				executionContext.setVariable("ApproverRoles",approverRoles.toString());
				
				Current_Level = Max_Level;
				executionContext.setVariable("Approve_Level", String(Current_Level));
				
				approvalDecisionTransition = "Approval Required";
				executionContext.setVariable("isAutoPublish", false);
				break;
			}
			else
			{
				if (approverRoles.length() == 0)
				{
					println("No Approver found");
					executionContext.setVariable("isAutoPublish", false);
					continue;
				}
				else if (this.ContainsInList(approverRoles,"SYSTEM Reject"))
				{
					println("####################### In ApprovalDecision_NodeEnter_Execute: SYSTEM Reject");
					executionContext.setVariable("ApproveMailUser", "");
					executionContext.setVariable("ApproverRoles","");
					approvalDecisionTransition = "Reject";
					executionContext.setVariable("isAutoPublish", false);
					break;
				}
				else if (this.ContainsInList(approverRoles,"SYSTEM Approve"))
				{
					println("####################### In ApprovalDecision_NodeEnter_Execute: SYSTEM Approve");
					executionContext.setVariable("ApproveMailUser", "");
					executionContext.setVariable("ApproverRoles","");
					approvalDecisionTransition = "Approve";
					executionContext.setVariable("isAutoPublish", false);
					break;
				}
				else  //conditional with approval roles
				{
					if(AutoApproveIfSameApprovers == true)
					{
						var previousRoleArray = executionContext.getVariable("ApproverRoles");
						
						if(previousRoleArray == null || previousRoleArray.equals(""))
						{
							var creatorRole = executionContext.getVariable("CurrentRole").split(",");
							var creatorRoleJSONArray = new JSONArray(creatorRole);
							previousRoleArray = creatorRoleJSONArray;
						}
						else
						{
							previousRoleArray = new JSONArray(previousRoleArray);
						}
						// If Same Approvers found
						if (this.checkArrayContainsAllElement(approverRoles, previousRoleArray))
						{
							continue;
						}
					}
					println("####################### In ApprovalDecision_NodeEnter_Execute: Approver Found");
					executionContext.setVariable("ApproverRoles",approverRoles.toString());
					approvalDecisionTransition = "Approval Required";
					executionContext.setVariable("isAutoPublish", false);
					break;
				}
			}
			}
		}

		println("###### NS WF_PS_Ge ActorHistoryInfo > " + ActorHistoryInfo);
		executionContext.setVariable("ActorHistoryInfo", ActorHistoryInfo.toString());
		if (Current_Level > Max_Level && isScopeValid == true)
		{
			println("Current_level>Max_Level");
			executionContext.setVariable("ApproverRoles","");
			approvalDecisionTransition = "Approve";
			
			
			println("\n\n \n saveHistoricData Start > =====================" );
			var historicImpactObj = new HistoricImapact();
			historicImpactObj.saveHistoricData(ppdocID, docProvider, userConnInfo);
			println(" saveHistoricData end > =====================" );
			
			
			
		}
		executionContext.setVariable("ApprovalDecisionTransition", approvalDecisionTransition);
		println("END :: ApprovalDecision_NodeEnter_Execute");
	}
	
	this.ContainsInList=function (list, element)
	{
		for(var iCount=0;iCount<list.length();iCount++)
		{
			if(list.get(iCount).toString().equals(element))
			{
				return true;
			}
		}
		return false;
	}
	
	var messageMaxLength = 2000;// Maximum 2000 chars supported in workflow context variable
	var terminateChars = "...";

	this.FormatUserMessage = function(approverMessages)
	{
		//Set approverMessagesString in executionContext
		println("###### in FormatUserMessage : Set approverMessagesString in executionContext");
		var approverMessagesString = "";
		if (approverMessages != null && approverMessages.length() > 0)
		{
			for (var i = 0; i < approverMessages.length(); i++)
			{
				var bullet = i+1;
				if (approverMessagesString == "")
				{
					approverMessagesString = "(" + bullet + ") " + approverMessages.get(i);
				}
				else
				{
					approverMessagesString += " (" + bullet + ") " + approverMessages.get(i);
				}
				if (approverMessagesString.length > messageMaxLength)
				{
					approverMessagesString = approverMessagesString.substr(0, messageMaxLength - terminateChars.length - 1);
					approverMessagesString += terminateChars;
					break;
				}
			}
		}
		return approverMessagesString;
	}

	/**
	 * It is called from process definition and it executes `PendingApproval_NodeEnter_Execute
	 * @name  PendingApproval_NodeEnter
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @param {object} executionContext Workflow Execution Context
	 * @example
	 *	<event type="node-enter">
	 *				
	 *			<action name="PendingApproval_NodeEnter" class="com.vistaar.workflow.handlers.ScriptHandler">
	 *			<javascript>
	 *			<!--@
				WF_NS_PS_Generic.PendingApproval_NodeEnter(executionContext);
				@-->
				</javascript>
	  			</action>
	 */
	this.PendingApproval_NodeEnter = function (executionContext)
	{
		try
		{
			var startTime = new Date();
			
			this.PendingApproval_NodeEnter_Execute(executionContext);
			
			var endTime = new Date();
			var executionTime = endTime - startTime;
			println("#### PendingApproval_NodeEnter End : Execution Time (milliseconds) : " + executionTime);
		}
		catch (error)
		{
			println("#### Error occured in PendingApproval_NodeEnter : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.setVariable("ApproveMailUser", "");
			executionContext.leaveNode("Recall PricePlan");
			throw(error);
		}
	}

	/**
	 * In here task for the approvers/delegates found in approval decision node execute are created which will show up in there My Task screen.
	 *
	 * This function call `WF_NS_PriceStructure_createTaskForApprovalRoles` which fetchs list of Approvers that mail has to be sent hence a context variable `ApproveMailUser` will set
	 * with list of mail string
	 * @name  PendingApproval_NodeEnter_Execute
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @param {object} executionContext Workflow Execution Context
	 */
	this.PendingApproval_NodeEnter_Execute = function (executionContext)
	{
		println("At start of function PendingApproval_NodeEnter");
		executionContext.setVariable("CurrentState", "Pending Approval");
		
		var approverRoles = executionContext.getVariable("ApproverRoles");
		if(approverRoles == null)
			approverRoles = new org.json.JSONArray();
		else
			approverRoles = new org.json.JSONArray(approverRoles);
		
		var MailUserString = WF_NS_PriceStructure_createTaskForApprovalRoles(approverRoles, executionContext);
		println("############ Mail Users String: " + MailUserString);
		executionContext.setVariable("ApproveMailUser", MailUserString);
			
		println("###### in PendingApproval_NodeEnter_Execute : END");
	}

	/**
	 * It is called from process definition and it executes `PendingApproval_TaskEnd_Execute`
	 * @name PendingApproval_TaskEnd
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @param {object} executionContext Workflow Execution Context
	 * @example
	 *		<event type="task-end">
				<action name="DecideTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
					<!--@
					WF_NS_PS_Generic.Approved_TaskEnd(executionContext);
					@-->
					</javascript>
				</action>
			</event>
	 */
	this.PendingApproval_TaskEnd = function (executionContext)
	{
		try
		{
			this.PendingApproval_TaskEnd_Execute(executionContext);
		}
		catch (error)
		{
			// executionContext.setVariable("ExecutedApprovers", "");
			println("#### Error occured in PendingApproval_TaskEnd : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.leaveNode("Recall PricePlan");
			throw(error);
		}
	}
	/**
	 * The function does the leave Node for the Price Plan from Approval Decision 
	 * 	* Reject - Leave Node in `Recal PricePlan`
	 * 	* Approve - Leave Node in `NextApproveTask PS`
	 * @name PendingApproval_TaskEnd_Execute
	 * @param {object} executionContext Workflow execution context
	 * @function
	 * @memberof WF_NS_PS_Generic
	 */
	this.PendingApproval_TaskEnd_Execute = function (executionContext)
	{
		println("PendingApproval_TaskEnd_Execute...............");
		var decision = executionContext.getVariable("UserDecision");
		println("User decision-" + decision);

		if (String(decision) == "Reject")
		{
			// executionContext.setVariable("ExecutedApprovers", "");
			executionContext.setVariable("ApproveMailUser", "");
			executionContext.setVariable("ApproverRoles","");
			executionContext.leaveNode("Recall PricePlan");
		}
		else if (String(decision) == "Approve")
		{
			var Get_Level = executionContext.getVariable("Approve_Level");
			var Next_Level = parseInt(Get_Level) + 1;
			println("Next Level: " + Next_Level);
			executionContext.setVariable("Approve_Level", String(Next_Level));
			executionContext.leaveNode("NextApproveTask PS");
		}
	}
	/**
	 * Function to fetch Price Plan Document
	 * @name GetPriceStructure
	 * @param {object} executionContext Script execution context
	 * @function 
	 * @memberOf  WF_NS_PS_Generic
	 */
	this.GetPriceStructure = function (executionContext)
	{
		var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
		var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
		var options = new java.util.HashMap();
		var libraryName = executionContext.getVariable("libraryName");

		var jsonPSDoc;
		var DocumentIDForPP = executionContext.getVariable("documentId");
		//create JSONQuery with DocumentIDForPP
		// docIDMap.put("Document Id", executionContext.getVariable("documentId"));
		// println("##########################" + docIDMap.get("Document Id"));
		options.put("ColumnOptions", "DocumentColumn");
		try
		{
			var finalQuery = new JSONObject(); 
			var conditionFieldNames = new JSONArray(); 
			var conditionType = new JSONArray(); 
			var conditionValues = new JSONArray(); 
			var units = new JSONArray(); 

			conditionFieldNames.put("Document Id"); 
			conditionValues.put(DocumentIDForPP); 
			conditionType.put("IN");

			var conditionalUnit = this.getUnitConditionalQuery("AND", "OR", conditionFieldNames, conditionType, conditionValues);

			units.put(conditionalUnit); 
			finalQuery.put("Units", units); 
			finalQuery.put("UnitOperator", "OR"); 
			var jsonQuery = finalQuery.toString();
			jsonPSDoc = mergePricePlanAndDealContainerDocuments(jsonQuery, docProvider, userConnInfo).get(0);

			// println("GetPriceStructure jsonPSDoc: " + jsonPSDoc);
		}
		catch (error)
		{
			println("Failed to fetch Price Structure for Document ID: " + DocumentIDForPP);
			throw(error);
		}

		if (jsonPSDoc == null)
		{
			throw("Failed to fetch Price Structure for Document ID: " + DocumentIDForPP);
		}

		return jsonPSDoc;
	}
	/**
	 * It fetchs the Price Plan and constructs the object to send to BRMS to get Delegates.
	 * The object that is formed is said 'Normalized Structure'. The Normalized Structure is build using `GWF_Normalize`
	 * @function
	 * @name  InitializeBRMSInput
	 * @memberof WF_NS_PS_Generic
	 * @param {string}  DefinitionType        Process Definition Name
	 * @param {object}  scope                 Price Plan Scope
	 * @param {object}  structureObject       Price Plan structured Object
	 * @param {Boolean} isModuleConditional   BRMS rule is it conditional	
	 * @param {object}  additionalParams      Addistion Parameters
	 * @param {object}  userConnInfo          User Connection Info
	 * @param {Boolean} isPermissionCheckOnly Is the call for permission check only
	 */
	this.InitializeBRMSInput = function (DefinitionType, scope, structureObject, isModuleConditional, additionalParams, userConnInfo, isPermissionCheckOnly)
	{
		println("START :: this.InitializeBRMSInput function");
		println("scope >> " + scope);
		DefinitionType = "PricePlan";
		var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);

		// var returnObjStr = '{"DOARequest" :{"isApproverSet" : false}}';
		// var returnObjStr = '{"DOARequest" :{}}';
		var DOARequestObj = new JSONObject();
		var DOARequestArray = new JSONArray();
		var returnObj = new org.json.JSONObject();
		
		if(structureObject != null)
			structureObject = new org.json.JSONObject(structureObject.toString());
		else
			structureObject = new org.json.JSONObject();
		
		DOARequestObj.put("DefinitionType", "PricePlan");
		DOARequestObj.put("OriginalStructure", structureObject);
		
		//AdditionalParams
		var addParamsItr = additionalParams.keys();
		while (addParamsItr.hasNext()) {
			var addParamKey = addParamsItr.next();
			var addParamValue = additionalParams.get(addParamKey);
			
			DOARequestObj.put(addParamKey, addParamValue);
		}
		
		if (!DOARequestObj.has("DelegationLevel"))
			DOARequestObj.put("DelegationLevel", "Level1");
		DOARequestArray.put(DOARequestObj);
		
		//structureObject object
		
		
		/* var definitionTypeArray = new JSONArray();
		var currentDefinitionType = new JSONObject();
		currentDefinitionType.put("Module","Current Module");
		currentDefinitionType.put("Current Module",DefinitionType);
		definitionTypeArray.put(currentDefinitionType); */
		
		
	
		if(permissionHierarchyDetail.has(DefinitionType))
		{
			var parentModuleArray = permissionHierarchyDetail.get(DefinitionType).get("DependsOnModule");
			for(var iCount = 0; iCount < parentModuleArray.length(); iCount++)
			{
				/* var parentDefinitionType = new JSONObject();
				parentDefinitionType.put("Module","Parent Module");
				parentDefinitionType.put("Parent Module",parentModuleArray.get(iCount));
				definitionTypeArray.put(parentDefinitionType); */
				DOARequestObj = new JSONObject();
				structureObject = new org.json.JSONObject();
				
				DOARequestObj.put("DefinitionType", parentModuleArray.get(iCount));
				DOARequestObj.put("OriginalStructure", structureObject);
				
				//AdditionalParams
				var addParamsItr = additionalParams.keys();
				while (addParamsItr.hasNext()) {
					var addParamKey = addParamsItr.next();
					var addParamValue = additionalParams.get(addParamKey);
					
					DOARequestObj.put(addParamKey, addParamValue);
				}
				
				if (!DOARequestObj.has("DelegationLevel"))
					DOARequestObj.put("DelegationLevel", "Level1");
				DOARequestArray.put(DOARequestObj);
			}
		}
		
		// returnObj.get("DOARequest").put("DefinitionType", DefinitionType);
		//returnObj.get("DOARequest").put("DefinitionType", definitionTypeArray);
		
		
		//returnObj.get("DOARequest").put("OriginalStructure", structureObject);
		//println("########### structureObject in GetBRMSInputObject: " + structureObject.toString());

		returnObj.put("Scope", new org.json.JSONObject());
		returnObj.put("DOARequest", DOARequestArray);
		
		var normalizedFacts = null;
		
		if(isModuleConditional == true)
		{
			// if(structureObject.length() != 0)
			// {
				if(typeof(NormalizeStructure_Custom) === 'function')	//if condition added to support PreScripting.
				{
					normalizedFacts = NormalizeStructure_Custom(structureObject);
				}
				else
				{
					if(DefinitionType == 'PricePlan')
					{
						// println("structureObject >> " + structureObject);
						normalizedFacts = GWF_Normalize(structureObject, docProvider, userConnInfo, isPermissionCheckOnly);	//Normalized_StructureObject
					}
				}
			// }
			
			if(normalizedFacts==null)
			{
				normalizedFacts = new org.json.JSONArray();
				normalizedFacts.put(new org.json.JSONObject());
			}
			else
				normalizedFacts = new org.json.JSONArray(normalizedFacts);
				
			returnObj.put("NormalizedStructure", normalizedFacts);
		}
		var membersArray = getMembersFromScope(scope);
		returnObj.put("Member", membersArray);
			//println("NIR ================================== Putting NStr" + returnObj);
		returnObj = VistaarJSUtils.newObject(returnObj.toString());
		println("END :: this.InitializeBRMSInput function");
		return returnObj;
	}

	/**
	 * Runs BRMS rules and get the list of Delegates for the input object
	 * @memberof WF_NS_PS_Generic
	 * @name GetDelegatesFromBRMS
	 * @param {string} module          Rule Name
	 * @param {object} brmsInputObject Normalized Structure of BRMS
	 * @param {object} userConnInfo    User Connection Info
	 */
	this.GetDelegatesFromBRMS = function (module, brmsInputObject, userConnInfo)
	{
		println("###### At start of function GetDelegatesRoles");
		var rbName = "DOA_" + module + "_RB";

		var conditional = false;
		var delegatesArray = new org.json.JSONArray();
		var isValidScopeFlag = false;

		try
		{
			var BRMSConnector = VistaarJSUtils.getBRMSConnector(userConnInfo);
			//println("brmsInputObject : "+brmsInputObject);
			//var fileToWrite = new File("/home/cloud_es1/nshetye/workflow/brmsInputObject.out");
			//var FW = new FileWriter(fileToWrite);
			//FW.write(brmsInputObject);
			//FW.close();
			var result = BRMSConnector.runRules(rbName, brmsInputObject, null, null, false);
			println("result.EvaluationSucceeded=" + result.evaluationSucceeded);
			if (result.evaluationSucceeded == false)
			{
				println("Error while rule evaluation:" + result.errors);
				throw new Error("Error occured while running rule: " + result.errors);
			}
			println("Rule logs are: " + result.errors + "\n");
		}
		catch (error)
		{
			println("Failed to run Rule Bundle");
			throw(error);
		}

		var jsonResult = new org.json.JSONObject(result);
		var decisionInfoList = new org.json.JSONArray();
		if (jsonResult != null && jsonResult.get("RuleOutput") != null)
		{
			var ruleOp1 = new org.json.JSONObject(jsonResult.get("RuleOutput"));
			
			if (ruleOp1.has("DOARequest"))
			{
				
				var ruleOp = ruleOp1.get("DOARequest");
				var ruleOp = new org.json.JSONArray(ruleOp.toString());
				//println("####### DEBUG ######### ruleOp1.DOARequest: " + ruleOp);
				if (ruleOp != null && ruleOp.length() > 0)
				{
					for(var iCount = 0; iCount < ruleOp.length(); iCount++)
					{
						var ruleOpTemp = ruleOp.get(iCount);	
						if (ruleOpTemp.has("Delegates"))
						{
							if(delegatesArray.length() <= 0)
								delegatesArray = ruleOpTemp.get("Delegates");
							else
							{
								for(var jCount = 0; jCount < ruleOpTemp.get("Delegates").length(); jCount++)
								{
									delegatesArray.put(ruleOpTemp.get("Delegates").get(jCount));
								}
							}
						}
						if (ruleOpTemp.has("isScopeValid"))
						{
							if( isValidScopeFlag == true || ruleOpTemp.get("isScopeValid") == true)
								isValidScopeFlag = true;
							else
								isValidScopeFlag = false;
						}
						if (ruleOpTemp.has("DecisionInfoList"))
						{
							if(decisionInfoList.length() <= 0)
								decisionInfoList = ruleOpTemp.get("DecisionInfoList");
							else
							{
								for(var jCount = 0; jCount < ruleOpTemp.get("DecisionInfoList").length(); jCount++)
								{
									decisionInfoList.put(ruleOpTemp.get("DecisionInfoList").get(jCount));
								}
							}
						}
					}
				}
			}
		}
		else
		{
			throw("Failed to get BRMS output for structureObject");
		}

		var returnObj = new org.json.JSONObject();
		if (delegatesArray)
			returnObj.put("Delegates", delegatesArray);
		if (decisionInfoList)
			returnObj.put("DecisionInfoList", decisionInfoList);
		
		returnObj.put("isScopeValid", isValidScopeFlag);
		
		if(typeof(ProcessDOAOutput_Custom) === 'function')	//if condition added to support PostScripting.
		{
			returnObj = ProcessDOAOutput_Custom(returnObj);
		}	
		
		//println("########### returnObj in GetDelegatesRoles: " + returnObj.toString());
		return returnObj;
	}

	this.AddAuditLog = function (module, delegatesRoleNames, delegatesRoleMessages, executionContext)
	{
		println("#############################At start of function AddAuditLog");

		var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
		var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
		var options = new java.util.HashMap();
		var libraryName = "AuditLog";

		if (delegatesRoleNames == null)
			delegatesRoleNames = new org.json.JSONArray();
		else
			delegatesRoleNames = new org.json.JSONArray(delegatesRoleNames.toString());

		if (delegatesRoleMessages == null)
			delegatesRoleMessages = new org.json.JSONArray();
		else
			delegatesRoleMessages = new org.json.JSONArray(delegatesRoleMessages.toString());
		
		var auditLogDocIds = new org.json.JSONArray();
		var messagesSizeLimited = new org.json.JSONArray();
		for (var i = 0; i < delegatesRoleMessages.length(); i++)
		{
			var messagesSizeLimitedPrev = new org.json.JSONArray(messagesSizeLimited.toString());
			messagesSizeLimited.put(delegatesRoleMessages.get(i));
			if (messagesSizeLimited.toString().length() > messageMaxLength)
			{
				messagesSizeLimited = messagesSizeLimitedPrev;
				break;
			}
		}

		try
		{
			var dateTime = new Date();
			var jsonDataDoc = new org.json.JSONObject();
			jsonDataDoc.put("TimeStamp", dateTime.toUTCString() + " (" + dateTime.getTime() + ")");
			jsonDataDoc.put("Module", module);
			jsonDataDoc.put("Role", delegatesRoleNames);
			jsonDataDoc.put("PSDocId", executionContext.getVariable("documentId") + "");
			jsonDataDoc.put("Message", messagesSizeLimited);

			var responseDoc = docProvider.createDoc(libraryName, jsonDataDoc.toString(), userConnInfo, options);
			
			if(responseDoc != null)
			{
				responseDoc = new org.json.JSONObject(responseDoc);
				auditLogDocIds.put(responseDoc.get("System Fields").get("Document Id"));
			}

			println("####################### In AddAuditLog : done");
		}
		catch (error)
		{
			println("###### Failed to create Audit Logs for doc id: " + error);
			throw(error);
		}

		return auditLogDocIds;
	}
	/**
	 * It is called from process definition and it set email notifiers list in workflow execution context
	 * @param {object} executionContext Workflow execution context
	 * @memberof WF_NS_PS_Generic
	 * @name PublishDecision_NodeEnter_FetchNotifiers
	 * @function
	 * @example
	 * <decision name="Publish Decision" expression="#{PublishDecisionTransition}">
				<event type="node-enter">
				<action name="DecideTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
						<!--@ 
						WF_NS_PS_Generic.PublishDecision_NodeEnter_FetchNotifiers(executionContext);
						@-->
					</javascript>
				</action>
	 */
	this.PublishDecision_NodeEnter_FetchNotifiers = function (executionContext)
	{
		var NotifierString = WF_NS_PriceStructure_getNotificationUserString(executionContext);
		NotifierString = "";
		executionContext.setVariable("NotifyMailUserApproved",NotifierString);
	}
	
	/**
	 * It is called from process defintion and it executes `PublishDecision_NodeEnter_Execute'
	 * @param {object} executionContext Workflow execution context
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name PublishDecision_NodeEnter
	 * @example
	 * <action name="DecideTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
						<!--@ 
						WF_NS_PS_Generic.PublishDecision_NodeEnter(executionContext);
						@-->
					</javascript>
				</action>
	 */
	this.PublishDecision_NodeEnter = function (executionContext)
	{
		//try
		//{
			var startTime = new Date();
			
			this.PublishDecision_NodeEnter_Execute(executionContext);
			
			var endTime = new Date();
			var executionTime = endTime - startTime;
			println("#### PublishDecision_NodeEnter End : Execution Time (milliseconds) : " + executionTime);
		/*}
		catch (error)
		{
			println("#### Error occured in PublishDecision_NodeEnter : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.setVariable("ApproveMailUser", "");
			executionContext.leaveNode("Reject");
			throw(error);
		}*/
	}
	
	/**
	 * In here based on Decision and Parameter the next transtion is done
	 *  * isAuto Publish and Publish Decsion - Publish the Price Plan
	 *  * not is Auto Publish and Delegates pres - Price Plan in approved state, Publisher required
	 * @param {object} executionContext Workflow Execution Context
	 * @name PublishDecision_NodeEnter_Execute
	 * @memberof WF_NS_PS_Generic
	 * @function
	 */
	this.PublishDecision_NodeEnter_Execute = function(executionContext)
	{
		//Place Transition name in publisherDecisionTransition
		//Setting default to Reject
		var publisherDecisionTransition = "Reject";
		var module = "PublisherMatrix";
		
		println("#### PublishDecision_NodeEnter_Execute Start");
		executionContext.setVariable("CurrentState", "Publish Decision");
		
		var userDecision = executionContext.getVariable("UserDecision");
		if (userDecision == null)
			userDecision = "";
			
		var IsNonPostingMarket = executionContext.getVariable("IsNonPostingMarket");
		var IsFuturePlanning = executionContext.getVariable("IsFuturePlanning");
		println("IsNonPostingMarket >> " + IsNonPostingMarket + " / IsFuturePlanning >> " + IsFuturePlanning);
		
		var userConnInfo = executionContext.getContextInstance().getTransientVariable("UserConnectionInfo");
			
		var isScopeValid = true;
	
		//================================================================
		//Get Approver Roles from BRMS and set executionContext variables - START
		//================================================================
		
		//Get Price Structure Doc
		var priceStructureDoc = this.GetPriceStructure(executionContext);
		
		var additionalParams = new org.json.JSONObject();
		
		//Get BRMS Input Object
		var definitionType = "PricePlan";
		var scope = executionContext.getVariable("Scope");
		var scopeJSONObj = new org.json.JSONObject(scope);
		var docProvider = getJBPMConfigObject(VAR_DOCPROVIDER);
		var permissionAdapter = new PermissionMtxAdapter_Intf();
		permissionAdapter.Init(docProvider, userConnInfo);
		var publisherInfo = permissionAdapter.getPublisher(definitionType, scopeJSONObj, priceStructureDoc, PublisherMatrixConditional);
		
		var publisherRoles;
		if (publisherInfo.has("Delegates"))
		{
			publisherRoles = publisherInfo.get("Delegates");
			publisherRoles = new org.json.JSONArray(publisherRoles.toString());
		}
		else
			publisherRoles = new org.json.JSONArray();
			
		
		//Get publisherMessages from publisherInfo
		var publisherMessages;
		if (publisherInfo.has("Messages"))
		{
			publisherMessages = publisherInfo.get("Messages");
			publisherMessages = new org.json.JSONArray(publisherMessages.toString());
		}
		else
			publisherMessages = new org.json.JSONArray();
			
		println("###### in PublishDecision_NodeEnter_Execute : PublisherRoles : " + publisherRoles.toString());
		println("###### in PublishDecision_NodeEnter_Execute : publisherMessages : " + publisherMessages.toString());

		var publisherMessagesString = this.FormatUserMessage(publisherMessages);
		if(publisherMessagesString!=null)
			executionContext.setVariable("PublisherRoleMessagesString", publisherMessagesString.toString());
		
		//Add audit logs
		println("###### in PublishDecision_NodeEnter_Execute : Add audit logs");
		var auditLogDocIds = this.AddAuditLog("Publisher Matrix", publisherRoles, publisherMessages, executionContext);
		
		var auditLogMessageIDs = new org.json.JSONObject();
		auditLogMessageIDs.put("MessageIds", auditLogDocIds);
		println("###### in PublishDecision_NodeEnter_Execute : auditLogMessageIDs : " + auditLogMessageIDs.toString());
		
		if(auditLogMessageIDs != null) 
			executionContext.setVariable("AuditLogMessages", auditLogMessageIDs.toString());
	
		println("###### in PublishDecision_NodeEnter_Execute : Take Transition based on output");
		
		isScopeValid = publisherInfo.get("isScopeValid");
		
		if(IsNonPostingMarket == 1 || IsFuturePlanning == 1){
			println("####################### In PublishDecision_NodeEnter_Execute:IsNonPostingMarket 1 SYSTEM Publish");
			g_checkLockDocument(executionContext);
			executionContext.setVariable("PublishMailUser", ""); //do remaining
			executionContext.setVariable("PublisherRoles","");
			publisherDecisionTransition = "Publish";
			executionContext.setVariable("isAutoPublish", true);
		}else{
			if(isScopeValid == false)
			{
				println("####################### No Scope Matched #######################");
				executionContext.setVariable("PublisherRoles",publisherRoles.toString());
				
				publisherDecisionTransition = "Publish Required";
				executionContext.setVariable("isAutoPublish", false);
			}
			else
			{
				if (publisherRoles.length() == 0)
				{
					println("No Publisher found");
					executionContext.setVariable("PublishMailUser", ""); 
					publisherDecisionTransition = "Publish";
					executionContext.setVariable("isAutoPublish", false);
				}
				else if (this.ContainsInList(publisherRoles,"SYSTEM Reject"))
				{
					println("####################### In PublishDecision_NodeEnter_Execute: SYSTEM Reject");
					executionContext.setVariable("PublishMailUser", "");
					executionContext.setVariable("PublisherRoles","");
					publisherDecisionTransition = "Reject";
					executionContext.setVariable("isAutoPublish", false);
				}
				else if (this.ContainsInList(publisherRoles,"SYSTEM Publish"))
				{
					println("####################### In PublishDecision_NodeEnter_Execute: SYSTEM Publish");
					g_checkLockDocument(executionContext);
					executionContext.setVariable("PublishMailUser", ""); //do remaining
					executionContext.setVariable("PublisherRoles","");
					publisherDecisionTransition = "Publish";
					executionContext.setVariable("isAutoPublish", false);
				}
				else  //conditional with approval roles
				{
					println("####################### In PublishDecision_NodeEnter_Execute: Publisher Found");
					executionContext.setVariable("PublisherRoles",publisherRoles.toString());
					publisherDecisionTransition = "Publish Required";
					executionContext.setVariable("isAutoPublish", false);
				}
			}
		}
		executionContext.setVariable("PublishDecisionTransition", publisherDecisionTransition);
		println("###### in PublishDecision_NodeEnter_Execute : END");
	}
	/**
	 * Run from process defintion and executes `Approved_NodeEnter_Execute`
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name Approved_NodeEnter
	 * @param {object} executionContext Workflow Execution Context
	 * @example
	 * <event type="node-enter">
				
				<action name="Approved_NodeEnter" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
					<!--@
					WF_NS_PS_Generic.Approved_NodeEnter(executionContext);
					@-->
					</javascript>
	  			</action>
	 */
	this.Approved_NodeEnter = function (executionContext)
	{
		try
		{
			var startTime = new Date();
			
			this.Approved_NodeEnter_Execute(executionContext);
			
			var endTime = new Date();
			var executionTime = endTime - startTime;
			println("#### Approved_NodeEnter End : Execution Time (milliseconds) : " + executionTime);
		}
		catch (error)
		{
			println("#### Error occured in Approved_NodeEnter : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.setVariable("PublishMailUser", "");
			executionContext.leaveNode("Recall PricePlan");
			throw(error);
		}
	}
	/**
	 * Creates task for the delegates of the Approved Decision Node
	 * @memberOf  WF_NS_PS_Generic
	 * @name Approved_NodeEnter_Execute
	 * @function
	 * @param {object} executionContext Workflow Execution Context
	 */
	this.Approved_NodeEnter_Execute = function (executionContext)
	{
		println("At start of function Approved_NodeEnter_Execute");
		executionContext.setVariable("CurrentState", "Approved");
		
		var publisherRoles = executionContext.getVariable("PublisherRoles");
		if(publisherRoles == null)
			publisherRoles = new org.json.JSONArray();
		else
			publisherRoles = new org.json.JSONArray(publisherRoles);
		
		var MailUserString = WF_NS_PriceStructure_createTaskForPublisher(publisherRoles, executionContext);
		println("############ Mail Users String: " + MailUserString);
		executionContext.setVariable("PublishMailUser", MailUserString);
			
		println("###### in Approved_NodeEnter_Execute : END");
	}

	/**
	 * Run from process definition and executes `Approved_TaskEnd_Execute`
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name  Approved_TaskEnd
	 * @param {object} executionContext Workflow execution context
	 * @example
	 * <event type="task-end">
				<action name="DecideTransition" class="com.vistaar.workflow.handlers.ScriptHandler">
					<javascript>
					<!--@
					WF_NS_PS_Generic.Approved_TaskEnd(executionContext);
					@-->
					</javascript>
				</action>
	 */
	this.Approved_TaskEnd = function (executionContext)
	{
		//try
		//{
			this.Approved_TaskEnd_Execute(executionContext);
		/*}
		catch (error)
		{
			println("#### Error occured in Approved_TaskEnd : " + error);
			println("#### Rejecting PriceStructure");
			executionContext.leaveNode("Recall PricePlan");
			throw(error);
		}*/
	}

	/**
	 * Leave Node from Approved Plan
	 * * Reject  - Leave as Recall Price Plan
	 * * Publish - Leave as Publish
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name Approved_TaskEnd_Execute
	 * @param {object} executionContext Workflow execution context
	 */
	this.Approved_TaskEnd_Execute = function (executionContext)
	{
		println("Approved_TaskEnd_Execute");
		var decision = executionContext.getVariable("UserDecision");
		println("User decision-" + decision);

		if (String(decision) == "Reject")
		{
			executionContext.setVariable("PublishMailUser", "");
			executionContext.setVariable("PublisherRoles","");
			executionContext.leaveNode("Recall PricePlan");
		}
		else if (String(decision) == "Publish") //Verify
		{
			g_checkLockDocument(executionContext);
			executionContext.leaveNode("Publish");
		}
	}
	
	/**
	 * External API to run BRMSrule other the workflow
	 * @memberof WF_NS_PS_Generic
	 * @function
	 * @name GetRolesFromBRMS_ExternalInterface
	 * @param {string} module           Rule bundle Name
	 * @param {string} definitionType   Process Defintion Name
	 * @param {object} scope            Price Plan Scope
	 * @param {object} structureObject  Normalized Price Plan Structure
	 * @param {object} additionalParams Additional parameter
	 * @param {object} userConnInfo     User Connection Info
	 */
	this.GetRolesFromBRMS_ExternalInterface = function (module, definitionType, scope, structureObject, additionalParams, userConnInfo)
	{
		println("######## GetRolesFromBRMS_ExternalInterface : Start");
		
		var matrixConditional = false;
		
		if(module.equals("ApproverMatrix"))
			matrixConditional = true;
		else if(module.equals("PublisherMatrix"))
			matrixConditional = true;
		
		println("CAlling from GetRolesFromBRMS_ExternalInterface");
		var brmsInputObject = this.InitializeBRMSInput(definitionType, scope, structureObject, matrixConditional, additionalParams, userConnInfo, isPermissionCheckOnly);
		//Get roles info from BRMS
		var brmsOutputObject = this.GetDelegatesFromBRMS(module, brmsInputObject, userConnInfo);

		//Get Roles and Messages from brmsOutputObject.
		var roles;
		if (brmsOutputObject.has("Delegates"))
		{
			roles = brmsOutputObject.get("Delegates");
			roles = new org.json.JSONArray(roles.toString());
		}
		else
			roles = new org.json.JSONArray();

		var messages;
		if (brmsOutputObject.has("Messages"))
		{
			messages = brmsOutputObject.get("Messages");
			messages = new org.json.JSONArray(messages.toString());
		}
		else
			messages = new org.json.JSONArray();

		var ruleOp = new org.json.JSONObject();
		ruleOp.put("Roles", roles);
		ruleOp.put("Messages", messages);
		return ruleOp;
	}
	
	this.checkArrayContainsAllElement = function(array1, array2)
	{
		for(var iCount = 0; iCount < array1.length(); iCount++)
		{
			if(!this.ContainsInList(array2, array1.get(iCount)))
			{
				return false;
			}
		}
		return true;
	}
	
	this.getUnitConditionalQuery = function(conditionOperator, unitOperator, conditionFieldNames, conditionType, conditionValues)
	{
		var condition = new JSONObject();
		condition.put("ConditionOperator", conditionOperator);
		condition.put("UnitOperator", unitOperator);
		var conditionArray = this.constructConditionArray(conditionFieldNames, conditionType, conditionValues);
		condition.put("Condition", conditionArray);
		return condition;
	}

	//Construct JSON Conditional Array
	this.constructConditionArray = function(conditionFieldNames, conditionType, conditionValues)
	{
		var finalConditionArray = new JSONArray();
		for (var i = 0; i < conditionFieldNames.length(); i++)
		{
			var condition = new JSONObject();
			condition.put("FieldName", conditionFieldNames.get(i));
			condition.put("ConditionType", conditionType.get(i));

			var Value = new JSONObject();
			Value.put("Type", "text");
			Value.put("Content", conditionValues.get(i));

			condition.put("Value", Value);
			finalConditionArray.put(condition);
		}
		return finalConditionArray;
	}


}

var WF_NS_PS_Generic = new WF_NS_PS_Generic();

