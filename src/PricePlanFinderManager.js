
/**
 *
 * <p> <img uml="
 * class PricePlanFinderManager { 
 *  -m_PricePlanFinderViewObj
 *  -m_objCatalogGrid -m_InitialComboData
 *  +initialize()
 *  +initializeAllCombos()
 *  +validateCombos()
 *  +loadCombos()
 *  +callPricePlanwithScope()
 *  +btnPricePlanFinderSearch_Click()
 *  +btnPricePlanFinderCopyPricePlan_Click()
 *  +btnPricePlanFinderClose_Click()
 *  }
 * "></p>
 * @class PricePlanFinderManager
 * @memberof WebUI
 */
function PricePlanFinderManager() {
	var m_PricePlanFinderViewObj;
	var m_MESSAGES = getObjectFactory().getGlobalConstants().PRICE_PLAN_FINDER_MESSAGE;
	var m_IS_AUDIT_REQUIRED = true;
	var m_objCatalogGrid;
	var m_InitialComboData;
	var m_CMB_PPF_FINANCIAL_YEAR = "cmbPricePlanFinderFinancialYear";
	var m_CMB_PPF_REGION = "cmbPricePlanFinderRegion";
	var m_CMB_PRICINGMARKET = "cmbPricePlanFinderPricingMarket";
	var m_CMB_PPF_BRAND = "cmbPricePlanFinderBrand";
	var m_CMB_PPF_PRICING_GROUP = "cmbPricePlanFinderPricingGroup";
	//*****This flag is added to fixed the issue of recursive Pricing group's focus event call when script failed.
	var m_focusEventFlag = true;

	//************Function to initialize the main object of the screen**************
	/**
	 * This function is used to initialize the Price Plan Finder Manager
	 * @name  initialize
	 * @memberof WebUI.PricePlanFinderManager
	 */
	this.initialize = function () {
		try {
			if (m_PricePlanFinderViewObj == undefined) {
				//************PricePlanFinder View object**************
				m_PricePlanFinderViewObj = VistaarFunctionLib.showWindow("viewPricePlanFinder");
				getObjectFactory().getPricePlanFinderManager().addPPF_ComboBoxStoreSorter();
				//Apply Tool-tip for PPF Work-flow Combo.................
				getObjectFactory().getPricePlanFinderManager().applyTooltipFor_PPF_Combo();

				VistaarAuditingManager.audit({
					"name" : "UIProcessing initializeAllCombos Started"
				}, m_IS_AUDIT_REQUIRED, 200);
				getObjectFactory().getPricePlanFinderManager().initializeAllCombos();

				getObjectFactory().getPricePlanFinderManager().registerPricingGroupTriggerClickEvent();
			} else {
				m_PricePlanFinderViewObj.show();
				/** HANDLE FAILURE OF INITIAL LOADING **/
				if (!m_InitialComboData) {
					getObjectFactory().getPricePlanFinderManager().initializeAllCombos();
				}
			}
			getObjectFactory().getUIACLManager().applyACL(getGlobalConstantsObj().m_PRICEPLANFINDER);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		//to set Window width as per resolution
		this.setFinderWindowWidth();
	};

	//Add Sorter object(Case Insensitive Sort Config) to comboBoxes store....................
	this.addPPF_ComboBoxStoreSorter = function () {
		try {
			var l_objComboStoreSorter = getGlobalConstantsObj().m_ComboStoreSorter;
			Ext.getStore("store_TestCombo").getSorters().add(l_objComboStoreSorter);
			Ext.getStore("store_ComboPricingMarket").getSorters().add(l_objComboStoreSorter);
			Ext.getStore("store_ComboBrand").getSorters().add(l_objComboStoreSorter);
			Ext.getStore("store_ComboPricingGroup").getSorters().add(l_objComboStoreSorter);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Add Tool-tip to Price Plan Finder Combo..........
	this.applyTooltipFor_PPF_Combo = function () {
		try {
			var l_ARR_PPF_ComboRef = [m_CMB_PPF_FINANCIAL_YEAR, m_CMB_PPF_REGION, m_CMB_PRICINGMARKET, m_CMB_PPF_BRAND, m_CMB_PPF_PRICING_GROUP];
			for (var comboRefIndex in l_ARR_PPF_ComboRef) {
				getCommonFuncMgr().createToolTipForComponent(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, l_ARR_PPF_ComboRef[comboRefIndex])["id"], "combobox");
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//************Function to RegisterTriggerEvent of Pricing Group Combo**************
	this.registerPricingGroupTriggerClickEvent = function () {
		var combo = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP);
		combo.triggers.picker.handler = function () {
			this.expand();
		};

	};

	/**
	 * Init function for all combo box
	 * @name  initializeAllCombos
	 * @memberof WebUI.PricePlanFinderManager
	 */
	this.initializeAllCombos = function () {

		setWaitCursor("window_PricePlanFinder");

		var input = [];
		var paramValues = [];

		//FETCH INPUT
		input[0] = {
			"Query_Id" : "RegionQuery",
			"UIInput" : {}

		};
		input[1] = {
			"Query_Id" : "MarketQuery",
			"UIInput" : {}

		};
		input[2] = {
			"Query_Id" : "BrandQuery",
			"UIInput" : {
				"Brand" : "Brand"
			}
		};

		//input[3] ={"Query_Id": "PricingQuery","UIInput":{}};
		input[3] = {
			"Query_Id" : "TimeMasterQuery",
			"UIInput" : {
				"Year" : "Year"
			}
		};
		paramValues.push(input);

		//************Call Script Initialize all combo**************
		VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getObjectFactory().getPricePlanFinderManager().InitializeAllCombosCallBack);

	};

	//************CallBack For Initialize All Combos**************
	this.InitializeAllCombosCallBack = function (ScriptOutput) {
		try {
			//************Exception Handler**************

			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					var scriptResponse = JSON.parse(ScriptOutput.response).solResponse;
					m_InitialComboData = scriptResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_TestCombo").loadData(scriptResponse["RegionQuery"]);
					Ext.getStore("store_ComboPricingMarket").loadData(scriptResponse["MarketQuery"]);
					Ext.getStore("store_ComboBrand").loadData(scriptResponse["BrandQuery"]);
					//Ext.getStore("store_ComboPricingGroup").loadData(scriptResponse["PricingQuery"]);
					Ext.getStore("store_ComboPricingGroup").loadData([]);
					//Enable Pricing Group Focus event..............
					m_focusEventFlag = true;
					VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
					Ext.getStore("store_ComboFinancialYear").loadData(scriptResponse["TimeMasterQuery"]);
					VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_FINANCIAL_YEAR).setValue(new Date().getFullYear().toString());
					setDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "UIProcessing initializeAllCombos Ended"
					}, m_IS_AUDIT_REQUIRED, 200);

				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["PPF_Script_Error"]["Title"],
						msg : m_MESSAGES["PPF_Script_Error"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					setDefaultCursor();
				}
			} else {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				setDefaultCursor();

			};

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	//************Function to identify selected value of combo **************
	this.onComboboxSelect = function onComboboxSelect(combobox, records, eOpts) {
		try {
			//VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnClosePricePlanFinder_LeftPanel").setVisible(true);
			//I).CALLBACK ON 'REGION' DROP DOWN SELECTION TO FETCH DATA FOR 'PRICING MARKET' DROP DOWN
			if (combobox.reference == m_CMB_PPF_REGION) {
				getObjectFactory().getPricePlanFinderManager().loadCombo_PricingMarket();
			}
			//II).CALLBACK ON 'PRICING MARKET' DROP DOWN SELECTION TO FETCH DATA FOR 'BRAND' DROP DOWN
			if (combobox.reference == m_CMB_PRICINGMARKET) {
				//getObjectFactory().getPricePlanFinderManager().loadCombo_Brand();
				getObjectFactory().getPricePlanFinderManager().validateOnPricingMarketSelection();
			}
			//III).CALLBACK ON 'BRAND' DROP DOWN SELECTION TO FETCH DATA FOR 'PRICING GROUP' DROP DOWN
			if (combobox.reference == m_CMB_PPF_BRAND) {
				//getObjectFactory().getPricePlanFinderManager().loadCombo_PricingGroup();
				getObjectFactory().getPricePlanFinderManager().validateOnBrandSelection();
			} else if (combobox.reference == m_CMB_PPF_FINANCIAL_YEAR) {
				//Empty Pricing Group Store..............
				getObjectFactory().getPricePlanFinderManager().validateOnBrandSelection();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//************Function to Load data into Pricing Group combo on expansion**************
	this.onComboboxExpand = function onComboboxExpand(field, eOpts) {
		try {
			var store = Ext.getStore("store_ComboPricingGroup");
			if (store.data.length == 0 && store.getNewRecords().length == 0) {
				getObjectFactory().getPricePlanFinderManager().loadCombo_PricingGroup();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.loadCombo_PricingMarket = function () {
		try {
			VistaarAuditingManager.audit({
				"name" : "UIProcessing loadCombo_PricingMarket Started"
			}, m_IS_AUDIT_REQUIRED, 201);
			setWaitCursor("window_PricePlanFinder");
			var ScriptInput = [];
			//Fetch selected values
			var valueRegionSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_REGION).getValue();

			//call script
			var inputRegionSelection = [];

			ScriptInput[0] = {
				"Query_Id" : "MarketQuery",
				"UIInput" : {
					"Region" : [valueRegionSelection]
				}
			}
			//ScriptInput[1] = {			"Query_Id" : "BrandQuery",			"UIInput" : {}	}
			//ScriptInput[2] ={"Query_Id": "PricingQuery","UIInput":{}}

			var paramValues = [];
			paramValues.push(ScriptInput);
			//Scrip Call
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getObjectFactory().getPricePlanFinderManager().loadComboPricingMarketCallBack);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};
	//************Call Back for Script call of load data into pricing market combo**************
	this.loadComboPricingMarketCallBack = function (ScriptOutput) {
		try {
			//Update data store with script output
			//************Exception Handler**************
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					var scriptResponse = Ext.decode(ScriptOutput.response).solResponse
						//************Load Data Into Combo-box stores**************
						Ext.getStore("store_ComboPricingMarket").loadData(scriptResponse["MarketQuery"]);
					//Ext.getStore("store_ComboBrand").loadData(scriptResponse["BrandQuery"]);
					//Ext.getStore("store_ComboPricingGroup").loadData(scriptResponse["PricingQuery"]);
					//Ext.getStore("store_ComboPricingGroup").loadData([]);
					//Enable Pricing Group Focus event..............
					m_focusEventFlag = true;
					VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
					//setDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "UIProcessing loadCombo_PricingMarket Ended"
					}, m_IS_AUDIT_REQUIRED, 201);
					//Validate combo on Region Selection.........
					getObjectFactory().getPricePlanFinderManager().validateOnRegionSelection();
				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["PPF_Script_Error"]["Title"],
						msg : m_MESSAGES["PPF_Script_Error"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//setDefaultCursor();
				}
			} else {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//setDefaultCursor();
			};
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			setDefaultCursor();
		}
	};

	this.validateOnRegionSelection = function () {
		try {
			//Remove Data from PricingGroup Store..............
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
			Ext.getStore("store_ComboPricingGroup").loadData([]);
			//Enable Pricing Group Focus event..............
			m_focusEventFlag = true;

			//Validate Pricing Market
			var l_cmb_PPF_Market = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PRICINGMARKET);
			var valueMarketSelection = l_cmb_PPF_Market.getValue();
			var l_bln_isMarketPresent = l_cmb_PPF_Market.findRecord(l_cmb_PPF_Market.valueField, valueMarketSelection);

			if (!l_bln_isMarketPresent) {
				l_cmb_PPF_Market.setValue("");
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	this.validateOnPricingMarketSelection = function () {
		try {
			//Validation checking for Brand Combo doesn't required.........

			//Validate Pricing Group.......
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
			Ext.getStore("store_ComboPricingGroup").loadData([]);
			//Enable Pricing Group Focus event..............
			m_focusEventFlag = true;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.validateOnBrandSelection = function () {
		try {
			//Validate Pricing Group
			Ext.getStore("store_ComboPricingGroup").loadData([]);
			//Enable Pricing Group Focus event..............
			m_focusEventFlag = true;
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};
	//************Function to Load data into Brand Combo**************
	this.loadCombo_Brand = function () {
		try {
			setWaitCursor("window_PricePlanFinder");
			VistaarAuditingManager.audit({
				"name" : "UIProcessing loadCombo_Brand Started"
			}, m_IS_AUDIT_REQUIRED, 202);

			//Fetch selected values
			var valuePricingMarketSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PRICINGMARKET).getValue();
			var valueRegionSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_REGION).getValue();

			//call script
			var ScriptInput = [];

			//
			ScriptInput[0] = {
				"Query_Id" : "BrandQuery",
				"UIInput" : {
					"Region" : [valueRegionSelection],
					"Market" : [valuePricingMarketSelection]
				}
			}
			//ScriptInput[1] ={"Query_Id": "PricingQuery","UIInput":{"Region":[valueRegionSelection],"Market":[valuePricingMarketSelection]}}


			var paramValues = [];
			paramValues.push(ScriptInput);
			//call script
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getObjectFactory().getPricePlanFinderManager().loadComboBrandCallBack);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	//************Call back Function on script call for load data into Brand combo **************
	this.loadComboBrandCallBack = function (ScriptOutput) {
		try {
			//************Exception Handler**************
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					//Update data store with script output
					var scriptResponse = Ext.decode(ScriptOutput.response).solResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_ComboBrand").loadData(scriptResponse["BrandQuery"]);
					//Ext.getStore("store_ComboPricingGroup").loadData(scriptResponse["PricingQuery"]);
					Ext.getStore("store_ComboPricingGroup").loadData([]);
					//Enable Pricing Group Focus event..............
					m_focusEventFlag = true;
					VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).setValue("");
					//setDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "UIProcessing loadCombo_Brand Ended"
					}, m_IS_AUDIT_REQUIRED, 202);

				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["PPF_Script_Error"]["Title"],
						msg : m_MESSAGES["PPF_Script_Error"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//setDefaultCursor();
				}
			} else {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				//setDefaultCursor();
			};
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			setDefaultCursor();
		}
	};
	//************Function to Load data into PricingGroup Combo**************
	this.loadCombo_PricingGroup = function () {
		try {
			setWaitCursor("window_PricePlanFinder");
			VistaarAuditingManager.audit({
				"name" : "UIProcessing loadCombo_PricingGroup Started"
			}, m_IS_AUDIT_REQUIRED, 203);

			var objPricingGroupData;
			//Fetch selected values
			var valueRegionSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_REGION).getValue();

			var valuePricingMarketSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PRICINGMARKET).getValue();

			var valueBrandSelection = VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_BRAND).getValue();
			var valueYearSelection = getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_FINANCIAL_YEAR));

			//call script
			var inputBrandSelection = [];

			inputBrandSelection[0] = {
				"Query_Id" : "PricingQuery",
				"UIInput" : {
					"Region" : (valueRegionSelection == null) || (valueRegionSelection == "") ? [] : [valueRegionSelection],
					"Market" : (valuePricingMarketSelection == null) || (valuePricingMarketSelection == "") ? [] : [valuePricingMarketSelection],
					"Brand" : (valueBrandSelection == null) || (valueBrandSelection == "") ? [] : [valueBrandSelection],
					"Year" : (valueYearSelection == null) || (valueYearSelection == "") ? [] : [valueYearSelection]

				}
			}

			var paramValues = [];

			paramValues.push(inputBrandSelection);
			//Script call
			VistaarAjax.callESExecuteScript('FetchMetaData', ['input'], paramValues, '', true, getObjectFactory().getPricePlanFinderManager().loadComboPricingGroupCallBack);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	//************Call back Function on script call for load data into PricingGroup combo **************
	this.loadComboPricingGroupCallBack = function (ScriptOutput) {
		try {
			//************Exception Handler**************
			if (ScriptOutput.status.toLowerCase() == "success") {
				var l_output = Ext.decode(ScriptOutput.response);
				if (l_output.solStatus.toLowerCase() == "success") {
					//Update data store with script output
					var scriptResponse = Ext.decode(ScriptOutput.response).solResponse;
					//************Load Data Into Combo-box stores**************
					Ext.getStore("store_ComboPricingGroup").loadData(scriptResponse["PricingQuery"]);
					//setDefaultCursor();
					VistaarAuditingManager.audit({
						"name" : "UIProcessing loadCombo_PricingGroup Ended"
					}, m_IS_AUDIT_REQUIRED, 203);
					m_focusEventFlag = true;
				} else {
					Ext.MessageBox.show({
						title : m_MESSAGES["PPF_Script_Error"]["Title"],
						msg : m_MESSAGES["PPF_Script_Error"]["Message"],
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.ERROR
					});
					//setDefaultCursor();
					m_focusEventFlag = false;
				}
			} else {
				Ext.MessageBox.show({
					title : m_MESSAGES["Script Failure"]["Title"],
					msg : m_MESSAGES["Script Failure"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
				m_focusEventFlag = false;
				//setDefaultCursor();
			};
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			setDefaultCursor();
		}
	};
	//************Function to Search PricePlan as per selected scope**************
	this.btnPricePlanFinderSearch_Click = function () {
		try {
			VistaarAuditingManager.audit({
				"name" : "UIProcessing PricePlanFinderSearch_Click Started"
			}, m_IS_AUDIT_REQUIRED, 204);

			//************Fetch Selection of all combos **************
			var inputComboSelection = {
				"Region" : getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_REGION)),
				"Pricing Market" : getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PRICINGMARKET)),
				"Brand" : getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_BRAND)),
				"Price Category" : getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP)),
				"Year" : getCommonFuncMgr().getComboBoxValue(VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_FINANCIAL_YEAR))
			};
			//inputComboSelection = getObjectFactory().getPricePlanFinderManager().InputComboSelectionValidate(inputComboSelection)
			//var l_arrFilterCondition = getObjectFactory().getPricePlanFinderManager().getFilterStringsForCE(inputComboSelection);
			var l_arrFilterCondition = getObjectFactory().getPricePlanFinderManager().getAdvancedFilterStringsForCE(inputComboSelection);

			if (m_objCatalogGrid === undefined) {
				/********* PPF Right Panel Initial Configuration *********/
				//************Right Side Panel object**************
				VistaarExtjs.getCmp("cntPricePlanFinderSearch").show();
				//show left Panel Collapse button.......
				VistaarExtjs.getCmp("btnPPFCollapseLeftPanel").show();
				//Remove Close button of left panel
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnClosePricePlanFinder_LeftPanel").hide();

				//Create PPF Catalog Explorer.............
				var CEGridConfig = getObjectFactory().getConfigurationManager().getCatalogExplorerPPFConfig(l_arrFilterCondition);
				m_objCatalogGrid = VistaarCE.openCatalogExplorer(CEGridConfig);
			} else {
				/*loadLibraryWithFilters API problem has been solved in 1.3.0.0 release*/
				//VistaarCE.loadLibraryWithFilters('PricePlanFinderCE', 'PricePlanView', getObjectFactory().getPricePlanFinderManager().getAdvancedFilterStringsForCE(inputComboSelection));
				VistaarCE.destroyCatalogExplorer('PricePlanFinderCE');
				var CEGridConfig = getObjectFactory().getConfigurationManager().getCatalogExplorerPPFConfig(l_arrFilterCondition);
				m_objCatalogGrid = VistaarCE.openCatalogExplorer(CEGridConfig);
				
			}
			VistaarAuditingManager.audit({
				"name" : "UIProcessing PricePlanFinderSearch_Click Ended"
			}, m_IS_AUDIT_REQUIRED, 204);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	//************Function to Validate Selection of all combos**************
	this.InputComboSelectionValidate = function (l_inputcombovalues) {
		for (var key in l_inputcombovalues.UIInput) {
			if (l_inputcombovalues.UIInput[key] == null)
				l_inputcombovalues.UIInput[key] = "";
		}
		return l_inputcombovalues;
	};

	//************Function to return Filter String for CE******************************
	this.getFilterStringsForCE = function (p_objSelectedScope) {
		try {
			var p_arrFilterConndition = [];
			var l_objFilterCondition;
			for (var l_fieldName in p_objSelectedScope) {
				if (p_objSelectedScope[l_fieldName] != "" && p_objSelectedScope[l_fieldName] != null) {
					l_objFilterCondition = {
						"FieldName" : l_fieldName,
						"Value" : {
							"Type" : "Text",
							"Content" : p_objSelectedScope[l_fieldName]
						},
						"ConditionType" : "="
					};
					p_arrFilterConndition.push(l_objFilterCondition);

				}
			}
			return p_arrFilterConndition;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.getAdvancedFilterStringsForCE = function (p_objSelectedScope) {
		try {
			var l_filterString = {
				"CaseInsensitiveSearch" : "true",
				"OrderBy" : [{
						"FieldName" : "Region Name",
						"Ascending" : "True"           
					}, {
						"FieldName" : "Pricing Market Name",
						"Ascending" : "True"            
					}, {
						"FieldName" : "Brand Name",
						"Ascending" : "True"           
					}, {
						"FieldName" : "Price Category Name",
						"Ascending" : "True"          
					}
				],
				"Units" : [{
						"Units" : [],
						"UnitOperator" : "Or",
						"ConditionOperator" : "And",
						"Condition" : []
					}
				]
			};
			for (var l_fieldName in p_objSelectedScope) {
				if (p_objSelectedScope[l_fieldName] != "" && p_objSelectedScope[l_fieldName] != null) {
					l_objFilterCondition = {
						"FieldName" : l_fieldName,
						"Value" : {
							"Type" : "Text",
							"Content" : p_objSelectedScope[l_fieldName]
						},
						"ConditionType" : "="
					};
					l_filterString["Units"][0]["Condition"].push(l_objFilterCondition);

				}
			}
			return l_filterString;

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	/*
	this.getTimeUnitObj = function (pValue) {
	try {
	var l_requiredArray = [{
	"Units" : [],
	"UnitOperator" : "Or",
	"ConditionOperator" : "And",
	"Condition" : [{
	"FieldName" : "Year",
	"Value" : {
	"Type" : "Text",
	"Content" : pValue
	},
	"ConditionType" : "="
	}
	]
	}, {
	"Units" : [],
	"UnitOperator" : "Or",
	"ConditionOperator" : "And",
	"Condition" : [{
	"FieldName" : "Year",
	"Value" : {
	"Type" : "Text",
	"Content" : pValue
	},
	"ConditionType" : "ISNULL"
	}, {
	"FieldName" : "PC_START_DATE",
	"Value" : {
	"Type" : "Text",
	"Content" : pValue
	},
	"ConditionType" : ">="
	}, {
	"FieldName" : "PC_END_DATE",
	"Value" : {
	"Type" : "Text",
	"Content" : pValue
	},
	"ConditionType" : "<="
	}
	]
	}
	];
	} catch (err) {
	getCommonFuncMgr().printLog(err);
	}
	} */

	//************Function to display search count**************
	this.displaySearchResultCount = function (pCount) {
		//************Count search Result**************
		Ext.getCmp("lblPricePlanFinderSearchCount").setText(pCount);
		if (pCount <= 0) {
			Ext.MessageBox.show({
				title : 'Information',
				msg : "No Price Plans found for this Scope",
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.INFO
			});
		};
		//	setDefaultCursor();
	};

	//************Function to close PriceplanFinder**************
	this.btnPricePlanFinderClose_Click = function () {
		var w = Ext.getCmp('window_PricePlanFinder');
		/*var el = w.getEl();
		el.removeCls('slideInLeft');
		el.addCls('slideOutLeft');
		setTimeout(function () {
		var w = Ext.getCmp('window_PricePlanFinder');
		w.hide();
		el.removeCls('slideOutLeft');
		},
		500);*/

		w.hide();
	}

	//Show Price Plan Finder Window................
	this.showPricePlanFinderScreen = function () {
		VistaarExtjs.getCmp('window_PricePlanFinder').show();
		getObjectFactory().getUIACLManager().applyACL(getGlobalConstantsObj().PRICEPLANFINDER);
	}

	//************Function to open Deal view From PricePlanFinder**************
	this.btnPricePlanFinderOpenPricePlan_Click = function (p_button, l_e, l_eOpts) {
		try {
			var l_arrSelectionData = [];
			//var l_rowselectionData;
			var l_OpenPPStatus;
			l_arrSelectionData = VistaarExtjs.getCmp(VistaarCE.getDynamicGridViewId("PricePlanFinderCE")).getSelectionModel().getSelection();
			if (l_arrSelectionData.length > 0) {
				//l_rowselectionData = l_arrSelectionData[0];
				getObjectFactory().getPricePlanFinderManager().btnPricePlanFinderClose_Click();
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor('viewContainer'); //window_PricePlanFinder
				Ext.defer(function () {
					l_OpenPPStatus = getObjectFactory().getPricePlanFinderManager().callPricePlanwithScope(l_arrSelectionData[0]);
					if (l_OpenPPStatus === false) {
						//Stay on Price Plan Finder Screen ........................
						getObjectFactory().getPricePlanFinderManager().showPricePlanFinderScreen();

					}
				}, 10);
			} else {
				Ext.MessageBox.show({
					title : 'Price Plan Finder',
					msg : "Please Select Price Plan",
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
			}

		} catch (err) {
			console.log(err);
		}

	};
	//************Function to open deal View on price-plan double click**************
	this.onItemDblClick = function (p_button, p_e, p_eOpts) {
		try {
			var l_OpenPPStatus;
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor('viewContainer');
			getObjectFactory().getPricePlanFinderManager().btnPricePlanFinderClose_Click();
			Ext.defer(function () {
				l_OpenPPStatus = getObjectFactory().getPricePlanFinderManager().callPricePlanwithScope(p_e);
				if (l_OpenPPStatus === false) {
					//Stay on Price Plan Finder Screen ........................
					getObjectFactory().getPricePlanFinderManager().showPricePlanFinderScreen();
				}
			}, 100);
		} catch (err) {
			console.log(err);
		}

	};

	this.callPricePlanwithScope = function (p_objSelectedGridRow) {
		try {
			var l_scopeObj = {};
			var SkipOpenPricePlanCall = false;
			var l_rowselectionData = p_objSelectedGridRow.getData();
			var l_scopeObj = {
				"Region" : l_rowselectionData['Region'],
				"Region Name" : l_rowselectionData['Region Name'],
				"Pricing Market Name" : l_rowselectionData['Pricing Market Name'],
				"Pricing Market" : l_rowselectionData['Pricing Market'],
				"Brand Name" : l_rowselectionData['Brand Name'],
				"Brand" : l_rowselectionData['Brand'],
				"Pricing Group Name" : l_rowselectionData['Price Category Name'],
				"Pricing Group" : l_rowselectionData['Price Category'],
				"Time" : l_rowselectionData['Year']
			};
			//Check for Incomplete Scope..........................
			for (var scopeAttr in l_scopeObj) {
				if (l_scopeObj[scopeAttr] === undefined || l_scopeObj[scopeAttr] === null) {
					SkipOpenPricePlanCall = true;
					break;
				}
			}

			if (SkipOpenPricePlanCall) {
				Ext.MessageBox.show({
					title : m_MESSAGES["IncompleteScope"]["Title"],
					msg : m_MESSAGES["IncompleteScope"]["Message"],
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.INFO
				});
				//getObjectFactory().getPricePlanFinderManager().showPricePlanFinderScreen();
				setDefaultCursor();

			} else {
				//Check whether already opened price plan has been changed or not.........................
				if (getPricePlanControllerManagerObj().isPricePlanDirty()) {
					Ext.MessageBox.confirm(m_MESSAGES["Save"]["Title"], m_MESSAGES["Save"]["Message"], function (p_btn) {
						//Discard the changes and Open New Price Plan.............
						if (p_btn == "yes") {
							Ext.defer(function () {
								getObjectFactory().getPricePlanFinderManager().openPricePlanCallback(l_scopeObj);
							}, 100);
						} else {
							setDefaultCursor();
							//Stay on Price Plan Finder Screen ........................
							return false;
						}
					});
				} else {
					getObjectFactory().getPricePlanFinderManager().openPricePlanCallback(l_scopeObj);
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.openPricePlanCallback = function (p_scopeObj) {
		//	getObjectFactory().getPricePlanFinderManager().btnPricePlanFinderClose_Click();
		Ext.getCmp("btnToolbarHome").toggle(false);
		getObjectFactory().getPricePlanControllerManager().renderPricePlanUI(p_scopeObj);
		//	setDefaultCursor();
	}
	//************Function to Clear All Filters of grid**************
	this.btnPricePlanFinderClearFilter_Click = function () {
		try {
			VistaarAuditingManager.audit({
				"name" : "UIProcessing clearAllFilters Started"
			}, m_IS_AUDIT_REQUIRED, 205);
			getObjectFactory().getCommonFunctionsManager().removeInlineFiltersForGrid(VistaarCE.getDynamicGridId("PricePlanFinderCE"));
			VistaarAuditingManager.audit({
				"name" : "UIProcessing clearAllFilters Ended"
			}, m_IS_AUDIT_REQUIRED, 205);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	//************Function to Reset all combo values**************
	this.btnPricePlanFinderResetCombos_Click = function () {
		try {
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_REGION).clearValue();
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PRICINGMARKET).clearValue();
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_BRAND).clearValue();
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).clearValue();
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_FINANCIAL_YEAR).clearValue();
			if (m_InitialComboData === undefined) {
				getObjectFactory().getPricePlanFinderManager().initializeAllCombos();
			} else {
				//************Load Data Into Combo-box stores**************
				Ext.getStore("store_TestCombo").loadData(m_InitialComboData["RegionQuery"]);
				Ext.getStore("store_ComboPricingMarket").loadData(m_InitialComboData["MarketQuery"]);
				Ext.getStore("store_ComboBrand").loadData(m_InitialComboData["BrandQuery"]);
				//Ext.getStore("store_ComboPricingGroup").loadData(scriptResponse["PricingQuery"]);
				Ext.getStore("store_ComboPricingGroup").loadData([]);
				//Enable Pricing Group Focus event..............
				m_focusEventFlag = true;
				Ext.getStore("store_ComboFinancialYear").loadData(m_InitialComboData["TimeMasterQuery"]);
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_FINANCIAL_YEAR).setValue(new Date().getFullYear().toString());
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onPGComboboxFocus = function (component, event, eOpts) {
		if (m_focusEventFlag) {
			VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, m_CMB_PPF_PRICING_GROUP).expand();
		}
	}

	this.onBtnPPFExpandCollapseLeftPanelClick = function (button, e, eOpts) {
		try {
			if (button.id === "btnPPFCollapseLeftPanel") {
				VistaarExtjs.getCmp("PPFLeftPanel").hide();
				VistaarExtjs.getCmp("btnPPFExpandLeftPanel").show();
			} else {
				VistaarExtjs.getCmp("PPFLeftPanel").show();
				VistaarExtjs.getCmp("btnPPFExpandLeftPanel").hide();
			}
			getObjectFactory().getPricePlanFinderManager().setFinderWindowWidth();
			
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.afterPPFGridRenderer = function () {
		try {
			var l_searchCount = parseInt(Ext.getCmp('PricePlanFinderCE').m_numTotalCount);
			getObjectFactory().getPricePlanFinderManager().displaySearchResultCount(l_searchCount);
			if (l_searchCount <= 0) {
				//Disabled Open and Copy PP Button.................
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnPricePlanFinderOpenPricePlan").setDisabled(true);
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnPricePlanFinderCopyPricePlan").setDisabled(true);
			} else {
				//Enabled Open and Copy PP Button.................
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnPricePlanFinderOpenPricePlan").setDisabled(false);
				VistaarFunctionLib.getCompByReference(m_PricePlanFinderViewObj, "btnPricePlanFinderCopyPricePlan").setDisabled(false);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.btnPricePlanFinderCopyPricePlan_Click = function () {
		try {
			var l_arrSelectionData = [];
			//var l_rowselectionData;
			l_arrSelectionData = VistaarExtjs.getCmp(VistaarCE.getDynamicGridViewId("PricePlanFinderCE")).getSelectionModel().getSelection();
			if (l_arrSelectionData.length > 0) {
				//l_rowselectionData = l_arrSelectionData[0];
				getObjectFactory().getPricePlanFinderManager().btnPricePlanFinderClose_Click();
				setWaitCursor('viewContainer'); //window_PricePlanFinder
				Ext.defer(function () {
					getObjectFactory().getPricePlanFinderManager().callCopyPricePlanWithScope(l_arrSelectionData[0]);
				}, 100);
			} else {
				Ext.MessageBox.show({
					title : 'Price Plan Finder',
					msg : "Please Select Price Plan",
					buttons : Ext.MessageBox.OK,
					icon : Ext.MessageBox.ERROR
				});
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.callCopyPricePlanWithScope = function (p_objSelectedGridRow) {
		try {
			var l_scopeObj = {};
			var l_rowselectionData = p_objSelectedGridRow.getData();
			var l_scopeObj = {
				"Region" : l_rowselectionData['Region'],
				"Pricing Market" : l_rowselectionData['Pricing Market'],
				"Brand" : l_rowselectionData['Brand'],
				"Price Category" : l_rowselectionData['Price Category'],
				"Year" : l_rowselectionData['Year']
			};
			//CALL COPY PRICE PLAN API WITH SCOPE OBJECT.................................
			getMPCObjectFactory().getPriceMaintenanceManager().initialize(l_scopeObj);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.setFinderWindowWidth = function () {
		var l_ScreenWidth = Ext.Element.getViewportWidth();

		if (Ext.getCmp("PPFLeftPanel").hidden) {
			var l_computedWidth = parseFloat(l_ScreenWidth)-40;
			Ext.getCmp("cntPricePlanFinderSearch").setWidth(l_computedWidth);
		} else {
			var l_computedWidth = parseFloat(l_ScreenWidth) - 390;
			Ext.getCmp("cntPricePlanFinderSearch").setWidth(l_computedWidth);
		}
	}

}
