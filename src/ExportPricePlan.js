/********************************************************************************
This work contains or references Vistaar generic components or Vistaar API, and
is developed in accordance with Vistaar best practices and solution development
guidelines. This work is designed and intended to be used only with licensed
Vistaar software.
 ********************************************************************************/
 /**
     * @fileOverview This files contain module Export Price Plan to export Price Plan in pdf and Excel Format.
     * 	It fetches Price Plan using scope data from the UI and then builds report using Jasper report and returns to the UI
     * @author anadar
     * @version 1.0.0
     */


importPackage (java.lang)
importPackage (java.io)
importPackage (java.util)


//global Export Price Plan Object
var g_ExportPricePlan;

//Object factory for Export Price Plan 
function getExportPricePlan() {
	if (g_ExportPricePlan == undefined) {
		g_ExportPricePlan = new ExportPricePlan();
	}
	return g_ExportPricePlan;
}


//Export Price Plan Module
/** @class */
function ExportPricePlan(){

	//function module attributes/properties

/**@type object*/	var m_scopeData;  //hold price plan scope
/**@type object*/	var m_exportConfig; //hold export Config from UI
/**@type object*/	var m_pricePlan;  //hold fetched price plan
/**@type object*/	var m_docServerManager; 
/**@type object*/	var m_userConnInfo;
/**@type object*/	var m_exportData;
	
	var m_Row = '{"Grid Type": "", "Deleted Deal": "", "4MTHS": "", "Shelf": "", "NetFOB": "", "Deleted Time": "", "NetList": "", "Sep": "", "Feb": "", "YTD": "", "Mar": "", "rowtype": "", "EditableFrom": "", "Oct": "", "Qualifier": "", "FYvsPY": "", "Nov": "", "expanded": "", "leaf": "", "MetricsType": "", "Aug": "", "SKU Excluded": "","Customer Included" : "","FY": "", "Apr": "", "Jan": "", "May": "", "Dec": "", "Jul": "", "DealID": "", "DealName": "", "Jun": "", "Metrics": "", "PY": "", "Distributor Excluded": ""}';


	/**
	 * InitModule 
	 * @param {object} p_inputContext The input Context to init the Export Price Plan this contains 'Scope Data', 'Export Config', 'Export Type', 'DocServer' and 'UserInfo'
	 */
	//Initialize module attributes/properties
	this.initModule = function(p_inputContext){

		println('Export Price Plan: initModule' + p_inputContext);

		this.m_scopeData = p_inputContext.get('scopeData');
		this.m_exportConfig = p_inputContext.get('exportConfig');
		this.m_exportType = p_inputContext.get('exportType');
		this.m_docServerManager = p_inputContext.get('DocServer');
		this.m_userConnInfo = p_inputContext.get('UserInfo');
		this.m_exportData = new org.json.JSONArray();

	};

	//Entity script call this function with the input context
	/**
	 * It returns the final report to the Front End
	 * @param  {object} p_inputContext Input Context
	 * @return {object}                Report either excel/pdf
	 */	
	this.getReport = function(p_inputContext){

		return this.BuildReportDataFromUI(p_inputContext);
		
		/*this.initModule(p_inputContext);

		this.fetchPricePlan();

		this.BuildObjectForReport();

		return this.BuildReport(this.m_exportData);*/
	}

	//Fetch Price Plan 
	/**
	 * To fetch Price Plan data using the scope
	 */
	this.fetchPricePlan = function(){

		println('Export Price Plan' + this.m_scopeData);
		

		/* 
			Form Script Input to call VPEntry Point
			*/
		var l_ScriptInput = new org.json.JSONObject();
		
		var l_VPInput = new org.json.JSONObject();

		l_ScriptInput.put('ModuleName','VolumePlanner');
		l_ScriptInput.put('Operation','openWithScope');

		l_VPInput.put('ScopeData',this.m_scopeData);

		l_ScriptInput.put('Input',l_VPInput);
		
		var inputJSON = l_ScriptInput.toString();

		println('Export Price Plan: In fetch Price Plan' +  inputJSON);

		try{
			//Call VPEntry Point script 

			var l_scriptOutput = vistaar.BevAlModule.VPModule_Entry.executeOperation(inputJSON, this.m_docServerManager, this.m_userConnInfo);


			println('Export Price Plan ' + l_scriptOutput)
			var jsOutput = l_scriptOutput;
			
			println('\n\nJS Output' + jsOutput.toString());			

			if(jsOutput.get("solStatus")=='success'){
				this.m_pricePlan = jsOutput.get("solResponse");
				println('Print output' + jsOutput.toString());
			}

			println('\n\nExport Price Plan: Fetched Price Plan' + this.m_pricePlan);

		}catch(e){
			println('Export Price Plan failed to fetch price plan'+e);
		}
	
	};

	/**
	 * Thde data that has been fetch with fetchPrice Plan is formatted in this function
	 * 
	 */
	this.BuildObjectForReport = function(){

		var l_Summary;
		var l_OFF;
		var l_ON;

		l_Summary = this.m_pricePlan.get("Price Plan").get("Summary");


		println('\n\nExport Price Plan: Summary ' + l_Summary.toString() );

		for (var itr = 0; itr < l_Summary.length(); itr++) {

		    var currentRecord = l_Summary.get(itr);
			
			println('\nExport Price Plan this.Row:' + m_Row);

		    var l_Row = new org.json.JSONObject(m_Row);
		    
		    l_Row.put("Grid Type","Summary");

		    for (var colkeys = l_Row.keys(); colkeys.hasNext(); ) {

	    		var ColumnKey = colkeys.next();

	    		if(currentRecord.has(ColumnKey)){
    				var ColumnValue = currentRecord.get(ColumnKey);
    				l_Row.put(ColumnKey,ColumnValue);
    			}
	    	}

		    println('Export Price Plan: current Record after put ' + currentRecord.toString() );
		    
		    this.m_exportData.put(l_Row);
		}			

		l_OFF = this.m_pricePlan.get("OFF").get("Current").get("children");

		if(l_OFF != undefined){
			for (var itr = 0; itr < l_OFF.length(); itr++) {

			    var currentRecord = l_OFF.get(itr);

			    var l_Row = new org.json.JSONObject(m_Row);
			    
			    l_Row.put("Grid Type","OFF");

			    for (var colkeys = l_Row.keys(); colkeys.hasNext(); ) {

		    		var ColumnKey = colkeys.next();

		    		if(currentRecord.has(ColumnKey)){
	    				var ColumnValue = currentRecord.get(ColumnKey);
	    				l_Row.put(ColumnKey,ColumnValue);
	    			}
		    	}

			    // currentRecord.put("Grid Type","OFF");
			    // if(currentRecord.has("children")){
			    // 	currentRecord.remove("children");
			    // }

			    this.m_exportData.put(l_Row);
			}
		}	

		l_ON = this.m_pricePlan.get("ON").get("Current").get("children");

		if(l_OFF != undefined){
			for (var itr = 0; itr < l_ON.length(); itr++) {

			    var currentRecord = l_ON.get(itr);

			    var l_Row = new org.json.JSONObject(m_Row);
			    
			    l_Row.put("Grid Type","ON");

			    for (var colkeys = l_Row.keys(); colkeys.hasNext(); ) {

		    		var ColumnKey = colkeys.next();

		    		if(currentRecord.has(ColumnKey)){
	    				var ColumnValue = currentRecord.get(ColumnKey);
	    				l_Row.put(ColumnKey,ColumnValue);
	    			}
		    	}
			    // currentRecord.put("Grid Type","ON");
			    // if(currentRecord.has("children")){
			    // 	currentRecord.remove("children");
			    // }
			    this.m_exportData.put(l_Row);
			}	
		}
	}

	/**
	 * The data from front is converted to Report in this function
	 * @param {Object} p_inputContext Input Constext from the front end 
	 */
	this.BuildReportDataFromUI = function(p_inputContext){

		var l_reportParameter = p_inputContext.get('reportParameter');
		var l_exportType = p_inputContext.get('exportType');
		var l_exportData = p_inputContext.get('exportData');

		try	{
			println("In BuildReport Data from UI Now");

     		var ESPath = SolutionProperties.getPropertyValue("EntityServiceRunningAt");

			var exportType  = l_exportType;
			//var compiledReportNamePath = new java.lang.String('/home/gallo_dev2/Vistaar3_11_5/WorkflowEntity/WorkflowEntityService/WebDeploy/WebUI/Gallo/Report/PricePlan.jasper');
			
			var compiledReportNamePath = new java.lang.String(ESPath +'/WebDeploy/WebUI/Gallo/Report/PricePlan.jasper');
			var reportJsonData =new java.lang.String(this.getCSVData(l_exportData));
			var exportFileNameAndPath = new java.lang.String(' ');
			var reportParameters = new java.util.HashMap();
			
		  	for (var keys = l_reportParameter.keys(); keys.hasNext(); ) {
    			var ColumnKey = keys.next();
    			var ColumnValue = l_reportParameter.get(ColumnKey);
    			reportParameters.put(ColumnKey,ColumnValue);		
    		}

			//reportParameters.put("Image-Path", "/home/gallo_dev2/Vistaar3_11_5/WorkflowEntity/WorkflowEntityService/WebDeploy/WebUI/Gallo/BR1/resources/images");
			
			
			reportParameters.put("Image-Path", ESPath +"/WebDeploy/WebUI/Gallo/BR1/resources/images");
			//reportParameters.put("Footer", ""); 
			//reportParameters.put("Footer_copyright", "" );
			
			println("Actual Time taken by Jasper Report execution Started @ ");
			var jasperReportUtilObj = new com.vistaar.JasperReportUtility.reports.JasperReportUtility();
			
			println("Object is :"+ jasperReportUtilObj.toString());
			
			var returnByteArrayPDF = jasperReportUtilObj.exportBinaryArrayOneReport(exportType,"",compiledReportNamePath,reportJsonData,reportParameters);
			
			println("Actual Time taken by Jasper Report execution ended @ ");

			println("Return Object Length : " + returnByteArrayPDF.length);
			
		return returnByteArrayPDF;
		}
		catch(err){
			println("Error in ExportReport " + err);
		}

	};


	//Build Price Plan Report with Jasper
	/**
	 * It builds report by fetching CSV data and the jasper files 
	 * @param {object} pValue Json object of the report data
	 * @example
	 * var returnByteArrayPDF = jasperReportUtilObj.exportBinaryArrayOneReport(exportType,compiledReportNamePath,reportJsonData,reportParameters);
	 */
	this.BuildReport = function(pValue){
		
		try	{
			println("In BuildReport Now");
			//println("pValue : " + pValue.toString())
			//var paramVal = pValue.get("Param").get(0);
			//println("paramVal : " + paramVal.toString())
			var exportType  = "pdf" // paramVal.get("exportType");
			var compiledReportNamePath = new java.lang.String('/home/gallo_dev2/Vistaar3_11_5/WorkflowEntity/WorkflowEntityService/WebDeploy/WebUI/Gallo/Report/PricePlan.jasper');
			var reportJsonData =new java.lang.String(this.getCSVData(pValue));
			var exportFileNameAndPath = new java.lang.String(' ');
			var reportParameters = new java.util.HashMap();
			
			reportParameters.put("Scope", "Test Scope"); 
			reportParameters.put("Image-Path", "/home/gallo_dev2/Vistaar3_11_5/WorkflowEntity/WorkflowEntityService/WebDeploy/WebUI/Gallo/BR1/resources/images");
			//reportParameters.put("Footer", ""); 
			//reportParameters.put("Footer_copyright", "" );
			
			println("Actual Time taken by Jasper Report execution Started @ ");
			var jasperReportUtilObj = new com.vistaar.JasperReportUtility.reports.JasperReportUtility();
			
			println("Object is :"+ jasperReportUtilObj.toString());
			
			var returnByteArrayPDF = jasperReportUtilObj.exportBinaryArrayOneReport(exportType,compiledReportNamePath,reportJsonData,reportParameters);
			
			println("Actual Time taken by Jasper Report execution ended @ ");

			println("Return Object Length : " + returnByteArrayPDF.length);
			
		return returnByteArrayPDF;
		}
		catch(err){
			println("Error in ExportReport " + err);
		}
	}
	/**
	 * Converts Json to CSV
	 * @param  {object} dataNode JSON object to convert
	 * @return {string}          Converted CSV data
	 */
	this.getCSVData = function(dataNode){
	    // var functionName = "ExportManager.getCSVData";
	    // var logger = new SimpleLogger(functionName, BaseTPMConstants.LOG_LEVEL_TEMP_DEBUG);             
	    try{
	      // logger.tempDebug("START");    

	      var csvDataStr = "";
	      
	      for(var dataCount = 0; dataCount < dataNode.length(); dataCount++){
	        var dataNodeObj = dataNode.get(dataCount);
	        if(dataCount == 0){
	          var firstRecordValue = "";

		        for (var keys = dataNodeObj.keys(); keys.hasNext(); ) {
	    			var ColumnKey = keys.next();
	    			csvDataStr = csvDataStr + '"' + ColumnKey + '"' + ",";

	    			var ColumnValue = dataNodeObj.get(ColumnKey);
	    			firstRecordValue = firstRecordValue + '"' + ColumnValue + '"' + ",";
	    		}

	          // for(var property in dataNodeObj){
	          //   if(dataNodeObj.has(property)){
	          //     csvDataStr = csvDataStr + '"' + property + '"' + ",";
	          //     firstRecordValue = firstRecordValue + '"' + dataNodeObj[property] + '"' + ",";
	          //   }
	          // }

	          var replaceCharPos = csvDataStr.lastIndexOf(",");
	          csvDataStr = csvDataStr.substring(0, replaceCharPos);
	          csvDataStr = csvDataStr + "\r\n";                                                                             
	          var replaceCharValusPos = firstRecordValue.lastIndexOf(",");
	          firstRecordValue = firstRecordValue.substring(0, replaceCharValusPos);
	          firstRecordValue = firstRecordValue + "\r\n";
	          //logger.tempDebug("\n" + functionName + " - csvDataStr after 1st record columns\n" + String(csvDataStr));
	          //logger.tempDebug("\n" + functionName + " - firstRecordValue\n" + String(firstRecordValue));
	          csvDataStr = csvDataStr + firstRecordValue;
	          //logger.tempDebug("\n" + functionName + " - csvDataStr after 1st record values\n" + csvDataStr);
	        }else{  

 				for (var keys = dataNodeObj.keys(); keys.hasNext(); ) {
	    			var ColumnKey = keys.next();
	    			var ColumnValue = dataNodeObj.get(ColumnKey);
	    			csvDataStr = csvDataStr + '"' + ColumnValue + '"' + ",";
	    		}	                                                                      
	          // for(var property in dataNodeObj){
	          //   if(dataNodeObj.hasOwnProperty(property)){
	          //     csvDataStr = csvDataStr + '"' + dataNodeObj[property] + '"' + ",";
	          //   }
	          // }
	          var replaceCharValusPos = csvDataStr.lastIndexOf(","); 
	          csvDataStr = csvDataStr.substring(0, replaceCharValusPos);
	          csvDataStr = csvDataStr + "\r\n";
	          //logger.tempDebug("\n" + functionName + " - csvDataStr after other records \n" + csvDataStr);
	        }
	      }
	      var replaceCharValusPos = csvDataStr.lastIndexOf("\r\n");
	      csvDataStr = csvDataStr.substring(0, replaceCharValusPos);
	      //csvDataStr = csvDataStr + "\\r\\n";                                     
	      //logger.tempDebug("\n" + functionName + " - final csvDataStr\n" + csvDataStr);
	      return csvDataStr;
	    }catch(e){
	      // logger.error("Failed to evaluate ExportManager.getCSVData.");
	      println("Error in CSV Conversion "+ e)
	      // ERROR.throwErr(functionName,e,"Failed to evaluate ExportManager.getCSVData.");
	    }finally{
	      // logger.tempDebug('END');
	      // logger.close();
	    }
  };

}