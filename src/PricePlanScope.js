/*
Price Plan Scope class

This class contains Scope related implementation.
 */

function PricePlanScopeManager() {
	var m_CmbRegionCount;
	var m_CmbPricingMarketCount;
	var m_CMB_PRICING_GROUPCount;
	var m_CmbBrandCount;
	var m_CMB_REGION = "cmbIdRegion";
	var m_CMB_PRICINGMARKET = "cmbIdPricingMarket";
	var m_CMB_BRAND = "cmbIdBrand";
	var m_CMB_PRICING_GROUP = "cmbIdPricingGroup";
	var m_CMB_WORKFLOW = "cmbWorkflow";
	/*contains all the combo id*/
	var m_ARR_ComboID = ["cmbIdRegion", "cmbIdPricingMarket", "cmbIdBrand", "cmbIdPricingGroup", "cmbWorkflow"];
	var m_Obj_ActiveScopeData;
	var m_CNT_OUTERPRICEPLAN = "cntOuterPricePlan";
	var m_CNT_PRICEPLANMAIN = "cntPricePlanMain";
	var m_fnFetchPricePlan;
	var m_fnClearPricePlan;
	var m_IS_AUDIT_REQUIRED = false;
	var m_MESSAGES = getObjectFactory().getGlobalConstants().PRICE_PLANS_MESSAGES;

	//INITIALIZE ALL THE COMBO COUNT.................
	this.renderComboCount = function () {
		try {
			if (m_CmbRegionCount == undefined) {
				m_CmbRegionCount = document.createElement('span');
				m_CmbRegionCount.id = "cmbRegionCount";
				m_CmbRegionCount.className = "notification-balloon";
				m_CmbRegionCount.innerHTML = Ext.getStore('store_cmbRegion').getCount();
				var l_objParentContainer = Ext.DomQuery.selectNode('#cmbIdRegion-bodyEl');
				l_objParentContainer.insertBefore(m_CmbRegionCount, l_objParentContainer.firstChild);
			}

			if (m_CmbPricingMarketCount == undefined) {
				m_CmbPricingMarketCount = document.createElement('span');
				m_CmbPricingMarketCount.id = "cmbPricingMarketCount";
				m_CmbPricingMarketCount.className = "notification-balloon";
				m_CmbPricingMarketCount.innerHTML = Ext.getStore('store_cmbPricingMarket').getCount();
				var l_objParentContainer = Ext.DomQuery.selectNode('#cmbIdPricingMarket-bodyEl');
				l_objParentContainer.insertBefore(m_CmbPricingMarketCount, l_objParentContainer.firstChild);
			}

			if (m_CMB_PRICING_GROUPCount == undefined) {
				m_CMB_PRICING_GROUPCount = document.createElement('span');
				m_CMB_PRICING_GROUPCount.id = "cmbPricingGroupCount";
				m_CMB_PRICING_GROUPCount.className = "notification-balloon";
				m_CMB_PRICING_GROUPCount.innerHTML = Ext.getStore('store_cmbPricingGroup').getCount();
				var l_objParentContainer = Ext.DomQuery.selectNode('#cmbIdPricingGroup-bodyEl');
				l_objParentContainer.insertBefore(m_CMB_PRICING_GROUPCount, l_objParentContainer.firstChild);
			}

			if (m_CmbBrandCount == undefined) {
				m_CmbBrandCount = document.createElement('span');
				m_CmbBrandCount.id = "cmbBrandCount";
				m_CmbBrandCount.className = "notification-balloon";
				m_CmbBrandCount.innerHTML = Ext.getStore('store_cmbBrand').getCount();
				var l_objParentContainer = Ext.DomQuery.selectNode('#cmbIdBrand-bodyEl');
				l_objParentContainer.insertBefore(m_CmbBrandCount, l_objParentContainer.firstChild);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Add Sorter object(Case Insensitive Sort Config ) to comboBoxes store....................
	this.addPricePlanComboBoxStoreSorter = function () {
		try {
			var l_objComboStoreSorter = getGlobalConstantsObj().m_ComboStoreSorter;
			VistaarExtjs.getCmp(m_CMB_REGION).getStore().getSorters().add(l_objComboStoreSorter);
			VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getStore().getSorters().add(l_objComboStoreSorter);
			VistaarExtjs.getCmp(m_CMB_BRAND).getStore().getSorters().add(l_objComboStoreSorter);
			VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getStore().getSorters().add(l_objComboStoreSorter);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//UPDATE COMBOBOX COUNT ...................................
	this.updatePricePlanComboCount = function (p_SpanObj, p_Count) {
		try {
			while (p_SpanObj.firstChild) {
				p_SpanObj.removeChild(p_SpanObj.firstChild);
			}
			p_SpanObj.appendChild(document.createTextNode(p_Count));
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/** Price Plan Combo select event callback **/
	this.onPricePlanComboboxSelect = function onPricePlanComboboxSelect(combobox, records, eOpts) {
		try {
			var currentScope = this;
			if (getPricePlanControllerManagerObj().isPricePlanDirty()) {
				Ext.MessageBox.confirm(m_MESSAGES["Save"]["Title"], m_MESSAGES["Save"]["Message"], function (p_btn) {
					if (p_btn == "yes") {
						Ext.defer(function () {
							currentScope.onPricePlanComboboxSelectCallBack(combobox, records, eOpts);
						}, 50);
					} else {
						//Set Previous Selected value of Combo..............
						/*** WorkFlow Combo Issue(Need to set value key) ***/
						combobox.setValue(m_Obj_ActiveScopeData[combobox.id]["Name"]);
						combobox.value = m_Obj_ActiveScopeData[combobox.id]["Code"];
					}
				});
			} else {
				this.onPricePlanComboboxSelectCallBack(combobox, records, eOpts);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//************Function to identify selected value of combo **************
	this.onPricePlanComboboxSelectCallBack = function onPricePlanComboboxSelectCallBack(combobox, records, eOpts) {
		try {
			//IT 977 : PP gets created for un-existing PC if user modifies the PC name from Bred Crum PC dropdown
			//Check Valid Combo Value.....
			if (combobox.findRecord(combobox.valueField, combobox.getValue())) {
				//Hide all Price Plan PopUp.....................
				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups();
				//I).CALLBACK ON 'REGION' DROP DOWN SELECTION TO FETCH DATA FOR 'PRICING MARKET' DROP DOWN
				if (combobox.id == m_CMB_REGION) {
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					//SET COMBO-LINK
					/*m_fnClearPricePlan(true);
					VistaarExtjs.getCmp("cntRegionMarketLink").getEl().addCls("inActive");
					VistaarExtjs.getCmp("cntMarketBrandLink").getEl().addCls("inActive");
					VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().addCls("inActive");
					//Disable Price Structure Tab..............
					getApplicationTabMgrObj().disablePriceStructure();*/
					Ext.defer(function () {
						this.fetchComboMarket();
					}, 100, this);
				}
				//II).CALLBACK ON 'PRICING MARKET' DROP DOWN SELECTION TO FETCH DATA FOR 'BRAND' DROP DOWN
				else if (combobox.id == m_CMB_PRICINGMARKET) {
					//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					//SET COMBO-LINK
					m_fnClearPricePlan(true);
					VistaarExtjs.getCmp("cntRegionMarketLink").getEl().removeCls("inActive");
					getApplicationTabMgrObj().disablePriceStructure();
					Ext.defer(function () {
						this.fetchComboBrand();
					}, 100, this);
				}
				//III).CALLBACK ON 'BRAND' DROP DOWN SELECTION TO FETCH DATA FOR 'PRICING GROUP' DROP DOWN
				else if (combobox.id == m_CMB_BRAND) {
					//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					m_fnClearPricePlan(true);
					//SET COMBO-LINK
					VistaarExtjs.getCmp("cntMarketBrandLink").getEl().removeCls("inActive");
					getApplicationTabMgrObj().disablePriceStructure();
					Ext.defer(function () {
						this.fetchComboPricingGroup();
						//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					}, 100, this);
				}
				//IV).CALLBACK ON 'PRICING GROUP' DROP DOWN SELECTION TO FETCH PRICE PLAN DATA FOR SELECTED SCOPE
				else if (combobox.id == m_CMB_PRICING_GROUP) {
					//SET COMBO-LINK
					VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().removeCls("inActive");
					this.removePricePlanMask();
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					Ext.defer(function () {
						/** Performance Enhancement***/
						//m_fnFetchPricePlan(this.getPricePlanScopeData(), this.getScopeDataKey());
						getPricePlanControllerManagerObj().callSyncOpenPPScript(this.getPPCombineScriptScopeData(), m_fnFetchPricePlan, false);
					}, 100, this);
				}
				//IV).CALLBACK ON 'YEAR' DROP DOWN SELECTION TO FETCH PRICE PLAN DATA FOR SELECTED SCOPE
				else if (combobox.id == m_CMB_WORKFLOW) {
					this.removePricePlanMask();
					var ScopeForScript = this.getPricePlanScopeData();
					ScopeForScript["WorkFlowStatus"] = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().WorkflowStatus;
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					Ext.defer(function () {
						/** Performance Enhancement***/
						//m_fnFetchPricePlan(ScopeForScript, this.getScopeDataKey());
						getPricePlanControllerManagerObj().callSyncOpenPPScript(this.getPPCombineScriptScopeData(), m_fnFetchPricePlan, false);
					}, 100, this);
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*******Validate Price Market combo on Region combo selection********/
	this.validateOnRegionSelection = function () {
		try {
			//Validate Pricing Market
			var l_cmbPriceMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET);
			var valuePriceMarketSelection = l_cmbPriceMarket.getValue();
			var l_bln_isMarketPresent = l_cmbPriceMarket.findRecord(l_cmbPriceMarket.valueField, valuePriceMarketSelection);

			if (!l_bln_isMarketPresent) {
				//If Market not found in store.............
				VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).setValue("");
				//CLEAR BRAND STORE.............
				Ext.getStore("store_cmbBrand").loadData([]);
				VistaarExtjs.getCmp(m_CMB_BRAND).setValue("");
				this.updatePricePlanComboCount(Ext.getElementById("cmbBrandCount"), Ext.getStore("store_cmbBrand").getCount());
				//CLEAR PRICING GROUP STORE..............
				Ext.getStore("store_cmbPricingGroup").loadData([]);
				VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).setValue("");
				this.updatePricePlanComboCount(Ext.getElementById("cmbPricingGroupCount"), Ext.getStore("store_cmbPricingGroup").getCount());
			} else {
				this.fetchComboBrand()
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*******Validate Brand combo on Price Market combo selection********/
	this.validateOnPricingMarketSelection = function () {
		try {
			//Validate Brand
			var l_cmbBrand = VistaarExtjs.getCmp(m_CMB_BRAND);
			var valueBrandSelection = VistaarExtjs.getCmp(m_CMB_BRAND).getValue();
			var l_bln_isBrandPresent = l_cmbBrand.findRecord(l_cmbBrand.valueField, valueBrandSelection);
			if (!l_bln_isBrandPresent) {
				VistaarExtjs.getCmp(m_CMB_BRAND).setValue("");
				VistaarExtjs.getCmp("cntMarketBrandLink").getEl().addCls("inActive");
				//CLEAR PRICING GROUP STORE
				Ext.getStore("store_cmbPricingGroup").loadData([]);
				VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().addCls("inActive");
				VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).setValue("");
				this.updatePricePlanComboCount(Ext.getElementById("cmbPricingGroupCount"), Ext.getStore("store_cmbPricingGroup").getCount());
			} else {
				this.fetchComboPricingGroup();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*******Validate Price Category combo on Brand combo selection********/
	this.validateOnBrandSelection = function (scriptResponse) {
		try {
			//Validate Pricing Group.....
			var l_cmbPricingGroup = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP);
			var valuePricingGroupSelection = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getValue();
			var l_bln_isPricingCategoryPresent = l_cmbPricingGroup.findRecord(l_cmbPricingGroup.valueField, valuePricingGroupSelection);
			if (!l_bln_isPricingCategoryPresent) {
				//Set the first Price Category ......
				VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).setValue(scriptResponse["PricingQuery"][0]["Code"]);
				//VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).value = scriptResponse["PricingQuery"][0]["Code"];
			}
			VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().removeCls("inActive");
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*** Back-end call to Fetch Price Market record***/
	this.fetchComboMarket = function () {
		try {
			var input = [];
			var paramValues = [];
			var l_RegionSelected = VistaarExtjs.getCmp(m_CMB_REGION).getValue();
			input[0] = {
				"Query_Id" : "MarketQuery",
				"UIInput" : {
					"Region" : [l_RegionSelected]
				}

			};
			paramValues.push(input);

			//************Call Script Initialize all combo**************
			VistaarAuditingManager.audit({
				"name" : "ScriptCall Fetch_ComboMarket Started"
			}, m_IS_AUDIT_REQUIRED, 502);

			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, this.fetchComboMarketCallBack, this);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/**Price Market Script Call Back**/
	this.fetchComboMarketCallBack = function (p_ScriptOutput, p_Scope) {
		try {
			m_fnClearPricePlan(true);
			VistaarExtjs.getCmp("cntRegionMarketLink").getEl().addCls("inActive");
			VistaarExtjs.getCmp("cntMarketBrandLink").getEl().addCls("inActive");
			VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().addCls("inActive");
			//Disable Price Structure Tab..............
			getApplicationTabMgrObj().disablePriceStructure();
			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(p_ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "failure") {
					Ext.MessageBox.show({
						title : 'Error',
						msg : "Could not load data into combobox",
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				} else if (l_output.solStatus.toLowerCase() == "success") {
					var scriptResponse = JSON.parse(p_ScriptOutput.response).solResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbPricingMarket").loadData(scriptResponse["MarketQuery"]);
					p_Scope.updatePricePlanComboCount(Ext.getElementById("cmbPricingMarketCount"), scriptResponse["MarketQuery"].length);
					p_Scope.validateOnRegionSelection();
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
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
			VistaarAuditingManager.audit({
				"name" : "ScriptCall Fetch_ComboMarket Ended"
			}, m_IS_AUDIT_REQUIRED, 502);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	}

	/** Back-end Call to Fetch Brand Combo Record**/
	this.fetchComboBrand = function () {
		try {
			var valueRegionSelection = VistaarExtjs.getCmp(m_CMB_REGION).getValue();
			var valuePricingMarketSelection = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
			// script Input.....
			var ScriptInput = [];
			ScriptInput[0] = {
				"Query_Id" : "PPBrandQuery",
				"UIInput" : {
					"Region" : [valueRegionSelection],
					"Market" : [valuePricingMarketSelection]
				}
			}
			var paramValues = [];
			paramValues.push(ScriptInput);
			//call script
			VistaarAuditingManager.audit({
				"name" : "ScriptCall Fetch_Combo_Brand Started"
			}, m_IS_AUDIT_REQUIRED, 503);
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, this.fetchComboBrandCallBack, this);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/** Brand Script Call Back**/
	this.fetchComboBrandCallBack = function (p_ScriptOutput, p_Scope) {
		try {
			//Combo Fetch Brand Store data callback..............
			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(p_ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "failure") {
					Ext.MessageBox.show({
						title : 'Error',
						msg : "Could not load data into combobox",
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				} else if (l_output.solStatus.toLowerCase() == "success") {
					//Update data store with script output
					var scriptResponse = Ext.decode(p_ScriptOutput.response).solResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbBrand").loadData(scriptResponse["PPBrandQuery"]);
					p_Scope.updatePricePlanComboCount(Ext.getElementById("cmbBrandCount"), scriptResponse["PPBrandQuery"].length);
					p_Scope.validateOnPricingMarketSelection();
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
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
			VistaarAuditingManager.audit({
				"name" : "ScriptCall Fetch_Combo_Brand Ended"
			}, m_IS_AUDIT_REQUIRED, 503);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/** Back-end call to Fetch PRICE CATEGORY combo record **/
	this.fetchComboPricingGroup = function () {
		try {
			var valueRegionSelection = VistaarExtjs.getCmp(m_CMB_REGION).getValue();
			var valuePricingMarketSelection = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
			var valueBrandSelection = VistaarExtjs.getCmp(m_CMB_BRAND).getValue();
			var valueYearSelection = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().year;
			//call script
			var inputBrandSelection = [];

			inputBrandSelection[0] = {
				"Query_Id" : "PricingQuery",
				"UIInput" : {
					"Region" : valueRegionSelection == "" ? [] : [valueRegionSelection],
					"Market" : valuePricingMarketSelection == "" ? [] : [valuePricingMarketSelection],
					"Brand" : valueBrandSelection == "" ? [] : [valueBrandSelection],
					"Year" : valueYearSelection == "" ? [] : [valueYearSelection]
				}
			}
			var paramValues = [];
			paramValues.push(inputBrandSelection);
			//Script call
			VistaarAuditingManager.audit({
				"name" : "ScriptCall Fetch_Combo_PricingGroup Started"
			}, m_IS_AUDIT_REQUIRED, 504);
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, this.fetchComboPricingGroupCallBack, this);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/** PRICE CATEGORY Script Callback **/
	this.fetchComboPricingGroupCallBack = function (p_ScriptOutput, p_Scope) {
		try {
			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(p_ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "failure") {
					Ext.MessageBox.show({
						title : 'Error',
						msg : "Could not load data into combobox",
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				} else if (l_output.solStatus.toLowerCase() == "success") {
					//Update data store with script output
					var scriptResponse = Ext.decode(p_ScriptOutput.response).solResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbPricingGroup").loadData(scriptResponse["PricingQuery"]);
					p_Scope.removePricePlanMask();
					//Update Price Category Combo Count....
					p_Scope.updatePricePlanComboCount(Ext.getElementById("cmbPricingGroupCount"), scriptResponse["PricingQuery"].length);

					p_Scope.validateOnBrandSelection(scriptResponse);
					VistaarAuditingManager.audit({
						"name" : "ScriptCall Fetch_Combo_PricingGroup Ended"
					}, m_IS_AUDIT_REQUIRED, 504);
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor(m_CNT_OUTERPRICEPLAN);
					Ext.defer(function () {
						/** Performance Enhancement***/
						//m_fnFetchPricePlan(p_Scope.getPricePlanScopeData(), p_Scope.getScopeDataKey());
						getPricePlanControllerManagerObj().callSyncOpenPPScript(this.getPPCombineScriptScopeData(), m_fnFetchPricePlan, false);
					}, 100, p_Scope);
					//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
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

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/**Render data into Price Plan Combo from PPF UI**/
	this.renderPricePlanComboBox = function (p_ScopeObj, fetchPricePlanCallback, clearPricePlanCallBack) {
		try {
			VistaarAuditingManager.audit({
				"name" : " Initialize All Price Plan combo Started @@@renderPricePlanComboBox"
			}, m_IS_AUDIT_REQUIRED, 505);
			//SET PRICE PLAN CONTROLLERS CALLBACK FUNCTION.....
			m_fnFetchPricePlan = fetchPricePlanCallback;
			m_fnClearPricePlan = clearPricePlanCallBack;

			//CLEAR PRICE PLAN DATA.............................
			m_fnClearPricePlan();

			//ENABLE PP SCREEN..................................
			this.removePricePlanMask();

			//INSTANTIATE COMBO COUNT OBJECT.....................
			this.renderComboCount();

			//RENDER COMBO REGION.................................
			var input = [];
			var paramValues = [];
			input = [{
					"Query_Id" : "RegionQuery",
					"UIInput" : {}
				}, {
					"Query_Id" : "MarketQuery",
					"UIInput" : {
						"Region" : [p_ScopeObj.Region]
					}

				}, {
					"Query_Id" : "PPBrandQuery",
					"UIInput" : {
						"Region" : [p_ScopeObj.Region],
						"Market" : [p_ScopeObj["Pricing Market"]]
					}
				}, {
					"Query_Id" : "PricingQuery",
					"UIInput" : {
						"Region" : p_ScopeObj["Region"] == "" ? [] : [p_ScopeObj["Region"]],
						"Market" : p_ScopeObj["Pricing Market"] == "" ? [] : [p_ScopeObj["Pricing Market"]],
						"Brand" : p_ScopeObj["Brand"] == "" ? [] : [p_ScopeObj["Brand"]],
						"Year" : p_ScopeObj["Time"] == "" ? [] : [p_ScopeObj["Time"]]
					}
				}
			]

			paramValues.push(input);
			/** Performance Enhancement***/
			//VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, this.renderPricePlanComboBoxCallBack, p_ScopeObj);
			getPricePlanControllerManagerObj().callSyncOpenPPScript(p_ScopeObj, this.renderPricePlanComboBoxCallBack, true);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.getFetchMetadataSyncScriptInput = function (p_ScopeObj, p_blnScopeLoad) {
		var input = [];
		if (p_blnScopeLoad) {
			input = [{
					"Query_Id" : "RegionQuery",
					"UIInput" : {}
				}, {
					"Query_Id" : "MarketQuery",
					"UIInput" : {
						"Region" : [p_ScopeObj.Region]
					}
				}, {
					"Query_Id" : "PPBrandQuery",
					"UIInput" : {
						"Region" : [p_ScopeObj.Region],
						"Market" : [p_ScopeObj["Pricing Market"]]
					}
				}, {
					"Query_Id" : "PricingQuery",
					"UIInput" : {
						"Region" : p_ScopeObj["Region"] == "" ? [] : [p_ScopeObj["Region"]],
						"Market" : p_ScopeObj["Pricing Market"] == "" ? [] : [p_ScopeObj["Pricing Market"]],
						"Brand" : p_ScopeObj["Brand"] == "" ? [] : [p_ScopeObj["Brand"]],
						"Year" : p_ScopeObj["Time"] == "" ? [] : [p_ScopeObj["Time"]]
					}
				}
			]
		}
		input.push({
			"Query_Id" : "WorkflowQuery",
			"UIInput" : {
				"Time" : p_ScopeObj["Time"] == "" ? [] : [p_ScopeObj["Time"]],
				"Geography Code" : p_ScopeObj["Pricing Market"] == "" ? [] : [p_ScopeObj["Pricing Market"]],
				"Product Code" : p_ScopeObj["Pricing Group"] == "" ? [] : [p_ScopeObj["Pricing Group"]]
			}
		});
		//paramValues.push(input);
		return input;
	}
	//Script call back renderPricePlanComboBox
	this.renderPricePlanComboBoxCallBack = function (p_ScriptOutput, p_ScopeObj) {
		try {

			if (p_ScriptOutput.status.toLowerCase() == "success") {
				var l_output = JSON.parse(JSON.parse(p_ScriptOutput.response).solResponse.Scope);
				var IsIPADView = getCommonFuncMgr().isNonDeskTopView();
				if (!IsIPADView)
					Ext.suspendLayouts();
				//************Exception Handler**************

				if (l_output.solStatus.toLowerCase() == "success") {
					var scriptResponse = l_output.solResponse;

					/*********RENDER COMBO REGION***************/
					//************Load Data Into Region Combo-box stores**************
					Ext.getStore("store_cmbRegion").loadData(scriptResponse["RegionQuery"]);
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().updatePricePlanComboCount(Ext.getElementById("cmbRegionCount"), scriptResponse["RegionQuery"].length);

					//Check whether value exists in the Region Combo Store........
					var l_cmbRegion = VistaarExtjs.getCmp(m_CMB_REGION);
					var l_regionRecord = l_cmbRegion.findRecord(l_cmbRegion.valueField, p_ScopeObj["Region"]);
					if (l_regionRecord) {
						l_cmbRegion.setValue(l_regionRecord.data["Code"]);
					}
					//l_cmbRegion.value = p_ScopeObj["Region"];

					/**********RENDER COMBO MARKET************************/
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbPricingMarket").loadData(scriptResponse["MarketQuery"]);
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().updatePricePlanComboCount(Ext.getElementById("cmbPricingMarketCount"), scriptResponse["MarketQuery"].length);

					//Check whether value exists in the Market Combo Store........
					var l_cmbMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET);
					var l_marketRecord = l_cmbMarket.findRecord(l_cmbMarket.valueField, p_ScopeObj["Pricing Market"]);
					if (l_marketRecord) {
						l_cmbMarket.setValue(l_marketRecord.data["Code"]);
					}
					//l_cmbMarket.value = p_ScopeObj["Pricing Market"];
					//Activate Region-Market Combo link...........
					VistaarExtjs.getCmp("cntRegionMarketLink").getEl().removeCls("inActive");

					/*************RENDER COMBO BRAND*******************/
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbBrand").loadData(scriptResponse["PPBrandQuery"]);
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().updatePricePlanComboCount(Ext.getElementById("cmbBrandCount"), scriptResponse["PPBrandQuery"].length);
					//Check whether value exists in the Brand Combo Store........
					var l_cmbBrand = VistaarExtjs.getCmp(m_CMB_BRAND);
					var l_brandRecord = l_cmbBrand.findRecord(l_cmbBrand.valueField, p_ScopeObj["Brand"]);
					if (l_brandRecord) {
						l_cmbBrand.setValue(l_brandRecord.data["Code"]);
					}
					//l_cmbBrand.value = p_ScopeObj["Brand"];
					//Activate Market-Brand combo link..........
					VistaarExtjs.getCmp("cntMarketBrandLink").getEl().removeCls("inActive");

					/************RENDER COMBO WORKFLOW*********************/
					VistaarExtjs.getCmp(m_CMB_WORKFLOW).setValue(p_ScopeObj["Time"]);
					VistaarExtjs.getCmp(m_CMB_WORKFLOW).value = {
						"year" : p_ScopeObj["Time"]
					};

					/***************RENDER COMBO PRICING CATEGORY***********************/
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_cmbPricingGroup").loadData(scriptResponse["PricingQuery"]);
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().updatePricePlanComboCount(Ext.getElementById("cmbPricingGroupCount"), scriptResponse["PricingQuery"].length);
					//Check whether value exists in the Pricing Group Combo Store........
					var l_cmbPriceCategory = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP);
					var l_PriceCategoryRecord = l_cmbPriceCategory.findRecord(l_cmbPriceCategory.valueField, p_ScopeObj["Pricing Group"]);
					if (l_PriceCategoryRecord) {
						l_cmbPriceCategory.setValue(l_PriceCategoryRecord.data["Code"]);
					}
					//VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).value = p_ScopeObj["Pricing Group"];
					//Activate Brand-PriceCategory combo link............
					VistaarExtjs.getCmp("cntBrandPricingGroupLink").getEl().removeCls("inActive");

					VistaarAuditingManager.audit({
						"name" : " Initialize All Price Plan combo Ended @@@renderPricePlanComboBox"
					}, m_IS_AUDIT_REQUIRED, 505);
					if (!IsIPADView)
						Ext.resumeLayouts(true);
					// RENDER PRICE PLAN FOR SELECTED SCOPE...........................
					m_fnFetchPricePlan(p_ScriptOutput, true);
				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["Script Failure"]["Title"],
						msg : m_MESSAGES["Script Failure"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().applyMaskingOnPricePlanView();
				}
			} else {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanScopeManager().applyMaskingOnPricePlanView();
			}
		} catch (err) {
			if (!IsIPADView)
				Ext.resumeLayouts(true);
			getCommonFuncMgr().printLog(err);
		}
	}

	/*RETURN KEY FOR SELECTED PRICE PLAN SCOPE */
	this.getScopeDataKey = function (p_strPricingGroupCode) {
		try {
			var l_strSelectedRegionCode = VistaarExtjs.getCmp(m_CMB_REGION).getValue();
			var l_strSelectedPriceMarketCode = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
			var l_strSelectedBrandCode = VistaarExtjs.getCmp(m_CMB_BRAND).getValue();
			var l_strSelectedPricingGroupCode = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getValue();
			var l_strSelectedYearCode = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().year;

			var l_strScopeKey = l_strSelectedRegionCode + l_strSelectedPriceMarketCode + l_strSelectedBrandCode + l_strSelectedPricingGroupCode + l_strSelectedYearCode;
			return l_strScopeKey;

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	/*RETURN SCOPE FOR OPEN PRICE PLAN SCRIPT */
	this.getPricePlanScopeData = function () {
		try {
			var l_strSelectedMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
			var l_strSelectedPricingGroup = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getValue();
			var l_strSelectedYear = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().year;
			var l_ObjScopeData = {
				"Geography Level" : "Market",
				"Geography Code" : l_strSelectedMarket,
				"Time Level" : "Year",
				"Time" : l_strSelectedYear,
				"Product Code" : l_strSelectedPricingGroup,
				"Product Level" : "Price Category"
			};
			return l_ObjScopeData;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	/** Performance Enhancement***/
	/*RETURN SCOPE FOR OPEN PRICE PLAN SCRIPT */
	this.getPPCombineScriptScopeData = function () {
		try {
			var l_strSelectedMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
			var l_strSelectedPricingGroup = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getValue();
			var l_strSelectedYear = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().year;
			var l_ObjScopeData = {
				"Pricing Market" : l_strSelectedMarket,
				"Time" : l_strSelectedYear,
				"Pricing Group" : l_strSelectedPricingGroup,
			};
			return l_ObjScopeData;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Purpose :To Store current scope data ....................................
	this.setActiveScopeDataFields = function () {
		try {
			/*Set all the scope data in module level to revert back last selected combo value*/
			m_Obj_ActiveScopeData = {};
			for (var l_indexComboID in m_ARR_ComboID) {
				m_Obj_ActiveScopeData[m_ARR_ComboID[l_indexComboID]] = {
					"Name" : VistaarExtjs.getCmp(m_ARR_ComboID[l_indexComboID]).getDisplayValue(),
					"Code" : VistaarExtjs.getCmp(m_ARR_ComboID[l_indexComboID]).getValue()
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	//DISABLED PRICE PLAN SCREEN..............
	this.applyMaskingOnPricePlanView = function () {
		VistaarExtjs.getCmp(m_CNT_PRICEPLANMAIN).disable();
		/** Handle price plan script failure in Compact view scenario to enable finder button  **/
		getPricePlanControllerManagerObj().getPricePlanUIManager().compactView(false);
	}

	//ENABLED PRICE PLAN SCREEN...............
	this.removePricePlanMask = function () {
		VistaarExtjs.getCmp(m_CNT_PRICEPLANMAIN).enable();
	}

	/*This API is used to Provide PP scope data And based on parameter it returns either display value or code value*/
	this.getScopeForExport = function (p_fieldType) {
		try {
			var l_strSelectedMarket;
			var l_strSelectedPricingGroup;
			var l_strSelectedYear;
			var l_strSelectedRegion;
			var l_strSelectedBrand;
			var l_ObjScopeData;
			if (p_fieldType == "DisplayField") {
				l_strSelectedMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getDisplayValue();
				l_strSelectedPricingGroup = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getDisplayValue();
				l_strSelectedYear = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getRawValue();
				l_strSelectedRegion = VistaarExtjs.getCmp(m_CMB_REGION).getDisplayValue();
				l_strSelectedBrand = VistaarExtjs.getCmp(m_CMB_BRAND).getDisplayValue();
				l_ObjScopeData = {
					"Region" : l_strSelectedRegion,
					"Market" : l_strSelectedMarket,
					"Brand" : l_strSelectedBrand,
					"Year" : l_strSelectedYear,
					"Price Category" : l_strSelectedPricingGroup
				};
			} else if (p_fieldType == "CodeField") {
				l_strSelectedMarket = VistaarExtjs.getCmp(m_CMB_PRICINGMARKET).getValue();
				l_strSelectedPricingGroup = VistaarExtjs.getCmp(m_CMB_PRICING_GROUP).getValue();
				l_strSelectedYear = VistaarExtjs.getCmp(m_CMB_WORKFLOW).getValue().year;
				l_ObjScopeData = {
					"Market" : l_strSelectedMarket,
					"Year" : l_strSelectedYear,
					"Price Group" : l_strSelectedPricingGroup
				};
			}
			return l_ObjScopeData;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Apply Tool-tip to all Combo.......
	this.applyTooltipForCombo = function () {
		for (var comboId in m_ARR_ComboID) {
			getCommonFuncMgr().createToolTipForComponent(m_ARR_ComboID[comboId], "combobox");
		}
	}
	//#1049
	this.addPickerListenerToCombo = function(p_combo,p_eOpts)
	{
		try
		{
			if (getCommonFuncMgr().isNonDeskTopView()) 
			{
				var l_combo = p_combo;								
				var l_picker = p_combo.getPicker();
				if(l_picker)
				{
					l_picker.on("show",function(){
							l_picker.setScrollable(false);
							l_picker.setScrollable(true);
							var record = l_combo.findRecordByValue(l_combo.getValue());
							if(record)
							{
								var l_index = l_combo.store.indexOf(record);
								l_picker.setScrollY((l_index*26));
								/*if(l_index>20)
								{
									l_picker.setScrollY((l_index*26)+100);
									}
								else
								{
									l_picker.setScrollY((l_index*26));
								}*/
							}
						});
				}		
			}		
		}
		catch(l_err)
		{			
			getCommonFuncMgr().printLog(l_err);
		}
	}

}
