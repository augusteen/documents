/**
     * @fileOverview This files contain function related to Workflow Exection/Transition 
     * It updates the Price Plan with persistent variables information needed during the Transition.
     * @author anadar
     * @version 1.0.0
     */


/**
 * WF_Execution holds function for perform Workflow transition.
 * @module  WF_Execution
 * @requires WF_NS_PriceStructure
 */
importPackage(org.json);
importPackage(java.lang);
importPackage(java.io);
importPackage(java.util);

/**
 * This is the main function which sets up persistent parameter and performs the Workflow Transtion of the Price Plan from UI
 * @function
 * @name  WF_Execution
 * @memberof module:WF_Execution
 * @param {object} inputContext     Workflow input Context
 * @param {object} docServerManager Entity Doc ServerManager
 * @param {object} userConnInfo     User Connection Info
 * @param {object} bAutoPublish     Boolean auto publish
 */
function WF_Execution(inputContext, docServerManager, userConnInfo, bAutoPublish){
var wfConnectionObj = null;
println("inputContext >> " + JSON.stringify(inputContext));
//var inputContext = JSON.parse(inputContext);
var docIdArray = [inputContext["System Fields"]["Document Id"]];
var wfTransition = inputContext["WF_Transition"];
var comments = inputContext["Comments"];
var productName = inputContext["Product Name"];
var geographyName = inputContext["Geography Name"];
var regionName = inputContext["Region Name"];

var geographyCode = inputContext["Geography Code"];
var productCode = inputContext["Product Code"];
var timeCode = inputContext["Time Code"];
var webURL = inputContext["link"];

var brandCode = NormalizedHierachiesMap.get("PC_BRAND_MASTER").get("Price Category").get(productCode).get("Brand");
var regionCode = NormalizedHierachiesMap.get("GeographyMaster").get("Market").get(geographyCode).get("Region");

println("brandCode > " + brandCode + " / regionCode > " + regionCode);

var docIdArray = new JSONArray(docIdArray);
var ErrorFileWriterObj = new A_FileWriter("WF_ExecutionError.Log", true);
//var instanceCreationFileWriterObj = new A_FileWriter("InstanceCreation.Log", true);
//var formatTMT = new java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss");

//println("########### NS WF Execution Called ################");

for(var docIdItr = 0, docIdLength = docIdArray.length(); docIdItr<docIdLength; docIdItr++)
{
	var documentId = docIdArray.get(docIdItr);
	//var libraryName = "PriceStructure";

	var columnOption = new HashMap();
	var columnMap = new HashMap();

	if(documentId.equals("") || null == documentId)
	{	
		ErrorFileWriterObj.writeline("Null Doc Id found.");
	}
	else
	{
		var finalQuery = new JSONObject(); 
		var conditionFieldNames = new JSONArray(); 
		var conditionType = new JSONArray(); 
		var conditionValues = new JSONArray(); 
		var units = new JSONArray(); 

		conditionFieldNames.put("Document Id"); 
		conditionValues.put(documentId); 
		conditionType.put("IN");

		var conditionalUnit = getUnitConditionalQuery("AND", "OR", conditionFieldNames, conditionType, conditionValues);

		units.put(conditionalUnit); 
		finalQuery.put("Units", units); 
		finalQuery.put("UnitOperator", "OR"); 
		var jsonQuery = finalQuery.toString();
		var document = mergePricePlanAndDealContainerDocuments(jsonQuery, docServerManager, userConnInfo).get(0);
		var priceplanSystemFileds = document.get("PricePlan System Fields");
		var extraAttributes = new JSONObject();
		extraAttributes.put("Comments", comments);
		extraAttributes.put("Product Name", productName);
		extraAttributes.put("Geography Name", geographyName);
		extraAttributes.put("Region Name", regionName);
		extraAttributes.put("Geography Code", geographyCode);
		extraAttributes.put("Product Code", productCode);
		extraAttributes.put("Time Code", timeCode);
		extraAttributes.put("URL", webURL);
		extraAttributes.put("Region Code", regionCode);
		extraAttributes.put("Brand Code", brandCode);
		
		var result = performWorkFlowTransitions(documentId, document.get("scope"), priceplanSystemFileds, wfConnectionObj, docServerManager, userConnInfo, wfTransition, extraAttributes, bAutoPublish);


		return result;
	}
}

//instanceCreationFileWriterObj.close();
ErrorFileWriterObj.close();

//println("########### WF Execution Finished ################");
}

function convertHTMLcomment(comments){

	var strHTML ="";
	var strRecall="";


	if(comments.has('Creator')){

		if(comments.get('Creator').get(0).get('Comments').has('Submit')){
			var strSubmitComments=  comments.get('Creator').get(0).get('Comments').get('Submit');

			var arrSubmit = String(strSubmitComments).split(':');

			if (arrSubmit[1] !== undefined){
				strHTML = '<tr><td>' + arrSubmit[0]+ '</td><td>' + arrSubmit[1] +'</td></tr>';
				return strHTML;
			}

		}
		if(comments.get('Creator').get(0).get('Comments').has('Recall')){
			
			var arrRecall = String(comments.get('Creator').get(0).get('Comments').get('Recall')).split(':');


			if(arrRecall[1] !== undefined ){
				strRecall = '<tr><td>' + arrRecall[0] + '</td><td>' + arrRecall[1] +'</td></tr>';
				return strRecall;
			}
		}

	}
	
	if(comments.has('Approver')){

		for (var i = 0; i < comments.get('Approver').length(); i++) {
			var objApprover = comments.get('Approver').get(i);

			if (objApprover.has('Comments')){
				var arrAppComments = String(objApprover.get('Comments')).split(':');
				if(arrAppComments.length >= 1){
					strHTML = strHTML + '<tr><td>' + arrAppComments[0] + '</td><td>' + arrAppComments[1] +'</td></tr>';
					return strHTML;			
				}

			}
		}

	}
}

function getWhatComments(comments){

	if(comments.has('What')){
		return comments.get('What');
	}

}
function getCommentsforEmail(processDefinitionName,userConnInfo,processInstanceKey,persistantProps,plastComments){

	var workflowConn= VistaarJSUtils.getWorkflowConnection(userConnInfo);
	//l_wfConn.getHistoryData(l_processDefinition, l_processInstanceKey, l_fillTaskHistory, l_fillNodeHistory, l_persistentParamKeyArrList);

	var l_persistentParamKeyArrList = java.util.ArrayList();
	
	var iterator=  persistantProps.entrySet().iterator();
    while(iterator.hasNext())
    {
        var parameter = iterator.next();
        var key= parameter.getKey();
        var value=parameter.getValue();

        l_persistentParamKeyArrList.add(value);
    }

    var l_historyData =workflowConn.getHistoryData(processDefinitionName,processInstanceKey,true,false, l_persistentParamKeyArrList);

  	var l_taskHistoryInfo = l_historyData.getTaskHistoryInfo();

  	println('History >>' + l_taskHistoryInfo.toString());

  	var strHTML="<table><tr> <th> Actor </th> <th> Comments </th></tr> ";
  	for(var l_taskHistoryInfoIterator = 0; l_taskHistoryInfoIterator < l_taskHistoryInfo.size(); l_taskHistoryInfoIterator++){
  		
  		var l_task = l_taskHistoryInfo.get(l_taskHistoryInfoIterator);

  		if(l_task.getEvent() == "Completed"){
  			
  			var comments =l_task.getComments();

  			strHTML = strHTML + convertHTMLcomment(new JSONObject(comments[0]));

  		}
  		
  	}

  	strHTML = strHTML + convertHTMLcomment(new JSONObject(plastComments));

  	return strHTML + "</table>";
}


/**
 * Perform Workflow Transtion of Price Plan whose documet Id is passed <br>
 * The list of persistent parameter that are added to the Price Plan <br>
 * <ul>
 * 	<li>Comments</li>
 * 	<li>Product Name</li>
 * 	<li>Geography Name</li>
 * 	<li>Region Name</li>
 * 	<li>Geography Code</li>
 * 	<li>Product Code</li>
 * 	<li>URL</li>
 * 	<li>Region Code</li>
 * 	<li>Brand Code</li>
 * 	<li>HTML Comments</li>
 * 	<li>What</li>
 * </ul>
 * The current Workflow Status of plan is checked and based on the status the parameters are put and api
 * <pre> <code> 
 * // executeScript
 * docServerManager.executeScript("ExecuteWorkflowTask", paramName, paramValue, userConnInfo);
 * </code> </pre>
 * is called and the workflow transtion is performed.
 * @function
 * @name performWorkFlowTransitions
 * @memberof module:WF_Execution
 * @param  {string} documentId            Price Plan Document Id in string
 * @param  {object} scope                 Scope of the Price Plan
 * @param  {object} priceplanSystemFileds Price Plan System Fields
 * @param  {object} wfConnectionObj       Vistaar Workflow Connection Object
 * @param  {object} docServerManager      Docment Server Managers
 * @param  {object} userConnInfo          User Connection Info
 * @param  {string} wfTransition          Next workflow Transtion
 * @param  {object} extraAttributes       Persistent Parameter List 
 * @param  {boolean} bAutoPublish          Auto PUblish boolean
 */
function performWorkFlowTransitions(documentId, scope, priceplanSystemFileds, wfConnectionObj, docServerManager, userConnInfo, wfTransition, extraAttributes, bAutoPublish)
{
	var localProps = new HashMap();
	var persistantProps = new HashMap();
	var processDefinitionName = "PricePlan";
	var CurrentWFState = "";
	var processInstanceKey = documentId;
	
	var comments = extraAttributes.get("Comments");
	
	var productName = extraAttributes.get("Product Name");
	var geographyName = extraAttributes.get("Geography Name");
	var regionName = extraAttributes.get("Region Name");
	var geographyCode = extraAttributes.get("Geography Code");
	var productCode = extraAttributes.get("Product Code");
	var timeCode = extraAttributes.get("Time Code");
	var webURL = extraAttributes.get("URL");
	var year = scope.get("Time");
	var regionCode = extraAttributes.get("Region Code");
	var brandCode = extraAttributes.get("Brand Code");
	
	var scopeForPermissionEvaluation = new JSONObject();
	
	//CreatorMatrixMasters is a globally cached variable which holds the masters for CreatorMatrix.
	//println("CreatorMatrixMasters : "+CreatorMatrixMasters);
	var currentWFStatus = new JSONArray(priceplanSystemFileds.get("WorkFlowStatus"));
	currentWFStatus = currentWFStatus.get(0);
	var PSDefinitionName = g_activePSDefinition;
	//println("currentWFStatus >>> " + currentWFStatus);
	//println("PSDefinitionName >>> " + PSDefinitionName);
	//println("scope >>> " + scope);
	var dimensionMasterArrayScope = getMastersScope(PSDefinitionName, scope, CreatorMatrixMasters);
	//println("dimensionMasterArrayScope >> " + dimensionMasterArrayScope);
	scopeForPermissionEvaluation.put("Scope", dimensionMasterArrayScope);
	
	persistantProps.put("Scope", scopeForPermissionEvaluation.toString());
	persistantProps.put("libraryName", "PricePlan" );
	persistantProps.put("documentId", documentId );
	persistantProps.put("geography", "geography" );
	persistantProps.put("geography_Attrib", "geography_Attrib" );
	persistantProps.put("product", "product" );
	persistantProps.put("product_Attrib", "product_Attrib" );

	var htmlcomments= getCommentsforEmail(processDefinitionName,userConnInfo,processInstanceKey,persistantProps,comments);
	var what = getWhatComments(new JSONObject(comments));

	var geographyCode = scope.get("Geography");
	var time = scope.get("Time");
	var productCode = scope.get("Product");
	var inputJSON = new JSONObject();
	inputJSON.put("scope", new JSONObject());
	inputJSON.get("scope").put("Geography Code", geographyCode);
	inputJSON.get("scope").put("Product Code", productCode);
	inputJSON.get("scope").put("Time", time);
	
	var l_loadAddOnPSProcessingDataObj = new LoadAddOnPSProcessingData();
	//l_loadAddOnPSProcessingDataObj.init(inputJSON, docServerManager, userConnInfo);
	//var onYearLevelAttribute = l_loadAddOnPSProcessingDataObj.getGlobalAttributes();
	
	l_loadAddOnPSProcessingDataObj.initPostingAndFuturePlanning(inputJSON, docServerManager, userConnInfo);
	var onYearLevelAttribute = l_loadAddOnPSProcessingDataObj.getGAPostingAndFuturePlanning();
	
	
	var onYearLevelAttributeJSON = new JSONObject(onYearLevelAttribute);
	var IsNonPostingMarket = onYearLevelAttributeJSON.get("ON").get("IsNonPostingMarket");
	if(bAutoPublish != undefined && bAutoPublish)
		var IsFuturePlanning = 1;
	else
		var IsFuturePlanning = onYearLevelAttributeJSON.get("ON").get("IsFuturePlanning");
	
	if(wfConnectionObj == null)
	{
		wfConnectionObj = com.vistaar.workflow.core.WorkflowManagerImpl.getInstance();
	}
	
	try{
		var jsonInput = new JSONObject();
		var jsonInputString = new JSONArray();
		var entityName = "PricePlan";
		var paramName = java.lang.reflect.Array.newInstance(java.lang.String, 1);
		var paramValue = java.lang.reflect.Array.newInstance(java.lang.String, 1);
		println("currentWFStatus >> " + currentWFStatus);
		//currentWFStatus="";
		//WIP(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo);
		if(currentWFStatus == ""){
			println("## First WF Call");
			WIP(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo);
			//println("## First WF End");
		}
		else if(currentWFStatus == "WIP"){
			println("## WIP Called");
			//WIP(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo);
			//println("## WIP End");
			
			//println("## Submit Start");
			jsonInput.put("System Fields", priceplanSystemFileds);
			jsonInput.put("Action", "Submit");
			jsonInput.put("Comments", comments);

			jsonInput.put("What", what);
			jsonInput.put("HTMLComments", htmlcomments);

			jsonInput.put("Entity Name", entityName);
			jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
			jsonInput.put("IsFuturePlanning", IsFuturePlanning);
			jsonInput.put("Product Name", productName);
			jsonInput.put("Geography Name", geographyName);
			jsonInput.put("Region Name", regionName);
			jsonInput.put("Year", year);
			
			jsonInput.put("Geography Code", geographyCode);
			jsonInput.put("Product Code", productCode);
			jsonInput.put("Time Code", timeCode);
			jsonInput.put("URL", webURL);
			jsonInput.put("Region Code", regionCode);
			jsonInput.put("Brand Code", brandCode);
			
			jsonInputString.put(jsonInput);
			paramName[0] = "jsonInputString";
			paramValue[0] = jsonInputString.toString();
			
			//println("ExecuteWorkflowTask Called...");
			var executeWorkflowTask = docServerManager.executeScript("ExecuteWorkflowTask", paramName, paramValue, userConnInfo);
			executeWorkflowTask = new JSONObject(executeWorkflowTask);
			executeWorkflowTask.put("Comments" , comments);
			return executeWorkflowTask;
			//println("executeWorkflowTask >> " + executeWorkflowTask);
			
			//instanceCreationFileWriterObj.writeline("Workflow Instance Created for "+processInstanceKey+" with state WIP");
			println("## Submit End");
		}
		else if(currentWFStatus == "Pending Approval"){
			println("## PA Called");
			
			if(wfTransition == "Approve"){
				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Approve");
				jsonInput.put("Comments", comments);

				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);

				jsonInput.put("Entity Name", entityName);
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}else if(wfTransition == "Reject"){


				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Reject");

				jsonInput.put("Comments", comments);
				//Reject mail notification changes 
				
				var RejectRecallMsg1 = "<span style='color:red'> <b> Action </b> </span>: <b> Price Plan rejected at Level";
				var RejectRecallMsg2 = "Please review </b>";
				
				jsonInput.put("RejectRecallSubject","ACTION");
				jsonInput.put("RejectRecallMsg1",RejectRecallMsg1);
				jsonInput.put("RejectRecallMsg2",RejectRecallMsg2);
				jsonInput.put("RejectRecallRole",userConnInfo.getRoleName());

				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);
				
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				
				jsonInput.put("Entity Name", entityName);
				jsonInput.put("wfTransition", wfTransition);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}else if(wfTransition == "Recall"){
				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Reject");
				jsonInput.put("Comments", comments);
				
				var RejectRecallMsg1 = "Notification: Price Plan has been recalled at Level";
				var RejectRecallMsg2 = "";
				
				jsonInput.put("RejectRecallSubject","NOTIFICATION");
				jsonInput.put("RejectRecallMsg1",RejectRecallMsg1);
				jsonInput.put("RejectRecallMsg2",RejectRecallMsg2);
				jsonInput.put("RejectRecallRole",userConnInfo.getRoleName());


				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);
				
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				
				jsonInput.put("Entity Name", entityName);
				jsonInput.put("wfTransition", wfTransition);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}
			var executeWorkflowTask = docServerManager.executeScript("ExecuteWorkflowTask", paramName, paramValue, userConnInfo);
			executeWorkflowTask = new JSONObject(executeWorkflowTask);
			executeWorkflowTask.put("Comments" , comments);
			return executeWorkflowTask;
			//instanceCreationFileWriterObj.writeline("Workflow Instance Created for : "+processInstanceKey+" with state Pending Approval");
			println("## PA End");
		}
		else if(currentWFStatus == "Approved"){
			println("## AP Called");	
			if(wfTransition == "Approve"){
				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Publish");
				jsonInput.put("Comments", comments);
				
				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);

				jsonInput.put("Entity Name", entityName);
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}else if(wfTransition == "Reject"){

				
				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Reject");
				jsonInput.put("Comments", comments);

				var RejectRecallMsg1 = "<span style='color:red'> <b> Action </b> </span>: <b> Price Plan rejected at Level";
				var RejectRecallMsg2 = "Please review </b>";
				
				jsonInput.put("RejectRecallSubject","ACTION");
				jsonInput.put("RejectRecallMsg1",RejectRecallMsg1);
				jsonInput.put("RejectRecallMsg2",RejectRecallMsg2);
				jsonInput.put("RejectRecallRole",userConnInfo.getRoleName());

				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);
				
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				
				jsonInput.put("Entity Name", entityName);
				jsonInput.put("wfTransition", wfTransition);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}else if(wfTransition == "Recall"){
				jsonInput.put("System Fields", priceplanSystemFileds);
				jsonInput.put("Action", "Reject");
				jsonInput.put("Comments", comments);

				var RejectRecallMsg1 = "Notification: Price Plan has been recalled at Level";
				var RejectRecallMsg2 = "";
				
				jsonInput.put("RejectRecallSubject","NOTIFICATION");
				jsonInput.put("RejectRecallMsg1",RejectRecallMsg1);
				jsonInput.put("RejectRecallMsg2",RejectRecallMsg2);
				jsonInput.put("RejectRecallRole",userConnInfo.getRoleName());
				
				jsonInput.put("What", what);
				jsonInput.put("HTMLComments", htmlcomments);
				
				jsonInput.put("IsNonPostingMarket", IsNonPostingMarket);
				jsonInput.put("IsFuturePlanning", IsFuturePlanning);
				
				
				jsonInput.put("Entity Name", entityName);
				jsonInput.put("wfTransition", wfTransition);
				jsonInput.put("Product Name", productName);
				jsonInput.put("Geography Name", geographyName);
				jsonInput.put("Region Name", regionName);
				jsonInput.put("Year", year);
				jsonInput.put("Geography Code", geographyCode);
				jsonInput.put("Product Code", productCode);
				jsonInput.put("Time Code", timeCode);
				jsonInput.put("URL", webURL);
				jsonInput.put("Region Code", regionCode);
				jsonInput.put("Brand Code", brandCode);
				jsonInputString.put(jsonInput);
				paramName[0] = "jsonInputString";
				paramValue[0] = jsonInputString.toString();
			}
			println('JSONInput  >>' + jsonInputString.toString() );
			var executeWorkflowTask = docServerManager.executeScript("ExecuteWorkflowTask", paramName, paramValue, userConnInfo);
			executeWorkflowTask = new JSONObject(executeWorkflowTask);
			executeWorkflowTask.put("Comments" , comments);
			return executeWorkflowTask;
			//instanceCreationFileWriterObj.writeline("Workflow Instance Created for : "+processInstanceKey+" with state Approved");
			println("## AP End");
		}
		else if(currentWFStatus == "Published"){
			//println("## Publish Called");	
			WIP(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo);
			println("## Publish End");
		}
	}
	catch(e)
	{
		println("ERROR in performWorkflowTransition" + e);
		//var TMTDateStr = formatTMT.format(new Date());
		//ErrorFileWriterObj.writeline(TMTDateStr + " Workflow instance creation failed for "+processInstanceKey+" with Exception \n"+e);
		//instanceCreationFileWriterObj.writeline("Workflow instance creation failed for "+processInstanceKey+" with Exception \n"+e);
	}
}


function WIP(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo)
{
	//Save PS
	println("Inside WIP");
	//var instanceId = wfConnectionObj.createNewProcessInstance(processDefinitionName, processInstanceKey, localProps, persistantProps, userConnInfo.userName, userConnInfo);
	var instanceId = wfConnectionObj.createNewProcessInstance(processDefinitionName, processInstanceKey, localProps, persistantProps, null, userConnInfo);
	
	
	//println("Instance Created");
	
	var activeNodesInfo = wfConnectionObj.getActiveNodes(processDefinitionName, processInstanceKey);
	
	//println("getActiveNodes");
	
	var actNodeInfo = activeNodesInfo[0];
	var outGoingTransition = actNodeInfo.getOutgoingTransitions()[0];
	var activeNodeId = actNodeInfo.getNodeId();
	
	var exeTranResult = wfConnectionObj.executeTransition(instanceId, activeNodeId, outGoingTransition, localProps, persistantProps, userConnInfo);
	
	//println("executeTransition");
}

function Recall(wfConnectionObj, processDefinitionName, processInstanceKey, localProps, userConnInfo)
{
	
	println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@executeTransition for Recall");
	var activeNodesInfo = wfConnectionObj.getActiveNodes(processDefinitionName, processInstanceKey);
	
	var actNodeInfo = activeNodesInfo[0];
	var outGoingTransition = actNodeInfo.getOutgoingTransitions()[0];
	var activeNodeId = actNodeInfo.getNodeId();
	instanceId = actNodeInfo.getInstanceId();
	
	var persistantProps = wfConnectionObj.getContextVariables(instanceId);
	println("outGoingTransition > " + outGoingTransition);
	println("persistantProps > "+persistantProps);
	
	persistantProps.put("isRejectFlg", false);
	
	var exeTranResult = wfConnectionObj.executeTransition(instanceId, activeNodeId, outGoingTransition, localProps, persistantProps, userConnInfo);
	persistantProps = wfConnectionObj.getContextVariables(instanceId);
	currentState = persistantProps.get("CurrentState");
	println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@executeTransition for Submit Completed");
	return "";
}


function getMastersScope(PSDefinitionName, scope, configuredMasterArray) {
  println("scope :"+scope);
  var ScopeObj = new JSONObject();
  var extPrimaryKeyObj = new JSONObject();
  var configuredMasterArrayLen = configuredMasterArray.length();
  for(var masterItr = 0; masterItr < configuredMasterArrayLen; masterItr++) {
    var curMasterName = configuredMasterArray.get(masterItr);
	if(curMasterName.equals("ProductMaster")) {
		//curMasterName = "PricingGroupMaster";
		curMasterName = "PC_BRAND_MASTER";
	}
    var priKeyArr = new JSONArray();
    var priKeyObj = new JSONObject();
	println("curMasterName > " + curMasterName);
    var curPrimaryKey = getPrimaryKeyNameFromMaster(PSDefinitionName, curMasterName);
	println("curPrimaryKey > " + curPrimaryKey);
    priKeyObj.put("Code", scope.get(curPrimaryKey));
    priKeyObj.put("Level", scope.get(curPrimaryKey + " Level"));
    priKeyArr.put(priKeyObj);
    extPrimaryKeyObj.put(curMasterName, priKeyArr);
  }
  //ScopeObj.put("Scope", extPrimaryKeyObj);
	//println("############################extPrimaryKeyObj : "+extPrimaryKeyObj);
  return extPrimaryKeyObj;
}

function getPrimaryKeyNameFromMaster(PSDefinitionName, MasterName)
{

  var primaryKeyInfo = g_GetPrimaryKeys(PSDefinitionName).get("Keys");
  //println("primaryKeyInfo > " + primaryKeyInfo);
  if(primaryKeyInfo != null && JSONObject.NULL != primaryKeyInfo) 
  {
    var primaryKeyInfoLength = primaryKeyInfo.length();
    for(var i=0;i < primaryKeyInfoLength; i++) 
    {
      var primaryInfo = primaryKeyInfo.get(i);
      var primaryKeyCode = primaryInfo.get("Master");
      
      if(primaryKeyCode.equals(MasterName)) 
      {
        return primaryInfo.get("Name");
      }
    }
  }
}

