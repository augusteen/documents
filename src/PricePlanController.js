/*
Price Plan UI class

This class will hold model controller implementation.
 */
function PricePlanControllerManager() {

	//REMOVING MULTIPLE PRICE PLANS STORAGE FUNCTIONALITY(28-May).......................
	var m_PricePlan = [];
	var m_MESSAGES;
	var m_ActivePricePlanID = null;
	var m_PricePlanUIManager;
	var m_IS_AUDIT_REQUIRED = false;
	var m_arrMonths = getGlobalConstantsObj().m_ARR_MONTH_KEY;
	var m_Config;
	var m_columnFactCode = "FactCode";
	var m_factCodeBILLFOB = "Bill_FOB";
	var m_CMB_WORKFLOW = "cmbWorkflow";
	this.readOnlyPricePlan;
	var m_Published_Key = "Published";
	//User Role based Permission Info........
	var m_ObjUserPermissionInfo;
	// best practice gudance data - 5oct15
	this.m_bestPracticeGuidance;
	var m_objWorkFlowConfig;
	this.m_historicalPP_ReportData;
	var m_showFreezecolumn = false;
	/** Tab switching functionallity need workflow combo data.... **/
	var m_ObjWorkflowComboData;

	//Render Price Plan UI.................................................
	this.renderPricePlanUI = function (p_ScopeObj) {
		try {
			VistaarAuditingManager.audit({
				"name" : "Open PP Started"
			}, m_IS_AUDIT_REQUIRED, 250);
			m_MESSAGES = getObjectFactory().getGlobalConstants().PRICE_PLANS_MESSAGES;
			//Call Price Plan UI with Scope Object and callback Function..........................
			/*VistaarAuditingManager.audit({
			"name" : "Start:UI Processing RenderPricePlan"
			}, m_IS_AUDIT_REQUIRED, 520);*/
			this.getPricePlanUIManager().initialize(p_ScopeObj, getPricePlanControllerManagerObj().refreshPricePlanScreen, getPricePlanControllerManagerObj().clearPricePlanDataRecords, getPricePlanControllerManagerObj().DealOperations);
			//Check for Read Only Price Plan...................
			this.readOnlyPricePlan = VistaarExtjs.getCmp("btnSavePricePlan").isDisabled();
			//Add KeyPress Event...............
			document.onkeydown = this.onKeyPressEvent;
			/*VistaarAuditingManager.audit({
			"name" : "End:UI Processing RenderPricePlan"
			}, m_IS_AUDIT_REQUIRED, 520);*/

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ImpactAnalysisOpenClick = function (p_field) {
		try {
			getObjectFactory().getImpactAnalysisManager().btnImpactAnalyisis_Click();
			return false;

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	//Future Price Plan
	this.isFuturePricePlan = function () {
		return getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).isClonePricePlan();
	}
	//Default comments for future planning
	this.getFuturePricePlanComments = function () {
		return {
			"Channels" : "All Channels",
			"What" : "Programming",
			"Where" : "Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec",
			"Creator" : [{
					"Name" : VistaarFunctionLib.getUserName(),
					"Role" : VistaarFunctionLib.getRoleName(),
					"Comments" : {
						"Submit" : VistaarFunctionLib.getUserName().split("@")[0].replace(".", " ") + " : Future Planning",
						"Recall" : ""
					}
				}
			],
			"Approver" : [],
			"FormatVersion" : "2.0"
		};
	}
	//Check for Price Plan Dirty..............
	this.isPricePlanDirty = function () {
		/*if (!this.readOnlyPricePlan) {
		for (var PricePlanIndex in m_PricePlan) {
		if (m_PricePlan[PricePlanIndex].isPricePlanDataChanged()) {
		return true;
		}
		}getPricePlanControllerManagerObj().isPricePlanDirty()
		}*/
		if (!this.readOnlyPricePlan && m_ActivePricePlanID != undefined) {
			//Additional functionality for PG related .........
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			getPricePlanControllerManagerObj().getSavePP_ScriptInput(l_objPricePlan);
			if (l_objPricePlan.isPricePlanDataChanged()) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	//DEACTIVATE PRICE PLAN UI.................
	this.deactivatePricePlanScreen = function () {
		try {
			//Disable Application Tab....................
			getApplicationTabMgrObj().disableApplicationTab();
			//Destroy Price Plan PopUps
			getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups(true);
			//Hide Price Plan Tab Tools Window on IPAD view.....
			if (getCommonFuncMgr().isNonDeskTopView()) {
				getPricePlanControllerManagerObj().getPricePlanUIManager().hidePricePlanTabTools();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Return Price Plan System Fields......
	this.getPPSystemFields = function () {
		try {
			if (m_ActivePricePlanID != undefined) {
				var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				if (!l_objPricePlan.isFrontLinePP()) {
					return l_objPricePlan.getPricePlanSystemFields();
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Return current Date
	this.getCurrentDateDetails = function () {
		try {
			if (m_ActivePricePlanID != undefined) {
				var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				return l_objPricePlan.getCurrenTimeDetails();

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	//Return Price Plan System Fields and Scope..............
	this.getSystemFieldsObj = function () {
		try {
			if (m_ActivePricePlanID != undefined) {
				var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				return l_objPricePlan.getPricePlanSystemFieldAndScope();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	//RETRUN RIPS APPLICABILITY
	this.getRIPSApplicability = function () {
		if (m_ActivePricePlanID != null && m_ActivePricePlanID != undefined) {
			var l_Obj_ActivePricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (l_Obj_ActivePricePlan) {
				return Ext.clone(l_Obj_ActivePricePlan.getPricePlan().Security.RIP.APPLICABILITY);
			}
		}
	}

	/** Performance Enhancement
	API @call Open PP combine Script only once*/
	this.callSyncOpenPPScript = function (pScopeObj, callbackAPI, isScopeLoadReq) {
		var ScriptInputObj = {};
		var l_SyncObj = false;
		//Fetch Meta-Data Script Input(Scope)
		ScriptInputObj["Scope"]={
		"paramName" : "input",
			"paramValue" : getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getFetchMetadataSyncScriptInput(pScopeObj, isScopeLoadReq),
		"scriptName" : "FetchMetaData"
		};
		//WorkFlow Combo Script input (Empty object req)
		ScriptInputObj["WF_History"] = {};
		//Price plan Script input..
		ScriptInputObj["PricePlan"]={
		"paramName" : "inputJSON",
		"paramValue" :getPricePlanControllerManagerObj().fetchPricePlanScriptInput(pScopeObj),
		"scriptName" : "VP_EntryPoint"
		};
		//Need to pass scope obj while loading scope part
		if (isScopeLoadReq) {
			l_SyncObj = pScopeObj;
		}
		var paramValue = [];
		paramValue.push(ScriptInputObj);
		Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('openPPCombine', ["input"], paramValue, '', true, callbackAPI, l_SyncObj);
	}
	//Fetch Price Plan for selected scope............................
	this.fetchPricePlan = function (p_strPPScopeKey, p_objPricePlanScopeData, p_destroyPriceStructureView) {
		try {
			//Script call to fetch Price Plan data .......................
			var l_scriptResponse;
			var l_ScriptInput;
			var paramValue = [];
			l_ScriptInput = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "openWithScope",
				"Input" : {
					"ScopeData" : p_objPricePlanScopeData
				}
			};

			var l_syncObj = {
				"PPScopeKey" : p_strPPScopeKey,
				"PricePlanScopeData" : p_objPricePlanScopeData,
				"blndestroyPriceStructureView" : p_destroyPriceStructureView
			};
			paramValue.push(l_ScriptInput);
			Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', true, getPricePlanControllerManagerObj().fetchPricePlanScriptCallBack, l_syncObj);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	/** Performance Enhancement***/
	//Fetch Price Plan for selected scope............................
	this.fetchPricePlanScriptInput = function (p_PPScopeObj) {
		try {
			//Script call to fetch Price Plan data .......................
			var l_ScriptInput = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "openWithScope",
				"Input" : {
					"ScopeData" : {
						"Geography Level" : "Market",
						"Geography Code" : p_PPScopeObj["Pricing Market"],
						"Time Level" : "Year",
						"Time" : p_PPScopeObj["Time"],
						"Product Code" : p_PPScopeObj["Pricing Group"],
						"Product Level" : "Price Category"
					}
				}
			};
			return l_ScriptInput;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	//Fetch Price Plan Best practice guidance
	this.fetchBestPractices = function (p_objPricePlanScopeData) {
		try {
			var paramValue = [];
			var inputParamValueObject = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "Pricing_Guidance",
				"Input" : {
					"scope" : p_objPricePlanScopeData
				}
			};

			paramValue.push(inputParamValueObject);
			Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', true, getPricePlanControllerManagerObj().fetchBestPracticesScriptCallBack);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	// fetch best practicces script call back
	this.fetchBestPracticesScriptCallBack = function (ScriptOutput) {
		try {
			var l_FetchBP_output;
			if (ScriptOutput.status.toLowerCase() == "success") {
				l_FetchBP_output = Ext.decode(ScriptOutput.response);
				//if (l_FetchBP_output.solStatus.toLowerCase() == "success") {
				// set best practice object
				//}
			} else {
				//SCRIPT FAILED.....................
				// Ext.MessageBox.show({
				// title : m_MESSAGES["Script Failure"]["Title"],
				// msg : m_MESSAGES["Script Failure"]["Message"],
				// buttons : Ext.MessageBox.OK,
				// icon : Ext.MessageBox.ERROR
				// });
			}
			getPricePlanControllerManagerObj().setBestracticeGuidanceData(l_FetchBP_output.solResponse);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	//Fetch Price Plan Best practice guidance
	this.fetchHistoricalPricePlanReports = function (p_objPricePlanScopeData) {
		try {
			var input = [];
			input[0] = {
				"Query_Id" : "AuditReportQuery",
				"UIInput" : {
					"Geography" : p_objPricePlanScopeData["Geography Code"],
					"Product" : p_objPricePlanScopeData["Product Code"],
					"Time" : p_objPricePlanScopeData["Time"]
				}
			};
			var paramValues = [];
			paramValues.push(input);
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getPricePlanControllerManagerObj().fetchHistoricalPricePlanReportCallBack);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	// fetch best practicces script call back
	this.fetchHistoricalPricePlanReportCallBack = function (ScriptOutput) {
		try {
			var l_FetchHistoryReport_output = {};
			if (ScriptOutput.status.toLowerCase() == "success") {
				l_FetchHistoryReport_output = Ext.decode(ScriptOutput.response);
				//if (l_FetchBP_output.solStatus.toLowerCase() == "success") {
				// set best practice object
				//}
			} else {
				//SCRIPT FAILED.....................
				// Ext.MessageBox.show({
				// title : m_MESSAGES["Script Failure"]["Title"],
				// msg : m_MESSAGES["Script Failure"]["Message"],
				// buttons : Ext.MessageBox.OK,
				// icon : Ext.MessageBox.ERROR
				// });
			}
			getPricePlanControllerManagerObj().setHistoricalPricePlanReportData(l_FetchHistoryReport_output.solResponse);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	/**ET 1242 */
	//Fetch Price Plan Best practice guidance
	this.fetchPricePlanWorkflowHistory = function (p_objPricePlan) {
		try {
			var l_FetchTaskHistory_output = {};
			/**Fetch workflow history for existing price plan....**/
			if (!p_objPricePlan.isFrontLinePP()) {
				var l_objSystemFields = p_objPricePlan.getPricePlanSystemFields();
				var l_actorId = "@RoleName{" + VistaarFunctionLib.getRoleName() + "}";
				var l_functionOutput = {
					"ProcessDefinition" : l_objSystemFields.WorkFlowProcessDef,
					"persistentParamKey" : [],
					"ProcessInstanceKey" : l_objSystemFields.WorkFlowProcessInstanceKey,
					"Configuration" : {
						"ColumnsInfo" : {
							"NodeHistory" : {
								"NodeId" : "Node Id",
								"FromState" : "From State",
								"ToState" : "To State",
								"Action" : "Action",
								"NodeComments" : "Node Comments",
								"ActionDate" : "Action Date",
								"ActorId" : "ActorId"
							}
						},
						"DateFormat" : {
							"Format" : "MM/dd/yy HH:mm",
							"FormatFields" : ["Action Date", "Date"]
						}
					},
					"CommentsKey" : "",
					"ActorIdKey" : l_actorId
				}
				var ScriptOutput = VistaarAjax.callESExecuteScript('wft_ExecuteWFTemplateOperations', ["OperationInputs"], [["History", JSON.stringify(l_functionOutput)]], '', false);
				if (ScriptOutput.status.toLowerCase() == "success") {
					l_FetchTaskHistory_output = Ext.decode(ScriptOutput.response).response;
					//if (l_FetchBP_output.solStatus.toLowerCase() == "success") {
					// set best practice object
					//}
				} else {
					//SCRIPT FAILED.....................
					// Ext.MessageBox.show({
					// title : m_MESSAGES["Script Failure"]["Title"],
					// msg : m_MESSAGES["Script Failure"]["Message"],
					// buttons : Ext.MessageBox.OK,
					// icon : Ext.MessageBox.ERROR
					// });
				}
			}
			p_objPricePlan.setWorkflowLevelComments(l_FetchTaskHistory_output.NodeHistory);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//FectPrice Plan execute scripts call back
	this.fetchPricePlanScriptCallBack = function (p_ScriptOutput, p_syncObj) {
		try {

			//Initialize Active Price Plan ID..............
			m_ActivePricePlanID = null;
			var l_objPricePlan;
			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_objCombinePPSolResponse = JSON.parse(p_ScriptOutput.response).solResponse;
				var l_ObjPPResponse = JSON.parse(l_objCombinePPSolResponse.PricePlan);
				if (l_ObjPPResponse.solStatus.toLowerCase() == "success" && l_ObjPPResponse.solResponse.hasOwnProperty("Price Plan")) {
					//SET THE PRICE PLAN DATA IN THE MODEL
					var l_scriptResponse = l_ObjPPResponse.solResponse;
					var l_objScope = l_scriptResponse.Scope;
					var l_objId = p_syncObj.PPScopeKey;

					l_objPricePlan = new PricePlan(l_scriptResponse, l_objScope, l_objId);
					//Validate Price Plan Output..................
					l_objPricePlan.checkValidity();
					l_objPricePlan.m_updatedDealRecord = {
						"DealsToBeDeleted" : {},
						"VariableAttributesAndValues" : []
					};
					/** Check Comments for Published Plan**/
					if (l_objPricePlan.getPricePlanState() == "Published") {
						l_scriptResponse.AdditionalInfo.WF_Comment = "";
						//ET#963 - proposed to current data copy
						getPricePlanControllerManagerObj().copyProposedToCurrent(l_objPricePlan.getPricePlan());
					}
					/*if (l_scriptResponse.AdditionalInfo.WF_Comment !== "") {

					l_objPricePlan.setWorkflowLevelComments(Ext.decode(l_scriptResponse.AdditionalInfo.WF_Comment));
					}*/

					if (!l_scriptResponse.hasOwnProperty("PricePlan_SystemFields")) {
						l_objPricePlan.setFLPricePlan(true);
						//Message Box for FL Price Plan...............
						if (l_ObjPPResponse.solMessages.length > 0) {
							Ext.MessageBox.show({
								title : 'Information',
								msg : l_ObjPPResponse.solMessages[0],
								buttons : Ext.MessageBox.OK,
								icon : Ext.MessageBox.INFO
							});
						}
					}
					/**ET 1242 */
					//Set User Comments Info in Price Plan Model
					//getPricePlanControllerManagerObj().fetchPricePlanWorkflowHistory(l_objPricePlan);
					var l_FetchTaskHistory_output={};
					if (l_objCombinePPSolResponse.hasOwnProperty("WF_History") && JSON.parse(l_objCombinePPSolResponse.WF_History).status.toLowerCase() == "success") {
					l_FetchTaskHistory_output =JSON.parse(l_objCombinePPSolResponse.WF_History).response;
					//if (l_FetchBP_output.solStatus.toLowerCase() == "success") {
					// set best practice object
					//}
					}
					l_objPricePlan.setWorkflowLevelComments(l_FetchTaskHistory_output.NodeHistory);
					//PRICE PLAN DATA INTO MODEL.............
					m_PricePlan.push(l_objPricePlan);
					m_ActivePricePlanID = p_syncObj.PPScopeKey;
					/*var l_Obj_ScopeForWorkScript = {
						"Time" : p_syncObj.PricePlanScopeData["Time"],
						"Geography Code" : p_syncObj.PricePlanScopeData["Geography Code"],
						"Product Code" : p_syncObj.PricePlanScopeData["Product Code"]
					}*/
					//getPricePlanControllerManagerObj().fetchWorkflowComboData(l_Obj_ScopeForWorkScript);
					getPricePlanControllerManagerObj().fetchWorkflowScriptCallback({
						"status" : "success",
						"response" : l_objCombinePPSolResponse.Scope
					});
					/*if (Obj_WorkFlowOutput != undefined) {
					l_objPricePlan.setWorkFlowCombo(Obj_WorkFlowOutput);
					}*/

					//return l_objPricePlan;


				} else {
					//FAILED TO FETCH PRICE PLAN DATA...............
					Ext.MessageBox.show({
						title : 'Information',
						msg : l_ObjPPResponse.solMessages[0],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

				}
			} else {
				//SCRIPT FAILED.....................
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
			getPricePlanControllerManagerObj().PricePlanViewDataRenderer(l_objPricePlan, p_syncObj);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	// Render data in price plan view..................
	this.PricePlanViewDataRenderer = function (l_objPricePlan, p_syncObj) {
		try {
			//Get Price Plan Object..................
			//l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(p_str_ScopeKey);
			//Hide Price Structure Tab................
			if (p_syncObj.blndestroyPriceStructureView && getApplicationTabMgrObj().isPriceStructureTabVisible()) {
				getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(null);
				getApplicationTabMgrObj().hidePriceStructureTab();
			}

			/**Mass Copy changes (Copy From PP) -Dipali*/
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOnPremise_MassCopy", false);
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOffPremise_MassCopy", false);
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().resetDealCopyData();

			if (l_objPricePlan != undefined) {

				//Set active Price Plan .....................................
				//	m_ActivePricePlanID = p_syncObj.PPScopeKey;
				//Apply UIACLs for Price Plan Promo Goods.............
				/*if (l_objPricePlan.getPricePlan().hasOwnProperty("Security")) {
				var l_PG_Security = l_objPricePlan.getPricePlan().Security["Price Plan"];
				getObjectFactory().getUIACLHelper().updateUIACLsJSON(l_PG_Security.Target, l_PG_Security.Default, l_PG_Security.Actions);
				getObjectFactory().getUIACLHelper().applyUIACLs(l_PG_Security.Default);
				}*/
				var l_priceplanDataObj = l_objPricePlan.getPricePlan();
				if (l_priceplanDataObj.hasOwnProperty("Security")) {
					var l_objSecurity = l_objPricePlan.getPricePlan().Security;
					for (var l_SecurityIter in l_objSecurity) {
						var l_UIACLobj = l_objSecurity[l_SecurityIter].UIACL;
						if (l_UIACLobj["APPLICABILITY"] == "1") {
							var l_UIACL = l_UIACLobj["UIACL"];
							getObjectFactory().getUIACLHelper().updateUIACLsJSON(l_UIACL.Target, l_UIACL.Default, l_UIACL.Actions);
							getObjectFactory().getUIACLHelper().applyUIACLs(l_UIACL.Default);

						}
					}
				}

				//Load Price Plan Grid Data ................................
				getPricePlanControllerManagerObj().getPricePlanUIManager().loadPricePlanGrids(l_objPricePlan.getPricePlan(), l_objPricePlan.getEditedRecord(), l_objPricePlan.getPRGAvailability(), l_objPricePlan.get_PG_Effectivity_Info());

				//Pending Approval Changes ....//VistaarExtjs.getCmp("cntPricePlanCard").getLayout().getActiveItem().id == "cntImpactAnalysisMain"
				/*if (VistaarExtjs.getCmp("btnPricePlanTab").pressed && VistaarExtjs.getCmp("btnImpactAnalysisOpen").pressed && !p_syncObj.blndestroyPriceStructureView) {
				//Open PP from Price Plan Scope Parts.........
				getPricePlanControllerManagerObj().setPricePlanMainView();
				} else if ((l_objPricePlan.getPricePlanState() == "Pending Approval" || l_objPricePlan.getPricePlanState() == "Approved") && p_syncObj.blndestroyPriceStructureView) {
				//Open PP from Finder Or MyTask view...........
				VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(true);
				getPricePlanControllerManagerObj().setPricePlanMainView();
				} else if (p_syncObj.blndestroyPriceStructureView) {
				VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(false);
				getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(false);
				}*/
				//Refresh Impact Analysis View...............@Iteration 4
				if (p_syncObj.blndestroyPriceStructureView) {
					//Open PP from Finder Or MyTask view...........
					if (l_objPricePlan.getPricePlanState() == "Pending Approval" || l_objPricePlan.getPricePlanState() == "Approved") {
						/** Open Impact Analysis View **/
						VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(true);
						getPricePlanControllerManagerObj().setPricePlanMainView();
					} else {
						/** Show Price Plan View related Button **/
						VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(false);
						getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(false);
					}
				} else if (VistaarExtjs.getCmp("btnImpactAnalysisOpen").pressed) {
					//Open PP from Price Plan Scope Parts.........
					getPricePlanControllerManagerObj().setPricePlanMainView();
				}

				//Set Deal system fields..........
				if (l_objPricePlan.getDealSystemFields() != undefined) {
					getPriceStructureModelObj().setSystemFieldsObj(l_objPricePlan.getDealSystemFields());
				}
				//SCOPE OBJECT FOR DEAL LINE VIEW...............
				var l_scopeObjDealLine = {
					"ScopeForScript" : {
						"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute()
					}
				};

				if (!p_syncObj.blndestroyPriceStructureView && getApplicationTabMgrObj().isPriceStructureTabVisible()) {
					var l_Config = {};
					if (l_objPricePlan.isFrontLinePP()) {
						getApplicationTabMgrObj().disablePriceStructure();
						//l_Config["operation"] = getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL;
					} else {
						l_Config["operation"] = getGlobalConstantsObj().m_OPRTN_EDIT_DEAL;
					}
					getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(l_scopeObjDealLine, l_Config);
				}
				//Hide Historic Impact Tab ......
				getApplicationTabMgrObj().disableHistoricImpactView();
				//getPricePlanControllerManagerObj().loadWorkFlowCombo(l_objPricePlan);
				getPricePlanControllerManagerObj().setApprovalWorkflowUI(l_objPricePlan.getPricePlanState());
			} else {
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().applyMaskingOnPricePlanView();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().clearAllPricePlanGridData();
				if (!p_syncObj.blndestroyPriceStructureView && getApplicationTabMgrObj().isPriceStructureTabVisible()) {
					getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(null);
				}
				if (getApplicationTabMgrObj().isHistoricImpactTabVisible()) {
					//Remove Historic Tab and activate Price Plan Tab....
					if (VistaarExtjs.getCmp("btnHistoricImpactTab").pressed) {
						VistaarExtjs.getCmp("cntPricePlanMain").setActiveItem(getPricePlanControllerManagerObj().getPricePlanUIManager().m_PricePlanMain);
						if (VistaarExtjs.getCmp("btnImpactAnalysisOpen").pressed) {
							getObjectFactory().getImpactAnalysisManager().renderImpactAnalysisView();
							getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(true);
						} else {
							getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().renderPricePlanGridView();
							getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(false);
						}
					}
					//Hide Historic Tab...
					getApplicationTabMgrObj().hideHistoricImpactTab();
				}
				getPricePlanControllerManagerObj().loadWorkFlowCombo();
				getPricePlanControllerManagerObj().setApprovalWorkflowUI();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	}

	//Call Work-Flow Combo Script with p_objScriptInput...........
	this.fetchWorkflowComboData = function (p_objScriptInputForWF) {
		try {
			var inputWorkFlowScript = [];
			inputWorkFlowScript[0] = {
				"Query_Id" : "WorkflowQuery",
				"UIInput" : p_objScriptInputForWF
			};
			var paramValues = [];
			paramValues.push(inputWorkFlowScript);
			//WorkflowQuery Script call.............
			var l_WorkFlowScriptOutput = VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getPricePlanControllerManagerObj().fetchWorkflowScriptCallback);
			/* if (l_WorkFlowScriptOutput.status.toLowerCase() == "success") {
			var l_WorkFlowOutput = Ext.decode(l_WorkFlowScriptOutput.response);
			if (l_WorkFlowOutput.solStatus.toLowerCase() == "success") {
			//	l_objPricePlan.setWorkFlowCombo(l_WorkFlowOutput.solResponse.WorkflowQuery);
			return l_WorkFlowOutput.solResponse.WorkflowQuery;
			}
			} */
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Price Plan Work Flow Script CallBack...............
	this.fetchWorkflowScriptCallback = function (p_Obj_WorkFlowScriptOutput) {
		try {
			if (p_Obj_WorkFlowScriptOutput.status.toLowerCase() == "success") {
				var l_WorkFlowOutput = Ext.decode(p_Obj_WorkFlowScriptOutput.response);
				if (l_WorkFlowOutput.solStatus.toLowerCase() == "success") {
					var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
					l_objPricePlan.setWorkFlowCombo(l_WorkFlowOutput.solResponse.WorkflowQuery);
					getPricePlanControllerManagerObj().loadWorkFlowCombo(l_objPricePlan);
					//return l_WorkFlowOutput.solResponse.WorkflowQuery;
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//CHECK PRICE PLAN IN PP MODEL...........................
	this.checkPricePlan = function (p_strPricePlanId) {
		try {
			for (var l_ObjPricePlan in m_PricePlan) {
				if (m_PricePlan[l_ObjPricePlan].getPricePlanId() === (p_strPricePlanId)) {
					return true;
				}
			}
			return false;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Return Active Price Plan Data................
	this.getActivePricePlanData = function () {
		if (m_ActivePricePlanID != null && m_ActivePricePlanID != undefined) {
			var l_Obj_ActivePricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (l_Obj_ActivePricePlan) {
				return Ext.clone(l_Obj_ActivePricePlan.getPricePlan());
			}
		}
	}

	//RETRUN PRICE PLAN FOR GIVEN PRICE PLAN ID......................
	this.getPricePlanObject = function (p_strPricePlanId) {
		try {
			for (var l_ObjPricePlan in m_PricePlan) {
				if (m_PricePlan[l_ObjPricePlan].getPricePlanId() === (p_strPricePlanId)) {
					return m_PricePlan[l_ObjPricePlan];
				}
			}
			return false;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//UPDATE ACTIVE PRICE PLAN IN PP MODEL......................
	this.UpdatePricePlan = function (p_PP_ScriptOutput, p_bln_Set_WF_Commemt) {
		try {
			//GET ACTIVE PRICE PLAN OBJECT....................
			var obj_ActivePP = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (!p_PP_ScriptOutput.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
				obj_ActivePP.setFLPricePlan(true);
				/*if (p_PP_ScriptOutput.solMessages.length > 0) {
				Ext.MessageBox.show({
				title : 'Information',
				msg : p_PP_ScriptOutput.solMessages[0],
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.INFO
				});
				}*/
			}

			//INITIAIZE PRICE PLAN TO ITS INITIAL STATE........................
			getPricePlanControllerManagerObj().getPricePlanUIManager().intializeSummaryGridRowHideFlag();
			getPricePlanControllerManagerObj().getPricePlanUIManager().destroyPricePlanPopups();

			//UPDATE PRICE PLAN IN PP MODEL.......................
			obj_ActivePP.setPricePlan(p_PP_ScriptOutput.solResponse, m_ActivePricePlanID);
			obj_ActivePP.setWorkflowApprovalLevel(p_PP_ScriptOutput.solResponse.AdditionalInfo.WF_Approval_Level);
			if (p_bln_Set_WF_Commemt) {
				//Set User comments info in Price Plan Model
				//obj_ActivePP.setWorkflowLevelComments(p_PP_ScriptOutput.solResponse.AdditionalInfo.WF_Comment);
				/**ET 1242 */
				getPricePlanControllerManagerObj().fetchPricePlanWorkflowHistory(obj_ActivePP);
			}
			//WorkFlow Script ..............
			var l_objPricePlanScopeData = obj_ActivePP.getPricePlanFixedAttribute();
			var p_obj_WorkFlowScriptInput = {
				"Time" : l_objPricePlanScopeData["Time"],
				"Geography Code" : l_objPricePlanScopeData["Geography Code"],
				"Product Code" : l_objPricePlanScopeData["Product Code"]
			};
			getPricePlanControllerManagerObj().fetchWorkflowComboData(p_obj_WorkFlowScriptInput);
			//LOAD UPDATED DATA IN PRICE PLAN VIEW.............
			getPricePlanControllerManagerObj().getPricePlanUIManager().loadPricePlanGrids(obj_ActivePP.getPricePlan(), obj_ActivePP.getEditedRecord(), obj_ActivePP.getPRGAvailability(), obj_ActivePP.get_PG_Effectivity_Info());
			//LOAD WORKFLOW COMBO......................................
			//getPricePlanControllerManagerObj().loadWorkFlowCombo(obj_ActivePP);

			//Set Approval Workflow UI........
			getPricePlanControllerManagerObj().setApprovalWorkflowUI(obj_ActivePP.getPricePlanState());
			//Refresh Impact View....//!getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()
			if (VistaarExtjs.getCmp("btnImpactAnalysisOpen").pressed) {
				getPricePlanControllerManagerObj().setPricePlanMainView();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//REFRESH PRICE PLAN SCREEN FOR NEW SCOPE.......................
	this.refreshPricePlanScreen = function (pScriptOutput, p_destroyPriceStructureView) {
		try {
			/*AS PP MODEL STORE ONLY CURRENT ACTIVE PRICE PLAN*/
			m_PricePlan = [];

			/*CLEAR PRICE PLAN FROM MODEL*/
			if (m_ActivePricePlanID != null) {
				//INITIAIZE PRICE PLAN TO ITS INITIAL STATE........................
				getPricePlanControllerManagerObj().getPricePlanUIManager().intializeSummaryGridRowHideFlag();
				getPricePlanControllerManagerObj().getPricePlanUIManager().destroyPricePlanPopups();
				//Reset Comments Fields.....
				getObjectFactory().getImpactAnalysisManager().resetImpactCommentsFields();
				//Hide Price Plan Comment WIndow ..... (Future Planning Comment Flow)
				getObjectFactory().getImpactAnalysisManager().hideImpactAnalysisCommentsWindow();
			}
			//Hide Historic Tab
			if (getApplicationTabMgrObj().isHistoricImpactTabVisible()) {}
			var l_syncObj = {
				"PPScopeKey" : getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getScopeDataKey(),
				"blndestroyPriceStructureView" : p_destroyPriceStructureView
			};

			//Fetch Price Plan for Selected Scope...................
			getPricePlanControllerManagerObj().fetchPricePlanScriptCallBack(pScriptOutput, l_syncObj);
			//Fetch Best Practice Guidance.......................
			getPricePlanControllerManagerObj().fetchBestPractices(getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPricePlanScopeData());
			//Fetch Price Plan History Reports.......................
			getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPricePlanScopeData());

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//LOAD WORK-FLOW COMBO AND ENABLE/DISABLE PP_OPERATION BASED ON ACTIVE PRICE PLAN...........
	this.loadWorkFlowCombo = function (p_objActivePricePlan) {
		try {

			if (p_objActivePricePlan == undefined) {
				/*CLEAR WORKFLOW COMBO IF PP NOT FOUND*/
				VistaarExtjs.getCmp(m_CMB_WORKFLOW).getStore().loadData([]);
				m_ObjWorkflowComboData = undefined;
			} else {
				var l_WorkFlowComboValue = {};
				var l_arr_WFComboStoreData = [];
				var l_objScope = p_objActivePricePlan.getPricePlanFixedAttribute();
				var l_obj_PP_SystemField = p_objActivePricePlan.getPricePlanSystemFields();
				if (p_objActivePricePlan.isFrontLinePP()) {
					/* DISABLE PP_OPERATION FOR FL_PRICEPLAN*/
					getPricePlanControllerManagerObj().getPricePlanUIManager().disableORenableIconsOnFLPricePlan(false);
					l_WorkFlowComboValue = {
						Name : l_objScope["Time"],
						Code : {
							"year" : l_objScope["Time"]
						}
					}
				} else {
					/*CHANGE STATUS OF WORK-FLOW COMBO*/
					var l_workFlow = "";
					if (l_obj_PP_SystemField.WorkFlowStatus != "") {
						l_workFlow = Ext.decode(l_obj_PP_SystemField.WorkFlowStatus)[0];
						//Set Pending Approval Level...
						if (l_workFlow == "Pending Approval") {
							//Check Approval level
							if (p_objActivePricePlan.getWorkflowApprovalLevel() != "Approval Level Not Available") {
								l_workFlow += " " + p_objActivePricePlan.getWorkflowApprovalLevel();
							}
						}
					}
					var l_PP_workFlowStatus = p_objActivePricePlan.getWorkFlowComboData();
					for (var l_WF_Index in l_PP_workFlowStatus) {
						var l_str_WF = Ext.decode(l_PP_workFlowStatus[l_WF_Index].WorkFlowStatus)[0]
							var l_comboValue = {
							Name : l_objScope["Time"] + " " + l_str_WF,
							Code : {
								"year" : l_objScope["Time"],
								"WorkflowStatus" : l_PP_workFlowStatus[l_WF_Index].WorkFlowStatus
							}
						};
						l_arr_WFComboStoreData.push(l_comboValue)
					}
					l_WorkFlowComboValue = {
						Name : l_objScope["Time"] + " " + l_workFlow,
						Code : {
							"year" : l_objScope["Time"],
							"WorkflowStatus" : l_obj_PP_SystemField.WorkFlowStatus
						}
					};
					//	if (getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear <= l_objScope["Time"]) {
					/* ENABLE PP_OPERATION FOR NON-FL_PRICEPLAN*/
					//if (l_workFlow == m_Published_Key) {
					/*HANDLE ADDITIONAL FUNCTIONALITY FOR PUBLISHED PP*/
					/*DIABLE ONLY SUBMIT BUTTON*/
					//getPricePlanControllerManagerObj().getPricePlanUIManager().disableORenableIconsOnFLPricePlan(true, true);
					//} else {
					/* ENABLE PP_OPERATION*/
					//	getPricePlanControllerManagerObj().getPricePlanUIManager().disableORenableIconsOnFLPricePlan(true);
					//}
					if (isAdminRole() || p_objActivePricePlan.getPricePlan().AdditionalInfo.EditableFrom != "") {
						getPricePlanControllerManagerObj().getPricePlanUIManager().disableORenableIconsOnFLPricePlan(true, l_workFlow);
					} else {
						//Handling Past Year functionality........................
						getPricePlanControllerManagerObj().getPricePlanUIManager().disableORenableIconsOnFLPricePlan(false, true);
					}
				}
				m_ObjWorkflowComboData = {
					"storeData" : l_arr_WFComboStoreData,
					"comboValue" : l_WorkFlowComboValue
				}
				//Set Workflow Combo Field
				getPricePlanControllerManagerObj().setPricePlanWorkflowComboFields();
				//To set current scope data in Scope Module level.....
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().setActiveScopeDataFields();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	//SET WORKFLOW COMBO .....
	this.setPricePlanWorkflowComboFields = function () {
		if (m_ObjWorkflowComboData) {
			VistaarExtjs.getCmp(m_CMB_WORKFLOW).getStore().loadData(m_ObjWorkflowComboData.storeData);
			VistaarExtjs.getCmp(m_CMB_WORKFLOW).setValue(m_ObjWorkflowComboData.comboValue.Name);
			VistaarExtjs.getCmp(m_CMB_WORKFLOW).value = m_ObjWorkflowComboData.comboValue.Code;
			if (m_ObjWorkflowComboData.comboValue.Code.WorkflowStatus == '["Pending Approval"]') {
				/** add PendingApproval Cls**/
				VistaarExtjs.getCmp(m_CMB_WORKFLOW).getEl().addCls("ClsWFPendingApproval");
			} else {
				/** remove PendingApproval Cls**/
				VistaarExtjs.getCmp(m_CMB_WORKFLOW).getEl().removeCls("ClsWFPendingApproval");
			}

		}
	}

	//SET PP SYSTEM FIELDS And Scope API...................
	this.setSystemFieldsObj = function (p_objSystemFields) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (p_objSystemFields.hasOwnProperty(getGlobalConstantsObj().m_PRICEPLAN_SYSTEMFIELDS)) {
				l_objPricePlan.setPricePlanSystemFields(p_objSystemFields[getGlobalConstantsObj().m_PRICEPLAN_SYSTEMFIELDS]);
				console.log(p_objSystemFields[getGlobalConstantsObj().m_PRICEPLAN_SYSTEMFIELDS]);
				if (l_objPricePlan.isFrontLinePP()) {
					l_objPricePlan.setFLPricePlan(false);
				}
			}
			if (p_objSystemFields.hasOwnProperty(getGlobalConstantsObj().m_DEALCONTAINER_SYSTEMFIELDS)) {
				console.log(p_objSystemFields[getGlobalConstantsObj().m_DEALCONTAINER_SYSTEMFIELDS]);
				l_objPricePlan.setDealSystemFields(p_objSystemFields[getGlobalConstantsObj().m_DEALCONTAINER_SYSTEMFIELDS]);
			}
			if (p_objSystemFields.hasOwnProperty(getGlobalConstantsObj().m_SCOPE)) {
				console.log(p_objSystemFields[getGlobalConstantsObj().m_SCOPE]);
				l_objPricePlan.setPricePlanFixedAttribute(p_objSystemFields[getGlobalConstantsObj().m_SCOPE]);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	//CLEAR PRICE PLAN MODEL DATA WHEN ANOTHER PRICE MARKET SELECTED..................................
	this.clearPricePlanDataRecords = function (p_IsIncompleteScpoe) {
		try {
			if (m_PricePlan.length > 0) {
				m_PricePlan = [];
				m_ActivePricePlanID = null;
				getPricePlanControllerManagerObj().getPricePlanUIManager().destroyPricePlanPopups();
				getPricePlanControllerManagerObj().getPricePlanUIManager().intializeSummaryGridRowHideFlag();
				//Reset Comments Fields.....
				getObjectFactory().getImpactAnalysisManager().resetImpactCommentsFields();
				//Hide Price Plan Comment WIndow ..... (Future Planning Comment Flow)
				getObjectFactory().getImpactAnalysisManager().hideImpactAnalysisCommentsWindow();
				//Additional Functionality for Incomplete Price Plan Scope...............
				if (p_IsIncompleteScpoe) {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().clearAllPricePlanGridData();
					getPricePlanControllerManagerObj().loadWorkFlowCombo();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().applyMaskingOnPricePlanView();
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	//INSTANTIATE PRICE PLAN UI........................................
	this.getPricePlanUIManager = function () {
		if (m_PricePlanUIManager == undefined) {
			m_PricePlanUIManager = new PricePlanUIManager();
		}
		return m_PricePlanUIManager;
	};

	//ON SAVE PRICE PLAN CLICK FUNCTION CALL...............................
	this.onBtnSavePricePlanClick = function (button, e, eOpts) {
		try {
			//SAVE UPDATED PRICE PLAN DATA.....................................
			if (getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).isFrontLinePP()) {
				Ext.MessageBox.show({
					title : m_MESSAGES["FL_PP"]["Title"],
					msg : m_MESSAGES["FL_PP"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.INFO
				});
			} else if (this.isPricePlanDirty()) {
				Ext.MessageBox.confirm(m_MESSAGES["SaveConfirm"]["Title"], m_MESSAGES["SaveConfirm"]["Message"], function (p_btn) {
					if (p_btn == "yes") {
						getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", "Saving...");
						Ext.defer(function () {
							getPricePlanControllerManagerObj().savePricePlan();
						}, 100);
					}
				});
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*SAVE PRICE PLAN API..............................*/
	this.savePricePlan = function (p_autoSaveCall, p_autoSaveCallback) {
		try {
			VistaarAuditingManager.audit({
				"name" : "Start:UI Processing Save PricePlan"
			}, m_IS_AUDIT_REQUIRED, 531);
			//SAVE UPDATED PRICE PLAN DATA.....................................
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objScopeData = l_objPricePlan.getPricePlanUpdatedRecord();
			l_objScopeData["System Fields"] = l_objPricePlan.getPricePlanSystemFields();
			l_objScopeData["DealContainer_SystemFields"] = l_objPricePlan.getDealSystemFields();
			l_objScopeData["Fixed Attributes"] = l_objPricePlan.getPricePlanFixedAttribute();
			/** PG Enhancement**/
			l_objScopeData["PiggyBag"] = l_objPricePlan.getPiggyBagData();

			//TO SOLVE SIZES ISSUE...................
			//TO APPEND SIZES TO VARIABLE ATTRIBUTES AND VALUES................
			for (var l_objVariableAttribute in l_objScopeData.VariableAttributesAndValues) {
				l_objScopeData.VariableAttributesAndValues[l_objVariableAttribute]["Variable Attributes"]["Sizes"] = l_objPricePlan.getPricePlanFixedAttribute()["Product Code"];

			}
			var paramValue = [];
			var inputParamValueObject = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "save",
				"Input" : {
					"ScopeData" : l_objScopeData
				}
			};
			paramValue.push(inputParamValueObject)
			var l_callbackParams = {
				"ScopeData" : l_objScopeData,
				"PricePlan" : l_objPricePlan,
				"AutoSaveCall" : p_autoSaveCall,
				"AutoSaveCallback" : p_autoSaveCallback
			}
			//		var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', false);
			var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, {}, true, getPricePlanControllerManagerObj().savePricePlanCallbackForAsync, l_callbackParams);
			/*if (ScriptOutput.status.toLowerCase() == "success") {
			var l_output = Ext.decode(ScriptOutput.response);
			if (l_output.solStatus.toLowerCase() == "success") {
			if (l_objScopeData["System Fields"].WorkFlowStatus.indexOf(m_Published_Key) != -1) {
			//Recreate WIP PP on Published PP save Operation...............
			getPricePlanControllerManagerObj().UpdatePricePlan(l_output);
			//Fetch Historic Report Data...
			getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(l_objPricePlan.getPricePlanFixedAttribute());
			} else {
			//Update best practices evaluation month.....
			l_objPricePlan.updateBestPracticesEvaluationMonth(l_objScopeData.VariableAttributesAndValues);
			//Set Price Plan System Fields .............
			var l_objPPColneCopy = l_objPricePlan.updatePricePlanCloneData();
			var l_objDeletedDealInfo = l_objPricePlan.getDeletedDealAdditionalInfo();
			//Delete Deal from Clone Copy..........
			for (var l_strDealID in l_objScopeData.DealsToBeDeleted) {
			getPricePlanControllerManagerObj().deactivateOrDeleteDeal(l_strDealID, l_objScopeData.DealsToBeDeleted[l_strDealID], l_objDeletedDealInfo[l_strDealID], l_objPPColneCopy);
			}
			//Remove Edit Record details...............
			l_objPricePlan.clearEditedData();
			//COMMIT ALL THE CHANGES..................
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().commitPricePlanGridChanges(l_objPricePlan.getEditedRecord());
			//getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().setLatestDataFromPricePlanGridsToCloneCopy(l_objPricePlan.getPricePlanCloneData());
			//Update deal count.............
			getPricePlanControllerManagerObj().setDealCountInGirdHeader();

			}

			//Set Price Plan System Fields in Price Plan Model..........
			if (l_output.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
			l_objPricePlan.setPricePlanSystemFields(l_output.solResponse.PricePlan_SystemFields);
			if (l_objPricePlan.isFrontLinePP()) {
			l_objPricePlan.setFLPricePlan(false);
			}
			}
			//Set Deal System Fields in Price Plan Model.........
			if (l_output.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
			l_objPricePlan.setDealSystemFields(l_output.solResponse.DealContainer_SystemFields);
			getPriceStructureModelObj().setSystemFieldsObj(l_output.solResponse.DealContainer_SystemFields);
			}
			//Call Refresh Deal View API............................
			if (getApplicationTabMgrObj().isPriceStructureTabVisible()) {
			var l_scopeObjDealLine = {
			"ScopeForScript" : {
			"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute()
			}
			};
			var l_Config = {
			"operation" : getGlobalConstantsObj().m_OPRTN_EDIT_DEAL
			};
			getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(l_scopeObjDealLine, l_Config);
			}
			if (p_autoSaveCall) {
			return {
			"SaveSucceded" : true,
			"ScopeForScript" : {
			"ScopeData" : l_output.solResponse.Scope
			}
			}
			} else {
			Ext.MessageBox.show({
			title : m_MESSAGES["SavePricePlan"]["Title"],
			msg : m_MESSAGES["SavePricePlan"]["Message"],
			buttons : Ext.MessageBox.OK,
			icon : Ext.MessageBox.INFORMATIONAL
			});
			// Enable PG Applicability...........
			if (!getPricePlanControllerManagerObj().getPricePlanUIManager().m_PG_Applicable_Market) {
			for (var arrIndex in l_objScopeData.VariableAttributesAndValues) {
			if (l_objScopeData.VariableAttributesAndValues[arrIndex].hasOwnProperty("PRG_State")) {
			//Set as PG Applicable market.............
			getPricePlanControllerManagerObj().getPricePlanUIManager().m_PG_Applicable_Market = true;
			}
			}
			}
			//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
			VistaarAuditingManager.audit({
			"name" : "End:UI Processing Save PricePlan"
			}, m_IS_AUDIT_REQUIRED, 531);
			} else {
			//FAILED TO SAVE PRICE PLAN DATA...............
			if (p_autoSaveCall) {
			return {
			"SaveSucceded" : false,
			"solMessages" : l_output.solMessages[0],
			"msgTitle" : "Information"
			}
			} else {
			Ext.MessageBox.show({
			title : 'Information',
			msg : l_output.solMessages[0],
			buttons : Ext.MessageBox.OK,
			icon : Ext.MessageBox.INFO
			});
			//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
			}
			} else {
			//SCRIPT FAILED.....................
			if (p_autoSaveCall) {
			return {
			"SaveSucceded" : false,
			"solMessages" : m_MESSAGES["Script Failure"]["Message"],
			"msgTitle" : m_MESSAGES["Script Failure"]["Title"]
			}
			} else {
			Ext.MessageBox.show({
			title : m_MESSAGES["Script Failure"]["Title"],
			msg : m_MESSAGES["Script Failure"]["Message"],
			buttons : Ext.MessageBox.OK,
			icon : Ext.MessageBox.ERROR
			});
			//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
			}*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			/*if (!p_autoSaveCall) {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}*/
		}
	}
	this.savePricePlanCallbackForAsync = function (ScriptOutput, p_callbackParams, p_objScopeData, p_objPricePlan, p_autoSaveCall) {
		try {
			/*var l_callbackParams = {
			"ScopeData":l_objScopeData,
			"PricePlan":l_objPricePlan,
			"AutoSaveCall":p_autoSaveCall
			};*/
			p_objScopeData = p_callbackParams["ScopeData"];
			p_objPricePlan = p_callbackParams["PricePlan"];
			p_autoSaveCall = p_callbackParams["AutoSaveCall"];
			p_autoSaveCallback = p_callbackParams["AutoSaveCallback"];
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					if (p_objScopeData["System Fields"].WorkFlowStatus.indexOf(m_Published_Key) != -1) {
						//Recreate WIP PP on Published PP save Operation...............
						getPricePlanControllerManagerObj().UpdatePricePlan(l_output, true);
						//Sync Impact Analysis view with latest comments
						getObjectFactory().getImpactAnalysisManager().syncImpactViewWithWorkflow(p_objPricePlan.getWorkflowLevelComments());
						//Fetch Historic Report Data...
						getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(p_objPricePlan.getPricePlanFixedAttribute());
					} else {
						//Update best practices evaluation month.....
						p_objPricePlan.updateBestPracticesEvaluationMonth(p_objScopeData.VariableAttributesAndValues);
						//Set Price Plan System Fields .............
						var l_objPPColneCopy = p_objPricePlan.updatePricePlanCloneData();
						var l_objDeletedDealInfo = p_objPricePlan.getDeletedDealAdditionalInfo();
						//Delete Deal from Clone Copy..........
						for (var l_strDealID in p_objScopeData.DealsToBeDeleted) {
							getPricePlanControllerManagerObj().deactivateOrDeleteDeal(l_strDealID, p_objScopeData.DealsToBeDeleted[l_strDealID], l_objDeletedDealInfo[l_strDealID], l_objPPColneCopy);
						}
						//Remove Edit Record details...............
						p_objPricePlan.clearEditedData();
						//COMMIT ALL THE CHANGES..................
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().commitPricePlanGridChanges(p_objPricePlan.getEditedRecord());
						//getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().setLatestDataFromPricePlanGridsToCloneCopy(p_objPricePlan.getPricePlanCloneData());
						//Update deal count.............
						getPricePlanControllerManagerObj().setDealCountInGirdHeader();
						/** PG Enhancements**/
						//Sync Promo Goods Applicabilty .....
						getPricePlanControllerManagerObj().getPricePlanUIManager().setPGApplicability(l_output.solResponse.PRGAvailability);
						//Update PG Plan with actuals whenever required.....
						if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
							var l_objSaveResponse = l_output.solResponse;
							/** Sync Actual of Allocated cost in case of promo goood delete : PG Enhancement **/
							var l_PromoGoodsGridID = {
								"PG_ON" : "DG_PGOnPremisesProposed",
								"PG_OFF" : "DG_PGOffPremisesProposed"
							}
							var l_PromooodsRecord;
							var l_RowRecord_AllocatedCost;
							var l_totals;
							for (var l_itrPGChannel in l_PromoGoodsGridID) {
								if (l_objSaveResponse.hasOwnProperty(l_itrPGChannel)) {
									var l_Store_PG = VistaarExtjs.getCmp(l_PromoGoodsGridID[l_itrPGChannel]).DGObj.getStore();
									var l_objPGCloneData = p_objPricePlan.getPricePlanCloneData()[l_itrPGChannel]["Proposed"];
									var l_PGResponseData = l_objSaveResponse[l_itrPGChannel]["Proposed"];
									var l_selectedMonth = "Jan";
									/** Deletion of PromoGoods from Jan month**/
									for (var itrPGData in l_objPGCloneData) {
										if (l_PGResponseData[0]["MetricsType"] == l_objPGCloneData[itrPGData]["MetricsType"]) {
											l_PromooodsRecord = l_Store_PG.data.find("MetricsType", l_objPGCloneData[itrPGData]["MetricsType"]);
											for (var itrMonth in l_objPGCloneData[itrPGData]) {
												if (l_PGResponseData[0].hasOwnProperty(itrMonth) && m_arrMonths.indexOf(itrMonth) != -1) {
													//To maintain previous month changes...
													//l_objPGData[itrPGData][itrMonth] = l_PGResponseData[itrPGData][itrMonth];
													l_PromooodsRecord.set(itrMonth, l_PGResponseData[0][itrMonth]);
													//Update Price Plan Clone Copy...
													l_objPGCloneData[itrPGData][itrMonth] = l_PGResponseData[0][itrMonth];
												}
											}
										}
									}

									l_RowRecord_AllocatedCost = l_Store_PG.data.find("MetricsType", "Allocated Budget");
									l_totals = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSumTotals(l_RowRecord_AllocatedCost.data);
									l_RowRecord_AllocatedCost.set("FY", l_totals.FY);
									l_RowRecord_AllocatedCost.set("YTD", l_totals.YTD);
									l_RowRecord_AllocatedCost.set("4MTHS", l_totals.FMTHS);
									l_RowRecord_AllocatedCost.set("FYvsPY", l_totals.FYvsPY);
								}
							}
						}
						//Calculate Summary Grid....
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();

					}
					//Set Price Plan System Fields in Price Plan Model..........
					if (l_output.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
						p_objPricePlan.setPricePlanSystemFields(l_output.solResponse.PricePlan_SystemFields);
						if (p_objPricePlan.isFrontLinePP()) {
							p_objPricePlan.setFLPricePlan(false);
						}
					}
					//Set Deal System Fields in Price Plan Model.........
					if (l_output.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
						p_objPricePlan.setDealSystemFields(l_output.solResponse.DealContainer_SystemFields);
						getPriceStructureModelObj().setSystemFieldsObj(l_output.solResponse.DealContainer_SystemFields);
					}
					//Call Refresh Deal View API............................
					if (getApplicationTabMgrObj().isPriceStructureTabVisible()) {
						var l_scopeObjDealLine = {
							"ScopeForScript" : {
								"ScopeData" : p_objPricePlan.getPricePlanFixedAttribute()
							}
						};
						var l_Config = {
							"operation" : getGlobalConstantsObj().m_OPRTN_EDIT_DEAL
						};
						getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(l_scopeObjDealLine, l_Config);
					}
					if (p_autoSaveCall) {
						/*return {
						"SaveSucceded" : true,
						"ScopeForScript" : {
						"ScopeData" : l_output.solResponse.Scope
						}
						}
						 */
						p_autoSaveCallback({
							"SaveSucceded" : true,
							"ScopeForScript" : {
								"ScopeData" : l_output.solResponse.Scope
							}
						});
					} else {
						Ext.MessageBox.show({
							title : m_MESSAGES["SavePricePlan"]["Title"],
							msg : m_MESSAGES["SavePricePlan"]["Message"],
							buttons : Ext.MessageBox.OK,
							icon : Ext.MessageBox.INFORMATIONAL
						});
						// Enable PG Applicability...........
						/*	if (!getPricePlanControllerManagerObj().getPricePlanUIManager().m_PG_Applicable_Market) {
						for (var arrIndex in p_objScopeData.VariableAttributesAndValues) {
						if (p_objScopeData.VariableAttributesAndValues[arrIndex].hasOwnProperty("PRG_State")) {
						//Set as PG Applicable market.............
						getPricePlanControllerManagerObj().getPricePlanUIManager().m_PG_Applicable_Market = true;
						}
						}
						}*/

						//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					}
					VistaarAuditingManager.audit({
						"name" : "End:UI Processing Save PricePlan"
					}, m_IS_AUDIT_REQUIRED, 531);
				} else {
					//FAILED TO SAVE PRICE PLAN DATA...............
					if (p_autoSaveCall) {
						/*return {
						"SaveSucceded" : false,
						"solMessages" : l_output.solMessages[0],
						"msgTitle" : "Information"
						}*/
						p_autoSaveCallback({
							"SaveSucceded" : false,
							"solMessages" : l_output.solMessages[0],
							"msgTitle" : "Information"
						});
					} else {
						Ext.MessageBox.show({
							title : 'Information',
							msg : l_output.solMessages[0],
							buttons : Ext.MessageBox.OK,
							icon : Ext.MessageBox.INFO
						});
						//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					}
				}
			} else {
				//SCRIPT FAILED.....................
				if (p_autoSaveCall) {
					/*return {
					"SaveSucceded" : false,
					"solMessages" : m_MESSAGES["Script Failure"]["Message"],
					"msgTitle" : m_MESSAGES["Script Failure"]["Title"]
					}*/
					p_autoSaveCallback({
						"SaveSucceded" : false,
						"solMessages" : m_MESSAGES["Script Failure"]["Message"],
						"msgTitle" : m_MESSAGES["Script Failure"]["Title"]
					});
				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["Script Failure"]["Title"],
						msg : m_MESSAGES["Script Failure"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				}
			}
		} catch (err) {
			//alert('In catch' + err.description);
			getCommonFuncMgr().printLog(err);
		}
		finally {
			if (!p_autoSaveCall) {
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
		}
	}

	//Filter Edited Record On the basis of PG Status........
	this.getSavePP_ScriptInput = function (p_objPricePlan) {
		try {
			/**Update Edited Record On the basis of PG_Btn state **/
			/**If PG_btn is Pressed**/

			var l_EditValues = p_objPricePlan.getPricePlanUpdatedRecord().VariableAttributesAndValues;
			var l_objPPData = p_objPricePlan.getPricePlan();
			var l_objPGData;
			var l_isPGdeleted;
			var l_isPGDataEdited = false;
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
				if (VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
					for (var record in l_EditValues) {
						if (l_EditValues[record].hasOwnProperty("PG_SDA") || l_EditValues[record].hasOwnProperty("PRG_Qualifier") || l_EditValues[record].hasOwnProperty("Percent of Business")) {
							// Promo Goods Enhancement changes
							l_isPGdeleted = true;
							//l_EditValues[record]["PRG_State"] = "Applicable";
							l_objPGData = l_objPPData["PG_" + l_EditValues[record]["Variable Attributes"]["Channels"]]["Proposed"];
							for (var rowIdx in l_objPGData) {
								if (l_objPGData[rowIdx]["MetricsType"] != "Allocated Budget") {
									for (var l_monthKey in m_arrMonths) {
										if (l_objPGData[rowIdx][m_arrMonths[l_monthKey]] != null) {
											l_isPGdeleted = false;
											break;
										}
									}
								}
								if (!l_isPGdeleted) {
									break;
								}
							}
							if (l_isPGdeleted) {
								l_EditValues[record]["PRG_State"] = "Deleted";
							} else {
								l_EditValues[record]["PRG_State"] = "Applicable";
							}
						}
					}
				} else {
					/**If PG_btn is not Pressed**/
					for (var record = 0; record < l_EditValues.length; record++) {
						for (var AttributeName in l_EditValues[record]) {
							if (AttributeName == "PG_SDA" || AttributeName == "PRG_Qualifier" || AttributeName == "Percent of Business") {
								delete l_EditValues[record][AttributeName];
								l_isPGDataEdited = true
							}
						}
						if (Object.getOwnPropertyNames(l_EditValues[record]).length == 1) {
							l_EditValues.splice(record, 1);
							record = record - 1;
						}
					}
					if (l_isPGDataEdited) {
						getPricePlanControllerManagerObj().resetPG_Grids_Data();
					}

				}
			}
			//return p_Obj_PP_EditedRecords;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.resetPG_Grids_Data = function () {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_GridData = l_objPricePlan.resetPGData();

			//VistaarTG.setDataOfTreeGrid(m_IdTGOnPremisesProposed, gridData[ChannelType].Proposed.children);
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
				VistaarDG.reloadDGWithData("DG_PGOnPremisesProposed", l_GridData.PG_ON.Proposed);
				VistaarDG.reloadDGWithData("DG_PG_Qual_OnPreProposed", l_GridData.PG_ON.Qualifier_Proposed);
				VistaarDG.reloadDGWithData("DG_PGOffPremisesProposed", l_GridData.PG_OFF.Proposed);
				VistaarDG.reloadDGWithData("DG_PG_Qual_OffPreProposed", l_GridData.PG_OFF.Qualifier_Proposed);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	// WorkFlow Button Click Callback...............
	this.onPPWorkflowBtnClick = function (button, e, eOpts) {
		try {
			var l_str_workflowBtn_tooltip;
			var l_str_workflowBtn_Cls;

			if (m_objWorkFlowConfig != undefined) {
				l_str_workflowBtn_tooltip = m_objWorkFlowConfig.WorkFlowActionDetails[button.id]["text"];
				l_str_workflowBtn_Cls = m_objWorkFlowConfig.WorkFlowActionDetails[button.id]["cls"];
				Ext.MessageBox.confirm(m_MESSAGES["SubmitConfirm"]["Title"], m_MESSAGES["SubmitConfirm"]["Message"][l_str_workflowBtn_tooltip], function (p_btn) {
					if (p_btn == "yes") {
						if (m_objWorkFlowConfig.isFuturePlan) {
							//Evaluate Best Practices
							getPricePlanControllerManagerObj().evaluateBestPractices(button, l_str_workflowBtn_tooltip, l_str_workflowBtn_Cls);
						} else {
							if (l_str_workflowBtn_tooltip == "Reject" || l_str_workflowBtn_tooltip == "Recall") {
							//Activate Impact Analysis View................
							if (getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()) {
								VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(true);
								getPricePlanControllerManagerObj().setPricePlanMainView();
							} else {
								//Show Impact comment window
								getObjectFactory().getImpactAnalysisManager().showImpactAnalysisCommentsWindow(button.id, l_str_workflowBtn_tooltip, l_str_workflowBtn_Cls);
							}
						} else {
							//Evaluate Best Practices
							getPricePlanControllerManagerObj().evaluateBestPractices(button, l_str_workflowBtn_tooltip, l_str_workflowBtn_Cls);
							}
						}
					}
				})
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Hide or Show Approval Workflow Button...
	this.hideOrShowApprovalWorkflowButton = function (p_blnHideCnt) {
		if (m_objWorkFlowConfig != undefined) {
			VistaarExtjs.getCmp(m_objWorkFlowConfig.cmpID).setHidden(p_blnHideCnt);
		}
	}

	this.onWorkflowConfirmationCallback = function (p_workFlowBtnId, p_objCommentsInfo) {
		try {
			/*var l_PP_CurrentState = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlanState()
			var l_ObjWorkFlowDetails = getPricePlanControllerManagerObj().getConfigurationWorkFlowAction(l_PP_CurrentState).WorkFlowActionDetails[p_workFlowBtnId];*/

			var l_ObjWorkFlowDetails = m_objWorkFlowConfig.WorkFlowActionDetails[p_workFlowBtnId];
			if (l_ObjWorkFlowDetails != undefined) {
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", l_ObjWorkFlowDetails.msgLoadMask);
				Ext.defer(function () {
					var bln_save_PP_status = {
						"SaveSucceded" : true,
					};

					var autoSavePricePlanCallback = function (bln_save_PP_status) {
						if (bln_save_PP_status.SaveSucceded) {
							//Approval Workflow backend call............
							l_ObjWorkFlowDetails.callBackAPI(l_ObjWorkFlowDetails.workflowAction, p_objCommentsInfo, l_ObjWorkFlowDetails.text);
						} else {
							/** save price Plan failure msg **/
							Ext.MessageBox.show({
								title : bln_save_PP_status.msgTitle,
								msg : bln_save_PP_status.solMessages,
								buttons : Ext.MessageBox.OK,
								icon : Ext.MessageBox.INFO
							});
							getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
						}
					}
					if (getPricePlanControllerManagerObj().isPricePlanDirty()) {
						if (l_ObjWorkFlowDetails.isAutoSaveRequired) {
							/** Save Price Plan before submitting **/
							//bln_save_PP_status = getPricePlanControllerManagerObj().savePricePlan(true);
							getPricePlanControllerManagerObj().savePricePlan(true, autoSavePricePlanCallback);
						} else {
							/** Reset Price Plan for Recall and Reject flow **/
							getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer"); //To compensate default cursor of Call Sort Grids
							getPricePlanControllerManagerObj().getPricePlanUIManager().resetPricePlanOnRecall();
							autoSavePricePlanCallback(bln_save_PP_status);
						}
					} else {
						autoSavePricePlanCallback(bln_save_PP_status);

					}
					/*if (bln_save_PP_status.SaveSucceded) {
					//Approval Workflow backend call............
					l_ObjWorkFlowDetails.callBackAPI(l_ObjWorkFlowDetails.workflowAction, p_objCommentsInfo, l_ObjWorkFlowDetails.text);
					} else {
					// save price Plan failure msg
					Ext.MessageBox.show({
					title : bln_save_PP_status.msgTitle,
					msg : bln_save_PP_status.solMessages,
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.INFO
					});
					getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					}
					 */

				}, 50);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/****Evaluate Best Practices Before Submitting Price Plan and after that show Comments window
	 ***** @return : Redirect to Impact Analysis View
	 ****/
	this.evaluateBestPractices = function (button, p_str_workflow_tooltip, p_str_workflowBtn_Cls) {
		try {

			//Check Best Practices Before Submitting Price Plan...................
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().evalBestPractice();
			var l_blnBestPracticesResult = getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().checkBestPractices();
			//handle best practices script failed issue........
			if (l_blnBestPracticesResult != "error") {
				if (l_blnBestPracticesResult == "HardStop") {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().showOnSubmit();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().setCountOfBestPractice();
					Ext.MessageBox.show({
						title : m_MESSAGES["PP_HardStop"]["Title"],
						msg : m_MESSAGES["PP_HardStop"]["Message"] + p_str_workflow_tooltip.toLowerCase() + ".",
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR,
						fn : function (pBtn) {
							//Focus best Practices window when it is visible.....
							getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().focusBestPracticeWindow();
						}
					});
					getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					//return false;
				} else if (l_blnBestPracticesResult == "SoftStop") {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().showOnSubmit();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().setCountOfBestPractice();
					Ext.MessageBox.confirm(m_MESSAGES["PP_SoftStop"]["Title"], m_MESSAGES["PP_SoftStop"]["Message"] + p_str_workflow_tooltip.toLowerCase() + "?", function (p_btn) {
						if (p_btn == "yes") {
							//Hide Best Practices Window......................
							getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().hide();
							if (m_objWorkFlowConfig.isFuturePlan) {
								getPricePlanControllerManagerObj().onWorkflowConfirmationCallback(button.id, Ext.encode(getPricePlanControllerManagerObj().getFuturePricePlanComments()));
							} else if (getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()) {
								//Activate Impact Analysis View................
								VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(true);
								getPricePlanControllerManagerObj().setPricePlanMainView();
							} else {
								//Show Impact comment window
								getObjectFactory().getImpactAnalysisManager().showImpactAnalysisCommentsWindow(button.id, p_str_workflow_tooltip, p_str_workflowBtn_Cls);
							}
						} else {
							getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
							//Focus best Practices window when it is visible.....
							getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().focusBestPracticeWindow();
							//return false;
						}
					});
				} else {
					//Hide Best Practices Window......................
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().hide();
					if (m_objWorkFlowConfig.isFuturePlan) {
						getPricePlanControllerManagerObj().onWorkflowConfirmationCallback(button.id, Ext.encode(getPricePlanControllerManagerObj().getFuturePricePlanComments()));
					} else if (getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()) {
						//Activate Impact Analysis View................
						VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(true);
						getPricePlanControllerManagerObj().setPricePlanMainView();
					} else {
						//Show Impact comment window
						getObjectFactory().getImpactAnalysisManager().showImpactAnalysisCommentsWindow(button.id, p_str_workflow_tooltip, p_str_workflowBtn_Cls);
					}
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Submit Price Plan API.................................
	this.submitPricePlan = function (p_str_WorkFlowAction, p_objCommentsInfo, p_strWorkflowOperationType) {
		try {
			VistaarAuditingManager.audit({
				"name" : "Start:UI Processing Submit PricePlan"
			}, m_IS_AUDIT_REQUIRED, 532);
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanSystemFields = l_objPricePlan.getPricePlanSystemFields();
			var processInstanceKey = l_objPricePlanSystemFields.WorkFlowProcessInstanceKey;
			var scopedata = l_objPricePlan.getPricePlanFixedAttribute();
			var paramValue = [];
			var l_ScriptInput = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "workflowAction",
				"Input" : {
					"processInstanceKey" : processInstanceKey,
					"WF_Transition" : p_str_WorkFlowAction,
					"Geography Level Code" : scopedata["Geography Level"],
					"Geography Code" : scopedata["Geography Code"],
					"Product Code" : scopedata["Product Code"],
					"Product Level Code" : scopedata["Product Level"],
					"Time Code" : scopedata["Time"],
					"Time Level Code" : scopedata["Time Level"],
					"Comments" : p_objCommentsInfo,
					"Document Id" : l_objPricePlanSystemFields["Document Id"],
					"System Fields" : l_objPricePlanSystemFields,
					"DealContainer_SystemFields" : l_objPricePlan.getDealSystemFields(),
					"link" : window.location.href.split('?')[0]
				}
			};
			//Add Price Plan Data while submitting WIP Plan
			if (l_objPricePlan.getPricePlanState() == "WIP") {
				l_ScriptInput["Input"]["PricePlanData"] = JSON.stringify(l_objPricePlan.getPricePlan());
				l_ScriptInput["Input"]["GuidanceData"] = JSON.stringify(getPricePlanControllerManagerObj().getBestracticeGuidanceData());
			}
			paramValue.push(l_ScriptInput);
			Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', true, getPricePlanControllerManagerObj().submitPricePlanCallBack, p_strWorkflowOperationType);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	this.submitPricePlanCallBack = function (p_ScriptOutput, p_strWorkflowOperationType) {
		try {
			//Submit Price Plan Callback ......................
			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_scriptResponse = Ext.decode(p_ScriptOutput.response);
				if (l_scriptResponse.solStatus.toLowerCase() == "success") {
					//var l_objUserCommentInfo;
					var l_WF_ApprovalLevel;
					var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
					var l_objPricePlanScopeData = l_objPricePlan.getPricePlanFixedAttribute();
					if (l_scriptResponse.solResponse.PricePlan_SystemFields.WorkFlowStatus.indexOf(m_Published_Key) == -1) {
						getPricePlanControllerManagerObj().setSystemFieldsObj(l_scriptResponse.solResponse);
						//Set Approval Workflow UI........
						l_objPricePlan.setWorkflowApprovalLevel(l_scriptResponse.solResponse["ApprovalLevel"]);
						//Load WorkFlow Combo..............
						var p_obj_WorkFlowScriptInput = {
							"Time" : l_objPricePlanScopeData["Time"],
							"Geography Code" : l_objPricePlanScopeData["Geography Code"],
							"Product Code" : l_objPricePlanScopeData["Product Code"]
						};
						getPricePlanControllerManagerObj().fetchWorkflowComboData(p_obj_WorkFlowScriptInput);
						getPricePlanControllerManagerObj().setApprovalWorkflowUI(l_objPricePlan.getPricePlanState());
						/**ET 1242 */
						//Set User comments info in Price Plan Model
						//l_objPricePlan.setWorkflowLevelComments(l_objUserCommentInfo);
						getPricePlanControllerManagerObj().fetchPricePlanWorkflowHistory(l_objPricePlan);
						//l_objUserCommentInfo = l_scriptResponse.solResponse.Comments;
					} else {
						//Copy Proposed to Current
						getPricePlanControllerManagerObj().copyProposedToCurrent(l_scriptResponse.solResponse);
						getPricePlanControllerManagerObj().UpdatePricePlan(l_scriptResponse, true);
						//Fetch Historic Report Data...
						getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(l_objPricePlanScopeData);
						//Set Deal System Fields in Price Structure Model.........
						if (l_scriptResponse.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
							getPriceStructureModelObj().setSystemFieldsObj(l_scriptResponse.solResponse.DealContainer_SystemFields);
						}
						//Call Refresh Deal View API............................
						if (getApplicationTabMgrObj().isPriceStructureTabVisible()) {
							var l_scopeObjDealLine = {
								"ScopeForScript" : {
									"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute()
								}
							};
							var l_Config = {
								"operation" : getGlobalConstantsObj().m_OPRTN_EDIT_DEAL
							};
							getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).refreshDealViewScope(l_scopeObjDealLine, l_Config);
						}
					}
					//Sync Impact Analysis view with latest comments
					getObjectFactory().getImpactAnalysisManager().syncImpactViewWithWorkflow(l_objPricePlan.getWorkflowLevelComments());

					Ext.MessageBox.show({
						title : m_MESSAGES["SubmitPricePlan"]["Title"],
						msg : m_MESSAGES["SubmitPricePlan"]["Message"][p_strWorkflowOperationType],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "End:UI Processing Submit PricePlan"
					}, m_IS_AUDIT_REQUIRED, 532);
				} else {
					//FAILED TO SUBMIT PRICE PLAN ...............
					Ext.MessageBox.show({
						title : 'Information',
						msg : l_scriptResponse.solMessages[0],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				}
			} else {
				//SCRIPT FAILED.....................
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	}

	this.onBtnPricePlanCloseClick = function (button, e, eOpts) {
		//Close Historic View if it is active....
		if (getPricePlanControllerManagerObj().getPricePlanUIManager().isHistoricImpactViewActive()) {
			setWaitCursor("viewContainer", "Closing...");
			Ext.defer(function () {
				getImpactHistoricalManagerObj().closeHistoricImpactView();
				setDefaultCursor();
			}, 100);
		} else {
			if (getPricePlanControllerManagerObj().isPricePlanDirty()) {
				Ext.MessageBox.confirm(m_MESSAGES["Save"]["Title"], m_MESSAGES["Save"]["Message"], getPricePlanControllerManagerObj().PPCloseConfirmationCallback);
			} else {
				Ext.MessageBox.confirm(m_MESSAGES["ClosePP"]["Title"], m_MESSAGES["ClosePP"]["Message"], getPricePlanControllerManagerObj().PPCloseConfirmationCallback);
			}
		}

	}

	this.PPCloseConfirmationCallback = function (p_btn) {
		if (p_btn == "yes") {
			getPricePlanControllerManagerObj().getPricePlanUIManager().compactView(false);
			getObjectFactory().getApplicationTabManager().destroyApplicationTab();
			VistaarExtjs.getCmp("btnToolbarHome").toggle(true);
			getObjectFactory().getToolbarManager().btnToolbarHome_Click();
			getPricePlanControllerManagerObj().clearPricePlanDataRecords();

		}

	}

	//Price Plan Delete Button Callback.......................
	this.onBtnPricePlanDelete_click = function (button, e, eOpts) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objScopeData = {
				"Fixed Attributes" : l_objPricePlan.getPricePlanFixedAttribute(),
				"DealContainer_SystemFields" : l_objPricePlan.getDealSystemFields(),
				"PricePlan_SystemFields" : l_objPricePlan.getPricePlanSystemFields()
			};

			Ext.MessageBox.confirm(m_MESSAGES["Delete"]["Title"], m_MESSAGES["Delete"]["Message"], function (p_btn) {
				if (p_btn == "yes") {
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", "Deleting...");
					Ext.defer(function () {
						VistaarAuditingManager.audit({
							"name" : "Start:UI Processing Delete PricePlan"
						}, m_IS_AUDIT_REQUIRED, 530);
						getPricePlanControllerManagerObj().deletePricePlan(l_objScopeData);
					}, 100);
				}
			});
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Delete Price Plan API...................
	this.deletePricePlan = function (p_objScopeData) {
		var paramValue = [];

		var inputParamValueObject = {
			"ModuleName" : "VolumePlanner",
			"Operation" : "deletePP",
			"Input" : {
				"ScopeData" : p_objScopeData
			}
		};
		paramValue.push(inputParamValueObject);
		Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', true, this.deletePricePlanCallback);
	}

	//Delete Price Plan Script Callback..............
	this.deletePricePlanCallback = function (p_ScriptOutput) {
		try {

			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(p_ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					//Remove Comments for Published plan.....
					l_output.solResponse.AdditionalInfo.WF_Comment = "";
					//Render Last Published Or FL Price Plan .............
					getPricePlanControllerManagerObj().UpdatePricePlan(l_output, true);
					//Sync Impact Analysis view with latest comments
					getObjectFactory().getImpactAnalysisManager().syncImpactViewWithWorkflow(getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getWorkflowLevelComments());
					//DESTROY PS MODEL AND HIDE PS and Historic Impact TAB....................
					getApplicationTabMgrObj().disablePriceStructure();
					getApplicationTabMgrObj().disableHistoricImpactView();
					//Fetch Historic Report Data...
					getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(l_output.solResponse.Scope);
					//console.log(" Price Plan Deleted successfully ");
					Ext.MessageBox.show({
						title : m_MESSAGES["DeletePricePlan"]["Title"],
						msg : m_MESSAGES["DeletePricePlan"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFORMATIONAL
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "End:UI Processing Delete PricePlan"
					}, m_IS_AUDIT_REQUIRED, 530);
				} else {
					//FAILED TO DELETE PRICE PLAN ...............
					Ext.MessageBox.show({
						title : 'Information',
						msg : l_output.solMessages[0],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				}
			} else {
				//SCRIPT FAILED.....................

				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],

					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {

			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	//Update PG_Qualifier data in Price Plan Clone Copy.......
	this.updatePG_Qualifier_From_PGCalculator = function (p_str_PG_ChannelType, p_value_PG_Qualifier) {
		try {
			if (m_ActivePricePlanID != null) {
				var PG_Key = {
					"ON" : "PG_ON",
					"OFF" : "PG_OFF"
				};
				var l_objPricePlanCloneCopy = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlanCloneData();
				l_objPricePlanCloneCopy[PG_Key[p_str_PG_ChannelType]]["Qualifier_Proposed"][0]["Qualifier"] = p_value_PG_Qualifier;
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	//Reset Price Plan data............................
	this.resetPricePlanData = function (p_channelType) {

		/** Imple. multi channels reset operation**/
		var l_arrChannels = [];
		var l_objPricePlan = this.getPricePlanObject(m_ActivePricePlanID);
		var l_PricePlanData = l_objPricePlan.resetPricePlanData(p_channelType);
		var l_objEditRecord = l_objPricePlan.getEditedRecord();
		if (p_channelType == undefined) {
			l_arrChannels = ["ON", "OFF"];
		} else {
			l_arrChannels = [p_channelType];
		}
		for (var l_channelIndex in l_arrChannels) {
			//Remove all the data from updated list of Price Plan ........................
			for (var key = 0; key < l_objEditRecord.length; key++) {
				if (l_objEditRecord[key]["Variable Attributes"].Channels === l_arrChannels[l_channelIndex]) {
					l_objEditRecord.splice(key, 1);
					key--;
				}
			}
			//Remove All the Edited Cell Info from the Stack.............
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().removeEditedCellInfoData("Channel", l_arrChannels[l_channelIndex]);

			if (l_arrChannels[l_channelIndex] != undefined) {
				this.handleDeletedDealsonResetClick(l_arrChannels[l_channelIndex]);
			}
		}
		return l_PricePlanData;
	}

	this.handleDeletedDealsonResetClick = function (pChannel) {
		//getDeleleted deal array
		var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
		var l_deletDealArr = l_objPricePlan.getPricePlanUpdatedRecord().DealsToBeDeleted;
		var l_deleteDealInfo = l_objPricePlan.getDeletedDealAdditionalInfo();
		var l_dealsTobeRevoked = [];

		if (Object.getOwnPropertyNames(l_deletDealArr).length > 0) {
			var l_objPricePlanData = l_objPricePlan.getPricePlan();
			var l_objPPOnProposed = l_objPricePlanData.ON.Proposed.children;
			var l_objPPOffProposed = l_objPricePlanData.OFF.Proposed.children;

			var l_objPricePlanClonedData = JSON.parse(JSON.stringify(l_objPricePlan.getPricePlanCloneData()));
			var l_objPPOnClonedProposed = l_objPricePlanClonedData.ON.Proposed.children;
			var l_objPPOffClonedProposed = l_objPricePlanClonedData.OFF.Proposed.children;

			var OffProObj = Ext.getCmp("TG_OffPremisesProposed").TGObj;
			var Store_OffPro = OffProObj.getStore();
			var offproposed = Store_OffPro.data;

			var OnProObj = Ext.getCmp("TG_OnPremisesProposed").TGObj;
			var Store_OnPro = OnProObj.getStore();
			var onproposed = Store_OnPro.data;

			if (pChannel == "ON") {
				for (var l_deletedDeal in l_deletDealArr) {
					for (var l_records in l_objPPOnClonedProposed) {
						if (l_objPPOnClonedProposed[l_records].hasOwnProperty("DealID")) {
							if (l_objPPOnClonedProposed[l_records]["DealID"] == l_deletedDeal) {
								l_dealsTobeRevoked.push(l_deletedDeal);
								delete l_deletDealArr[l_deletedDeal];
							}
						}
					}
				}
				for (var l_deletedDeal in l_deleteDealInfo) {
					for (var l_records in l_objPPOnClonedProposed) {
						if (l_objPPOnClonedProposed[l_records].hasOwnProperty("DealID")) {
							if (l_objPPOnClonedProposed[l_records]["DealID"] == l_deletedDeal) {

								delete l_deleteDealInfo[l_deletedDeal];
							}
						}
					}
				}
				this.dealToRevoke(l_dealsTobeRevoked, "OFF");
			}

			if (pChannel == "OFF") {
				for (var l_deletedDeal in l_deletDealArr) {
					for (var l_records in l_objPPOffClonedProposed) {
						if (l_objPPOffClonedProposed[l_records].hasOwnProperty("DealID")) {
							if (l_objPPOffClonedProposed[l_records]["DealID"] == l_deletedDeal) {
								l_dealsTobeRevoked.push(l_deletedDeal);
								delete l_deletDealArr[l_deletedDeal];
							}
						}
					}
				}
				for (var l_deletedDeal in l_deleteDealInfo) {
					for (var l_records in l_objPPOffClonedProposed) {
						if (l_objPPOffClonedProposed[l_records].hasOwnProperty("DealID")) {
							if (l_objPPOffClonedProposed[l_records]["DealID"] == l_deletedDeal) {

								delete l_deleteDealInfo[l_deletedDeal];
							}
						}
					}
				}

				this.dealToRevoke(l_dealsTobeRevoked, "ON");

			}
		}

	}

	this.dealToRevoke = function (pDealToRevoke, pChannel) {
		/* var l_TGGRIDID = {
		"ON" : {
		"Current" : "TG_OnPremisesCurrent",
		"Proposed" : "TG_OnPremisesProposed"
		},
		"OFF" : {
		"Current" : "TG_OffPremisesCurrent",
		"Proposed" : "TG_OffPremisesProposed"
		}
		};
		var l_Sections = ["Current", "Proposed"];
		 */
		var l_TGGRIDID = {
			"ON" : {
				"Proposed" : "TG_OnPremisesProposed"
			},
			"OFF" : {
				"Proposed" : "TG_OffPremisesProposed"
			}
		};
		var l_Sections = ["Proposed"];

		for (var l_section in l_Sections) {

			var l_objTG = Ext.getCmp(l_TGGRIDID[pChannel][l_Sections[l_section]]).TGObj;
			var l_storeTG = l_objTG.getStore();

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);

			var l_objPricePlanData = l_objPricePlan.getPricePlan();
			var l_objPPProposed = l_objPricePlanData[pChannel][l_Sections[l_section]].children;

			var l_objPricePlanClonedData = JSON.parse(JSON.stringify(l_objPricePlan.getPricePlanCloneData()));
			var l_objPPClonedPro = JSON.parse(JSON.stringify(l_objPricePlanClonedData[pChannel][l_Sections[l_section]].children));

			for (var l_dealToRevoke in pDealToRevoke) {
				var l_OffPremisesRecord = l_storeTG.findRecord("DealID", pDealToRevoke[l_dealToRevoke]);
				if (l_OffPremisesRecord != null) {
					l_OffPremisesRecord.remove();
				}
				for (var l_records in l_objPPProposed) {
					if (l_objPPProposed[l_records].hasOwnProperty("DealID")) {
						if (l_objPPProposed[l_records]["DealID"] == pDealToRevoke[l_dealToRevoke]) {
							l_objPPProposed.splice(l_records, 1);

						}
					}
				}

			}
			for (var l_dealToRevoke in pDealToRevoke) {
				for (var l_records in l_objPPClonedPro) {
					if (l_objPPClonedPro[l_records].hasOwnProperty("DealID")) {
						if (l_objPPClonedPro[l_records]["DealID"] == pDealToRevoke[l_dealToRevoke]) {
							l_objPPProposed.splice(2, 0, JSON.parse(JSON.stringify(l_objPPClonedPro[l_records])));
							var l_rootnode = l_storeTG.getRootNode();
							l_rootnode.insertChild(2, JSON.parse(JSON.stringify(l_objPPClonedPro[l_records])));
							break;

						}

					}
				}

			}

			l_objTG.view.refresh();
		}

	}

	//PERFORM DEAL LEVEL OPERATIONS
	this.DealOperations = function (pConfig, pOperation) {
		try {
			switch (pOperation) {
			case "deleteContextClick": {
					getPricePlanControllerManagerObj().deleteDealContextClick(pConfig)
					break;
				}
			case "editContextClick": {
					getPricePlanControllerManagerObj().editDealContextClick(pConfig)
					break;
				}
			case "openPSViewContextClick": {
					getPricePlanControllerManagerObj().openPSViewContextClick(pConfig)
					break;
				}
			case "addContextClick": {
					getPricePlanControllerManagerObj().addDealContextClick(pConfig)
					break;
				}
			case "cloneContextClick": {
					getPricePlanControllerManagerObj().cloneDealContextClick(pConfig)
					break;
				}
			case "edit": {

					Ext.defer(function () {
						getPricePlanControllerManagerObj().UpdatePricePlanDataFromDealLine(pConfig)
					}, 50);

					break;
				}
			case "new": {
					Ext.defer(function () {
						getPricePlanControllerManagerObj().PPAddDeal(pConfig)
					}, 50);

					break;
				}
			case "clone": {
					Ext.defer(function () {
						getPricePlanControllerManagerObj().PPcloneDeal(pConfig)
					}, 50);

					break;
				}
			case getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL: {
					getPricePlanControllerManagerObj().NewPricePlan(pConfig)
					break;
				}
			case getGlobalConstantsObj().m_OPRTN_NEW_DEAL_PUBLISHEDPP: {
					getPricePlanControllerManagerObj().Recreate_WIP_PP();
					break;
				}
			case getGlobalConstantsObj().m_OPRTN_EDIT_DEAL_PUBLISHEDPP: {
					getPricePlanControllerManagerObj().Recreate_WIP_PP();
					break;
				}
			case getGlobalConstantsObj().m_OPRTN_CLONE_DEAL_PUBLISHEDPP: {
					getPricePlanControllerManagerObj().Recreate_WIP_PP();
					break;
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.Recreate_WIP_PP = function () {
		try {
			//delete existing pp from model
			for (var l_ObjPricePlan in m_PricePlan) {
				if (m_PricePlan[l_ObjPricePlan].getPricePlanId() === m_ActivePricePlanID) {
					m_PricePlan.splice(l_ObjPricePlan, 1);
				}
			}
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor('cntPricePlanMain', "Creating WIP Plan...");

			//call refresh
			Ext.defer(function () {
				/** Performance Enhancement***/
				//this.refreshPricePlanScreen(getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPricePlanScopeData(), getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getScopeDataKey());
				getPricePlanControllerManagerObj().callSyncOpenPPScript(getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPPCombineScriptScopeData(), getPricePlanControllerManagerObj().refreshPricePlanScreen, false);
			}, 100, this);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	//EDIT DEAL CONTEXT  CLICK
	this.editDealContextClick = function (pConfig) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var blnIsFrontline = l_objPricePlan.isFrontLinePP();
			if (l_objPricePlan.isHistoricPricePlan()) {
				var l_Operation = getGlobalConstantsObj().m_OPRTN_OPEN_HISTORIC_DEAL;
				getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);
			} else if (!blnIsFrontline) {
				m_Config = pConfig;
				var l_deletedTime = pConfig.RecordSelected.data["Deleted Time"]
					var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(pConfig.MonthSelected);
				if (pConfig.RecordSelected.data["Deleted Deal"] && l_deletedTime != "") {
					if (pConfig.MonthSelected >= (m_arrMonths.indexOf(l_deletedTime) + 1)) {
						Ext.MessageBox.confirm(m_MESSAGES["Re-activate Deal"]["Title"], m_MESSAGES["Re-activate Deal"]["Message"], function (btn, pConfig) {
							if (btn == "yes") {
								getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", "Re-Activating Deal...");
								Ext.defer(function () {
									getPricePlanControllerManagerObj().ReActivateDealConfirmaton(m_Config);
								}, 500);
							}
						});
					} else {
						var l_Operation = "edit";
						getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);

					}

				} else {
					var l_Operation = "edit";
					getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);

				}
			} else {
				var l_Operation = getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL;
				//pConfig.RecordSelected.data.DealID = "FirstDeal";
				getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	//OPEN PS VIEW  CONTEXT  CLICK
	this.openPSViewContextClick = function (pConfig) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var blnIsFrontline = l_objPricePlan.isFrontLinePP();
			if (l_objPricePlan.isHistoricPricePlan()) {
				var l_Operation = getGlobalConstantsObj().m_OPRTN_OPEN_HISTORIC_DEAL;
				getPricePlanControllerManagerObj().openPSViewContextClickCallBack(pConfig, l_Operation);
			} else if (!blnIsFrontline) {
				m_Config = pConfig;
				var l_deletedTime = pConfig.RecordSelected.data["Deleted Time"]
					var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(pConfig.MonthSelected);
				if (pConfig.RecordSelected.data["Deleted Deal"] && l_deletedTime != "") {
					if (pConfig.MonthSelected >= (m_arrMonths.indexOf(l_deletedTime) + 1)) {
						Ext.MessageBox.confirm(m_MESSAGES["Re-activate Deal"]["Title"], m_MESSAGES["Re-activate Deal"]["Message"], function (btn, pConfig) {
							if (btn == "yes") {
								getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", "Re-Activating Deal...");
								Ext.defer(function () {
									getPricePlanControllerManagerObj().ReActivateDealConfirmaton(m_Config);
								}, 500);
							}
						});
					} else {
						var l_Operation = "edit";
						getPricePlanControllerManagerObj().openPSViewContextClickCallBack(pConfig, l_Operation);

					}

				} else {
					var l_Operation = "edit";
					getPricePlanControllerManagerObj().openPSViewContextClickCallBack(pConfig, l_Operation);

				}
			}
			/* else {
			var l_Operation = getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL;
			//pConfig.RecordSelected.data.DealID = "FirstDeal";
			getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);
			} */
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.ReActivateDealConfirmaton = function (pConfig) {
		try {

			var l_Channels = ["ON", "OFF"];
			/* var l_Sections = ["Current", "Proposed"];
			var l_TGGRIDID = {
			"ON" : {
			"Current" : "TG_OnPremisesCurrent",
			"Proposed" : "TG_OnPremisesProposed"
			},
			"OFF" : {
			"Current" : "TG_OffPremisesCurrent",
			"Proposed" : "TG_OffPremisesProposed"
			}
			}; */

			var l_Sections = ["Proposed"];
			var l_TGGRIDID = {
				"ON" : {

					"Proposed" : "TG_OnPremisesProposed"
				},
				"OFF" : {

					"Proposed" : "TG_OffPremisesProposed"
				}
			};
			var l_selectedRecord = pConfig.RecordSelected;
			var l_intDeleteFromMonth = pConfig.MonthSelected;

			var p_objPricePlanScopeData = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPricePlanScopeData();

			//GET TIME MEMBER CODE FOR MONTH SELECTED(DEACTIVATE DEAL FROM MONTH)
			var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(l_intDeleteFromMonth);

			var l_deletedDealObj = {};
			var blnDealIdFound = false;
			var blnDealDeletedLastPublished = false;

			//GET PRICEPLAN Actual copy OBJECT
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();

			//GET PRICEPLAN CLONED OBJECT
			var l_objPricePlanClonedData = l_objPricePlan.getPricePlanCloneData();
			var l_objPPOnClonedProposed = l_objPricePlanClonedData.ON.Proposed.children;
			var l_objPPOffClonedProposed = l_objPricePlanClonedData.OFF.Proposed.children;

			//GetDeals which user want to delete
			var l_deletDealArr = l_objPricePlan.getPricePlanUpdatedRecord().DealsToBeDeleted;

			//GET MONTH SELECTED (STRING) (DEACTIVATE DEL FROM MONTH)
			var l_strdeActivatmonth = m_arrMonths[l_intDeleteFromMonth - 1];

			//GET USER EDITED INFORMATION(ARRAY)
			var p_arrEditedRecord = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getEditedData();

			//FIND RECORD IN DELETE DEAL ARRAY
			for (var l_deletedDeal in l_deletDealArr) {
				if (l_deletedDeal == l_selectedRecord.data.DealID) {
					delete l_deletDealArr[l_deletedDeal];
					blnDealIdFound = true;
				}
			}

			//Check if deal was deactivated in last published
			for (var l_record in l_objPPOnClonedProposed) {
				if (l_objPPOnClonedProposed[l_record].DealID != undefined) {
					if (l_objPPOnClonedProposed[l_record].DealID == l_selectedRecord.data.DealID) {
						if (l_objPPOnClonedProposed[l_record]["Deleted Deal"] == true) {
							blnDealDeletedLastPublished = true;
							break;
						}
					}
				}
			}

			//Check if deal was deactivated in last published
			for (var l_record in l_objPPOffClonedProposed) {
				if (l_objPPOffClonedProposed[l_record].DealID != undefined) {
					if (l_objPPOffClonedProposed[l_record].DealID == l_selectedRecord.data.DealID) {
						if (l_objPPOffClonedProposed[l_record]["Deleted Deal"] == true) {
							blnDealDeletedLastPublished = true;
							break;
						}
					}
				}
			}

			if (blnDealDeletedLastPublished) { //CALL BACK END
				//CHECK IF PRICE PLAN IS WIP OR PUBLISHED
				var l_autoSaveResponse = {};

				var autoSavePricePlanCallback = function (l_autoSaveResponse) {
					if (l_autoSaveResponse.SaveSucceded) {
						//GET PRICEPLAN Actual copy OBJECT
						var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
						var l_objPricePlanData = l_objPricePlan.getPricePlan();
						var l_scriptResponse;
						var l_ScriptInput;
						l_deletedDealObj[l_selectedRecord.data.DealID] = l_timeMemberCode;
						var paramValue = [];
						l_ScriptInput = {
							"ModuleName" : "VolumePlanner",
							"Operation" : "reActivateDeal",
							"Input" : {
								"ScopeData" : {
									"Fixed Attributes" : l_objPricePlan.getPricePlanFixedAttribute(),
									"DealsToBeActivated" : l_deletedDealObj,
									"DealContainer_SystemFields" : l_objPricePlan.getDealSystemFields()
								}
							}
						};

						VistaarAuditingManager.audit({
							"name" : "Start:ScriptCall Delete Deal"
						}, m_IS_AUDIT_REQUIRED, 522);
						paramValue.push(l_ScriptInput);
						var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', false);
						VistaarAuditingManager.audit({
							"name" : "End:ScriptCall Delete Deal"
						}, m_IS_AUDIT_REQUIRED, 522);
						if (ScriptOutput.status.toLowerCase() == "success") {
							var l_output = Ext.decode(ScriptOutput.response);
							if (l_output.solStatus.toLowerCase() == "success") {
								if (l_output.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
									l_objPricePlan.setPricePlanSystemFields(l_output.solResponse.PricePlan_SystemFields);
								}

								//set System fields and scope
								//getPricePlanControllerManagerObj().setSystemFieldsObj(l_output.solResponse);

								if (l_output.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
									l_objPricePlan.setDealSystemFields(l_output.solResponse.DealContainer_SystemFields);
									getPriceStructureModelObj().setSystemFieldsObj(l_output.solResponse.DealContainer_SystemFields);
								}

								l_scriptResponse = l_output.solResponse;
								console.log("output=============== ");
								console.log(l_scriptResponse);
								console.log("output================");

								//REMOVE GREY OUT
								for (var l_channel in l_Channels) {
									for (var l_section in l_Sections) {
										//REMOVE GRAY OUT FORM DATA ACTUAL COPY
										var l_objData = l_objPricePlanData[l_Channels[l_channel]][l_Sections[l_section]].children;
										for (var l_record in l_objData) {
											if (l_objData[l_record].DealID != undefined) {
												if (l_objData[l_record].DealID == l_selectedRecord.data.DealID) {
													for (var l_fact in l_objData[l_record].children) {
														l_objData[l_record].children[l_fact]["Deleted Time"] = "";
													}

													l_objData[l_record]["Deleted Time"] = "";
													l_objData[l_record]["Deleted Deal"] = false;

													break;
												}
											}
										}

										//REMOVE GRAY OUT FORM DATA CLONE COPY
										var l_objDataClone = l_objPricePlanClonedData[l_Channels[l_channel]][l_Sections[l_section]].children;
										for (var l_record in l_objDataClone) {
											if (l_objDataClone[l_record].DealID != undefined) {
												if (l_objDataClone[l_record].DealID == l_selectedRecord.data.DealID) {
													for (var l_fact in l_objDataClone[l_record].children) {
														l_objDataClone[l_record].children[l_fact]["Deleted Time"] = "";
													}

													l_objDataClone[l_record]["Deleted Time"] = "";
													l_objDataClone[l_record]["Deleted Deal"] = false;

													break;
												}
											}
										}
										Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj.view.refresh();
									}

								}
								getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

								var l_Operation = "edit";
								getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);

							} else {
								//FAILED TO SAVE PRICE PLAN DATA...............
								Ext.MessageBox.show({
									title : 'Information',
									msg : l_output.solMessages[0],
									buttons : Ext.MessageBox.OK,
									icon : Ext.MessageBox.INFO
								});
								getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

							}

						} else {
							//SCRIPT FAILED.....................
							Ext.MessageBox.show({
								title : m_MESSAGES["Script Failure"]["Title"],
								msg : m_MESSAGES["Script Failure"]["Message"],
								buttons : Ext.MessageBox.OK,
								icon : Ext.MessageBox.ERROR
							});
							getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
						}
					} else {
						Ext.MessageBox.show({
							title : l_autoSaveResponse.msgTitle,
							msg : l_autoSaveResponse.solMessages,
							buttons : Ext.MessageBox.OK,
							icon : Ext.MessageBox.ERROR
						});
						getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					}
				}
				if (l_objPricePlan.getPricePlanSystemFields().WorkFlowStatus.indexOf(m_Published_Key) != -1) {
					l_autoSaveResponse = getPricePlanControllerManagerObj().savePricePlan(true, autoSavePricePlanCallback);
				} else {
					l_autoSaveResponse["SaveSucceded"] = true;
					autoSavePricePlanCallback(l_autoSaveResponse);
				}
			} else {

				//REMOVE GREY OUT
				//CLEAR DATA FOR DEAL TO BE DEACTIVATED  FROM ONPREMISES PROPOSED SECTION(ACTUAL COPY)
				var l_blnDealFoundInON = false;
				var l_blnDealFoundInOFF = false;

				//REMOVE GREY OUT
				for (var l_channel in l_Channels) {
					for (l_section in l_Sections) {
						var l_objData = l_objPricePlanData[l_Channels[l_channel]][l_Sections[l_section]].children;
						var l_objPPClonedCopyData = JSON.parse(JSON.stringify(l_objPricePlanClonedData[l_Channels[l_channel]][l_Sections[l_section]].children));
						for (var l_record in l_objData) {
							if (l_objData[l_record].DealID != undefined) {
								if (l_objData[l_record].DealID == l_selectedRecord.data.DealID) {
									for (var l_fact in l_objData[l_record].children) {
										l_objData[l_record].children[l_fact]["Deleted Time"] = "";
									}
									l_blnDealFoundInON = true;
									var l_getValuesFomMonth = Ext.clone(l_objData[l_record]["Deleted Time"]);
									l_objData[l_record]["Deleted Time"] = "";
									l_objData[l_record]["Deleted Deal"] = false;

									//copy back data form clone copy in  deal which was reactivated
									for (var l_recordCloneCopy in l_objPPClonedCopyData) {
										if (l_objPPClonedCopyData[l_recordCloneCopy].DealID != undefined) {
											if (l_objPPClonedCopyData[l_recordCloneCopy].DealID == l_objData[l_record].DealID) {
												for (var l_fields in l_objPPClonedCopyData[l_recordCloneCopy]) {
													if (m_arrMonths.indexOf(l_fields) != -1) {
														if (m_arrMonths.indexOf(l_fields) >= m_arrMonths.indexOf(l_getValuesFomMonth))
															l_objData[l_record][l_fields] = l_objPPClonedCopyData[l_recordCloneCopy][l_fields];
													}

												}
												break;
											}
										}
									}

									break;
								}
							}
						}
						//refresh grid
						Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj.view.refresh();
					}

				}

				//reCalculate data
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				var l_Operation = "edit";
				getPricePlanControllerManagerObj().openDealPanelOnEditContextClick(pConfig, l_Operation);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.openDealPanelOnEditContextClick = function (pConfig, pOperation) {
		try {

			var l_channel = pConfig.Channel;
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (pOperation == "edit") {
				var l_Config = {
					"operation" : "edit"
				};
				//ET#185
				if (pConfig.hasOwnProperty("SelectedFactCode")) {
					l_Config["SelectedFactCode"] = pConfig["SelectedFactCode"];
				}
			} else if (pOperation == getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL) {
				var l_Config = {
					"operation" : getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL
				};
				/*var l_objPricePlanData = l_objPricePlan.getPricePlan();
				var l_objPPOnProposed = l_objPricePlanData.ON.Proposed.children;
				var l_objPPOffProposed = l_objPricePlanData.OFF.Proposed.children;
				for (var l_records in l_objPPOnProposed) {
				if (l_objPPOnProposed[l_records].MetricsType != "Volume" && l_objPPOnProposed[l_records].MetricsType != "Business") {
				l_objPPOnProposed[l_records].DealID = "FirstDeal";
				}
				}
				for (var l_records in l_objPPOffProposed) {
				if (l_objPPOffProposed[l_records].MetricsType != "Volume" && l_objPPOffProposed[l_records].MetricsType != "Business") {
				l_objPPOffProposed[l_records].DealID = "FirstDeal";
				}
				}

				//Refresh Grid
				var l_objOnPro = Ext.getCmp("TG_OnPremisesProposed").TGObj;
				l_objOnPro.view.refresh();

				//RefreshGrid
				var l_objOffPro = Ext.getCmp("TG_OffPremisesProposed").TGObj;
				l_objOffPro.view.refresh();
				 */
				//to get time member code as 01
				//pConfig.MonthSelected = 1;
			} else if (pOperation == getGlobalConstantsObj().m_OPRTN_OPEN_HISTORIC_DEAL) {
				var l_Config = {
					"operation" : getGlobalConstantsObj().m_OPRTN_OPEN_HISTORIC_DEAL
				};
			}

			var l_scopeObj = {};

			var l_DealScope = {};

			var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(pConfig.MonthSelected);

			l_scopeObj = {
				"ScopeForScript" : {
					"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute(),
					"DealScope" : {
						"TimeMemberCode" : l_timeMemberCode
					}
				},
				"SelectedDeal" : {
					"DealID" : (l_Config.operation == getGlobalConstantsObj().m_OPRTN_NEWFIRST_DEAL) ? "" : pConfig.RecordSelected.data.DealID,
					"TimeMemberCode" : l_timeMemberCode,
					"Channel" : l_channel
				}

			};

			l_Config.closeCallback = this.closeDealPanelCallback;
			getObjectFactory().getDealPanelManager(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).loadDealViewWithScope(l_scopeObj, l_Config);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Open PS Callback ....
	this.openPSViewContextClickCallBack = function (pConfig, pOperation) {
		try {

			var l_channel = pConfig.Channel;
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_Config = {
				"operation" : pOperation
			};
			var l_scopeObj = {};
			var l_DealScope = {};
			var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(pConfig.MonthSelected);

			l_scopeObj = {
				"ScopeForScript" : {
					"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute(),
					"DealScope" : {
						"TimeMemberCode" : l_timeMemberCode
					}
				},
				"SelectedDeal" : {
					"DealID" : pConfig.RecordSelected.data.DealID,
					"TimeMemberCode" : l_timeMemberCode,
					"Channel" : l_channel
				}

			};
			getDealPanelMgrObj("DealView").loadPSViewWithScope(l_scopeObj, l_Config);
			/* getObjectFactory().getDealPanelManager(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).loadDealViewWithScope(l_scopeObj, l_Config); */
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//ADD DEAL CONTEXT  CLICK
	this.addDealContextClick = function (pConfig) {
		try {
			//Call Deal View API to Add NEW Price Plan......................

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);

			var l_scopeObjDealLine = {
				"ScopeForScript" : {
					"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute(),
					"DealScope" : {
						"TimeMemberCode" : pConfig.timeMemberCode
					}

				},
				"SelectedDeal" : {
					"DealID" : "",
					"TimeMemberCode" : pConfig.timeMemberCode
				}

			};
			/*var l_Config = {
			"operation" : "new",
			"channel" : pConfig.Channel
			}*/
			var l_Config = {
				"operation" : "new",
				"Channel" : pConfig.Channel,
				"PricePlan" : {}
			};

			l_Config.closeCallback = this.closeDealPanelCallback;
			getDealPanelMgrObj(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).loadDealViewWithScope(l_scopeObjDealLine, l_Config)

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//CLONE DEAL CONTEXT  CLICK
	this.cloneDealContextClick = function (pConfig) {
		try {
			var l_scopeObj = {};
			var l_dealIDSelectedDeal = pConfig.DealSelected.data["DealID"];
			var l_channel = pConfig.Channel;
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);

			var OffProObj = Ext.getCmp("TG_OffPremisesProposed");
			var Store_OffPro = OffProObj.TGObj.getStore();
			var offproposed = Store_OffPro.data;

			var OnProObj = Ext.getCmp("TG_OnPremisesProposed");
			var Store_OnPro = OnProObj.TGObj.getStore();
			var onproposed = Store_OnPro.data;

			var l_DealScope = {};
			var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(pConfig.MonthSelected);

			l_scopeObj = {
				"ScopeForScript" : {
					"ScopeData" : l_objPricePlan.getPricePlanFixedAttribute(),
					"DealScope" : {
						"TimeMemberCode" : l_timeMemberCode
					}
				},
				"SelectedDeal" : {
					"DealID" : l_dealIDSelectedDeal,
					"TimeMemberCode" : l_timeMemberCode,
					"Channel" : l_channel
				}

			};
			var l_Config = {
				"operation" : "clone",
				"PricePlan" : {
					"Fixed Attributes" : l_objPricePlan.getPricePlanFixedAttribute()
					//"VariableAttributesAndValues" : getPricePlanControllerManagerObj().getVariableAttributesAndvalues(l_dealIDSelectedDeal, l_channel, pConfig.MonthSelected)

				}
			};

			l_Config.closeCallback = this.closeDealPanelCallback;
			getObjectFactory().getDealPanelManager(getObjectFactory().getGlobalConstants().DEALPANEL_UNIQUEID).loadDealViewWithScope(l_scopeObj, l_Config);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.getVariableAttributesAndvalues = function (pDealId, pstrChannel, pMonthSelected) {
		try {
			var l_variableVariableAttributesAndvalues = [];
			var l_value = {};
			var l_variableAttributes = {};

			var OffProObj = Ext.getCmp("TG_OffPremisesProposed");
			var Store_OffPro = OffProObj.TGObj.getStore();
			var offproposed = Store_OffPro.data;

			var OnProObj = Ext.getCmp("TG_OnPremisesProposed");
			var Store_OnPro = OnProObj.TGObj.getStore();
			var onproposed = Store_OnPro.data;

			var l_recordOffPro = offproposed.find("DealID", pDealId);
			var l_recordOnPro = onproposed.find("DealID", pDealId);
			var l_recordToClone;

			if (pstrChannel == "ON") {
				l_recordToClone = l_recordOnPro;
			} else if (pstrChannel == "OFF") {
				l_recordToClone = l_recordOffPro;
			}

			if (l_recordToClone != null) {
				l_variableAttributes = {};
				l_value = {};
				l_variableAttributes["Sizes"] = Ext.getCmp("cmbIdPricingGroup").getValue();
				l_variableAttributes["Channels"] = pstrChannel;
				l_variableAttributes["DealID"] = "";
				l_variableAttributes["Version"] = "Proposed"

					for (var l_field in l_recordToClone.data) {
						for (var l_month in m_arrMonths)
							if (l_month >= pMonthSelected - 1) {
								if (m_arrMonths[l_month] == l_field) {
									l_value[m_arrMonths[l_month]] = l_recordToClone.data[l_field];
									break;
								}
							}
					}

					l_variableVariableAttributesAndvalues.push({
						"Variable Attributes" : JSON.parse(JSON.stringify(l_variableAttributes)),
						"Values" : l_value
					});
			}

			if (pstrChannel == "ON") {
				l_variableAttributes["Channels"] = "OFF";
				l_variableVariableAttributesAndvalues.push({
					"Variable Attributes" : l_variableAttributes,
					"Values" : l_value
				});
			} else if (pstrChannel == "OFF") {
				l_variableAttributes["Channels"] = "ON";
				l_variableVariableAttributesAndvalues.push({
					"Variable Attributes" : l_variableAttributes,
					"Values" : l_value
				});
			}

			return l_variableVariableAttributesAndvalues;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//DELETE DEAL
	this.deleteDealContextClick = function (pConfig) {
		try {
			var l_selectedRecord = pConfig.RecordSelected;
			var l_intDeleteFromMonth = pConfig.MonthSelected;

			//GET TIME MEMBER CODE FOR MONTH SELECTED(DEACTIVATE DEAL FROM MONTH)
			var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(l_intDeleteFromMonth);
			var l_deletedDealObj = {};

			//GETPRICEPLAN OBJECT
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();

			//GET USER EDITED INFORMATION(ARRAY)
			var p_arrEditedRecord = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getEditedData();

			l_deletedDealObj[l_selectedRecord.data.DealID] = l_timeMemberCode;

			//CALL BACK END
			var l_scriptResponse;
			var l_ScriptInput;
			var paramValue = [];
			l_ScriptInput = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "deleteDealOrDeactivate",
				"Input" : {
					"ScopeData" : {
						"Fixed Attributes" : l_objPricePlan.getPricePlanFixedAttribute(),
						"DealsToBeDeleted" : l_deletedDealObj
					}
				}
			};

			VistaarAuditingManager.audit({
				"name" : "Start:ScriptCall Delete Deal"
			}, m_IS_AUDIT_REQUIRED, 523);
			paramValue.push(l_ScriptInput);
			var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('DV_EntryPoint', ["inputJSON"], paramValue, '', false);
			VistaarAuditingManager.audit({
				"name" : "End:ScriptCall Delete Deal"
			}, m_IS_AUDIT_REQUIRED, 523);
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					//SET THE PRICE PLAN DATA IN THE MODEL
					l_scriptResponse = l_output.solResponse;
					console.log("output=============== ");
					console.log(l_scriptResponse);
					console.log("output================");
					if (l_scriptResponse[l_selectedRecord.data.DealID] == "Deactivate") {

						//DELETE EDITED RECORD FOR DEAL WHICH USER WANT TO DEACTIVATE
						for (var l_editedObj in p_arrEditedRecord) {
							if (p_arrEditedRecord[l_editedObj]["Variable Attributes"]["DealID"] == l_selectedRecord.data.DealID) {
								for (var l_editedMonth in p_arrEditedRecord[l_editedObj].Values) {
									if (m_arrMonths.indexOf(l_editedMonth) >= l_intDeleteFromMonth - 1) {
										delete p_arrEditedRecord[l_editedObj].Values[l_editedMonth]
									}
								}
							}
						}

						//UPDATE DELETED DEAL ARRAY
						l_objPricePlan.addDeletedPricePlanDeal(l_selectedRecord.data.DealID, l_timeMemberCode, "Deactivate");
						//DELETE EDITED STACK RECORD FOR DEAL WHICH USER WANT TO DEACTIVATE
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().removeEditedCellInfoData("DealID", l_selectedRecord.data.DealID, l_intDeleteFromMonth);

						this.deactivateOrDeleteDeal(l_selectedRecord.data.DealID, l_timeMemberCode, "Deactivate", l_objPricePlanData);

					} else if (l_scriptResponse[l_selectedRecord.data.DealID] == "Delete") {
						//UPDATE DELETED DEAL ARRAY
						l_objPricePlan.addDeletedPricePlanDeal(l_selectedRecord.data.DealID, l_timeMemberCode, "Delete");

						//DELETE EDITED RECORD FOR DEAL WHICH USER WANT TO DEACTIVATE
						for (var l_editedObj = 0; l_editedObj < p_arrEditedRecord.length; l_editedObj++) {
							if (p_arrEditedRecord[l_editedObj]["Variable Attributes"]["DealID"] == l_selectedRecord.data.DealID) {
								//delete p_arrEditedRecord[l_editedObj];
								p_arrEditedRecord.splice(l_editedObj, 1);
								l_editedObj--;
							}
						}

						this.deactivateOrDeleteDeal(l_selectedRecord.data.DealID, l_timeMemberCode, "Delete", l_objPricePlanData);

						//DELETE EDITED STACK RECORD FOR DEAL WHICH USER WANT TO DEACTIVATE
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().removeEditedCellInfoData("DealID", l_selectedRecord.data.DealID);

					} else if (l_scriptResponse[l_selectedRecord.data.DealID] == "Not Allowed") {

						//Message Cannot delete
						Ext.MessageBox.show({
							title : m_MESSAGES["Cannot Delete Deal"]["Title"],
							msg : m_MESSAGES["Cannot Delete Deal"]["Message"],
							buttons : Ext.MessageBox.OK
						});

					}
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

				} else {
					//FAILED TO SAVE PRICE PLAN DATA...............
					Ext.MessageBox.show({
						title : 'Information',
						msg : l_output.solMessages[0],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

				}

			} else {
				//SCRIPT FAILED.....................
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	};

	this.deactivateOrDeleteDeal = function (p_DealID, p_timeMemberCode, pstrOperation, p_objPricePlanData) {
		if (pstrOperation != undefined) {
			var l_strDeActivatmonth = getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_timeMemberCode);

			//start ET588
			/* 	var l_Channels = ["ON", "OFF"];
			var l_Sections = ["Current", "Proposed"];
			var l_TGGRIDID = {
			"ON" : {
			"Current" : "TG_OnPremisesCurrent",
			"Proposed" : "TG_OnPremisesProposed"
			},
			"OFF" : {
			"Current" : "TG_OffPremisesCurrent",
			"Proposed" : "TG_OffPremisesProposed"
			}
			}; */

			var l_Channels = ["ON", "OFF"];
			var l_Sections = ["Proposed"];
			var l_TGGRIDID = {
				"ON" : {
					"Proposed" : "TG_OnPremisesProposed"
				},
				"OFF" : {
					"Proposed" : "TG_OffPremisesProposed"
				}
			};

			//End ET588
			switch (pstrOperation.toUpperCase()) {
			case "DELETE": {
					for (var l_channel in l_Channels) {
						for (var l_section in l_Sections) {
							//getTGObject
							var l_objTG = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj;
							var l_storeTG = l_objTG.getStore();
							var l_dataTG = l_storeTG.data.items;

							//Get data ActualCopy
							var l_objChannelData = p_objPricePlanData[l_Channels[l_channel]][l_Sections[l_section]].children;

							//complete delete
							for (var l_records in l_objChannelData) {
								if (l_objChannelData[l_records].DealID != undefined) {
									if (l_objChannelData[l_records].DealID == p_DealID) {
										l_objChannelData.splice(parseInt(l_records), 1);
										break;
									}
								}
							};

							for (var l_records in l_dataTG) {
								if (l_dataTG[l_records].data.DealID != undefined) {
									if (l_dataTG[l_records].data.DealID == p_DealID) {
										l_dataTG[l_records].remove();
										//REFRESH VIEW OFF PREMISE PROPOSED
										l_objTG.view.refresh();
										break;
									}
								}
							}
						}
					}
					break;
				}

			case "DEACTIVATE": {
					for (var l_channel in l_Channels) {
						for (l_section in l_Sections) {
							//getTGObject
							var l_objTG = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj;
							//getTGStore
							var l_storeTG = l_objTG.getStore();
							//Get data ActualCopy
							var l_objChannelData = p_objPricePlanData[l_Channels[l_channel]][l_Sections[l_section]].children;

							//PARTIAL GREY OUT
							//CLEAR DATA FOR DEAL TO BE DEACTIVATED  FROM ONPREMISES PROPOSED SECTION(ACTUAL COPY)
							for (var l_record in l_objChannelData) {
								if (l_objChannelData[l_record].DealID != undefined) {
									if (l_objChannelData[l_record].DealID == p_DealID) {
										for (var l_months in m_arrMonths) {
											if (l_months >= m_arrMonths.indexOf(l_strDeActivatmonth)) {
												for (var l_fact in l_objChannelData[l_record].children) {

													l_objChannelData[l_record].children[l_fact]["Deleted Time"] = l_strDeActivatmonth;
												}
												if (l_Sections[l_section] == "Proposed") {
													l_objChannelData[l_record][m_arrMonths[l_months]] = null;
												}
												l_objChannelData[l_record]["Deleted Time"] = l_strDeActivatmonth;
												l_objChannelData[l_record]["Deleted Deal"] = true;
											}
										}
										break;
									}
								}
							}

							//FIND RECORD IN STORE
							var l_Record = l_storeTG.findRecord("DealID", p_DealID);
							if (l_Record != null) {
								//var l_nodeId = l_Record.id;
								//var l_nodeIdRec = l_storeTG.getNodeById(l_nodeId);
								l_Record.data["Deleted Time"] = l_strDeActivatmonth;
								l_Record.data["Deleted Deal"] = true;
								for (var l_months in m_arrMonths) {
									if (l_months >= m_arrMonths.indexOf(l_strDeActivatmonth)) {
										for (var rowIdxChildren in l_Record.data.children) {
											//l_nodeOFFPro.data.children[rowIdxChildren][m_arrMonths[l_months]] = "";
											l_Record.data.children[rowIdxChildren]["Deleted Time"] = l_strDeActivatmonth;
										}
										if (l_Sections[l_section] == "Proposed") {
											l_Record.data[m_arrMonths[l_months]] = null;
										}

									}
								}

							}
							//REFRESH VIEW OFF PREMISE PROPOSED
							l_objTG.view.refresh();
						}

					}
					break;
				}
			}
		}
	}

	this.NewPricePlan = function (pConfig) {
		try {

			if (pConfig != null && pConfig != undefined && pConfig != "" && pConfig != []) {
				for (var l_deal in pConfig.Deals) {
					pConfig.Deals[l_deal].SourceDealID = "FirstDeal";
					switch (pConfig.Deals[l_deal].Channel.toUpperCase()) {
					case "ALL": {
							this.UpdateDealFactsOnNewPricePlan(pConfig.Deals[l_deal], "OFF");
							this.UpdateDealFactsOnNewPricePlan(pConfig.Deals[l_deal], "ON");
							this.UpdateEditedRecordArray(pConfig.Deals[l_deal].DealID, null);

							break;

						}
					case "ON": {
							this.UpdateDealFactsOnNewPricePlan(pConfig.Deals[l_deal], "ON");
							//to remove data related to OFF section
							this.UpdateEditedRecordArray(pConfig.Deals[l_deal].DealID, "OFF");
							//remove deal from  "OFF" premises
							this.emptyChannelData("OFF", true);

							//	this.removeRowVolumeAndBusisness("OFF", true);

							break;
						}
					case "OFF": {
							this.UpdateDealFactsOnNewPricePlan(pConfig.Deals[l_deal], "OFF");
							//to remove data related to ON section
							this.UpdateEditedRecordArray(pConfig.Deals[l_deal].DealID, "ON");
							//remove deal from  "On" premises
							this.emptyChannelData("ON", true);

							//this.removeRowVolumeAndBusisness("ON", true);

							break;
						}
					}
				}

				this.fetchAndUpdatePrices();

				/*getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();*/
				//Price Plan Scope Data..............
				var l_objPricePlanScopeData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlanFixedAttribute();
				//WorkFlow Script ..............
				var p_obj_WorkFlowScriptInput = {
					"Time" : l_objPricePlanScopeData["Time"],
					"Geography Code" : l_objPricePlanScopeData["Geography Code"],
					"Product Code" : l_objPricePlanScopeData["Product Code"]
				};
				getPricePlanControllerManagerObj().fetchWorkflowComboData(p_obj_WorkFlowScriptInput);
				//Set Approval Workflow UI...........
				getPricePlanControllerManagerObj().setApprovalWorkflowUI(getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlanState());

				//set Work Flow in Price Plan Model....................
				/*if (Obj_WorkFlowOutput != undefined) {
				getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).setWorkFlowCombo(Obj_WorkFlowOutput);
				}
				getPricePlanControllerManagerObj().loadWorkFlowCombo(getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID));
				 */
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	// PG delete Confirmation ......
	this.validateDeletePromoGoods = function () {
		try {
			//var isPlanDirtyInPublisedState = false;
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			if (l_objPricePlan.getPricePlanState() == m_Published_Key && l_objPricePlan.isPricePlanDataChanged()) {
				Ext.MessageBox.confirm(m_MESSAGES["PG_Delete_Published_Confirm"]["Title"], m_MESSAGES["PG_Delete_Published_Confirm"]["Message"], function (p_btn) {
					if (p_btn == "yes") {
						Ext.MessageBox.confirm(m_MESSAGES["DeletePromoGoodsConfirmation"]["Title"], m_MESSAGES["DeletePromoGoodsConfirmation"]["Message"], getPricePlanControllerManagerObj().getPricePlanUIManager().PromoGoodsDeleteConfirmCallback);
					}
				});
			} else {
				//Confirmation message for delete promo goods....
				Ext.MessageBox.confirm(m_MESSAGES["DeletePromoGoodsConfirmation"]["Title"], m_MESSAGES["DeletePromoGoodsConfirmation"]["Message"], getPricePlanControllerManagerObj().getPricePlanUIManager().PromoGoodsDeleteConfirmCallback);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/** PG Enhancement **/
	/* Delete Promo Goods*/
	this.PromoGoodsDeleteScriptCall = function (p_channelType, p_selectedMonth) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objScopeData = {};
			l_objScopeData["System Fields"] = l_objPricePlan.getPricePlanSystemFields();
			//l_objScopeData["DealContainer_SystemFields"] = l_objPricePlan.getDealSystemFields();
			l_objScopeData["ScopeData"] = l_objPricePlan.getPricePlanFixedAttribute();

			l_objScopeData["PiggyBag"] = l_objPricePlan.getPiggyBagData();
			l_objScopeData["PGPlanScope"] = [{
					"VolumeChannel" : p_channelType,
					"Month" : p_selectedMonth
				}
			];

			var paramValue = [];
			var inputParamValueObject = {
				"ModuleName" : "VolumePlanner",
				"Operation" : "DeletePGPlan",
				"Input" : l_objScopeData
			};
			paramValue.push(inputParamValueObject)
			var l_callbackParams = {
				"PGPlanScope" : l_objScopeData["PGPlanScope"],
				"PricePlan" : l_objPricePlan,
				"Scope" : l_objScopeData
			}
			//		var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', false);
			Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, {}, true, getPricePlanControllerManagerObj().PromoGoodsDeleteScriptCallback, l_callbackParams);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.PromoGoodsDeleteScriptCallback = function (ScriptOutput, p_callbackParam) {
		try {
			var l_objPricePlan = p_callbackParam.PricePlan;
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					if (p_callbackParam["Scope"]["System Fields"].WorkFlowStatus.indexOf(m_Published_Key) != -1) {
						//Recreate WIP PP on Published PP save Operation...............
						getPricePlanControllerManagerObj().UpdatePricePlan(l_output, true);
						//Sync Impact Analysis view with latest comments
						getObjectFactory().getImpactAnalysisManager().syncImpactViewWithWorkflow(l_objPricePlan.getWorkflowLevelComments());
						//Fetch Historic Report Data...
						getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(l_objPricePlan.getPricePlanFixedAttribute());
					} else {
						var l_scriptResponse = l_output.solResponse;
						var PG_Grid_Id = {
							"ON" : {
								"Grid_Id" : "DG_PGOnPremisesProposed",
								"PG_Key" : "PG_ON"
							},
							"OFF" : {
								"Grid_Id" : "DG_PGOffPremisesProposed",
								"PG_Key" : "PG_OFF"
							},
						}
						/** Update Promo Good data w.r.t. response **/

						//Calculate PromoGood Metrics Columns ......
						var l_PromooodsRecord;
						var l_Store_PG = VistaarExtjs.getCmp(PG_Grid_Id[p_callbackParam["PGPlanScope"][0]["VolumeChannel"]]["Grid_Id"]).DGObj.getStore();
						//var l_objPGData = l_objPricePlan.getPricePlan()[PG_Grid_Id[p_callbackParam["PGPlanScope"][0]["VolumeChannel"]]["PG_Key"]]["Proposed"];
						var l_objPGCloneData = l_objPricePlan.getPricePlanCloneData()[PG_Grid_Id[p_callbackParam["PGPlanScope"][0]["VolumeChannel"]]["PG_Key"]]["Proposed"];
						var l_PGResponseData = l_scriptResponse[PG_Grid_Id[p_callbackParam["PGPlanScope"][0]["VolumeChannel"]]["PG_Key"]]["Proposed"];
						var l_selectedMonth = p_callbackParam["PGPlanScope"][0]["Month"];
						for (var itrPGData in l_objPGCloneData) {
							l_PromooodsRecord = l_Store_PG.data.find("MetricsType", l_objPGCloneData[itrPGData]["MetricsType"]);
							for (var itrMonth in l_objPGCloneData[itrPGData]) {
								if (m_arrMonths.indexOf(itrMonth) >= m_arrMonths.indexOf(l_selectedMonth)) {
									//To maintain previous month changes...
									//l_objPGData[itrPGData][itrMonth] = l_PGResponseData[itrPGData][itrMonth];
									l_PromooodsRecord.set(itrMonth, l_PGResponseData[itrPGData][itrMonth]);
									//Update Price Plan Clone Copy...
									l_objPGCloneData[itrPGData][itrMonth] = l_PGResponseData[itrPGData][itrMonth];
								}
							}
						}

						/**Reload PromoGood  Grid...*/
						//VistaarDG.reloadDGWithData(PG_Grid_Id[p_callbackParam["PGPlanScope"][0]["VolumeChannel"]]["Grid_Id"], l_objPGData);

						/** Update System Fields and PRGAvailability**/
						l_objPricePlan.setPricePlanSystemFields(l_scriptResponse["System Fields"]);

						/** Set Promo Good applicable **/
						l_objPricePlan.setPRGAvailability(l_scriptResponse["PRGAvailability"]);
						getPricePlanControllerManagerObj().getPricePlanUIManager().setPGApplicability(l_scriptResponse["PRGAvailability"]);

						//Remove data from edited record
						getPricePlanControllerManagerObj().removeEditedRecordInfoAfterPGDelete(l_objPricePlan, p_callbackParam["PGPlanScope"]);

						//Calculate Summary Grid....
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();

						var l_RowRecord_AllocatedCost = l_Store_PG.data.find("MetricsType", "Allocated Budget");
						var l_totals = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSumTotals(l_RowRecord_AllocatedCost.data);
						l_RowRecord_AllocatedCost.set("FY", l_totals.FY);
						l_RowRecord_AllocatedCost.set("YTD", l_totals.YTD);
						l_RowRecord_AllocatedCost.set("4MTHS", l_totals.FMTHS);
						l_RowRecord_AllocatedCost.set("FYvsPY", l_totals.FYvsPY);
					}
					Ext.MessageBox.show({
						title : m_MESSAGES["DeletePromoGoods"]["Title"],
						msg : m_MESSAGES["DeletePromoGoods"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFORMATIONAL
					});

					getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

				} else {

					Ext.MessageBox.show({
						title : 'Information',
						msg : l_output.solMessages[0],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.INFO
					});
					getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

				}
			} else {

				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	}

	/** Remove PG related edited record after delete PG operation**/
	this.removeEditedRecordInfoAfterPGDelete = function (p_objPricePlan, pScopeData) {
		try {
			var l_EditedPricePlanInfo = p_objPricePlan.getPricePlanUpdatedRecord().VariableAttributesAndValues;
			var l_arrRowsToDelete = ["PG_SDA", "Percent of Business"];
			for (var itrEditedRec in l_EditedPricePlanInfo) {
				if (!l_EditedPricePlanInfo[itrEditedRec]["Variable Attributes"].hasOwnProperty("DealID") && l_EditedPricePlanInfo[itrEditedRec]["Variable Attributes"].Channels === pScopeData[0].VolumeChannel) {
					for (var l_rowIdx in l_arrRowsToDelete) {
						//Remove edited record of promo goods
						if (l_EditedPricePlanInfo[itrEditedRec].hasOwnProperty(l_arrRowsToDelete[l_rowIdx])) {
							for (var l_MonthKey in l_EditedPricePlanInfo[itrEditedRec][l_arrRowsToDelete[l_rowIdx]]) {
								if (m_arrMonths.indexOf(l_MonthKey) >= m_arrMonths.indexOf(pScopeData[0].Month)) {
									delete l_EditedPricePlanInfo[itrEditedRec][l_arrRowsToDelete[l_rowIdx]][l_MonthKey];
									//Remove data from stack(Ctrl+Z) .....
									getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().removeEditedCellInfoData("id", pScopeData[0].VolumeChannel + l_MonthKey + l_arrRowsToDelete[l_rowIdx]);
								}
							}

							/**Check whether object is empty**/
							if (Object.getOwnPropertyNames(l_EditedPricePlanInfo[itrEditedRec][l_arrRowsToDelete[l_rowIdx]]).length == 0) {
								delete l_EditedPricePlanInfo[itrEditedRec][l_arrRowsToDelete[l_rowIdx]];
							}
						}
					}
					//Check is there any edited data present or not , otherwise remove this object....
					if (Object.getOwnPropertyNames(l_EditedPricePlanInfo[itrEditedRec]).length == 1) {
						l_EditedPricePlanInfo.splice(itrEditedRec, 1);
					}
					break;
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.UpdateEditedRecordArray = function (pnewDealId, pChannelToDelete) {
		try {
			var p_arrEditedRecord = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getEditedData();
			for (var l_editedObj in p_arrEditedRecord) {
				if (p_arrEditedRecord[l_editedObj]["Variable Attributes"].Channels === pChannelToDelete && p_arrEditedRecord[l_editedObj]["Variable Attributes"].hasOwnProperty("DealID")) {
					p_arrEditedRecord.splice(l_editedObj, 1)
				}
			}
			for (var l_editedObj in p_arrEditedRecord) {
				if (p_arrEditedRecord[l_editedObj]["Variable Attributes"].hasOwnProperty("DealID")) {
					p_arrEditedRecord[l_editedObj]["Variable Attributes"]["DealID"] = pnewDealId
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.fetchAndUpdatePrices = function () {

		var l_objPricePlan = this.getPricePlanObject(m_ActivePricePlanID);
		var l_objPricePlanData = l_objPricePlan.getPricePlan();
		var l_scriptResponse;
		var l_ScriptInput;
		var paramValue = [];
		l_ScriptInput = {
			"ModuleName" : "VolumePlanner",
			"Operation" : "synchWithPS",
			"Input" : {
				"ScopeData" : l_objPricePlanData.Scope
			}
		};

		/*VistaarAuditingManager.audit({
		"name" : "Start:ScriptCall Get Data Prices"
		}, m_IS_AUDIT_REQUIRED, 524);*/
		paramValue.push(l_ScriptInput);

		Ext.defer(function () {
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor('cntPricePlanMain', "Updating Data...")
			//************Call Script Fetch all Prices**************
			VistaarAjax.callESExecuteScript('VP_EntryPoint', ['inputJSON'], paramValue, '', true, getPricePlanControllerManagerObj().fetchAndUpdatePricesCallBack);

		}, 100);

		/*VistaarAuditingManager.audit({
		"name" : "End:ScriptCall Get Prices"
		}, m_IS_AUDIT_REQUIRED, 524);*/

	}

	this.fetchAndUpdatePricesCallBack = function (ScriptOutput) {
		var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
		var l_objPricePlanData = l_objPricePlan.getPricePlan();
		var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
		if (ScriptOutput.status.toLowerCase() == "success") {
			var l_output = Ext.decode(ScriptOutput.response);
			if (l_output.solStatus.toLowerCase() == "success") {
				//SET THE PRICE PLAN DATA IN THE MODEL
				var l_scriptResponse = l_output.solResponse;

				var l_Channels = ["ON", "OFF"];
				var l_Sections = ["Current", "Proposed"];
				var l_TGGRIDID = {
					"ON" : {
						"Current" : "TG_OnPremisesCurrent",
						"Proposed" : "TG_OnPremisesProposed"
					},
					"OFF" : {
						"Current" : "TG_OffPremisesCurrent",
						"Proposed" : "TG_OffPremisesProposed"
					}
				};
				VistaarAuditingManager.audit({
					"name" : "Start:UI Processing Update Prices"
				}, m_IS_AUDIT_REQUIRED, 560);
				for (var l_channel in l_Channels) {
					for (var l_section in l_Sections) {
						var l_objData = l_objPricePlanData[l_Channels[l_channel]][l_Sections[l_section]].children;
						for (var l_record in l_objData) {
							if (l_objData[l_record]["DealID"] != undefined) {
								for (var l_DealID in l_scriptResponse[l_Channels[l_channel]]) {
									if (l_objData[l_record]["DealID"] == l_DealID) {
										for (var l_fact in l_objData[l_record].children) {
											for (var l_data in l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]) {
												if (l_objData[l_record].children[l_fact]["Qualifier"] == l_data) {
													for (var l_month in m_arrMonths) {
														l_objData[l_record].children[l_fact][m_arrMonths[l_month]] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]][l_data][m_arrMonths[l_month]]
													}
												}
											}
										}

										for (var l_field in l_objData[l_record]) {
											if (l_Sections[l_section] == "Current" && (l_field == "Deleted Time" || l_field == "Deleted Deal"))
												continue;
											for (var l_dealinfo in l_scriptResponse[l_Channels[l_channel]][l_DealID]) {
												if ((l_field == l_dealinfo)) {
													l_objData[l_record][l_field] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_dealinfo]
														break;
												}
											}
										}
										getPricePlanControllerManagerObj().setDealLevelSummary(l_objData[l_record], l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]["Qualifier"]);
										//	getPricePlanControllerManagerObj().CopyDealFactsToCloneCopy(l_objData[l_record], [l_Channels[l_channel]], [l_Sections[l_section]]);
										break;
									}
								}
							}
						}

						//UpdateData in clone Copy
						var l_objClonedCopyData = l_objPricePlanCloneData[l_Channels[l_channel]][l_Sections[l_section]].children;
						for (var l_record in l_objClonedCopyData) {
							if (l_objClonedCopyData[l_record]["DealID"] != undefined) {
								for (var l_DealID in l_scriptResponse[l_Channels[l_channel]]) {
									if (l_objClonedCopyData[l_record]["DealID"] == l_DealID) {
										for (var l_fact in l_objClonedCopyData[l_record].children) {
											for (var l_data in l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]) {
												if (l_objClonedCopyData[l_record].children[l_fact]["Qualifier"] == l_data) {
													for (var l_month in m_arrMonths) {
														l_objClonedCopyData[l_record].children[l_fact][m_arrMonths[l_month]] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]][l_data][m_arrMonths[l_month]]
													}
												}
											}
										}

										for (var l_field in l_objClonedCopyData[l_record]) {
											if (l_Sections[l_section] == "Current" && (l_field == "Deleted Time" || l_field == "Deleted Deal"))
												continue;
											for (var l_dealinfo in l_scriptResponse[l_Channels[l_channel]][l_DealID]) {
												if (l_field == l_dealinfo) {
													l_objClonedCopyData[l_record][l_field] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_dealinfo]
														break;
												}
											}
										}
										getPricePlanControllerManagerObj().setDealLevelSummary(l_objClonedCopyData[l_record], l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]["Qualifier"]);

										break;
									}
								}
							}
						}

						//Update Data to Grid Store

						var l_objDataGird = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj.getStore().getData().items;
						for (var l_record in l_objDataGird) {
							if (l_objDataGird[l_record].data["DealID"] != undefined) {
								for (var l_DealID in l_scriptResponse[l_Channels[l_channel]]) {
									if (l_objDataGird[l_record].data["DealID"] == l_DealID) {
										for (var l_fact in l_objDataGird[l_record].data.children) {
											for (var l_data in l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]) {
												if (l_objDataGird[l_record].data.children[l_fact]["Qualifier"] == l_data) {
													for (var l_month in m_arrMonths) {
														l_objDataGird[l_record].data.children[l_fact][m_arrMonths[l_month]] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]][l_data][m_arrMonths[l_month]]
													}
												}
											}
										}

										for (var l_field in l_objDataGird[l_record].data) {
											if (l_Sections[l_section] == "Current" && (l_field == "Deleted Time" || l_field == "Deleted Deal"))
												continue;
											for (var l_dealinfo in l_scriptResponse[l_Channels[l_channel]][l_DealID]) {
												if (l_field == l_dealinfo) {
													l_objDataGird[l_record].data[l_field] = l_scriptResponse[l_Channels[l_channel]][l_DealID][l_dealinfo]
														break;
												}
											}
										}
										getPricePlanControllerManagerObj().setDealLevelSummary(l_objDataGird[l_record].data, l_scriptResponse[l_Channels[l_channel]][l_DealID][l_Sections[l_section]]["Qualifier"]);
										//getPricePlanControllerManagerObj().CopyDealFactsToCloneCopy(l_objDataGird[l_record].data, [l_Channels[l_channel]], [l_Sections[l_section]]);
										break;
									}
								}
							}
						}

					}
				}

				/* if (l_output.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
				l_objPricePlan.setPricePlanSystemFields(l_output.solResponse.PricePlan_SystemFields);

				} */

				//set System fields and scope
				getPricePlanControllerManagerObj().setSystemFieldsObj(l_output.solResponse);

				if (l_output.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
					l_objPricePlan.setDealSystemFields(l_output.solResponse.DealContainer_SystemFields);
					getPriceStructureModelObj().setSystemFieldsObj(l_output.solResponse.DealContainer_SystemFields);
				}
				if (l_output.solResponse.hasOwnProperty("ExclusionDetails")) {
					l_objPricePlan.setExclusionDetails(l_output.solResponse.ExclusionDetails);
				}
				if (l_output.solResponse.hasOwnProperty("InclusionDetails")) {
					l_objPricePlan.setInclusionDetails(l_output.solResponse.InclusionDetails);
				}
				if (l_output.solResponse.hasOwnProperty("DistributorMaster")) {
					l_objPricePlan.setDistributorMaster(l_output.solResponse.DistributorMaster);
				}
				if (l_output.solResponse.hasOwnProperty("SKUMaster")) {
					l_objPricePlan.setSKUMaster(l_output.solResponse.SKUMaster);
				}
				 
				VistaarAuditingManager.audit({
					"name" : "End:UI Processing Update Prices"
				}, m_IS_AUDIT_REQUIRED, 560);

				//refresh all grids and sort net list
				getPricePlanControllerManagerObj().refreshProposedGridAndSort();

				//re-calculate all grids data
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();

				getPricePlanControllerManagerObj().setDealCountInGirdHeader();

				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

			} else {
				//FAILED TO SAVE PRICE PLAN DATA...............
				Ext.MessageBox.show({
					title : 'Information',
					msg : l_output.solMessages[0],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.INFO
				});
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

			}

		} else {
			//SCRIPT FAILED.....................
			Ext.MessageBox.show({
				title : m_MESSAGES["Script Failure"]["Title"],
				msg : m_MESSAGES["Script Failure"]["Message"],
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.ERROR
			});
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	this.UpdateDealFactsOnNewPricePlan = function (pDeal, pchannel) {
		try {
			/* var l_TGGRIDID = {
			"ON" : {
			"Current" : "TG_OnPremisesCurrent",
			"Proposed" : "TG_OnPremisesProposed"
			},
			"OFF" : {
			"Current" : "TG_OffPremisesCurrent",
			"Proposed" : "TG_OffPremisesProposed"
			}
			};
			var l_Sections = ["Current", "Proposed"]; */

			var l_TGGRIDID = {
				"ON" : {

					"Proposed" : "TG_OnPremisesProposed"
				},
				"OFF" : {

					"Proposed" : "TG_OffPremisesProposed"
				}
			};
			var l_Sections = ["Proposed"];
			for (var l_section in l_Sections) {
				var l_objTG = Ext.getCmp(l_TGGRIDID[pchannel][l_Sections[l_section]]).TGObj;
				var l_storeTG = l_objTG.getStore();
				var l_DataGird = l_storeTG.data.items;

				var l_UpdateFromMonth = getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(pDeal["TimeMemberCode"]);

				for (var l_record in l_DataGird) {
					if (l_DataGird[l_record].data.hasOwnProperty("DealID")) {
						if (l_DataGird[l_record].data.DealLevelCode == "Frontline") {

							l_DataGird[l_record].data.DealID = pDeal["DealID"];
						}
					}
				}

				//getPricePlan Object
				var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				var l_objPricePlanData = l_objPricePlan.getPricePlan();

				//Update DealID Actual Copy
				var l_objPPData = l_objPricePlanData[pchannel][l_Sections[l_section]].children;
				for (var l_record in l_objPPData) {
					if (l_objPPData[l_record].hasOwnProperty("DealID")) {
						if (l_objPPData[l_record].DealLevelCode == "Frontline") {
							l_objPPData[l_record]["DealID"] = pDeal["DealID"];
						}
					}

				}

				//Update DealID in CloneCopy
				var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
				var l_objPPCloneCopyData = l_objPricePlanCloneData[pchannel][l_Sections[l_section]].children;
				for (var l_recordCloneCopy in l_objPPCloneCopyData) {
					if (l_objPPCloneCopyData[l_recordCloneCopy].hasOwnProperty("DealID")) {
						if (l_objPPCloneCopyData[l_recordCloneCopy].DealLevelCode == "Frontline") {
							l_objPPCloneCopyData[l_recordCloneCopy]["DealID"] = pDeal["DealID"];
						}
					}

				}

				/*if (l_Record != null) {
				var l_nodeId = l_Record.id;
				var l_node = l_storeTG.getNodeById(l_nodeId);
				l_node.data.DealID = pDeal["DealID"];
				for (var l_month in m_arrMonths) {
				if (l_month >= m_arrMonths.indexOf(l_UpdateFromMonth)) {
				for (var rowIdxChildren in l_node.data.children) {
				for (var l_Editedfact in pDeal) {
				if (l_Editedfact == l_node.data.children[rowIdxChildren][m_columnFactCode]) {
				l_node.data.children[rowIdxChildren][m_arrMonths[l_month]] = pDeal[l_Editedfact];
				break;
				}
				}
				}
				}
				}

				if (pDeal["Distributor Excluded"] != undefined)
				l_node.data["Distributor Excluded"] = pDeal["Distributor Excluded"];
				if (pDeal["SKU Excluded"] != undefined)
				l_node.data["SKU Excluded"] = pDeal["SKU Excluded"];
				l_node.data["Qualifier"] = pDeal["Qualifier"];
				l_node.data["DealName"] = pDeal["DealName"];
				this.setDealLevelSummary(l_node.data);
				this.CopyDealFactsToCloneCopy(l_node.data, pchannel, "Proposed", true);
				}
				 */

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.CopyDealFactsToCloneCopy = function (pDealToCopy, pChannel, pSection, blnNewFirstDeal) {
		try {
			if (blnNewFirstDeal == undefined) {
				blnNewFirstDeal = false;
			}

			var l_arrFieldsToInclude = ["NetFOB", "Qualifier", "Shelf", "NetList", "Distributor Excluded", "SKU Excluded", "DealName", "rowtype"];

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlanCloneData();
			//var l_objPPSummary = l_objPricePlanData["Price Plan"].Summary;

			var l_objPPChannel = l_objPricePlanData[pChannel][pSection].children;
			var l_DealToCopy = JSON.parse(JSON.stringify(pDealToCopy));

			if (!blnNewFirstDeal) {
				for (var l_records in l_objPPChannel) {
					if (l_objPPChannel[l_records].DealID == l_DealToCopy.DealID) {
						for (var l_factsDeal in l_DealToCopy.children) {
							for (var l_factsCloneCopy in l_objPPChannel[l_records].children) {
								if (l_DealToCopy.children[l_factsDeal][m_columnFactCode] == l_objPPChannel[l_records].children[l_factsCloneCopy][m_columnFactCode]) {
									for (var l_Month in m_arrMonths) {
										l_objPPChannel[l_records].children[l_factsCloneCopy][m_arrMonths[l_Month]] = l_DealToCopy.children[l_factsDeal][m_arrMonths[l_Month]];
									}
									break;
								}
							}
						}

						//Copy Deal level Summary(Deal Name,Qualifier etc)
						for (var l_facts in l_DealToCopy) {
							if (l_arrFieldsToInclude.indexOf(l_facts) != -1) {
								l_objPPChannel[l_records][l_facts] = l_DealToCopy[l_facts];
							}
						}
						break;
					}
				}
			} else {
				for (var l_records in l_objPPChannel) {
					if (l_objPPChannel[l_records].hasOwnProperty("DealID")) {
						l_objPPChannel[l_records]["DealID"] = l_DealToCopy["DealID"];
						for (var l_factsDeal in l_DealToCopy.children) {
							for (var l_factsCloneCopy in l_objPPChannel[l_records].children) {
								if (l_DealToCopy.children[l_factsDeal][m_columnFactCode] == l_objPPChannel[l_records].children[l_factsCloneCopy][m_columnFactCode]) {
									for (var l_Month in m_arrMonths) {
										l_objPPChannel[l_records].children[l_factsCloneCopy][m_arrMonths[l_Month]] = l_DealToCopy.children[l_factsDeal][m_arrMonths[l_Month]];
									}
									break;
								}
							}
						}
						//Copy Deal level Summary(Deal Name,Qualifier etc)
						for (var l_facts in l_DealToCopy) {
							if (l_arrFieldsToInclude.indexOf(l_facts) != -1) {
								l_objPPChannel[l_records][l_facts] = l_DealToCopy[l_facts];
							}
						}
						break;
					}
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.UpdatePricePlanDataFromDealLine = function (pConfig) {
		try {

			if (pConfig != null && pConfig != undefined && pConfig != "" && pConfig != []) {
				var l_objOnPro = Ext.getCmp("TG_OnPremisesProposed").TGObj;
				var l_storeOnPro = l_objOnPro.getStore();
				var l_dataOnproposed = l_storeOnPro.data;

				var l_objOffPro = Ext.getCmp("TG_OffPremisesProposed").TGObj;
				var l_storeOffPro = l_objOffPro.getStore();
				var l_dataOffproposed = l_storeOffPro.data;

				for (var deal in pConfig.Deals) {
					console.log(pConfig.Deals[deal]);
					if (pConfig.Deals[deal].DealLevel.toLowerCase() == "frontline") {

						/*						getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();

						var p_objPricePlanScopeData = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().getPricePlanScopeData();
						var l_scriptResponse;
						var l_ScriptInput;
						var paramValue = [];
						l_ScriptInput = {
						"ModuleName" : "VolumePlanner",
						"Operation" : "synchWithPS",
						"Input" : {
						"ScopeData" : p_objPricePlanScopeData
						}
						};

						VistaarAuditingManager.audit({
						"name" : "Start:ScriptCall Get Data on  Frontline Deal change"
						}, m_IS_AUDIT_REQUIRED, 524);
						paramValue.push(l_ScriptInput);
						var ScriptOutput = Vistaar.frameworkUtil.VistaarAjax.callESExecuteScript('VP_EntryPoint', ["inputJSON"], paramValue, '', false);
						VistaarAuditingManager.audit({
						"name" : "End:ScriptCall Get Data on  Frontline Deal change"
						}, m_IS_AUDIT_REQUIRED, 524);
						if (ScriptOutput.status.toLowerCase() == "success") {
						var l_output = Ext.decode(ScriptOutput.response);
						if (l_output.solStatus.toLowerCase() == "success") {
						//SET THE PRICE PLAN DATA IN THE MODEL
						l_scriptResponse = l_output.solResponse;

						var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
						var l_objPricePlanData = l_objPricePlan.getPricePlan();
						var l_objPPOnProposed = l_objPricePlanData.ON.Proposed.children;
						var l_objPPOffProposed = l_objPricePlanData.OFF.Proposed.children;

						for (var l_recordOnProposed in l_objPPOnProposed) {
						if (l_objPPOnProposed[l_recordOnProposed]["DealID"] != undefined) {
						for (var l_DealID in l_scriptResponse.ON) {
						if (l_objPPOnProposed[l_recordOnProposed]["DealID"] == l_DealID) {
						for (var l_fact in l_objPPOnProposed[l_recordOnProposed].children) {
						for (var l_data in l_scriptResponse.ON[l_DealID].Proposed) {
						if (l_objPPOnProposed[l_recordOnProposed].children[l_fact]["Qualifier"] == l_data) {
						for (var l_month in m_arrMonths) {
						l_objPPOnProposed[l_recordOnProposed].children[l_fact][m_arrMonths[l_month]] = l_scriptResponse.ON[l_DealID].Proposed[l_data][m_arrMonths[l_month]]
						}
						}
						}
						}

						for (var l_field in l_objPPOnProposed[l_recordOnProposed]) {
						for (var l_dealinfo in l_scriptResponse.ON[l_DealID]) {
						if (l_field == l_dealinfo) {
						l_objPPOnProposed[l_recordOnProposed][l_field] = l_scriptResponse.ON[l_DealID][l_dealinfo]

						}
						}
						}
						this.setDealLevelSummary(l_objPPOnProposed[l_recordOnProposed], l_scriptResponse.ON[l_DealID].Proposed["Qualifier"]);
						this.CopyDealFactsToCloneCopy(l_objPPOnProposed[l_recordOnProposed], "ON");
						break;
						}
						}

						}
						}

						for (var l_recordOffProposed in l_objPPOffProposed) {
						if (l_objPPOffProposed[l_recordOffProposed]["DealID"] != undefined) {
						for (var l_DealID in l_scriptResponse.OFF) {
						if (l_objPPOffProposed[l_recordOffProposed]["DealID"] == l_DealID) {

						for (var l_fact in l_objPPOffProposed[l_recordOffProposed].children) {
						for (var l_data in l_scriptResponse.OFF[l_DealID].Proposed) {
						if (l_objPPOffProposed[l_recordOffProposed].children[l_fact]["Qualifier"] == l_data) {
						for (var l_month in m_arrMonths) {
						l_objPPOffProposed[l_recordOffProposed].children[l_fact][m_arrMonths[l_month]] = l_scriptResponse.OFF[l_DealID].Proposed[l_data][m_arrMonths[l_month]]
						}
						}
						}
						}

						for (var l_field in l_objPPOffProposed[l_recordOffProposed]) {
						for (var l_dealinfo in l_scriptResponse.OFF[l_DealID]) {
						if (l_field == l_dealinfo) {
						l_objPPOffProposed[l_recordOffProposed][l_field] = l_scriptResponse.OFF[l_DealID][l_dealinfo]

						}
						}
						}
						this.setDealLevelSummary(l_objPPOffProposed[l_recordOffProposed],
						l_scriptResponse.OFF[l_DealID].Proposed["Qualifier"]);
						this.CopyDealFactsToCloneCopy(l_objPPOffProposed[l_recordOffProposed], "OFF");
						break;
						}
						}

						}
						}

						if (l_output.solResponse.hasOwnProperty("PricePlan_SystemFields")) {
						l_objPricePlan.setPricePlanSystemFields(l_output.solResponse.PricePlan_SystemFields);

						}

						if (l_output.solResponse.hasOwnProperty("DealContainer_SystemFields")) {
						l_objPricePlan.setDealSystemFields(l_output.solResponse.DealContainer_SystemFields);
						getPriceStructureModelObj().setSystemFieldsObj(l_output.solResponse.DealContainer_SystemFields);
						}

						this.refreshProposedGridAndSort();

						getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();*/

						this.fetchAndUpdatePrices();

						break;
					} else {
						/*
						var l_UpdateFromMonth = getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(pConfig.Deals[deal]["TimeMemberCode"]);
						var l_OffPremisesRecord = l_storeOffPro.findRecord("DealID", pConfig.Deals[deal].DealID);
						var l_UpdatePPDealLevelFromMonth;
						if (l_OffPremisesRecord != null) {
						var l_nodeId = l_OffPremisesRecord.id;
						var l_nodeOffPrem = l_storeOffPro.getNodeById(l_nodeId);
						for (var l_month in m_arrMonths) {
						if (l_month >= m_arrMonths.indexOf(l_UpdateFromMonth)) {
						for (var rowIdxChildren in l_nodeOffPrem.data.children) {
						for (var l_Editedfact in pConfig.Deals[deal]) {
						if (l_Editedfact == l_nodeOffPrem.data.children[rowIdxChildren][m_columnFactCode]) {
						l_nodeOffPrem.data.children[rowIdxChildren][m_arrMonths[l_month]] = pConfig.Deals[deal][l_Editedfact];
						break;
						}
						}
						}
						}
						}
						if (m_arrMonths.indexOf(l_UpdateFromMonth) == m_currMonth) {
						l_nodeOffPrem.data["DealName"] = pConfig.Deals[deal]["DealName"];
						if (pConfig.Deals[deal]["Distributor Excluded"] != undefined)
						l_nodeOffPrem.data["Distributor Excluded"] = pConfig.Deals[deal]["Distributor Excluded"];
						if (pConfig.Deals[deal]["SKU Excluded"] != undefined)
						l_nodeOffPrem.data["SKU Excluded"] = pConfig.Deals[deal]["SKU Excluded"];
						l_nodeOffPrem.data["Qualifier"] = pConfig.Deals[deal]["Qualifier"];
						}
						this.setDealLevelSummary(l_nodeOffPrem.data);
						this.CopyDealFactsToCloneCopy(l_nodeOffPrem.data, "OFF","Proposed");

						}

						var l_OnPremisesRecord = l_storeOnPro.findRecord("DealID", pConfig.Deals[deal].DealID);
						if (l_OnPremisesRecord != null) {
						var l_nodeId = l_OnPremisesRecord.id;
						var l_nodeOnPrem = l_storeOnPro.getNodeById(l_nodeId);
						for (var l_month in m_arrMonths) {
						if (l_month >= m_arrMonths.indexOf(l_UpdateFromMonth)) {
						for (var rowIdxChildren in l_nodeOnPrem.data.children) {
						for (var l_Editedfact in pConfig.Deals[deal]) {
						if (l_Editedfact == l_nodeOnPrem.data.children[rowIdxChildren][m_columnFactCode]) {
						l_nodeOnPrem.data.children[rowIdxChildren][m_arrMonths[l_month]] = pConfig.Deals[deal][l_Editedfact];
						break;
						}
						}
						}
						}
						}
						if (m_arrMonths.indexOf(l_UpdateFromMonth) == m_currMonth) {
						l_nodeOnPrem.data["DealName"] = pConfig.Deals[deal]["DealName"];
						if (pConfig.Deals[deal]["Distributor Excluded"] != undefined)
						l_nodeOnPrem.data["Distributor Excluded"] = pConfig.Deals[deal]["Distributor Excluded"];
						if (pConfig.Deals[deal]["SKU Excluded"] != undefined)
						l_nodeOnPrem.data["SKU Excluded"] = pConfig.Deals[deal]["SKU Excluded"];
						l_nodeOnPrem.data["Qualifier"] = pConfig.Deals[deal]["Qualifier"];
						}
						this.setDealLevelSummary(l_nodeOnPrem.data);
						this.CopyDealFactsToCloneCopy(l_nodeOnPrem.data, "OFF","Proposed");

						}

						this.refreshProposedGridAndSort();*/
						this.fetchAndUpdatePrices();
						break;
					}
				}
			}

			/*getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.getEditableFromAndFOBInfoForPrices = function (pNewDealId) {
		try {
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();
			var l_objPPOnProposed = l_objPricePlanData.ON.Proposed.children;
			var l_objPPOffProposed = l_objPricePlanData.OFF.Proposed.children;
			var l_factBillFob = [];
			var EditableFrom = "";

			if (l_objPPOnProposed != undefined && l_objPPOnProposed != null) {
				if (l_objPPOnProposed.length >= 3) {
					for (var l_record in l_objPPOnProposed) {
						if (l_objPPOnProposed[l_record].MetricsType != "Volume" && l_objPPOnProposed[l_record].MetricsType != "Business") {
							if (l_objPPOnProposed[l_record].DealID != pNewDealId) {
								for (var l_facts in l_objPPOnProposed[l_record].children) {
									if (l_objPPOnProposed[l_record].children[l_facts].hasOwnProperty(["EditableFrom"])) {
										EditableFrom = l_objPPOnProposed[l_record].children[l_facts]["EditableFrom"];
									}
									if (l_objPPOnProposed[l_record].children[l_facts][m_columnFactCode] == m_factCodeBILLFOB) {
										l_factBillFob = l_objPPOnProposed[l_record].children[l_facts];

										return {
											"EditableFrom" : EditableFrom,
											"BillFOB" : l_factBillFob
										}
										break;
									}
								}
							}
						}
					}
				}
			}

			if (l_objPPOffProposed != undefined && l_objPPOffProposed != null) {
				if (l_objPPOffProposed.length >= 3) {
					for (var l_record in l_objPPOffProposed) {
						if (l_objPPOffProposed[l_record].MetricsType != "Volume" && l_objPPOffProposed[l_record].MetricsType != "Business") {
							if (l_objPPOffProposed[l_record].DealID != pNewDealId) {
								for (var l_facts in l_objPPOffProposed[l_record].children) {

									if (l_objPPOffProposed[l_record].children[l_facts].hasOwnProperty(["EditableFrom"])) {
										EditableFrom = l_objPPOffProposed[l_record].children[l_facts]["EditableFrom"];
									}
									if (l_objPPOffProposed[l_record].children[l_facts][m_columnFactCode] == m_factCodeBILLFOB) {
										l_factBillFob = l_objPPOffProposed[l_record].children[l_facts];

										return {
											"EditableFrom" : EditableFrom,
											"BillFOB" : l_factBillFob
										}
										break;
									}
								}

							}
						}
					}
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.PPAddDeal = function (p_data) {
		try {

			if (p_data != undefined && p_data != null) {
				for (var l_deal in p_data.Deals) {
					console.log("Added Deal:" + p_data.Deals[l_deal]);

					switch (p_data.Deals[l_deal].Channel.toUpperCase()) {
					case "ALL": {
							//this.addRowVolumeAndBusisness("OFF");
							this.addDeal(p_data.Deals[l_deal], "OFF", getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//	this.addRowVolumeAndBusisness("ON");
							this.addDeal(p_data.Deals[l_deal], "ON", getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//	this.refreshProposedGridAndSort();
							break;

						}
					case "ON": {
							//this.addRowVolumeAndBusisness("ON");
							this.addDeal(p_data.Deals[l_deal], "ON", getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.refreshProposedGridAndSort("ON");
							break;
						}
					case "OFF": {
							//	this.addRowVolumeAndBusisness("OFF");
							this.addDeal(p_data.Deals[l_deal], "OFF", getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.refreshProposedGridAndSort("OFF");
							break;
						}
					}
				}
				this.fetchAndUpdatePrices();

				/*getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();*/
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.addDeal = function (p_deal, p_channel, p_UpdateFromMonth) {
		try {
			var l_EditableFromAndFOBInfoForPrices = this.getEditableFromAndFOBInfoForPrices(p_deal.DealID);

			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesProposed",
				"OFF" : "TG_OffPremisesProposed"

			};
			var l_objTG = Ext.getCmp(l_TGGRIDID[p_channel]).TGObj;
			var l_storeTG = l_objTG.getStore();

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();

			var l_dummmyDeal = JSON.parse(JSON.stringify(getPricePlanControllerManagerObj().getPricePlanUIManager().createDummyDeal(l_objPricePlanData.UserPreference)));

			var l_objChannelData = l_objPricePlanData[p_channel].Proposed.children;

			//update DealLevelFields i.e dealName,DealId,SKU,DisExclusion
			//for (var l_Updatedfield in p_deal) {
			/*for (var l_dealField in l_dummmyDeal) {
			if (l_dealField == l_Updatedfield) {
			l_dummmyDeal[l_dealField] = p_deal[l_Updatedfield];

			}
			}
			 */
			//Update Prices
			for (var l_dealFactIndx in l_dummmyDeal.children) {
				/*if (l_dummmyDeal.children[l_dealFactIndx][m_columnFactCode] == l_Updatedfield) {
				for (var l_month in m_arrMonths) {
				if (l_month >= m_arrMonths.indexOf(p_UpdateFromMonth)) {
				l_dummmyDeal.children[l_dealFactIndx][m_arrMonths[l_month]] = p_deal[l_Updatedfield];
				}

				}
				}
				//copy fob form other deal
				if (l_dummmyDeal.children[l_dealFactIndx][m_columnFactCode] == m_factCodeBILLFOB) {
				l_dummmyDeal.children[l_dealFactIndx] = JSON.parse(JSON.stringify(l_EditableFromAndFOBInfoForPrices.BillFOB));
				}
				 */
				//Update Editable From Info for Prices
				l_dummmyDeal.children[l_dealFactIndx]["EditableFrom"] = l_EditableFromAndFOBInfoForPrices.EditableFrom;

			}

			//}
			l_dummmyDeal["DealID"] = p_deal.DealID;
			l_dummmyDeal["EditableFrom"] = "Jan";
			this.setDealLevelSummary(l_dummmyDeal);

			var l_rootnode = l_storeTG.getRootNode();
			//l_rootnode.appendChild(JSON.parse(JSON.stringify(l_dummmyDeal)));
			l_rootnode.insertChild(2, JSON.parse(JSON.stringify(l_dummmyDeal)));
			//l_objChannelData.push(JSON.parse(JSON.stringify(l_dummmyDeal)));
			l_objChannelData.splice(2, 0, JSON.parse(JSON.stringify(l_dummmyDeal)));

			var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
			var l_objPPCloneChannelData = l_objPricePlanCloneData[p_channel].Proposed.children;
			//l_objPPCloneChannelData.push(JSON.parse(JSON.stringify(l_dummmyDeal)));
			l_objPPCloneChannelData.splice(2, 0, JSON.parse(JSON.stringify(l_dummmyDeal)));
			//this.inserDealToCurrent(l_dummmyDeal, p_channel);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.inserDealToCurrent = function (p_deal, p_channel) {
		try {
			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesCurrent",
				"OFF" : "TG_OffPremisesCurrent"

			};
			var l_objTG = Ext.getCmp(l_TGGRIDID[p_channel]).TGObj;
			var l_storeTG = l_objTG.getStore();

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();
			var l_objChannelData = l_objPricePlanData[p_channel].Current.children;

			var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
			var l_objPPCloneChannelData = l_objPricePlanCloneData[p_channel].Current.children;

			var l_rootnode = l_storeTG.getRootNode();
			l_rootnode.insertChild(2, JSON.parse(JSON.stringify(p_deal)));
			l_objChannelData.splice(2, 0, JSON.parse(JSON.stringify(p_deal)));
			l_objPPCloneChannelData.splice(2, 0, JSON.parse(JSON.stringify(p_deal)));

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.PPcloneDeal = function (p_data) {
		try {
			if (p_data != undefined && p_data != null) {
				for (var l_deal in p_data.Deals) {
					console.log("Added Deal:");
					console.log("Added Deal:" + p_data.Deals[l_deal]);

					switch (p_data.Deals[l_deal].Channel.toUpperCase()) {
					case "ALL": {
							//this.addRowVolumeAndBusisness("OFF");
							this.cloneDeal(p_data.Deals[l_deal], "OFF", p_data.Deals[l_deal].SourceChannel, getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.addRowVolumeAndBusisness("ON");
							this.cloneDeal(p_data.Deals[l_deal], "ON", p_data.Deals[l_deal].SourceChannel, getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.refreshProposedGridAndSort();
							break;

						}
					case "ON": {
							//this.addRowVolumeAndBusisness("ON");
							this.cloneDeal(p_data.Deals[l_deal], "ON", p_data.Deals[l_deal].SourceChannel, getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.refreshProposedGridAndSort("ON");
							break;
						}
					case "OFF": {
							//this.addRowVolumeAndBusisness("OFF");
							this.cloneDeal(p_data.Deals[l_deal], "OFF", p_data.Deals[l_deal].SourceChannel, getPricePlanControllerManagerObj().getPricePlanUIManager().getMonthFormTimeMemberCode(p_data.Deals[l_deal]["TimeMemberCode"]));
							//this.refreshProposedGridAndSort("OFF");
							break;
						}
					}
				}
				this.fetchAndUpdatePrices();
				/*getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();	getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();*/
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.cloneDeal = function (p_deal, p_channel, p_sourceChannel, p_UpdateFromMonth) {
		try {

			var l_EditableFromAndFOBInfoForPrices = this.getEditableFromAndFOBInfoForPrices(p_deal.DealID);
			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesProposed",
				"OFF" : "TG_OffPremisesProposed"

			};

			var l_objTG = Ext.getCmp(l_TGGRIDID[p_channel]).TGObj;
			var l_storeTG = l_objTG.getStore();

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = l_objPricePlan.getPricePlan();

			var l_dummmyDeal = JSON.parse(JSON.stringify(getPricePlanControllerManagerObj().getPricePlanUIManager().createDummyDeal(l_objPricePlanData.UserPreference)));

			var l_cloneFromDeal = [];
			var l_objChannelData = l_objPricePlanData[p_channel].Proposed.children;

			//commenting line coz AsPerReview with customer do not copy volume mix
			/*for (var l_record in l_objChannelData) {
			if (l_objChannelData[l_record].DealID == p_deal.SourceDealID) {
			l_cloneFromDeal = l_objChannelData[l_record];
			break;
			}

			}
			 */

			/*for (var l_Updatedfield in p_deal) {
			//Update deal Level fields(SKU /Distributed management)
			for (var l_dealField in l_dummmyDeal) {
			if (l_dealField == l_Updatedfield) {
			l_dummmyDeal[l_dealField] = p_deal[l_Updatedfield];
			break;
			}
			}*/

			for (var l_dealFactIndx in l_dummmyDeal.children) {
				/*if (l_dummmyDeal.children[l_dealFactIndx][m_columnFactCode] == l_Updatedfield) {
				for (var l_month in m_arrMonths) {
				if (l_month >= m_arrMonths.indexOf(p_UpdateFromMonth)) {
				l_dummmyDeal.children[l_dealFactIndx][m_arrMonths[l_month]] = p_deal[l_Updatedfield];
				}
				}
				}
				//copy fob form other deal
				if (l_dummmyDeal.children[l_dealFactIndx][m_columnFactCode] == m_factCodeBILLFOB) {
				l_dummmyDeal.children[l_dealFactIndx] = JSON.parse(JSON.stringify(l_EditableFromAndFOBInfoForPrices.BillFOB));
				}
				 */
				l_dummmyDeal.children[l_dealFactIndx]["EditableFrom"] = l_EditableFromAndFOBInfoForPrices.EditableFrom;
			}

			//}

			l_dummmyDeal["EditableFrom"] = "Jan";
			l_dummmyDeal["DealID"] = p_deal.DealID;
			//this.setDealLevelSummary(l_dummmyDeal);

			var l_rootnode = l_storeTG.getRootNode();
			//l_rootnode.appendChild(JSON.parse(JSON.stringify(l_dummmyDeal)));
			l_rootnode.insertChild(2, JSON.parse(JSON.stringify(l_dummmyDeal)));
			//l_storeTG.add(l_dummmyDeal);

			//l_objChannelData.push(JSON.parse(JSON.stringify(l_dummmyDeal)));
			l_objChannelData.splice(2, 0, JSON.parse(JSON.stringify(l_dummmyDeal)));

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
			var l_objPPCloneChannelData = l_objPricePlanCloneData[p_channel].Proposed.children;
			//l_objPPCloneChannelData.push(JSON.parse(JSON.stringify(l_dummmyDeal)));

			l_objPPCloneChannelData.splice(2, 0, JSON.parse(JSON.stringify(l_dummmyDeal)));

			//this.inserDealToCurrent(l_dummmyDeal, p_channel);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.refreshProposedGridAndSort = function (pChannel) {
		try {
			var l_Channels = ["ON", "OFF"];
			var l_Sections = ["Current", "Proposed"];
			var l_TGGRIDID = {
				"ON" : {
					"Current" : "TG_OnPremisesCurrent",
					"Proposed" : "TG_OnPremisesProposed"
				},
				"OFF" : {
					"Current" : "TG_OffPremisesCurrent",
					"Proposed" : "TG_OffPremisesProposed"
				}
			};

			var l_sortPreference = getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence.sort;
			var l_sortOrder = "DESC";

			if (l_sortPreference == undefined) {
				l_sortPreference = "Descending";
			}
			if (l_sortPreference == "Ascending") {
				l_sortOrder == "ASC";
			} else if (l_sortPreference == "Descending") {
				l_sortOrder == "DESC";
			}

			switch (pChannel) {
			case "ON": {
					for (var l_channel in l_Channels) {
						var l_objGrid = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]]["ON"]).TGObj;
						var l_objStore = l_objGrid.getStore();
						l_objGrid.view.refresh();
						l_objStore.sort("NetList", l_sortOrder);
					}
					break;
				}
			case "OFF": {
					for (var l_channel in l_Channels) {
						var l_objGrid = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]]["OFF"]).TGObj;
						var l_objStore = l_objGrid.getStore();
						l_objGrid.view.refresh();
						l_objStore.sort("NetList", l_sortOrder);
					}
					break;
				}
			default: {
					for (var l_channel in l_Channels) {
						for (var l_section in l_Sections) {
							var l_objGrid = Ext.getCmp(l_TGGRIDID[l_Channels[l_channel]][l_Sections[l_section]]).TGObj;
							var l_objStore = l_objGrid.getStore();
							l_objGrid.view.refresh();
							l_objStore.sort("NetList", l_sortOrder);
						}
					}
					break;
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.addRowVolumeAndBusisness = function (p_channel) {
		try {
			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesProposed",
				"OFF" : "TG_OffPremisesProposed"
			};

			var l_objTG = Ext.getCmp(l_TGGRIDID[p_channel]).TGObj;
			var l_storeTG = l_objTG.getStore();
			var l_planningYear = Ext.getCmp(m_CMB_WORKFLOW).getValue().year;
			var l_dummmyRow = JSON.parse(JSON.stringify(getObjectFactory().getConfigurationManager().getDummyRow().BuisneesAndVolume));

			var l_objPricePlanData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlan();
			var l_objChannelData = l_objPricePlanData[p_channel].Proposed.children;
			if (l_objChannelData.length == 0) {
				for (var rows in l_dummmyRow) {
					if (l_dummmyRow[rows].MetricsType == "Volume") {
						l_dummmyRow[rows].Qualifier.concat(l_planningYear)
					}
					var l_rootnode = l_storeTG.getRootNode();
					l_rootnode.appendChild(l_dummmyRow[rows]);
					//l_storeTG.add(l_dummmyDeal);
					l_objChannelData.push(l_dummmyRow[rows]);
				}
				this.addRowNetFOBAndRAB(p_channel);
			}

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
			var l_objPPCopyChannelData = l_objPricePlanCloneData[p_channel].Proposed.children;

			var l_dummmyRow = JSON.parse(JSON.stringify(getObjectFactory().getConfigurationManager().getDummyRow().BuisneesAndVolume));
			if (l_objPPCopyChannelData.length == 0) {
				for (var rows in l_dummmyRow) {
					if (l_dummmyRow[rows].MetricsType == "Volume") {
						l_dummmyRow[rows].Qualifier.concat(l_planningYear)
					}
					l_objPPCopyChannelData.push(l_dummmyRow[rows]);
				}
				//this.addRowNetFOBAndRAB(p_channel);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.addRowNetFOBAndRAB = function (p_channel) {
		try {
			var l_objDGSummary = Ext.getCmp("grdSummaryProposed").DGObj;
			var l_storeDGSummary = l_objDGSummary.getStore();
			if (p_channel == "OFF") {
				var l_index = [5, 7];
				var l_dummmyRow = JSON.parse(JSON.stringify(getObjectFactory().getConfigurationManager().getDummyRow().OffPremises));
			} else if (p_channel == "ON") {
				var l_index = [6, 8];
				var l_dummmyRow = JSON.parse(JSON.stringify(getObjectFactory().getConfigurationManager().getDummyRow().OnPremises));
			}
			var l_objPricePlanData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlan();
			var l_objSummaryData = l_objPricePlanData["Price Plan"].Summary;

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanCloneData = l_objPricePlan.getPricePlanCloneData();
			var l_objCloneSummaryData = l_objPricePlanCloneData["Price Plan"].Summary;

			console.log("Dummy Row==============");
			console.log(l_dummmyRow);
			console.log("DummyRow===============");

			l_storeDGSummary.insert(l_index[0], l_dummmyRow.NetFOB);
			l_storeDGSummary.insert(l_index[1], l_dummmyRow.RAB);

			l_objSummaryData.splice(l_index[0], 0, l_dummmyRow.NetFOB);
			l_objSummaryData.splice(l_index[1], 0, l_dummmyRow.RAB);

			l_objCloneSummaryData.splice(l_index[0], 0, l_dummmyRow.NetFOB);
			l_objCloneSummaryData.splice(l_index[1], 0, l_dummmyRow.RAB);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.removeRowVolumeAndBusisness = function (p_channel, pblnIsNewPP) {
		try {

			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesProposed",
				"OFF" : "TG_OffPremisesProposed"
			};
			var l_objTG = Ext.getCmp(l_TGGRIDID[p_channel]).TGObj;
			var l_storeTG = l_objTG.getStore();
			var blnDealFound = false;
			for (var rec in l_storeTG.data.items) {
				if (l_storeTG.data.items[rec].data.hasOwnProperty("DealID")) {
					blnDealFound = true;
					break;
				}
			}

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlan();
			var l_objChannelData = l_objPricePlanData[p_channel].Proposed.children;
			if (!blnDealFound) {

				this.emptyChannelData(p_channel);
				if (l_objChannelData != undefined)
					l_objChannelData.splice(0, l_objChannelData.length);

				this.removeRowNetFOBAndRAB(p_channel, pblnIsNewPP);

			}
			l_objTG.view.refresh();
			console.log("DealFound");
			console.log(blnDealFound);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.emptyChannelData = function (pChannel, pblnIsNewPP) {
		try {
			var l_TGGRIDID = {
				"ON" : "TG_OnPremisesProposed",
				"OFF" : "TG_OffPremisesProposed"
			};

			var l_objTG = Ext.getCmp(l_TGGRIDID[pChannel]).TGObj;
			var l_storeTG = l_objTG.getStore();
			var l_dataGrid = l_storeTG.data.items;

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlan();
			var l_objChannelData = l_objPricePlanData[pChannel].Proposed.children;

			var l_objPricePlanClonedData = l_objPricePlan.getPricePlanCloneData();
			var l_objChannelClonedData = l_objPricePlanClonedData[pChannel].Proposed.children;

			//remove Deal from store
			for (var l_records in l_dataGrid) {
				if (l_dataGrid[l_records].data.hasOwnProperty("DealID")) {
					l_dataGrid[l_records].remove();
				}
			}

			for (var l_records in l_objChannelData) {
				if (l_objChannelData[l_records].hasOwnProperty("DealID")) {
					l_objChannelData.splice(l_records, 1);
				}

			}

			for (var l_records in l_objChannelClonedData) {
				if (l_objChannelClonedData[l_records].hasOwnProperty("DealID")) {
					l_objChannelClonedData.splice(l_records, 1);
				}

			}

			//**************************************************************************//
			//below code was used to remove eniter channel
			/*	if (l_objChannelData != undefined) {
			l_objChannelData.splice(0, l_objChannelData.length);
			}
			if (l_dataGrid != undefined) {
			for (var l_RowIdxdata = l_dataGrid.length; l_RowIdxdata >= 0; l_RowIdxdata--) {
			if (l_dataGrid[l_RowIdxdata] != undefined)
			l_dataGrid[l_RowIdxdata].remove();
			}
			}
			if (pblnIsNewPP) {
			var l_objPricePlanClonedData = l_objPricePlan.getPricePlanCloneData();
			var l_objChannelClonedData = l_objPricePlanClonedData[pChannel].Proposed.children;
			if (l_objChannelClonedData != undefined) {
			l_objChannelClonedData.splice(0, l_objChannelClonedData.length);
			}
			}*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.removeRowNetFOBAndRAB = function (p_channel, pblnIsNewPP) {
		try {
			var l_objDGSummary = Ext.getCmp("grdSummaryProposed").DGObj;
			var l_storeDGSummary = l_objDGSummary.getStore();
			var l_dataDGSummary = l_storeDGSummary.getData();
			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanData = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID).getPricePlan();

			var l_objSummaryData = l_objPricePlanData["Price Plan"].Summary;

			if (p_channel == "OFF") {
				var l_arrRowstoRemove = ["OffPremiseNetFOB", "OffPremiseRAB"];
			} else if (p_channel == "ON") {
				var l_arrRowstoRemove = ["OnPremiseNetFOB", "OnPremiseRAB"];
			}

			for (var l_records in l_dataDGSummary.items) {
				if (l_dataDGSummary.items[l_records].data.MetricsType == l_arrRowstoRemove[0] && l_dataDGSummary.items[l_records].data.Type == "Proposed") {
					l_storeDGSummary.removeAt(l_records);
					break;
				}
			}
			for (var l_records in l_dataDGSummary.items) {
				if (l_dataDGSummary.items[l_records].data.MetricsType == l_arrRowstoRemove[1] && l_dataDGSummary.items[l_records].data.Type == "Proposed") {
					l_storeDGSummary.removeAt(l_records);
					break;
				}
			}

			for (var l_record in l_objSummaryData) {
				if (l_objSummaryData[l_records].MetricsType == l_arrRowstoRemove[0] && l_objSummaryData[l_records].Type == "Proposed") {
					l_objSummaryData.splice(l_records, 1);
					break;

				}
			}
			for (var l_record in l_objSummaryData) {
				if (l_objSummaryData[l_records].MetricsType == l_arrRowstoRemove[1] && l_objSummaryData[l_records].Type == "Proposed") {
					l_objSummaryData.splice(l_records, 1);
					break;
				}
			}

			if (pblnIsNewPP) {
				var l_objPricePlanClonedData = l_objPricePlan.getPricePlanCloneData();
				var l_objSummaryClonedData = l_objPricePlanClonedData["Price Plan"].Summary;

				for (var l_record in l_objSummaryClonedData) {
					if (l_objSummaryClonedData[l_records].MetricsType == l_arrRowstoRemove[0] && l_objSummaryClonedData[l_records].Type == "Proposed") {
						l_objSummaryClonedData.splice(l_records, 1);
						break;
					}
				}
				for (var l_record in l_objSummaryClonedData) {
					if (l_objSummaryClonedData[l_records].MetricsType == l_arrRowstoRemove[1] && l_objSummaryClonedData[l_records].Type == "Proposed") {
						l_objSummaryClonedData.splice(l_records, 1);
						break;
					}
				}

			}

			l_objDGSummary.view.refresh();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.setDealLevelSummary = function (pDealData, pQualifier) {
		try {
			var l_getValueFromMonth;
			var l_NameToCodeMapping = {};
			var IDX_MONTH_MAP = {
				1 : "Jan",
				2 : "Feb",
				3 : "Mar",
				4 : "Apr",
				5 : "May",
				6 : "Jun",
				7 : "Jul",
				8 : "Aug",
				9 : "Sep",
				10 : "Oct",
				11 : "Nov",
				12 : "Dec"
			};

			var timeDetails = getGlobalConstantsObj().getTimeDetails();
			var timeMebCode = timeDetails.CurrentMonthCode;
			var l_currMonth = timeMebCode.substring(4, 6);
			var l_currYear = timeDetails.CurrentYear;
			var l_userPreference = getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence;
			var l_planningYear = getGlobalConstantsObj().getPlanningYear();
			if (l_userPreference.hasOwnProperty("Net_List_ATAX")) {
				l_NameToCodeMapping["Net_FOB"] = "NetFOB";
				l_NameToCodeMapping["Net_List_ATAX"] = "NetList";
				l_NameToCodeMapping["Shelf"] = "Shelf";

			} else {
				l_NameToCodeMapping["Net_FOB"] = "NetFOB";
				l_NameToCodeMapping["Net_List"] = "NetList";
				l_NameToCodeMapping["Shelf"] = "Shelf";

			}

			if (Number(l_planningYear) < Number(l_currYear)) {
				l_getValueFromMonth = 12;
			} else if (Number(l_planningYear) == Number(l_currYear)) {
				l_getValueFromMonth = Ext.clone(Number(l_currMonth));

				for (var facts in pDealData.children) {
					if (pDealData.children[facts][m_columnFactCode] != undefined) {
						if (pDealData.children[facts][m_columnFactCode] == "Shelf") {
							while ((pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == undefined || pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == null || pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == "") && Number(l_getValueFromMonth) < 13) {
								l_getValueFromMonth++;

							}
							break;
						}
					}
				}

			} else if (Number(l_planningYear) > Number(l_currYear)) {
				l_getValueFromMonth = 1;

				for (var facts in pDealData.children) {
					if (pDealData.children[facts][m_columnFactCode] != undefined) {
						if (pDealData.children[facts][m_columnFactCode] == "Shelf") {
							while ((pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == undefined || pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == null || pDealData.children[facts][IDX_MONTH_MAP[l_getValueFromMonth]] == "") && Number(l_getValueFromMonth) < 13) {
								l_getValueFromMonth++;

							}
							break;
						}
					}

				}

			}

			for (var l_field in pDealData.children) {
				for (var dealAttr in l_NameToCodeMapping) {
					if (pDealData.children[l_field][m_columnFactCode] != undefined) {
						if (l_NameToCodeMapping.hasOwnProperty(pDealData.children[l_field][m_columnFactCode])) {
							pDealData[l_NameToCodeMapping[pDealData.children[l_field][m_columnFactCode]]] = pDealData.children[l_field][IDX_MONTH_MAP[l_getValueFromMonth]];
							break;
						}

					}
				}
			}
			//Copy qualifier if deal front line deal changed
			if (pQualifier) {
				pDealData["Qualifier"] = pQualifier[IDX_MONTH_MAP[l_getValueFromMonth]];
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.setDealCountInGirdHeader = function () {
		try {

			var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
			var l_objPricePlanClonedData = Ext.clone(l_objPricePlan.getPricePlanCloneData());

			var l_objSpanIds = {
				"ON" : {
					"Current" : "spanDealCountOnPremisesCurrent",
					"Proposed" : "spanDealCountOnPremisesProposed"
				},
				"OFF" : {
					"Current" : "spanDealCountOffPremisesCurrent",
					"Proposed" : "spanDealCountOffPremisesProposed"
				}
			}

			var l_hasPGDeal = false;

			var l_Channels = ["ON", "OFF"];
			var l_Sections = ["Current", "Proposed"]
			for (var l_channel in l_Channels) {
				for (var l_section in l_Sections) {
					var l_objSpanDealCount = Ext.get(l_objSpanIds[l_Channels[l_channel]][l_Sections[l_section]]);
					if (l_objSpanDealCount != undefined || l_objSpanDealCount != null) {
						var l_objChannelData = l_objPricePlanClonedData[l_Channels[l_channel]][l_Sections[l_section]].children;
						var l_dealCount = 0;
						l_hasPGDeal = false;
						for (var l_records in l_objChannelData) {
							if (l_objChannelData[l_records].hasOwnProperty("DealID") && l_objChannelData[l_records].MetricsType != 'PG') {
								l_dealCount++;
							}
							if (l_objChannelData[l_records].MetricsType == 'PG') {
								l_hasPGDeal = true;
							}
						}

						if (!l_objPricePlan.isFrontLinePP() && !Ext.getCmp("btn_PP_PromoGoods").isDisabled() && l_hasPGDeal) {
								l_dealCount = l_dealCount + 1;

						}

						l_objSpanDealCount.setText(l_dealCount);
					}
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.onBtnImpactAnalysisOpenClick = function (button, e, eOpts) {
		try {
			//Activate impact View............
			getPricePlanControllerManagerObj().setPricePlanMainView();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.setPricePlanMainView = function (pOptTabBtnClick) {
		try {

			if (VistaarExtjs.getCmp("btnImpactAnalysisOpen").pressed) {
				var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				/**HIDE BEST PRACTICES POPUP WINDOW WHILE RENDERING IMPACT VIEW**/
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager().hideBestPracticePopup();
				if (pOptTabBtnClick) {
					getObjectFactory().getImpactAnalysisManager().renderImpactAnalysisView();
					//Set Chhanel button state.....
					getObjectFactory().getImpactAnalysisManager().setCurrentChannelSelectionState(getObjectFactory().getImpactAnalysisManager().m_arrSelectedChannels);
				} else {
					getObjectFactory().getImpactAnalysisManager().btnImpactAnalyisis_Click(l_objPricePlan.getPricePlan(), l_objPricePlan.getPricePlanState(), l_objPricePlan.getWorkflowLevelComments());
				}
				getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(true);
				//return false;
			} else { //Initially Hide Impact Comments Fields when impact view is Visible
				getObjectFactory().getImpactAnalysisManager().hideImpactAnalysisCommentsWindow();
				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().renderPricePlanGridView();
				getObjectFactory().getPricePlanControllerManager().hidePricePlanOperationBtn(false);
				//Set Freeze column grid view.....
				getPricePlanControllerManagerObj().getPricePlanUIManager().setFreezeColumnGridView();

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.hidePricePlanOperationBtn = function (p_blnValue) {
		try {
			if (p_blnValue == "HistoricImpact") {
				VistaarExtjs.getCmp("menuExportPricePlan").addCls("clsHistoricExportMenu");
				//Hide Freeze Column
				VistaarExtjs.getCmp("cntFreezeColumnGrid").setMaxHeight(0);
				//Hide Operation Button....
				var l_arrHistoricImpactBtnToHide = ["btn_PP_PromoGoods", "cnt_PP_WorkFlowButtons", "btnSubmit", "btnSavePricePlan", "btnPricePlanDelete", "btnPreference", "btnBestPractices", "btn_PP_Historical", "btn_IA_TaskHistory", "btnImpactAnalysisOpen", "btn_PP_TaskHistory"];
				var l_arrHistoricImpactBtnToShow = ["btn_Impact_OnPremiseChannel", "btn_Impact_OffPremiseChannel", "btn_Historic_TaskHistory"]
				for (var l_index in l_arrHistoricImpactBtnToHide) {
					VistaarExtjs.getCmp(l_arrHistoricImpactBtnToHide[l_index]).setHidden(true);
				}
				for (var l_index in l_arrHistoricImpactBtnToShow) {
					VistaarExtjs.getCmp(l_arrHistoricImpactBtnToShow[l_index]).setHidden(false);
				}
			} else {
				//Hide Histoeic Impact Taks History button...
				if (VistaarExtjs.getCmp("btn_Historic_TaskHistory").isVisible()) {
					VistaarExtjs.getCmp("btn_Historic_TaskHistory").hide();
				}
				//Add cls for export menu
				VistaarExtjs.getCmp("menuExportPricePlan").removeCls("clsHistoricExportMenu");
				var l_arrDefaultBtnToShow = ["btnSavePricePlan", "btnPricePlanDelete", "btnPreference", "btnBestPractices", "btnImpactAnalysisOpen", "btn_PP_Historical"];
				for (var l_index in l_arrDefaultBtnToShow) {
					VistaarExtjs.getCmp(l_arrDefaultBtnToShow[l_index]).setHidden(false);
				}
				var l_arrPPOpertionBtn = ["btn_PP_PromoGoods", "btn_PP_TaskHistory"];
				var l_arrImpactViewBtn = ["btn_Impact_OnPremiseChannel", "btn_Impact_OffPremiseChannel", "btn_IA_TaskHistory"];
				for (var l_index in l_arrPPOpertionBtn) {
					VistaarExtjs.getCmp(l_arrPPOpertionBtn[l_index]).setHidden(p_blnValue);
				}
				for (var l_index in l_arrImpactViewBtn) {
					VistaarExtjs.getCmp(l_arrImpactViewBtn[l_index]).setVisible(p_blnValue);
				}

				//Apply UIACL based on Workflow Config.............
				var l_arrWorkFlowCompIDs = ["cnt_PP_WorkFlowButtons", "btnSubmit"];
				for (var cmpID in l_arrWorkFlowCompIDs) {
					if (m_objWorkFlowConfig != undefined && l_arrWorkFlowCompIDs[cmpID] == m_objWorkFlowConfig.cmpID) {
						VistaarExtjs.getCmp(l_arrWorkFlowCompIDs[cmpID]).setVisible(true);
					} else {
						VistaarExtjs.getCmp(l_arrWorkFlowCompIDs[cmpID]).setVisible(false);
					}
				}
			}
			//VistaarExtjs.getCmp('btn_PP_Historical').setVisible(p_blnValue);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.btnExportPricePlanPDF = function (button, e, eOpts) {
		var l_Id_ActiveView = VistaarExtjs.getCmp("cntPricePlanCard").getLayout().getActiveItem().id;
		if (l_Id_ActiveView == "cntPricePlanGridView") {
			var exportPP = new ExportPricePlan();
			exportPP.ExportPDF();
		} else if (l_Id_ActiveView == "cntImpactAnalysisMain") {
			var exportIA = new ExportImpactAnalysis("gridImpactAnalysis", "chartImpactAnalysis", "ImpactAnalysis");
			exportIA.ExportPDF();
		} else if (l_Id_ActiveView == "cntHistoricImpactMain") {
			var exportHI = new ExportImpactAnalysis("gridHistoricImpact", "chartHistoricImpact", "HistoricImpact");
			exportHI.ExportPDF();
		}
	};

	this.btnExportPricePlanExcel = function (button, e, eOpts) {
		var l_Id_ActiveView = VistaarExtjs.getCmp("cntPricePlanCard").getLayout().getActiveItem().id;
		if (l_Id_ActiveView == "cntPricePlanGridView") {
			var exportPP = new ExportPricePlan();
			exportPP.ExportExcel();
		} else if (l_Id_ActiveView == "cntImpactAnalysisMain") {
			var exportIA = new ExportImpactAnalysis("gridImpactAnalysis", "chartImpactAnalysis", "ImpactAnalysis");
			exportIA.ExportExcel();
		} else if (l_Id_ActiveView == "cntHistoricImpactMain") {
			var exportHI = new ExportImpactAnalysis("gridHistoricImpact", "chartHistoricImpact", "HistoricImpact");
			exportHI.ExportExcel();
		}
	};

	/**Ctrl+Z implementation**/
	this.onKeyPressEvent = function (e) {
		try {
			var evtobj = window.event ? event : e
				if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
					if (getDealPanelMgrObj('DealView').isDealViewActive()) {
						//Deal VIew Ctrl+Z Operation
						getDealPanelMgrObj('DealView').onUndoClick();
					} else if (getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()) {
						var l_objPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
						var l_ObjPricePlanCloneCopy = Ext.clone(l_objPricePlan.getPricePlanCloneData());
						var StackTOPObject = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().popEditedStackTopData();
						if (StackTOPObject) {

							//Set clone copy data for last edited cell...............
							var l_objTreeGridIDs = {
								"ON" : "TG_OnPremisesProposed",
								"OFF" : "TG_OffPremisesProposed"
							};
							var l_objPG_GridIDs = {
								"ON" : "DG_PGOnPremisesProposed",
								"OFF" : "DG_PGOffPremisesProposed"
							};
							var l_objPG_Qual_GridIDs = {
								"ON" : "DG_PG_Qual_OnPreProposed",
								"OFF" : "DG_PG_Qual_OffPreProposed"
							};
							var l_bln_isSummaryGridCalcReq = true;
							var l_bln_isPGGridCalcReq = true;
							var l_isTreeGridCalcReq = true;
							var l_GridRowType;
							var l_ObjCloneGridData;
							var l_strCloneData;
							var l_arrGridData;
							if (StackTOPObject.AttributeName == "DealValues") {
								l_ObjCloneGridData = l_ObjPricePlanCloneCopy[StackTOPObject.Channel].Proposed.children;
								//Fetch clone data from price plan clone copy..................
								for (var arrayIndex in l_ObjCloneGridData) {
									if (l_ObjCloneGridData[arrayIndex].DealID == StackTOPObject.DealID) {
										l_strCloneData = l_ObjCloneGridData[arrayIndex][StackTOPObject.Month];
										break;
									}
								}
								l_arrGridData = Ext.getCmp(l_objTreeGridIDs[StackTOPObject.Channel]).TGObj.getStore().getData();
								//Set Last Edited Grid Data with clone copy......
								for (var l_rowIdx in l_arrGridData.items) {
									if (l_arrGridData.items[l_rowIdx].data.DealID != undefined) {
										if (l_arrGridData.items[l_rowIdx].data.DealID === StackTOPObject.DealID) {
											l_arrGridData.getAt(l_rowIdx).set(StackTOPObject.Month, l_strCloneData);
											break;
										}
									}
								}
								l_bln_isPGGridCalcReq = false;
							} else if (StackTOPObject.AttributeName == "Values") {
								l_ObjCloneGridData = l_ObjPricePlanCloneCopy[StackTOPObject.Channel].Proposed.children;
								//Fetch clone data from price plan clone copy..................
								for (var arrayIndex in l_ObjCloneGridData) {
									if (l_ObjCloneGridData[arrayIndex]["MetricsType"] == "Volume") {
										l_strCloneData = l_ObjCloneGridData[arrayIndex][StackTOPObject.Month];
										break;
									}
								}
								l_arrGridData = Ext.getCmp(l_objTreeGridIDs[StackTOPObject.Channel]).TGObj.getStore().getData();
								//Set Last Edited Grid Data with clone copy......
								for (var l_rowIdx in l_arrGridData.items) {
									if (l_arrGridData.items[l_rowIdx].data["MetricsType"] == "Volume") {
										l_arrGridData.getAt(l_rowIdx).set(StackTOPObject.Month, l_strCloneData);
										break;
									}
								}
								l_GridRowType = "Volume";
							} else if (StackTOPObject.AttributeName == "Percent of Business" || StackTOPObject.AttributeName == "PG_SDA") {
								l_ObjCloneGridData = l_ObjPricePlanCloneCopy["PG_" + StackTOPObject.Channel].Proposed;
								//Fetch clone data from price plan clone copy..................
								for (var arrayIndex in l_ObjCloneGridData) {
									if (l_ObjCloneGridData[arrayIndex]["MetricsType"] == StackTOPObject.AttributeName) {
										l_strCloneData = l_ObjCloneGridData[arrayIndex][StackTOPObject.Month];
										break;
									}
								}
								l_arrGridData = Ext.getCmp(l_objPG_GridIDs[StackTOPObject.Channel]).DGObj.getStore().getData();
								//Set Last Edited Grid Data with clone copy......
								for (var l_rowIdx in l_arrGridData.items) {
									if (l_arrGridData.items[l_rowIdx].data["MetricsType"] == StackTOPObject.AttributeName) {
										l_arrGridData.getAt(l_rowIdx).set(StackTOPObject.Month, l_strCloneData);
										break;
									}
								}
								l_GridRowType = StackTOPObject.AttributeName;
								l_isTreeGridCalcReq = false;
							} else if (StackTOPObject.AttributeName == "PRG_Qualifier") {
								l_ObjCloneGridData = l_ObjPricePlanCloneCopy["PG_" + StackTOPObject.Channel].Qualifier_Proposed;
								//Fetch clone data from price plan clone copy..................
								l_strCloneData = l_ObjCloneGridData[0]["Qualifier"];
								l_arrGridData = Ext.getCmp(l_objPG_Qual_GridIDs[StackTOPObject.Channel]).DGObj.getStore().getData();
								//Set Last Edited Grid Data with clone copy......
								l_arrGridData.getAt(0).set("Qualifier", l_strCloneData);
								l_bln_isSummaryGridCalcReq = false;
								l_bln_isPGGridCalcReq = false;
								l_isTreeGridCalcReq = false;
							}

							/*****Price Plan Grids Calculation Section**********/
							//Promo-Goods Grid calculation............
							if (l_bln_isPGGridCalcReq) {
								getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChanges(l_GridRowType, StackTOPObject.Month, StackTOPObject.Channel);
							}
							//Summary Grid calculation.........
							if (l_bln_isSummaryGridCalcReq) {
								getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
							}
							//Tree Grid Calculation...........
							if (l_isTreeGridCalcReq) {
								if (StackTOPObject.Channel == "ON")
									getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
								else
									getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
							}
						}
					}
				}
		} catch (err) {
			getCommonFuncMgr().printLog(err);

		}

	}

	// best practice - 5 Oct 15
	this.setBestracticeGuidanceData = function (pFetchBPData) {
		this.m_bestPracticeGuidance = pFetchBPData;
	};
	this.getBestracticeGuidanceData = function () {
		if (this.m_bestPracticeGuidance == undefined) {
			//Fetch Best Practice Guidance.......................
			getPricePlanControllerManagerObj().fetchBestPractices(getPricePlanControllerManagerObj().getActivePricePlanData().Scope);
			if (this.m_bestPracticeGuidance == undefined) {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
			}
		}
		return this.m_bestPracticeGuidance;
	};
	this.setHistoricalPricePlanReportData = function (pFetchHistoricalData) {
		if (pFetchHistoricalData == undefined) {
			this.m_historicalPP_ReportData = undefined
		} else {
			this.m_historicalPP_ReportData = pFetchHistoricalData.AuditReportQuery;
		}
	};
	this.getHistoricalPricePlanReportData = function () {
		if (this.m_historicalPP_ReportData == undefined) {
			//Fetch Best Practice Guidance.......................
			getPricePlanControllerManagerObj().fetchHistoricalPricePlanReports(getPricePlanControllerManagerObj().getActivePricePlanData().Scope);
			if (this.m_historicalPP_ReportData == undefined) {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
			}
		}
		return this.m_historicalPP_ReportData;
	};
	/***Return WoekFlow action configuration based on current State of Price Plan
	 ***** @param : Price Plan Current Workflow State
	 *****/
	this.getConfigurationWorkFlowAction = function (p_WorkFlowStatus) {
		//Config for WorkFlow Actions Button....
		var l_workflow_Comp_Config = {
			"WIP" : {
				"CreatorMatrix" : {
					"cmpID" : "btnSubmit",
					"WorkFlowActionDetails" : {
						"btnSubmit" : {
							"text" : "Submit",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Approve",
							"cls" : "clsPPOperationButton clsOperationSubmit",
							"isAutoSaveRequired" : true,
							"msgLoadMask" : "Submitting..."
						}
					},
					"isFuturePlan" : false
				}
			},
			"Pending Approval" : {
				"ApproverMatrix" : {
					"cmpID" : "cnt_PP_WorkFlowButtons",
					"WorkFlowActionDetails" : {
						"btn_PP_Approve_OR_Publish_WorkFlow" : {
							"text" : "Approve",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Approve",
							"isAutoSaveRequired" : false,
							"cls" : "clsPPOperationButton clsOperationApprove",
							"msgLoadMask" : "Approving..."
						},
						"btn_PP_Reject_WorkFlow" : {
							"text" : "Reject",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Reject",
							"isAutoSaveRequired" : false,
							"cls" : "clsPPOperationButton clsOperationReject",
							"msgLoadMask" : "Rejecting..."
						}
					},
					"isFuturePlan" : false
				},
				"CreatorMatrix" : {
					"cmpID" : "btnSubmit",
					"WorkFlowActionDetails" : {
						"btnSubmit" : {
							"text" : "Recall",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Recall",
							"isAutoSaveRequired" : false,
							"cls" : "clsPPOperationButton clsOperationRecall",
							"msgLoadMask" : "Recalling..."
						}
					},
					"isFuturePlan" : false
				}
			},
			"Approved" : {
				"PublisherMatrix" : {
					"cmpID" : "cnt_PP_WorkFlowButtons",
					"WorkFlowActionDetails" : {
						"btn_PP_Approve_OR_Publish_WorkFlow" : {
							"text" : "Publish",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Approve",
							"isAutoSaveRequired" : false,
							"cls" : "clsPPOperationButton clsOperationApprove",
							"msgLoadMask" : "Publishing..."
						},
						"btn_PP_Reject_WorkFlow" : {
							"text" : "Reject",
							"callBackAPI" : getPricePlanControllerManagerObj().submitPricePlan,
							"workflowAction" : "Reject",
							"isAutoSaveRequired" : false,
							"cls" : "clsPPOperationButton clsOperationReject",
							"msgLoadMask" : "Rejecting..."
						}
					},
					"isFuturePlan" : false
				}
			}

		}

		var l_default_WorkFlow_Config = {
			"cmpID" : "btnSubmit",
			"WorkFlowActionDetails" : {
				"btnSubmit" : {
					"text" : "Submit",
					"callBackAPI" : "",
					"workflowAction" : "",
					"cls" : "clsPPOperationButton clsOperationSubmit",
				},
			},
			"disable" : true
		}
		if (l_workflow_Comp_Config.hasOwnProperty(p_WorkFlowStatus)) {
			for (var itr_roleMatrix in l_workflow_Comp_Config[p_WorkFlowStatus]) {
				if (getPricePlanControllerManagerObj().getUserPermissionInfo(itr_roleMatrix)) {
					//Add future price plan details......
					if (getPricePlanControllerManagerObj().isFuturePricePlan()) {
						l_workflow_Comp_Config[p_WorkFlowStatus][itr_roleMatrix]["isFuturePlan"] = true;
					}
					return l_workflow_Comp_Config[p_WorkFlowStatus][itr_roleMatrix];
				}
			}
		} else {
			return l_default_WorkFlow_Config;
		}
	};

	/*** Set Approval Workflow UI based on current State of Price Plan
	 ***** @param : Price Plan Current Workflow State
	 *****/
	this.setApprovalWorkflowUI = function (p_str_PP_WorkflowSate) {
		try {
			VistaarAuditingManager.audit({
				"name" : "setApprovalWorkflowUI started"
			}, m_IS_AUDIT_REQUIRED, 561);
			//Set Approval Workflow UI......................
			var l_arrWorkFlowCompIDs = ["cnt_PP_WorkFlowButtons", "btnSubmit"];
			m_ObjUserPermissionInfo = {};
			m_objWorkFlowConfig = getPricePlanControllerManagerObj().getConfigurationWorkFlowAction(p_str_PP_WorkflowSate);
			//Apply UIACL based on Workflow Config.............
			for (var cmpID in l_arrWorkFlowCompIDs) {
				if (m_objWorkFlowConfig != undefined && l_arrWorkFlowCompIDs[cmpID] == m_objWorkFlowConfig.cmpID) {
					VistaarExtjs.getCmp(l_arrWorkFlowCompIDs[cmpID]).setVisible(true);
				} else {
					VistaarExtjs.getCmp(l_arrWorkFlowCompIDs[cmpID]).setVisible(false);
				}
			}
			//Set Workflow action info.............
			var l_arrCustomCls = ["clsPPOperationButton", "clsOperationSubmit", "clsOperationApprove", "clsOperationReject", "clsOperationRecall"];
			for (var wfContlID in m_objWorkFlowConfig.WorkFlowActionDetails) {
				//Ext.getCmp(wfContlID).setText(m_objWorkFlowConfig.WorkFlowActionDetails[wfContlID].text);
				var l_objWorkflowOperation = VistaarExtjs.getCmp(wfContlID);
				l_objWorkflowOperation.setTooltip(m_objWorkFlowConfig.WorkFlowActionDetails[wfContlID].text);
				for (var l_indexCls in l_arrCustomCls) {
					if (l_objWorkflowOperation.hasCls(l_arrCustomCls[l_indexCls])) {
						l_objWorkflowOperation.removeCls(l_arrCustomCls[l_indexCls]);
					}
				}
				//Add current work-flow operation cls....
				l_objWorkflowOperation.addCls(m_objWorkFlowConfig.WorkFlowActionDetails[wfContlID].cls);
				//Enable Workflow Btn...
				if (m_objWorkFlowConfig.disable) {
					l_objWorkflowOperation.disable();
				} else {
					l_objWorkflowOperation.enable();
				}

			}
			VistaarAuditingManager.audit({
				"name" : "setApprovalWorkflowUI ended"
			}, m_IS_AUDIT_REQUIRED, 561);
			//Set Impact Comment PopUp ACL based on WorkFlow Changes
			//getObjectFactory().getImpactAnalysisManager().syncImpactViewWithWorkflow(p_str_PP_WorkflowSate);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.getUserPermissionInfo = function (p_strRoleMatrix) {
		try {
			if (m_ObjUserPermissionInfo.hasOwnProperty(p_strRoleMatrix)) {
				return m_ObjUserPermissionInfo[p_strRoleMatrix];
			} else {
				var l_ObjPricePlan = getPricePlanControllerManagerObj().getPricePlanObject(m_ActivePricePlanID);
				var l_objPricePlanScope = l_ObjPricePlan.getPricePlanFixedAttribute();
				var l_ObjSystemFields = l_ObjPricePlan.getPricePlanSystemFields();

				var l_PermissionScriptInput = {
					"docID" : l_ObjSystemFields["Document Id"],
					"definitionType" : l_ObjSystemFields.WorkFlowProcessDef,
					"scope" : {
						"Scope" : {
							"GeographyMaster" : [{
									"Code" : l_objPricePlanScope["Geography Code"],
									"Level" : l_objPricePlanScope["Geography Level"]
								}
							],
							"PC_BRAND_MASTER" : [{
									"Code" : l_objPricePlanScope["Product Code"],
									"Level" : l_objPricePlanScope["Product Level"]
								}
							]
						}
					},
					"role" : VistaarFunctionLib.getRoleName(),
					"module" : p_strRoleMatrix,
					"workflowState" : l_ObjSystemFields.WorkFlowStatus
				};
				if (p_strRoleMatrix == "ApproverMatrix") {
					//need input for this Script.......
					// var l_contextVariable = VistaarAjax.callESExecuteScript('GetContextVariable', [], [], '', false)
					l_PermissionScriptInput["delegationLevel"] = "Level" + l_ObjPricePlan.getWorkflowApprovalLevel();
				}
				var paramValue = [];
				paramValue.push(l_PermissionScriptInput);

				var ScriptOutput = VistaarAjax.callESExecuteScript('HasPermission', ['permissionInfo'], paramValue, '', false);
				if (ScriptOutput.status.toLowerCase() == "success") {
					m_ObjUserPermissionInfo[p_strRoleMatrix] = (ScriptOutput.response == "true");
					return m_ObjUserPermissionInfo[p_strRoleMatrix];
				} else {
					return false;
				}
			}

		} catch (err) {
			return false;
		}
	}

	/** Return Price Plan Creator Info **/
	this.getPricePlanCreatorInfo = function (p_strCreatorOperation) {
		if (m_objWorkFlowConfig.WorkFlowActionDetails.hasOwnProperty("btnSubmit") && m_objWorkFlowConfig.WorkFlowActionDetails["btnSubmit"].text == p_strCreatorOperation)
			return true;
		else
			return false;
	}

	/** To copy proposed data to current **/
	this.copyProposedToCurrent = function (p_activeData) {
		try {
			var l_CloneData = Ext.clone(p_activeData);
			var l_arrKeysToCheck = ["Type", "MetricsType", "Metrics", "id"];
			var l_summary = p_activeData["Price Plan"]["Summary"];
			var l_clonedSummary = Ext.clone(l_summary);
			p_activeData["OFF"]["Current"] = l_CloneData["OFF"]["Proposed"];
			p_activeData["ON"]["Current"] = l_CloneData["ON"]["Proposed"];
			p_activeData["PG_OFF"]["Current"] = l_CloneData["PG_OFF"]["Proposed"];
			p_activeData["PG_ON"]["Current"] = l_CloneData["PG_ON"]["Proposed"];

			for (var l_prp = 0, l_curr = l_summary.length / 2; l_prp <= l_summary.length / 2 - 1; l_prp++, l_curr++) {
				for (var l_key in l_summary[l_prp]) {
					if (l_summary[l_prp].hasOwnProperty(l_key) && l_summary[l_curr].hasOwnProperty(l_key)) {
						if (l_arrKeysToCheck.indexOf(l_key) == -1) {
							l_summary[l_curr][l_key] = l_clonedSummary[l_prp][l_key];
						}
					}
				}
			}
		} catch (l_objException) {
			getCommonFuncMgr().printLog(l_objException.stack, 3);
		}
	}

	//Purpose : To perform additional functionality while applying Wait on Price Plan View...
	this.setPricePlanViewWaitCursor = function (p_name, p_msg) {
		try {
			setWaitCursor(p_name, p_msg);
			//Hide Freeze column
			if (!m_showFreezecolumn && Ext.getCmp("cntFreezeColumnGrid") && VistaarExtjs.getCmp("cntFreezeColumnGrid").getHeight() != 0) {
				var l_viewContainerObj = Ext.ComponentQuery.query('#viewContainer')[0];
				if (l_viewContainerObj.isMasked(true) == true) {
					//getPricePlanControllerManagerObj().getPricePlanUIManager().disablePricePlanTabTools();
					VistaarExtjs.getCmp("cntFreezeColumnGrid").setHeight(0);
					m_showFreezecolumn = true;
				}
			}

		} catch (l_objException) {
			getCommonFuncMgr().printLog(l_objException.stack, 3);
		}
	}

	//Purpose : To perform additional functionality while removing Wait on Price Plan View...
	this.setPricePlanViewDefaultCursor = function () {
		try {
			setDefaultCursor();
			//Show Freeze column
			var l_viewContainerObj = Ext.ComponentQuery.query('#viewContainer')[0];
			if (m_showFreezecolumn && l_viewContainerObj.isMasked(true) == false && getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive() && VistaarExtjs.getCmp("cntFreezeColumnGrid") && VistaarExtjs.getCmp("cntFreezeColumnGrid").getHeight() == 0) {
				if (VistaarExtjs.getCmp('cntPricePlanGridView') && VistaarExtjs.getCmp('cntPricePlanGridView').getScrollY() >= 95) {
					//getPricePlanControllerManagerObj().getPricePlanUIManager().enablePricePlanTabTools();
					VistaarExtjs.getCmp("cntFreezeColumnGrid").setHeight(24);
				}
				m_showFreezecolumn = false;
			}

		} catch (l_objException) {
			getCommonFuncMgr().printLog(l_objException.stack, 3);
		}
	}
	this.closeDealPanelCallback = function () {
		getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().setPricePlanAsActiveView();
	}
}
