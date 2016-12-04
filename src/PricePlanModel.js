/*
Price Plan Model v2.
 */

var PricePlan = function (p_objPricePlan, p_objScope, objId) {
	this.m_PricePlan = p_objPricePlan;
	this.m_PricePlanScope = p_objScope;
	this.m_PricePlanId = objId;
	this.m_updatedDealRecord;
	this.m_PPSystemFields = p_objPricePlan.PricePlan_SystemFields;
	this.m_DealSystemFields = p_objPricePlan.DealContainer_SystemFields;
	this.m_PricePlanCloneCopy = JSON.parse(JSON.stringify(p_objPricePlan));
	this.currentTimeDetails = p_objPricePlan.CurrenTimeDetails;
	var m_ImpactAnalysis;
	this.m_is_FL_PricePlan = false;
	this.m_WorkFlowCombo = [];
	//this.m_ExclusionDetails = p_objPricePlan.ExclusionDetails;
	//Additionally added to store deleted deal info(Partially or Completely)
	this.m_objDeletedDealInfo = {};
	this.m_objUserCommentsInfo = "";
	this.m_workflowApprovalLevel = p_objPricePlan.AdditionalInfo.WF_Approval_Level;

	//check Validity of Price Plan Data ............
	this.checkValidity = function () {
		this.handleDataValidity(this.m_PricePlan);
		this.handleDataValidity(this.m_PricePlanCloneCopy);
	}

	//Check for Valid Data..............
	this.handleDataValidity = function (p_objPricePlan) {
		//Is OnPremise data present in dataDoc...........
		if (!p_objPricePlan.hasOwnProperty("ON")) {
			p_objPricePlan["ON"] = {
				Current : {
					children : []
				},
				Proposed : {
					children : []
				}
			};
		}

		//Is OffPremise data present in dataDoc...........
		if (!p_objPricePlan.hasOwnProperty("OFF")) {
			p_objPricePlan["OFF"] = {
				Current : {
					children : []
				},
				Proposed : {
					children : []
				}
			};
		}
		//Is PG_ON data present in dataDoc...........
		if (!p_objPricePlan.hasOwnProperty("PG_ON")) {
			p_objPricePlan["PG_ON"] = {
				Current : [],
				Proposed : []
			};
		}
		//Is PG_OFF data present in dataDoc...........
		if (!p_objPricePlan.hasOwnProperty("PG_OFF")) {
			p_objPricePlan["PG_OFF"] = {
				Current : [],
				Proposed : []
			};
		}
	}
	//Set Front Line Price Plan........
	this.setFLPricePlan = function (blnSet) {
		this.m_is_FL_PricePlan = blnSet;
	}
	//Clone Price Plan ..... 1:FuturePlan
	this.isClonePricePlan = function(){
		if (this.m_PricePlan.AdditionalInfo.hasOwnProperty("FuturePlanning")) {
			return (this.m_PricePlan.AdditionalInfo.FuturePlanning == 1);
		}else{
			return false;
		}
	
	}
	//Set Historic Price Plan........
	this.isHistoricPricePlan = function () {
		if(this.m_PricePlan.AdditionalInfo.hasOwnProperty("ReadOnlyPricePlan")){
			return this.m_PricePlan.AdditionalInfo.ReadOnlyPricePlan;
		}
	}

	//Check for Front Line PP...........
	this.isFrontLinePP = function () {
		return this.m_is_FL_PricePlan;
	}
	//set Work Flow Combo for Price Plan................
	this.setWorkFlowCombo = function (p_workFlowData) {
		this.m_WorkFlowCombo = p_workFlowData;
	}

	//Get Work Flow Combo
	this.getWorkFlowComboData = function () {
		return this.m_WorkFlowCombo;
	}

	//SET PRICE PLAN MODEL DATA..............................
	this.setPricePlan = function (objPricePlan, objId) {
		this.m_PricePlan = objPricePlan;
		this.m_PricePlanScope = objPricePlan.Scope;
		this.m_PricePlanId = objId;
		this.m_updatedDealRecord.DealsToBeDeleted = {};
		this.m_updatedDealRecord.VariableAttributesAndValues = [];
		this.m_PricePlanCloneCopy = JSON.parse(JSON.stringify(objPricePlan));
		this.m_PPSystemFields = objPricePlan.PricePlan_SystemFields;
		this.m_DealSystemFields = objPricePlan.DealContainer_SystemFields;
		this.m_WorkFlowCombo = [];
		this.checkValidity();
		this.m_objDeletedDealInfo = {};
		this.currentTimeDetails = objPricePlan.CurrenTimeDetails;
	};
	//Return Price Plan Data..........
	this.getPricePlan = function () {
		return this.m_PricePlan;
	};

	//Return Price Plan Scope........
	this.getPricePlanFixedAttribute = function () {
		if (this.m_PricePlanScope != undefined) {
			return JSON.parse(JSON.stringify(this.m_PricePlanScope));
		}
	};

	//Set Price Plan Fixed Attributes(Scope).................
	this.setPricePlanFixedAttribute = function (p_ObjPricePlanScope) {
		this.m_PricePlanScope = p_ObjPricePlanScope;
	}

	this.getPricePlanSystemFields = function () {
		if (this.m_PPSystemFields != undefined) {
			return JSON.parse(JSON.stringify(this.m_PPSystemFields));
		}
	}

	//Get Price Plan Current State..... WorkFlow related changes @Iteration4
	this.getPricePlanState = function () {
		if (this.m_PPSystemFields != undefined && this.m_PPSystemFields.WorkFlowStatus != undefined) {
			return Ext.clone(Ext.decode(this.m_PPSystemFields.WorkFlowStatus)[0]);
		}
	}

	this.getCurrenTimeDetails = function () {
		if (this.currentTimeDetails != undefined) {
			return this.currentTimeDetails;
		}
	}

	this.setPricePlanSystemFields = function (p_objPPSystemFields) {
		this.m_PPSystemFields = p_objPPSystemFields;
	}

	this.getDealSystemFields = function () {
		//if (this.m_DealSystemFields != undefined) {
		return this.m_DealSystemFields;
		//}
	}

	this.setDealSystemFields = function (p_objDealSystemFields) {
		this.m_DealSystemFields = p_objDealSystemFields;
	}
	//Return Price Plan ID.....................
	this.getPricePlanId = function () {
		return this.m_PricePlanId;
	}

	//Return Price Plan Clone Data(Unmodified data)............
	this.getPricePlanCloneData = function () {
		return this.m_PricePlanCloneCopy;
	}

	//Update Price Plan Clone Data After Price Plan Save ............
	this.updatePricePlanCloneData = function (p_operationType, p_PromoGoodsDeleteScope) {

		//this.m_PricePlanCloneCopy = JSON.parse(JSON.stringify(this.m_PricePlan));
		var p_arrEditedRecord = this.m_updatedDealRecord.VariableAttributesAndValues;
		var l_PG_Key = {
			"ON" : "PG_ON",
			"OFF" : "PG_OFF"
		}
		//Iterate Loop for Edited record..............
		for (var l_index_EditedRecord in p_arrEditedRecord) {
			var l_objChannelInfo = p_arrEditedRecord[l_index_EditedRecord]["Variable Attributes"];
			var l_objFilterPPdata = this.m_PricePlanCloneCopy[l_objChannelInfo["Channels"]][l_objChannelInfo["Version"]]["children"];
			var l_objPGdata = this.m_PricePlanCloneCopy[l_PG_Key[l_objChannelInfo["Channels"]]][l_objChannelInfo["Version"]];
			var l_objPG_Qua_data = this.m_PricePlanCloneCopy[l_PG_Key[l_objChannelInfo["Channels"]]]["Qualifier_Proposed"];
			//Update deal line record....................
			if (p_arrEditedRecord[l_index_EditedRecord]["Variable Attributes"].hasOwnProperty("DealID")) {

				for (var PP_data_index in l_objFilterPPdata) {
					if (l_objFilterPPdata[PP_data_index].DealID == l_objChannelInfo.DealID) {
						for (var editedMonth in p_arrEditedRecord[l_index_EditedRecord]["Values"]) {
								//Issue : Null value changes to zero after reset...
							if(p_arrEditedRecord[l_index_EditedRecord]["Values"][editedMonth] === "" ){
								l_objFilterPPdata[PP_data_index][editedMonth] = null;
							}else{
							l_objFilterPPdata[PP_data_index][editedMonth] = p_arrEditedRecord[l_index_EditedRecord]["Values"][editedMonth] * 100;
							}
						}
						break;
					}
				}
			} else {
				for (var l_attributeKey in p_arrEditedRecord[l_index_EditedRecord]) {
					//update volume of Price Plan Data.....................
					if (l_attributeKey == "Values") {
						for (var editedMonth in p_arrEditedRecord[l_index_EditedRecord]["Values"]) {
							l_objFilterPPdata[0][editedMonth] = p_arrEditedRecord[l_index_EditedRecord]["Values"][editedMonth]
						}
					} else if (l_attributeKey == "PRG_Qualifier") {
						//Update PG_Qualifier Data............................
						l_objPG_Qua_data["Qualifier"] = p_arrEditedRecord[l_index_EditedRecord][l_attributeKey]
					} else {
						//Update PG data .........................
						for (var PG_data_index in l_objPGdata) {
							if (l_objPGdata[PG_data_index].MetricsType == l_attributeKey) {
								for (var editedMonth in p_arrEditedRecord[l_index_EditedRecord][l_attributeKey]) {
									l_objPGdata[PG_data_index][editedMonth] = p_arrEditedRecord[l_index_EditedRecord][l_attributeKey][editedMonth]
								}
								break;
							}
						}
					}
				}
			}
		}
		//Added for Promo Good Enhancement Parts......
		for (var key in l_PG_Key) {
			var l_objPGData = this.m_PricePlan[key]["Proposed"];
			var l_cloneCopy = this.m_PricePlanCloneCopy[key]["Proposed"];
			for (var rowIdx in l_objPGData) {
				if (l_objPGData[rowIdx]["MetricsType"] == "Allocated Budget") {
					//Copy Allocated Cost into clone copy ....
					for (var monthKey in l_objPGData[rowIdx]) {
						l_cloneCopy[rowIdx][monthKey] = l_objPGData[rowIdx][monthKey];
					}
				}
			}
		}
		return this.m_PricePlanCloneCopy;

	}

	//Return Price Plan Modified Record...................
	this.getEditedRecord = function () {
		return this.m_updatedDealRecord.VariableAttributesAndValues;
	}

	//Set Price Plan with  Modified Record....................
	this.setEditedRecord = function (p_arrEditedRecord) {
		this.m_updatedDealRecord.VariableAttributesAndValues = JSON.parse(JSON.stringify(p_arrEditedRecord));
	}

	//Return Updated Record Info for Save Price Plan Script Input...............
	this.getPricePlanUpdatedRecord = function () {
		return this.m_updatedDealRecord;
	}

	this.addDeletedPricePlanDeal = function (p_strDealID, p_timeMemberCode, p_isDealDeleted) {
		this.m_updatedDealRecord.DealsToBeDeleted[p_strDealID] = p_timeMemberCode;
		this.m_objDeletedDealInfo[p_strDealID] = p_isDealDeleted;
	}

	//Reset Price Plan Data with Clone Data ..............
	this.resetPricePlanData = function (p_channelType) {
		if (p_channelType) {
			var l_PG_Grid_channelType = {
				"ON" : "PG_ON",
				"OFF" : "PG_OFF"
			};
			this.m_PricePlan[p_channelType] = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy[p_channelType]));
			this.m_PricePlan[l_PG_Grid_channelType[p_channelType]].Proposed = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy[l_PG_Grid_channelType[p_channelType]].Proposed));
			this.m_PricePlan[l_PG_Grid_channelType[p_channelType]].Qualifier_Proposed = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy[l_PG_Grid_channelType[p_channelType]].Qualifier_Proposed));
		} else {
			this.m_PricePlan = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy));
		}
		return this.m_PricePlan;
	}

	//Check for edit price plan data
	this.isPricePlanDataChanged = function () {
		return !(this.m_updatedDealRecord.VariableAttributesAndValues.length === 0 && Object.getOwnPropertyNames(this.m_updatedDealRecord.DealsToBeDeleted).length === 0);
	}
	//Clear all Edited Price Plan data...............
	this.clearEditedData = function () {
		this.m_updatedDealRecord = {
			"DealsToBeDeleted" : {},
			"VariableAttributesAndValues" : []
		};
		this.m_objDeletedDealInfo = {};
	}

	//Returns Deleted Deals Additional Info..................
	this.getDeletedDealAdditionalInfo = function () {
		return this.m_objDeletedDealInfo;
	}

	//Return Boolean value on the basis of PG_ applicability
	this.getPRGAvailability = function () {
		/*if (this.m_PricePlan.AdditionalInfo.PRG_Status.OFF.Proposed.PRG_State == "Applicable" || this.m_PricePlan.AdditionalInfo.PRG_Status.ON.Proposed.PRG_State == "Applicable") {
			return true;
		} else {
			return false;
		}*/
		return this.m_PricePlan.AdditionalInfo.PRGAvailability;
		// return true;
	}
	//Set Promogoods Availability.....
	this.setPRGAvailability = function (p_PRGAvailability) {
		this.m_PricePlan.AdditionalInfo.PRGAvailability = p_PRGAvailability;
	}

	//Return PG_Effectivity for given Price Plan.....................
	this.get_PG_Effectivity_Info = function () {
		if (this.m_PricePlan.AdditionalInfo.hasOwnProperty("PG_Effectivity")) {
			return this.m_PricePlan.AdditionalInfo.PG_Effectivity;
		}
	}

	//Return Price Plan System Field And Scope....
	this.getPricePlanSystemFieldAndScope = function () {
		var l_Obj_SystemFieldObj = {};
		l_Obj_SystemFieldObj[getGlobalConstantsObj().m_PRICEPLAN_SYSTEMFIELDS] = this.m_PPSystemFields;
		l_Obj_SystemFieldObj[getGlobalConstantsObj().m_DEALCONTAINER_SYSTEMFIELDS] = this.m_DealSystemFields;
		l_Obj_SystemFieldObj[getGlobalConstantsObj().m_SCOPE] = this.m_PricePlanScope;
		return JSON.parse(JSON.stringify(l_Obj_SystemFieldObj));
	}

	//Reset PG Data ...........
	this.resetPGData = function () {
		var l_PG_Grid_channelType = {
			"ON" : "PG_ON",
			"OFF" : "PG_OFF"
		};
		for (var l_channelType in l_PG_Grid_channelType) {
			this.m_PricePlan[l_PG_Grid_channelType[l_channelType]].Proposed = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy[l_PG_Grid_channelType[l_channelType]].Proposed));
			this.m_PricePlan[l_PG_Grid_channelType[l_channelType]].Qualifier_Proposed = JSON.parse(JSON.stringify(this.m_PricePlanCloneCopy[l_PG_Grid_channelType[l_channelType]].Qualifier_Proposed));
		}
		return this.m_PricePlan;

	}
	this.calculateImpact = function () {};

	/**Set Exclusion Details**/

	this.setExclusionDetails = function (p_objExclusionDetails) {
		this.m_PricePlan["ExclusionDetails"]  = p_objExclusionDetails;
	}
	this.setInclusionDetails = function (p_objInclusionDetails) {
		this.m_PricePlan["InclusionDetails"] = p_objInclusionDetails;
	}
	this.setDistributorMaster = function (p_objDistributorMaster) {
		this.m_PricePlan["DistributorMaster"] = p_objDistributorMaster;
	}
	this.setSKUMaster = function (p_objSKUMaster) {
		this.m_PricePlan["SKUMaster"] = p_objSKUMaster;
	}

	this.setWorkflowLevelComments = function (p_UserCommentsInfo) {
		this.m_objUserCommentsInfo = p_UserCommentsInfo
	}

	this.getWorkflowLevelComments = function () {
		if (this.m_objUserCommentsInfo !== "") {
			return this.m_objUserCommentsInfo;
		}
	}
	this.setWorkflowApprovalLevel = function (p_WF_ApprovalLevel) {
		this.m_workflowApprovalLevel = p_WF_ApprovalLevel;
		this.m_PricePlan.AdditionalInfo.WF_Approval_Level = p_WF_ApprovalLevel;
	}
	this.getWorkflowApprovalLevel = function () {
		return this.m_workflowApprovalLevel;
	}
	// Update Evaluation Months for Best Practices..
	this.updateBestPracticesEvaluationMonth = function (p_ObjSaveInput) {
		try {
			var l_arrMonths = getGlobalConstantsObj().m_ARR_MONTH_KEY;
			for (var inputIndex in p_ObjSaveInput) {
				if (p_ObjSaveInput[inputIndex]["Variable Attributes"].hasOwnProperty("DealID")) {
					for (var l_month in p_ObjSaveInput[inputIndex].Values) {
						if (l_arrMonths.indexOf(l_month) <= l_arrMonths.indexOf(this.m_PricePlan.AdditionalInfo.ClosedMonth) && !this.m_PricePlan.AdditionalInfo.EvalBestPracticeMonths[p_ObjSaveInput[inputIndex]["Variable Attributes"]["Channels"]].hasOwnProperty(l_month)) {
							//Add eval month for best practices
							this.m_PricePlan.AdditionalInfo.EvalBestPracticeMonths[p_ObjSaveInput[inputIndex]["Variable Attributes"]["Channels"]][l_month] = true;
							//Also update in clone price plan copy.....
							this.m_PricePlanCloneCopy.AdditionalInfo.EvalBestPracticeMonths[p_ObjSaveInput[inputIndex]["Variable Attributes"]["Channels"]][l_month] = true;
						}
					}
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	/** PG Enhancement**/
	//Return Piggy Bag...
	this.getPiggyBagData = function () {
		if (this.m_PricePlan.PiggyBag) {
			return this.m_PricePlan.PiggyBag;
		}
	}
	/*
	To calculate Impact on new of PricePlan Object uncoment this
	this.calculateImpact(); (Object.getOwnPropertyNames(a).length === 0);
	 */
	/*Another way to make clone copy of object.....
	Ext.clone(Obj)*/
};
