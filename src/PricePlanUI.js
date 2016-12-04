function PricePlanUIManager() {

	var m_PricePlanScope;
	this.m_PricePlanMain;
	var m_objPricePlanGridView;
	var m_PricePlanPreferenceObject;
	var m_DGObject = "DGObj";
	var m_TGObject = "TGObj";
	var m_IdDGSummaryProposed = "grdSummaryProposed";
	var m_IdTGOffPremisesProposed = "TG_OffPremisesProposed";
	var m_IdTGOnPremisesProposed = "TG_OnPremisesProposed";
	var m_IdTGOffPremisesCurrent = "TG_OffPremisesCurrent";
	var m_IdTGOnPremisesCurrent = "TG_OnPremisesCurrent";
	var m_DG_PG_OFFPREMISESPROPOSED = "DG_PGOffPremisesProposed";
	var m_DG_PG_ONPREMISESPROPOSED = "DG_PGOnPremisesProposed";
	var m_DG_PG_OFFPREMISESCURRENT = "DG_PGOffPremisesCurrent";
	var m_DG_PG_ONPREMISESCURRENT = "DG_PGOnPremisesCurrent";
	var m_isFullInFullScreenMode = false;
	var m_MESSAGES = getObjectFactory().getGlobalConstants().PRICE_PLANS_MESSAGES;
	var m_CmbWorkFlowId = "cmbWorkflow";
	var m_blnIsColumnsExpanded = false;
	var m_SummaryShowHide = true;
	var m_SummaryGridShowHide = true;
	var m_OffPremiseShowHide = true;
	var m_OnPremiseShowHide = true;
	var m_PricePlanGridCntId = "cntPricePlanGridView";
	var m_arrMonths = getGlobalConstantsObj().m_ARR_MONTH_KEY;
	var m_contextMenu;
	var m_PG_contextMenu;
	var m_selectedRecord;
	var m_SelectedGridId;
	var m_selectedMonth;
	var m_channel;
	var m_PricePlanScopeManager;
	var m_PricePlanGridManager;
	this.m_UserPrefrence = [];
	var fn_DealOperation;
	var m_BestPracticeManager;
	var m_factsLength = [];
	var m_hideRAB = true;
	var m_WindowPGOffCalculatorObject;
	var m_PG_Context_SelectedMonth;
	var m_PG_Context_Record;
	var m_PRG_Availability = 0;
	var m_PG_Context_ChannelType;
	var m_blnIsFrontlinePP = false;
	var m_prev_Cell_Selected_ID;
	var m_bln_IsClosedPricePlan;
	this.m_PG_Applicable_Market = false;
	/*Indicate Previous Year Price Plan*/
	//MAINTAINING ACL INFO FOR DELETE AND CLONE DEAL BUTTON......................
	var m_Bln_CloneDeal_ACL;
	var m_Bln_DeleteDeal_ACL;
	var m_Bln_DeletePG_ACL;
	var m_IS_AUDIT_REQUIRED = false;
	var obj_pricePlanButtonsWindow;
	var m_dealMenu;
	var m_dealCopyData;
	var m_copyData;
	var m_Bln_OpenPS_ACL;
	var m_staticMetricPGColumnWidth = getCommonFuncMgr().isNonDeskTopView()?170:246;
	var m_staticMetricPGColumnExpandedWidth = getCommonFuncMgr().isNonDeskTopView()?302:378;
	var m_staticSummaryMetricWidth = getCommonFuncMgr().isNonDeskTopView()?350:427;
	var m_staticSummaryMetricExpandedWidth = getCommonFuncMgr().isNonDeskTopView()?482:559;

	// Initialize Price Plan Screen
	this.initialize = function (p_ScopeObj, fetchPricePlanCallback, clearPricePlanCallBack, DealOperationCallback) {
		try {
			fn_DealOperation = DealOperationCallback;
			//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			/*Load viewPricePlan on viewContainer */
			//Render Price plan View................
			VistaarAuditingManager.audit({
				"name" : "Render Price Plan View started @@renderPricePlan|renderPricePlanGridView|activateApplicationTab"
			}, m_IS_AUDIT_REQUIRED, 5024);
			this.renderPricePlan();

			//Render Price Plan Grid View............
			this.renderPricePlanGridView();

			//This activates the application tab for Price Plan and Price Structure
			getApplicationTabMgrObj().activateApplicationTab();
			VistaarAuditingManager.audit({
				"name" : "Render Price Plan View ended @@renderPricePlan|renderPricePlanGridView|activateApplicationTab"
			}, m_IS_AUDIT_REQUIRED, 5024);
			//Apply ACL after Price Plan view rendered.....
			getObjectFactory().getUIACLManager().applyACL(getGlobalConstantsObj().PRICEPLAN);

			//Render Price Plan combo-box and Grids.............
			this.getPricePlanScopeManager().renderPricePlanComboBox(p_ScopeObj, fetchPricePlanCallback, clearPricePlanCallBack);

			//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();

			//Intialization : Show Freeze column view....
			VistaarExtjs.getCmp("cntFreezeColumnGrid").show();
			VistaarExtjs.getCmp("cntFreezeColumnGrid").setMaxHeight(0);

			//disable impact analysis button
			//VistaarExtjs.getCmp("btnImpactAnalysisOpen").disable();
			//disable FOB cal button
			//VistaarExtjs.getCmp("btnFobCalculator").disable();
		} catch (err) {
			//Ext.resumeLayouts(true);
			getCommonFuncMgr().printLog(err);
		}
		finally {
			// if(!IsIPADView)
			// Ext.resumeLayouts(true);
		}
	};

	this.setFreezeColumnGridView = function () {
		try {
			if (this.isPricePlanGridViewActive()) {
				/**ET # 1097 : Price Plan Scroll Bar Locks Halfway Down Page**/
				//Set Width of Freeze column Grid w.r.t. Price Plan Grid
				var l_Cnt_FreezeColumnGrid = VistaarExtjs.getCmp("cntFreezeColumnGrid");
				if (l_Cnt_FreezeColumnGrid) {
					//l_Cnt_FreezeColumnGrid.show();
					l_Cnt_FreezeColumnGrid.setWidth(VistaarExtjs.getCmp("cntPricePlanSummary").getWidth());
					l_Cnt_FreezeColumnGrid.setX(VistaarExtjs.getCmp("cntPricePlanSummary").getX());
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	//expose Price Plan Scope
	this.getPricePlanScope = function () {
		return m_PricePlanScope;
	};
	//expose Price Plan Grid View
	this.getPricePlanGridViewObj = function (){
		return m_objPricePlanGridView;
	}
	//Purpose: render PricePlan screen
	this.renderPricePlan = function () {
		try {
			var IsIPADView = getCommonFuncMgr().isNonDeskTopView();
			if (!IsIPADView)
				Ext.suspendLayouts();
			if (m_PricePlanScope == undefined) {
				m_PricePlanScope = VistaarFunctionLib.createAndAddView('PricePlanScope', VistaarExtjs.getCmp("viewContainer"));
				VistaarExtjs.getCmp("viewContainer").setActiveItem(m_PricePlanScope);
				//Create ToolTip for all Combo in Price Plan View....
				this.getPricePlanScopeManager().applyTooltipForCombo();
				//Add Sorter object to all combo store...................
				this.getPricePlanScopeManager().addPricePlanComboBoxStoreSorter();
			} else {
				VistaarExtjs.getCmp("viewContainer").setActiveItem(m_PricePlanScope);
			}

			if (this.m_PricePlanMain == undefined) {
				this.m_PricePlanMain = VistaarFunctionLib.createAndAddView('PricePlanMain', VistaarExtjs.getCmp("cntPricePlanMain"));
				VistaarExtjs.getCmp("cntPricePlanMain").setActiveItem(this.m_PricePlanMain);
			} else {
				VistaarExtjs.getCmp("cntPricePlanMain").setActiveItem(this.m_PricePlanMain);
			}

			if (getCommonFuncMgr().isNonDeskTopView()) {
				getObjectFactory().getToolbarManager().btnBaseViewExpander_Click();
				getObjectFactory().getToolbarManager().hideHeader();
				m_isFullInFullScreenMode = true;
				//Ext.getCmp('cntPPOperationButtons').setVisible(false);
				var l_PPSummaryHideObj = Ext.ComponentQuery.query('#btnPricePlanHideSummary')[0];
				if (obj_pricePlanButtonsWindow == undefined) {
					obj_pricePlanButtonsWindow = VistaarFunctionLib.showWindow('PricePlanTabTool');
					//if (l_PPSummaryHideObj != undefined) {
					//Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].showAt((l_PPSummaryHideObj.getX() * 33), l_PPSummaryHideObj.getY());

					//}
					getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
					Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].setHeight(20);
					//VistaarFunctionLib.showWindow("viewPricePlanButtons");
				} else {
					obj_pricePlanButtonsWindow.show();
					Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].setHeight(20);
					//Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].showAt((l_PPSummaryHideObj.getX() * 33), l_PPSummaryHideObj.getY());
					//VistaarFunctionLib.showWindow("viewPricePlanButtons");
					getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
				}
				/** Handle Full Screen Mode Button **/
				VistaarExtjs.getCmp("btn_PP_FullScreen").setVisible(false);
				VistaarExtjs.getCmp("btn_PP_ExitFullScreen").setVisible(true);
			}
			//var objData = Vistaar.frameworkUtil.VistaarAjax.callAjax("data/ImpactAnalysis/PricePlan.json", "", false);

			//var dataview = Ext.getStore('ProposedNetFOB');

			//dataview.loadData(objData["ProposedNetFOB"]);

			//	Ext.getStore('store_Errors').loadData(objData["Best Practices"]["Errors"]);
			//Ext.getStore('store_Violations').loadData(objData["Best Practices"]["Violation"]);
			//Ext.getStore('store_cmbWorkflow').loadData(objData["PPWorkFlow"]);
			Ext.getStore('store_cmbWorkflow').loadData([]);
			/*if (m_objPreferenceTip == undefined) {
			this.addTiponPreferenceButton();
			}*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			if (!IsIPADView)
				Ext.resumeLayouts();
		}
	};

	//Purpose: Initialize all the PricePlan Configuration to its initial state..........
	this.intializeSummaryGridRowHideFlag = function () {
		try {
			VistaarAuditingManager.audit({
				"name" : "intializeSummaryGridRowHideFlag started..."
			}, m_IS_AUDIT_REQUIRED, 5030);

			//Initialize Price Plan PG_Effectivity
			getCommonFuncMgr().m_PP_PG_Effectivity = {};
			var l_objSummaryProposedGrid = VistaarExtjs.getCmp("grdSummaryProposed").DGObj;
			var l_objFreezeColumnGrid = VistaarExtjs.getCmp("PP_ColumnFreezeGrd").DGObj;

			//var l_objSummaryCurrentGrid = VistaarExtjs.getCmp("grdSummaryCurrent").DGObj.lockedGrid;
			var l_objHiddenFieldInfo = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo;
			for (var field in l_objHiddenFieldInfo) {
				if (!l_objHiddenFieldInfo[field].hidden) {
					l_objHiddenFieldInfo[field].hidden = true;
					if (l_objHiddenFieldInfo[field].hasOwnProperty("expandCls")) {
						l_objSummaryProposedGrid.getEl().removeCls(l_objHiddenFieldInfo[field].expandCls);
					}
				}
			}
			/*if (m_blnIsColumnsExpanded) {
				//Set Width of Summary Grid's Column to initial State.................
				if (!getCommonFuncMgr().isNonDeskTopView()) {
					l_objSummaryProposedGrid.getColumnManager().getColumns()[0].setWidth(377);
					l_objFreezeColumnGrid.getColumnManager().getColumns()[0].setWidth(393);
				}

				//Initial State of all PG Grid...............
				var l_arrPG_Grid_Id = [m_DG_PG_OFFPREMISESPROPOSED, m_DG_PG_ONPREMISESPROPOSED, m_DG_PG_OFFPREMISESCURRENT, m_DG_PG_ONPREMISESCURRENT];
				//Decreasing column width Of PG Grid.........
				for (var PG_Index in l_arrPG_Grid_Id) {
					var l_obj_PG_Grid = VistaarExtjs.getCmp(l_arrPG_Grid_Id[PG_Index]);
					if (l_obj_PG_Grid != undefined) {
						// l_obj_PG_Grid.DGObj.getColumnManager().getColumns()[0].setWidth(196);
						//l_obj_PG_Grid.DGObj.getColumnManager().getColumns()[0].setWidth(236);
						l_obj_PG_Grid.DGObj.getColumnManager().getColumns()[0].setWidth(m_staticMetricPGColumnWidth);
					}
				}
				//set Column Expanded to false on reload PricePlan(need to checked in..............)
				m_blnIsColumnsExpanded = false;
			}*/
			//l_objHiddenFieldInfo["PG_Rows"].hidden = false;
			if (VistaarExtjs.getCmp("btnSummaryToggleId").pressed) {
				VistaarExtjs.getCmp("btnSummaryToggleId").toggle();
			}
			VistaarAuditingManager.audit({
				"name" : "intializeSummaryGridRowHideFlag ended..."
			}, m_IS_AUDIT_REQUIRED, 5030);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.activatePricePlan = function () {
		try {
			this.renderPricePlan();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.renderPricePlanGridView = function () {
		try {
			var IsIPADView = getCommonFuncMgr().isNonDeskTopView();
			if (!IsIPADView)
				Ext.suspendLayouts();
			if (m_objPricePlanGridView == undefined) {
				if(getCommonFuncMgr().isNonDeskTopView())
					m_objPricePlanGridView = VistaarFunctionLib.createAndAddView('viewPricePlanGridIPAD', VistaarExtjs.getCmp("cntPricePlanCard"));
				else
				m_objPricePlanGridView = VistaarFunctionLib.createAndAddView('viewPricePlanGrid', VistaarExtjs.getCmp("cntPricePlanCard"));
				//Load Comments combobox.......
				getObjectFactory().getImpactAnalysisManager().loadCommentsCombobox();
				VistaarExtjs.getCmp("cntPricePlanCard").setActiveItem(m_objPricePlanGridView);
				if (!IsIPADView)
					Ext.resumeLayouts();
				/**ET # 1097 : Price Plan Scroll Bar Locks Halfway Down Page (Removing Scroll event)**/
				//Add PricePlanGridView Scroll event.....
				var l_GridContainer = VistaarExtjs.getCmp('cntPricePlanGridView');
				l_GridContainer.getEl().on('scroll', function (e, t) {
					//Is Price Plan Grid View Active.......
					if (this.id == "cntPricePlanGridView") {
						var l_cnt_FreezeCol = VistaarExtjs.getCmp("cntFreezeColumnGrid");
						if (t.scrollTop >= 95 && l_cnt_FreezeCol && l_cnt_FreezeCol.getMaxHeight() == 0) {
							//Show Freeze column Grid....
							l_cnt_FreezeCol.setMaxHeight(24);
							l_cnt_FreezeCol.setHeight(24);
							//Set Scroll Position of Fixed Header Grid.....
							VistaarExtjs.getCmp("PP_ColumnFreezeGrd").DGObj.view.getEl().setScrollLeft(VistaarExtjs.getCmp("grdSummaryProposed").DGObj.view.getEl().getScrollLeft());
						} else if (t.scrollTop < 95 && l_cnt_FreezeCol && l_cnt_FreezeCol.getMaxHeight() == 24) {
							//Hide Freeze column Grid....
							l_cnt_FreezeCol.setMaxHeight(0);
						}
						//ET#1097 -- month headers appearing on right side--
						getPricePlanControllerManagerObj().getPricePlanUIManager().setFreezeColumnGridView();
					}
				});
			} else {
				VistaarExtjs.getCmp("cntPricePlanCard").setActiveItem(m_objPricePlanGridView);
				if (!IsIPADView)
					Ext.resumeLayouts();
			}
			// var l_PPSummaryHideObj = Ext.ComponentQuery.query('#btnPricePlanHideSummary')[0];
			// Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].showAt((l_PPSummaryHideObj.getX() * 33), l_PPSummaryHideObj.getY());
			/*	var objFieldSetPricePlan = Ext.getCmp("cnt_PricePlanImpact_Fieldset");
			objFieldSetPricePlan.setVisible(true);
			var objDummySiblingPricePlan = Ext.getCmp("cnt_PricePlanImpact_BelowFieldset");
			objDummySiblingPricePlan.setVisible(true);*/
		} catch (err) {
			if (!IsIPADView)
				Ext.resumeLayouts();
			getCommonFuncMgr().printLog(err);
		}
	};

	//Check Price Plan Grid view visibility....................
	this.isPricePlanGridViewActive = function () {
		var btnPricePlanTab = VistaarExtjs.getCmp("btnPricePlanTab");
		if (btnPricePlanTab.isVisible() && btnPricePlanTab.pressed && VistaarExtjs.getCmp("cntPricePlanCard").getLayout().getActiveItem().id == "cntPricePlanGridView") {
			return true;
		}
	}

	//Check Historic Impact view visibility....................
	this.isHistoricImpactViewActive = function () {
		var btnHistoricImpactTab = VistaarExtjs.getCmp("btnHistoricImpactTab");
		if (btnHistoricImpactTab.isVisible() && btnHistoricImpactTab.pressed && VistaarExtjs.getCmp("cntPricePlanCard").getLayout().getActiveItem().id == "cntHistoricImpactMain") {
			return true;
		}
	}
	this.loadPricePlanGrids = function (p_ScriptResponse, p_EditedData, p_bln_PG_Applicable, p_PG_Effectivity) {
		try {
			//Render Price Plan Grid View if its not Active........
			if (!this.isPricePlanGridViewActive()) {
				this.renderPricePlanGridView()
			}
			//Reset Sort Grid Flags To False
			m_bln_ON_CurrentSorted = false;
			m_bln_OFF_CurrentSorted = false;
			//Set Proposed Plan Active
			this.setProposedPricePlanActive();
			//this.getPricePlanSummaryGridData(p_ScriptResponse);
			//Maintain the visibility of PG (PG ROWS)...................

			if (p_ScriptResponse.hasOwnProperty("CurrenTimeDetails")) {
				getGlobalConstantsObj().m_objCurrentDateDetails = p_ScriptResponse.CurrenTimeDetails;
			}

			if (p_ScriptResponse.hasOwnProperty("Scope")) {
				getGlobalConstantsObj().m_planningYear = p_ScriptResponse.Scope.Time;
			}

			//this.m_PG_Applicable_Market = p_bln_PG_Applicable;
			/** PG Enhancement **/
			/*m_PRG_Availability = p_bln_PG_Applicable;
			if (p_bln_PG_Applicable == 0) {
			this.m_PG_Applicable_Market = true;
			} else {
			this.m_PG_Applicable_Market = false
			}*/
			this.setPGApplicability(p_bln_PG_Applicable)
			if (this.m_PG_Applicable_Market) {
				getCommonFuncMgr().objSummaryGrdHiddenFieldInfo.PG_Rows.hidden = false;
				VistaarExtjs.getCmp("btn_PP_PromoGoods").toggle(true);
				Ext.getCmp("cntParentFGOffPremise").setHidden(false);
				Ext.getCmp("cntParentFGOnPremise").setHidden(false);
				//this.getPricePlanGridManager().calculateCurrentSectionOnLoad(p_ScriptResponse);
			} else {
				getCommonFuncMgr().objSummaryGrdHiddenFieldInfo.PG_Rows.hidden = true;
				VistaarExtjs.getCmp("btn_PP_PromoGoods").toggle(false);
				Ext.getCmp("cntParentFGOffPremise").setHidden(true);
				Ext.getCmp("cntParentFGOnPremise").setHidden(true)
			}
			this.refreshPGButtonsState(); /*Mobility*/
			if (p_PG_Effectivity != undefined) {
				getCommonFuncMgr().m_PP_PG_Effectivity = p_PG_Effectivity;
			}
			//Set Closed month and editable info at Price Plan Level
			if (p_ScriptResponse.hasOwnProperty("AdditionalInfo")) {
				getCommonFuncMgr().m_PP_ClosedMonth = p_ScriptResponse.AdditionalInfo.ClosedMonth;
				if (!isAdminRole()) {
					getCommonFuncMgr().m_PP_EditableFrom = p_ScriptResponse.AdditionalInfo.EditableFrom;
				}
			}

			/**** Back-end Key related changes ***/
			/*if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
			this.getPricePlanGridManager().calculateCurrentSectionOnLoad(p_ScriptResponse);

			}*/

			this.getPricePlanGridManager().setPricePlanGrids(p_ScriptResponse, p_EditedData);

			this.updateFactsListPrefrenceWindow(p_ScriptResponse.UserPreference);
			//var l_PPSummaryHideObj = Ext.ComponentQuery.query('#btnPricePlanHideSummary')[0];
			//Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].showAt((l_PPSummaryHideObj.getX() * 33), l_PPSummaryHideObj.getY());

			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();

			/**** Back-end Key related changes ***/
			/*if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
			Ext.defer(function () {


			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChangesONLoad();


			}, 200, this);
			}*/

			Ext.defer(function () {
				this.setFreezeColumnGridView();
				this.callGridSort();
				//Set Floating Freeze column view
				VistaarAuditingManager.audit({
					"name" : "Open PP Ended"
				}, m_IS_AUDIT_REQUIRED, 250);
				//getPricePlanControllerManagerObj().getPricePlanUIManager().swapCurrentProposed();
			}, 1, this);
			//	this.getPricePlanGridManager().refreshAllPricePlanGridsView();

			//set deal count IN GRID HEADER
			getPricePlanControllerManagerObj().setDealCountInGirdHeader();

			this.setComponentsAsPerResolution();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.setPGApplicability = function (p_bln_PG_Applicable) {
		try {
			m_PRG_Availability = p_bln_PG_Applicable;
			if (p_bln_PG_Applicable == 0) {
				this.m_PG_Applicable_Market = false;
			} else {
				this.m_PG_Applicable_Market = true
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.getPricePlanSummaryGridData = function (p_ScriptResponse) {
		try {

			for (var key in p_ScriptResponse["Price Plan"].Summary.Current) {
				p_ScriptResponse["Price Plan"].Summary.Proposed.push(p_ScriptResponse["Price Plan"].Summary.Current[key]);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.callGridSort = function () {
		try {
			this.getPricePlanGridManager().sortGrid(this.m_UserPrefrence);

			//This is required for IPAD only for first render
			/*Check again if required */
			VistaarAuditingManager.audit({
				"name" : "DO LAYOUT After render started"
			}, m_IS_AUDIT_REQUIRED, 5023);
			Ext.getCmp('cntPricePlanMain').doLayout();
			VistaarAuditingManager.audit({
				"name" : "DO LAYOUT After render ended"
			}, m_IS_AUDIT_REQUIRED, 5023);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	this.onbtnPreferenceClick = function (button, e, eOpts) {
		try {

			var l_objMenuPrefrence = Ext.getCmp("menuPreference");

			if (button.pressed) {
				var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence").getForm();
				obj_PricePlanPrefrenceForm.setValues(this.m_UserPrefrence);
				l_objMenuPrefrence.showAt(button.getX() - ((l_objMenuPrefrence.width) / 2) + (button.getWidth() / 2), button.getY() + button.getHeight() - 5);

				l_objMenuPrefrence.setX(button.getX() - ((l_objMenuPrefrence.width) / 2) + (button.getWidth() / 2));
				l_objMenuPrefrence.setY(button.getY() + button.getHeight() - 5);

			} else {

				//	this.hidePreferenceWindow();

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.menuPreferenceShow = function (component, eOpts) {

		/*var btnPreference=Ext.getCmp("btnPreference");
		component.showAt(btnPreference.getX() - ((component.width) / 2) + (btnPreference.getWidth() / 2), btnPreference.getY() + btnPreference.getHeight() - 5);*/

	}

	this.menuPreferenceHide = function (component, eOpts) {

		var btnPreference = Ext.getCmp("btnPreference");
		btnPreference.toggle(false);
		getPricePlanControllerManagerObj().getPricePlanUIManager().hidePreferenceWindow();
	}

	this.hidePreferenceWindow = function () {
		if (m_PricePlanPreferenceObject != undefined) {
			var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence").getForm();
			if (!(this.compareTwoObjects(this.m_UserPrefrence, obj_PricePlanPrefrenceForm.getFieldValues()))) {
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
					this.callUserPrefrence();

				}, 100, this);
			}

		}
	};

	this.compareTwoObjects = function (obj1, obj2) {
		var blnMatch = true;

		for (var key1 in obj1) {
			if (obj1[key1] != obj2[key1]) {
				blnMatch = false;
				break;
			}
		}
		return blnMatch
	}

	this.callUserPrefrence = function () {
		try {
			var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence").getForm().getFieldValues();
			this.updatePricePlanPrefrenceForm();
			this.getPricePlanGridManager().sortGrid(this.m_UserPrefrence);
			this.getPricePlanGridManager().refreshAllPricePlanGridsView();
			if (VistaarExtjs.getCmp("cntPricePlanCard").getLayout().activeItem.id == "cntImpactAnalysisMain") {
				getObjectFactory().getImpactAnalysisManager().setViewPrefrence();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	};

	this.btn_PP_FullScreen_Click = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().getPricePlanUIManager().compactView(true);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.btn_PP_ExitFullScreen_Click = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().getPricePlanUIManager().compactView(false);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.compactView = function (pEnable) {
		try {
			if (pEnable) {
				//hide
				//VistaarExtjs.getCmp("btnBaseViewExpander").setPressed(true)
				m_isFullInFullScreenMode = true;
				this.onGridColumnClick(false);
				getObjectFactory().getToolbarManager().btnBaseViewExpander_Click();
				getObjectFactory().getToolbarManager().hideHeader();
				/* if (m_SummaryShowHide) {
				this.onbtnPricePlanHideTopSummary_click()
				Ext.getCmp("btnPricePlanHideTopSummary").toggle(true);
				} */
				Ext.getCmp("btn_PP_FullScreen").setVisible(false);
				Ext.getCmp("btn_PP_ExitFullScreen").setVisible(true);

			} else {
				m_isFullInFullScreenMode = false;
				//show
				if (VistaarExtjs.getCmp('toolbarContainer').getWidth() == 0 || VistaarExtjs.getCmp('toolbarContainer').isDisabled()) {
					getObjectFactory().getToolbarManager().btnBaseViewExpander1_Click();
				}
				if (VistaarExtjs.getCmp('headerContainer').getHeight() == 0 || VistaarExtjs.getCmp('toolbarContainer').isDisabled()) {
					getObjectFactory().getToolbarManager().showHeader();
				}
				/* if (!m_SummaryShowHide) {
				this.onbtnPricePlanHideTopSummary_click()
				Ext.getCmp("btnPricePlanHideTopSummary").toggle(false);
				} */
				Ext.getCmp("btn_PP_FullScreen").setVisible(true);
				Ext.getCmp("btn_PP_ExitFullScreen").setVisible(false);
			}
			if (getCommonFuncMgr().isNonDeskTopView()) {
				getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.onWindowBlurEvent = function (window, event, eOpts) {
		try {}
		catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.addTiponPreferenceButton = function () {
		try {

			m_objPreferenceTip = Ext.create('Ext.tip.ToolTip', {
					target : 'btnPreference',
					html : 'Preferences'
				});
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.removeTiponPreferenceButton = function () {
		try {

			m_objPreferenceTip.destroy();
			m_objPreferenceTip = null;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.hideGridColumnAfterRender = function (p_grid) {
		if (p_grid.isLockedView) {
			VistaarAuditingManager.audit({
				"name" : "Start: Hide Grid Column"
			}, true, 5120);
			p_grid.getColumnManager().headerCt.items.get(1).items.get(0).setVisible(false);
			p_grid.getColumnManager().headerCt.items.get(1).items.get(2).setVisible(false);
			VistaarAuditingManager.audit({
				"name" : "End: Hide Grid Column"
			}, true, 5120);
		}
	}

	//Tree-Grid Expand collapse implementation.............................
	this.onGridColumnClick = function (p_bln_Expand) {
		try {

			/*hide and show of tree grid columns(NetFOB and shelf)*/
			/*var l_treeId;
			var l_blnExpand = false;
			var l_ShowImgId;
			switch (img_id.id) {
			case 'imgPPExpandRowOffProposed':
			l_treeId = 'TG_OffPremisesProposed';
			l_blnExpand = true;
			l_ShowImgId = 'imgPPCollapseRowOffProposed';
			break;
			case 'imgPPCollapseRowOffProposed':
			l_treeId = 'TG_OffPremisesProposed';
			l_blnExpand = false;
			l_ShowImgId = 'imgPPExpandRowOffProposed';
			break;
			case 'imgPPExpandRowOffCurrent':
			l_treeId = 'TG_OffPremisesCurrent';
			l_blnExpand = true;
			l_ShowImgId = 'imgPPCollapseRowOffCurrent';
			break;
			case 'imgPPCollapseRowOffCurrent':
			l_treeId = 'TG_OffPremisesCurrent';
			l_blnExpand = false;
			l_ShowImgId = 'imgPPExpandRowOffCurrent';
			break;
			case 'imgPPExpandRowOnProposed':
			l_treeId = 'TG_OnPremisesProposed';
			l_blnExpand = true;
			l_ShowImgId = 'imgPPCollapseRowOnProposed';
			break;
			case 'imgPPCollapseRowOnProposed':
			l_treeId = 'TG_OnPremisesProposed';
			l_blnExpand = false;
			l_ShowImgId = 'imgPPExpandRowOnProposed';
			break;
			case 'imgPPExpandRowOnCurrent':
			l_treeId = 'TG_OnPremisesCurrent';
			l_blnExpand = true;
			l_ShowImgId = 'imgPPCollapseRowOnCurrent';
			break;
			case 'imgPPCollapseRowOnCurrent':
			l_treeId = 'TG_OnPremisesCurrent';
			l_blnExpand = false;
			l_ShowImgId = 'imgPPExpandRowOnCurrent';
			break;
			}

			var TG_Object = Ext.getCmp(l_treeId);

			var columnManager = TG_Object.TGObj.getColumnManager();
			Ext.getElementById(l_ShowImgId).hidden = false;
			Ext.getElementById(img_id.id).hidden = true;
			if (l_blnExpand) {
			columnManager.headerCt.items.get(1).items.get(0).setVisible(true);
			columnManager.headerCt.items.get(1).items.get(2).setVisible(true);

			} else {
			columnManager.headerCt.items.get(1).items.get(0).setVisible(false);
			columnManager.headerCt.items.get(1).items.get(2).setVisible(false);
			}*/

			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer");
			Ext.defer(function () {
				this.onGridColumnClickCallBack(p_bln_Expand);
			}, 50, this);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onGridColumnClickCallBack = function (p_bln_Expand) {
		try {
			m_blnIsColumnsExpanded = p_bln_Expand;
			var l_arrTreeGridId = [m_IdTGOffPremisesProposed, m_IdTGOnPremisesProposed, m_IdTGOffPremisesCurrent, m_IdTGOnPremisesCurrent];
			var l_arrExpandImgID = ["imgPPExpandRowOffProposed", "imgPPExpandRowOffCurrent", "imgPPExpandRowOnProposed", "imgPPExpandRowOnCurrent"];
			var l_arrCollapseImgID = ["imgPPCollapseRowOffProposed", "imgPPCollapseRowOffCurrent", "imgPPCollapseRowOnProposed", "imgPPCollapseRowOnCurrent"];
			var l_arrColumnsToHide = ["NetFOB", "Shelf"];
			//var TG_Object = Ext.getCmp(l_treeId);
			for (var l_indexTreeGrid in l_arrTreeGridId) {
				//Hide and Show Expand collapse image.................
				if(Ext.get(l_arrExpandImgID[l_indexTreeGrid]))
				Ext.get(l_arrExpandImgID[l_indexTreeGrid]).setVisible(!p_bln_Expand);
				if(Ext.get(l_arrCollapseImgID[l_indexTreeGrid]))
				Ext.get(l_arrCollapseImgID[l_indexTreeGrid]).setVisible(p_bln_Expand);
				//Hide & show Tree Grid Columns.......................
				var TG_Object = Ext.getCmp(l_arrTreeGridId[l_indexTreeGrid]).TGObj;
				var l_gridColumn = TG_Object.getColumnManager().getColumns();
				for (var l_column in l_arrColumnsToHide) {
					for (var l_columnIndx in l_gridColumn) {
						if (l_gridColumn[l_columnIndx].dataIndex == l_arrColumnsToHide[l_column]) {
							l_gridColumn[l_columnIndx].setVisible(p_bln_Expand);
							break;
						}
					}
				}
			}
			//Showing PG container visible if it is hidden....................
			var l_bln_PG_Btn_Pressed = VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed;
			var l_bln_PG_Btn_Disabled = VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled();
			if (!l_bln_PG_Btn_Disabled && l_bln_PG_Btn_Pressed) {
				this.expandCollapse_PG_GridColumn();
			}
			//ALIGN SUMMARY GRID AND PROMO GRID COLUMN...........................
			var l_arrSummaryColumn = Ext.getCmp("grdSummaryProposed").DGObj.getColumnManager().getColumns();
			//ALIGN FREEZE COLUMN GRID...........................
			var l_arrFreezeColumn = Ext.getCmp("PP_ColumnFreezeGrd").DGObj.getColumnManager().getColumns();
			//var l_arrPG_Grid_Id = [m_DG_PG_OFFPREMISESPROPOSED, m_DG_PG_ONPREMISESPROPOSED, m_DG_PG_OFFPREMISESCURRENT, m_DG_PG_ONPREMISESCURRENT];
			if (p_bln_Expand) {
				//Increasing column width Of Summary Grid .........
				l_arrSummaryColumn[0].setWidth(m_staticSummaryMetricExpandedWidth);
				l_arrFreezeColumn[0].setWidth(575);
			} else {
				//Decreasing column width Of Summary Grid.........
				l_arrSummaryColumn[0].setWidth(m_staticSummaryMetricWidth);
				l_arrFreezeColumn[0].setWidth(443);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	this.setComponentsAsPerResolution = function () {
		try {
			VistaarAuditingManager.audit({
				"name" : "setComponentsAsPerResolution Started"
			}, m_IS_AUDIT_REQUIRED, 5022);
			//Match the wait cursor count.....
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			//if(Ext.Element.getViewportWidth()<1500){
			if (getCommonFuncMgr().isNonDeskTopView()) {
				this.onGridColumnTotalClickCallBack(false);
				//Ext.getCmp("cntPricePlanSummaryTop").setWidth(350);
			} else {
				this.onGridColumnTotalClickCallBack(true);
			}
			VistaarAuditingManager.audit({
				"name" : "setComponentsAsPerResolution Ended"
			}, m_IS_AUDIT_REQUIRED, 5022);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Tree-Grid Expand collapse implementation.............................
	this.onGridColumnTotalClick = function (p_bln_Expand) {
		try {

			/*hide and show of tree grid columns(NetFOB and shelf)*/

			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer");
			Ext.defer(function () {
				this.onGridColumnTotalClickCallBack(p_bln_Expand);
			}, 50, this);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onGridColumnTotalClickCallBack = function (p_bln_Expand) {
		try {
			m_blnIsTotalsColumnsExpanded = p_bln_Expand;
			var l_arrTreeGridId = [m_IdTGOffPremisesProposed, m_IdTGOnPremisesProposed, m_IdTGOffPremisesCurrent, m_IdTGOnPremisesCurrent];
			var l_arrExpandImgID = ["imgPPExpandRowOffProposedTotal", "imgPPExpandRowOnProposedTotal", "imgPPExpandRowOffCurrentTotal", "imgPPExpandRowOnCurrentTotal"];
			var l_arrCollapseImgID = ["imgPPCollapseRowOffProposedTotal", "imgPPCollapseRowOnProposedTotal", "imgPPCollapseRowOffCurrentTotal", "imgPPCollapseRowOnCurrentTotal"];
			var l_arrColumnsToHide = ["FY", "YTD", "4MTHS", "PY", "FYvsPY"];
			//var TG_Object = VistaarExtjs.getCmp(l_treeId);
			for (var l_indexTreeGrid in l_arrTreeGridId) {
				//Hide and Show Expand collapse image.................
				if (Ext.get(l_arrExpandImgID[l_indexTreeGrid]) && Ext.get(l_arrExpandImgID[l_indexTreeGrid]) != null) {
					if (p_bln_Expand == Ext.get(l_arrExpandImgID[l_indexTreeGrid]).isVisible()) {
						Ext.get(l_arrExpandImgID[l_indexTreeGrid]).setVisible(!p_bln_Expand);
						Ext.get(l_arrCollapseImgID[l_indexTreeGrid]).setVisible(p_bln_Expand);
					}
				}
				//Hide & show Tree Grid Columns.......................
				var TG_Object = VistaarExtjs.getCmp(l_arrTreeGridId[l_indexTreeGrid])[m_TGObject];
				var l_gridColumn = TG_Object.getColumnManager().getColumns();
				for (var l_column in l_arrColumnsToHide) {
					for (var l_columnIndx in l_gridColumn) {
						if (l_gridColumn[l_columnIndx].dataIndex == l_arrColumnsToHide[l_column]) {
							if (l_gridColumn[l_columnIndx].isVisible() != p_bln_Expand) {
								l_gridColumn[l_columnIndx].setVisible(p_bln_Expand);
							}
							break;
						}
					}
				}
			}

			//ALIGN SUMMARY GRID AND PROMO GRID COLUMN...........................
			var l_arrGridID = [m_IdDGSummaryProposed, "PP_ColumnFreezeGrd"];
			for (var l_indexGrid in l_arrGridID) {
				var l_arrGridColumn = VistaarExtjs.getCmp(l_arrGridID[l_indexGrid])[m_DGObject].getColumnManager().getColumns();
				for (var l_column in l_arrColumnsToHide) {
					for (var l_columnIndx in l_arrGridColumn) {
						if (l_arrGridColumn[l_columnIndx].dataIndex == l_arrColumnsToHide[l_column]) {
							if (l_arrGridColumn[l_columnIndx].isVisible() != p_bln_Expand) {
								l_arrGridColumn[l_columnIndx].setVisible(p_bln_Expand);
							}
							break;
						}
					}
				}
			}
			/*** hide show summary exapnd collapse button ***/
			Ext.get("imgPPExpandRowSummaryTotal").setVisible(!p_bln_Expand);
			Ext.get("imgPPCollapseRowSummaryTotal").setVisible(p_bln_Expand);
			/** Hide and Show PG Total column **/
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
				this.expandCollapse_PG_TotalColumn();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	this.expandCollapse_PG_TotalColumn = function () {
		try {
			var l_arrColumnsToHide = ["FY", "YTD", "4MTHS", "PY", "FYvsPY"];
			var l_arrExpandImgID = ["imgPPExpandRowPGOnProposedTotal", "imgPPExpandRowPGOffCurrentTotal", "imgPPExpandRowPGOffProposedTotal", "imgPPExpandRowPGOnCurrentTotal"];
			var l_arrCollapseImgID = ["imgPPCollapseRowPGOnProposedTotal", "imgPPCollapseRowPGOffCurrentTotal", "imgPPCollapseRowPGOffProposedTotal", "imgPPCollapseRowPGOnCurrentTotal"];
			//ALIGN SUMMARY GRID AND PROMO GRID COLUMN...........................
			var l_arrGridID = [m_DG_PG_ONPREMISESPROPOSED, m_DG_PG_OFFPREMISESCURRENT, m_DG_PG_OFFPREMISESPROPOSED, m_DG_PG_ONPREMISESCURRENT];
			for (var l_indexGrid in l_arrGridID) {
				//Hide and Show Expand collapse image.................
				if (Ext.get(l_arrExpandImgID[l_indexGrid]) && Ext.get(l_arrExpandImgID[l_indexGrid]) != null) {
					if (m_blnIsTotalsColumnsExpanded == Ext.get(l_arrExpandImgID[l_indexGrid]).isVisible()) {
						Ext.get(l_arrExpandImgID[l_indexGrid]).setVisible(!m_blnIsTotalsColumnsExpanded);
						Ext.get(l_arrCollapseImgID[l_indexGrid]).setVisible(m_blnIsTotalsColumnsExpanded);
					}
				}
				var l_arrGridColumn = VistaarExtjs.getCmp(l_arrGridID[l_indexGrid])[m_DGObject].getColumnManager().getColumns();
				for (var l_column in l_arrColumnsToHide) {
					for (var l_columnIndx in l_arrGridColumn) {
						if (l_arrGridColumn[l_columnIndx].dataIndex == l_arrColumnsToHide[l_column]) {
							if (l_arrGridColumn[l_columnIndx].isVisible() != m_blnIsTotalsColumnsExpanded) {
								l_arrGridColumn[l_columnIndx].setVisible(m_blnIsTotalsColumnsExpanded);
							}
							break;
						}
					}
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onSummaryProposedGrdCellClickEvent = function (tableview, td, cellIndex, record, tr, rowIndex, e, eOpts) {
		try {
			var el = VistaarExtjs.getCmp("grdSummaryProposed").DGObj.getEl();
			var l_str_ParentKey = record.get("Type") + record.get("MetricsType");
			var l_index_ParentNode = getCommonFuncMgr().arrSummaryGrdParentRowInfo.indexOf(l_str_ParentKey);
			var l_objHiddenFieldInfo = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo;
			if (l_index_ParentNode != -1) {
				if (l_objHiddenFieldInfo[l_str_ParentKey].hidden) {
					el.addCls(l_objHiddenFieldInfo[l_str_ParentKey].expandCls);
				} else {
					el.removeCls(l_objHiddenFieldInfo[l_str_ParentKey].expandCls);
				}
				l_objHiddenFieldInfo[l_str_ParentKey].hidden = !l_objHiddenFieldInfo[l_str_ParentKey].hidden;

			}
			VistaarExtjs.getCmp("grdSummaryProposed").DGObj.view.refresh();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.onbtnPricePlanHideTopSummary_click = function () {
		try {
			var summary = Ext.getCmp("cntPricePlanSummaryTop");
			var cntPPOperationButtonsEl = Ext.getCmp("cntPPOperationButtons").getEl();
			summary.setHidden(m_SummaryShowHide);
			m_SummaryShowHide = !(m_SummaryShowHide);
			if (m_SummaryShowHide) {
				cntPPOperationButtonsEl.addCls("clsCntPPOperationButtons");

			} else {
				cntPPOperationButtonsEl.removeCls("clsCntPPOperationButtons");
				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onbtnPricePlanHideSummary_click = function (button, e, eOpts) {
		try {
			if(getCommonFuncMgr().isNonDeskTopView())
			{
				var pnlParentCard = VistaarExtjs.getCmp('cnt_PricePlan_Grid_Card');
				var l_cntPricePlanSummary = VistaarExtjs.getCmp("cntPricePlanSummary");
				pnlParentCard.setActiveItem(l_cntPricePlanSummary);
				if(!button.pressed)
				{
					button.toggle();
				}
			}
			else
			{
			var summaryGrid = Ext.getCmp("tabPnlSummary");
			summaryGrid.setHidden(m_SummaryGridShowHide);
			Ext.getCmp("btnSummaryToggleId").setHidden(m_SummaryGridShowHide)
			m_SummaryGridShowHide = !(m_SummaryGridShowHide);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onbtnPricePlanOffHide_click = function (button, e, eOpts) {
		try {
			if(getCommonFuncMgr().isNonDeskTopView())
			{
				var pnlParentCard = VistaarExtjs.getCmp('cnt_PricePlan_Grid_Card');
				var l_cntPricePlanOffPremise = VistaarExtjs.getCmp("cnt_PricePlanOffPremise");
				pnlParentCard.setActiveItem(l_cntPricePlanOffPremise);
				if(!button.pressed)
				{
					button.toggle();
				}
			}
			else
			{
			var OffPremiseGrid = Ext.getCmp("tabPnlOffPremise");
			OffPremiseGrid.setHidden(m_OffPremiseShowHide);
			//disable toggle
			VistaarExtjs.getCmp("btnOffPremiseToggleValues").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("btnResetOffPremise").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOffAdd").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("tabFGOffPremise").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOffCollapseAll").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOffExpandAll").setHidden(m_OffPremiseShowHide);
			VistaarExtjs.getCmp("btnPGOffHide").toggle(m_OffPremiseShowHide);
			m_OffPremiseShowHide = !(m_OffPremiseShowHide);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onbtnPricePlanOnHide_click = function (button, e, eOpts) {
		try {
		if(getCommonFuncMgr().isNonDeskTopView())
			{
				var pnlParentCard = VistaarExtjs.getCmp('cnt_PricePlan_Grid_Card');
				var l_cntPricePlanOnPremise = VistaarExtjs.getCmp("cnt_PricePlanOnPremise");
				pnlParentCard.setActiveItem(l_cntPricePlanOnPremise);
				if(!button.pressed)
				{
					button.toggle();
				}
			}
			else
			{
			var OnPremiseGrid = Ext.getCmp("tabPnlOnPremise");
			OnPremiseGrid.setHidden(m_OnPremiseShowHide);
			//disable toggle
			VistaarExtjs.getCmp("btnOnPremiseToggleValues").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("btnResetOnPremise").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOnAdd").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("tabFGOnPremise").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOnCollapseAll").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("btnPricePlanOnExpandAll").setHidden(m_OnPremiseShowHide);
			VistaarExtjs.getCmp("btnPGOnHide").toggle(m_OnPremiseShowHide);

			m_OnPremiseShowHide = !(m_OnPremiseShowHide);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.cellClick = function (view, p_tableCell, cellIndex, record, row, rowIndex, e, pChannel) {
		if (m_prev_Cell_Selected_ID != undefined) {
			var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
			if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
				l_obj_GirdCell.removeCls("clsSelectedCell");
		}
		m_prev_Cell_Selected_ID = Ext.clone(p_tableCell.id);
		var l_ColumnDataIndex = view.getColumnManager().getHeaderAtIndex(cellIndex).dataIndex;
		if (view.getColumnManager().getColumns()[cellIndex].dataIndex == "Customer Included") {
			if(record.data["Customer Included"] && (record.data["Customer Included"] === true)){			
				var l_CustomerData =record.data["CustomerDetails"]
				/*l_Scope["BU Code"] = record.data["BU Code"];
				l_Scope["Brand Code"] = record.data["Brand Code"];
				l_Scope["Price Category Code"] = record.data["Price Category Code"];*/
				getCPSKUAndDistViewManager().showPPCustomerDetailsWindow(l_CustomerData);
			}

		}

		// To handle grid with checkbox - 29dec15
		l_cellIdx = view.ownerGrid.itemId == "TG_OffPremisesCurrent" || view.ownerGrid.itemId == "TG_OnPremisesCurrent" ? 2 : 3;
		var l_isDealNameColumn = view.getColumnManager().getColumns()[cellIndex].dataIndex == "DealName";
		//if (cellIndex == l_cellIdx && record.data.hasOwnProperty("children") && view.grid.isLocked) {
		if (l_isDealNameColumn && record.data.hasOwnProperty("children")) {
			if (record.isExpanded()) {
				record.collapse();
			} else {
				record.expand();
			}
			if(getCommonFuncMgr().isNonDeskTopView())
			{			
				if(!view.ownerGrid.view.isForceRefreshedEarlier)
				{
					view.ownerGrid.view.refresh();
					view.ownerGrid.view.isForceRefreshedEarlier = true;
				}
			}
		}

		//ET#185
		if (view.ownerGrid.itemId == "TG_OffPremisesProposed" || view.ownerGrid.itemId == "TG_OnPremisesProposed") {
			var l_currSelectedColHeader = view.getColumnManager().getHeaderAtIndex(cellIndex).dataIndex;
			if (isAdminRole() || ((m_arrMonths.indexOf(record.data.EditableFrom) !== -1) && (m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(record.data.EditableFrom)))) {
				if ((!view.grid.isLocked) && (record.data["FactCode"] == "SKU_Count" || record.data["FactCode"] == "Distributor_Count") && (cellIndex < 12)) {
					m_selectedMonth = cellIndex + 1;
					m_channel = pChannel;
					var l_selctedColumn;
					var l_gridColumns = view.getColumnManager().getColumns();
					var l_currSelectedColHeader = view.getColumnManager().getHeaderAtIndex(cellIndex).dataIndex;
					for (var l_colIdx in l_gridColumns) {
						if (l_gridColumns[l_colIdx].dataIndex == l_currSelectedColHeader) {
							l_selctedColumn = l_gridColumns[l_colIdx];
							break;
						}
					}
					var l_obj_GirdCell = view.getCell(record, l_selctedColumn);
					if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
						l_obj_GirdCell.addCls('clsSelectedCell');
					}
					m_prev_Cell_Selected_ID = l_obj_GirdCell.id;
					fn_DealOperation({
						"RecordSelected" : view.getStore().getNodeById(record.data.parentId),
						"MonthSelected" : m_selectedMonth,
						"Channel" : pChannel,
						"SelectedFactCode" : record.data["FactCode"]
					}, "editContextClick"); ;
				}
			}
		}
		/*var l_obj_GirdCell = Ext.get(p_tableCell.id);
		if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
		l_obj_GirdCell.addCls('clsSelectedCell');*/

	}

	/* this.showContextMenu = function (p_view, p_tableCell, p_columnIndex, p_record, p_tableRow, p_rowIndex, p_channel) {
	try {

	if (m_prev_Cell_Selected_ID != undefined) {
	var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
	if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
	l_obj_GirdCell.removeCls("clsSelectedCell");
	}
	m_prev_Cell_Selected_ID = Ext.clone(p_tableCell.id);

	var blnShowContextMenu = false;
	//Handle Row Selection Event to remove selection from other grids
	getPricePlanControllerManagerObj().getPricePlanUIManager().handleRowSelectionEvent(p_channel);
	//get herader of currnet cell clicked
	var l_currSelectedColHeader = p_view.getColumnManager().getHeaderAtIndex(p_columnIndex).dataIndex;

	//check if can we show context menu
	if (p_record.data.MetricsType != "Volume" && p_record.data.MetricsType != "Business" && p_record.data.MetricsType != "PG" && m_arrMonths.indexOf(l_currSelectedColHeader) > -1 && (m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(p_record.data.EditableFrom))) {
	//check for child or parent
	if (p_record.data.parentId !== "root" && m_arrMonths.indexOf(p_record.data.EditableFrom) !== -1) {
	blnShowContextMenu = true;
	}
	if (p_record.data.children !== undefined && p_record.data.children !== null) {
	if ((m_arrMonths.indexOf(p_record.data.children[0].EditableFrom) !== -1) && m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(p_record.data.children[0].EditableFrom)) {
	blnShowContextMenu = true;
	} else {
	blnShowContextMenu = false;
	}
	}

	}
	m_selectedMonth = m_arrMonths.indexOf(l_currSelectedColHeader) + 1;
	if (blnShowContextMenu) {

	var l_obj_GirdCell = Ext.get(p_tableCell.id);
	if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
	l_obj_GirdCell.addCls('clsSelectedCell');
	}

	if (p_record.data.parentId !== "root") {
	m_channel = p_channel;
	m_selectedRecord = p_view.getStore().getNodeById(p_record.data.parentId);
	} else {
	m_selectedRecord = p_record;
	m_channel = p_channel;
	}
	this.itmesToShowInContextMenu(m_selectedRecord, m_selectedMonth);
	m_contextMenu.showAt([p_tableCell.getBoundingClientRect().left - 25, p_tableCell.getBoundingClientRect().top - 45]);
	m_contextMenu.focus();
	//Destroy Price Plan PopUps
	getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups();
	return false;
	}
	} catch (err) {
	getCommonFuncMgr().printLog(err);
	}

	}; */

	/************************Show Context menu on tree Grid*********************************/
	this.showContextMenu = function (p_view, p_tableCell, p_columnIndex, p_record, p_tableRow, p_rowIndex, p_channel) {
		try {
			//Remove Previous cell selection
			if (m_prev_Cell_Selected_ID != undefined) {
				var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
					l_obj_GirdCell.removeCls("clsSelectedCell");
			}
			var blnShowContextMenu = false;
			//Handle Row Selection Event to remove selection from other grids
			getPricePlanControllerManagerObj().getPricePlanUIManager().handleRowSelectionEvent(p_channel);
			//get header of current cell clicked
			var l_currSelectedColHeader = p_view.getColumnManager().getHeaderAtIndex(p_columnIndex).dataIndex;
			if (l_currSelectedColHeader == "DealName" && p_record.data.hasOwnProperty("DealID") && p_record.data.MetricsType != "PG") {

				if (p_record.data.parentId !== "root") {
					m_channel = p_channel;
					m_selectedRecord = p_view.getStore().getNodeById(p_record.data.parentId);
				} else {
					m_selectedRecord = p_record;
					m_channel = p_channel;
				}

				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().showDealMenu(p_view, p_tableCell, p_columnIndex, p_record, p_tableRow, p_rowIndex, p_channel);

			}

			//check if can we show context menu
			if (getCommonFuncMgr().m_PP_PG_Effectivity[l_currSelectedColHeader] && p_record.data.MetricsType != "Volume" && p_record.data.MetricsType != "Business" && p_record.data.MetricsType != "PG" && m_arrMonths.indexOf(l_currSelectedColHeader) > -1) {
				//check for child or parent
				if (p_record.data.parentId !== "root" && (isAdminRole() || (m_arrMonths.indexOf(p_record.data.EditableFrom) !== -1 && m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(p_record.data.EditableFrom)))) {
					blnShowContextMenu = true;
				}
				if (p_record.data.children !== undefined && p_record.data.children !== null) {
					if (isAdminRole() || ((m_arrMonths.indexOf(p_record.data.children[0].EditableFrom) !== -1) && m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(p_record.data.children[0].EditableFrom))) {
						blnShowContextMenu = true;
					} else {
						blnShowContextMenu = false;
					}
				}

			}
			m_selectedMonth = m_arrMonths.indexOf(l_currSelectedColHeader) + 1;
			if (blnShowContextMenu) {
				/********select Cell********/
				var l_selctedColumn;
				var l_gridColumns = p_view.getColumnManager().getColumns();
				for (var l_colIdx in l_gridColumns) {
					if (l_gridColumns[l_colIdx].dataIndex == l_currSelectedColHeader) {
						l_selctedColumn = l_gridColumns[l_colIdx];
						break;
					}
				}
				//var l_obj_GirdCell = p_view.getCell(p_record, l_selctedColumn);
				var l_obj_GirdCell = VistaarExtjs.getCmp(p_view.id).getView().getCell(p_record, l_selctedColumn);

				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
					l_obj_GirdCell.addCls('clsSelectedCell');
				}
				m_prev_Cell_Selected_ID = l_obj_GirdCell.id;
				/********select Cell********/
				if (p_record.data.parentId !== "root") {
					m_channel = p_channel;
					m_selectedRecord = p_view.getStore().getNodeById(p_record.data.parentId);
				} else {
					m_selectedRecord = p_record;
					m_channel = p_channel;
				}
				this.itmesToShowInContextMenu(m_selectedRecord, m_selectedMonth);
				/* Mobility*/
				//m_contextMenu.showAt([p_tableCell.getBoundingClientRect().left - 25, p_tableCell.getBoundingClientRect().top - 80]);
				//m_contextMenu.focus();
				//p_view.view.scrollBy(10);
				//p_view.view.scrollBy(-10);
				//Destroy Price Plan PopUps
				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups();
				Ext.defer(function(){
				m_contextMenu.showAt([p_tableCell.getBoundingClientRect().left - 25, p_tableCell.getBoundingClientRect().top - 80]);
				var c = p_view.ownerGrid.columns[p_columnIndex];
				if(c.getEditor())
				{
					//c.getEditor().hide();
					c.getEditor().setHeight(0);
				}
				//m_contextMenu.focus();
				},25,this);

			}
			return false;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	this.showDealMenu = function (p_view, p_tableCell, p_columnIndex, p_record, p_tableRow, p_rowIndex, p_channel) {
		var DealNameIdmapping = {

			"copy" : "action_PricePlan_Copy_Deal",
			"paste" : "action_PricePlan_Paste_Deal"
		}
		var IconsToShowHide = {};
		if (m_copyData == null) {
			IconsToShowHide["copy"] = DealNameIdmapping["copy"]; //"copy" : "action_PricePlan_Copy_Deal",
		} else {
			IconsToShowHide["copy"] = DealNameIdmapping["copy"];
			IconsToShowHide["paste"] = DealNameIdmapping["paste"];
		}

		for (var item in m_dealMenu.items.items) {
			if (Object.getOwnPropertyNames(IconsToShowHide).length > 0)
				for (var IconId in IconsToShowHide) {
					if (m_dealMenu.items.items[item].id == IconsToShowHide[IconId]) {
						m_dealMenu.items.items[item].setDisabled(false);
						break;
					} else {
						m_dealMenu.items.items[item].setDisabled(true);

					}
				}
		}
		//m_dealCopyData
		//var l_PricePlanCopy;
		//var l_PricePlanPaste;

		m_dealMenu.showAt([p_tableCell.getBoundingClientRect().left - 15, p_tableCell.getBoundingClientRect().top - 40]);
		m_dealMenu.focus();
	}

	this.itmesToShowInContextMenu = function (pSelectedRecord, pMonthSelected) {
		try {
			var ContextNameIdmapping = {
				"edit" : "action_PricePlan_Edit_Deal",
				"clone" : "action_PricePlan_Clone_Deal",
				"delete" : "action_PricePlan_Delete_Deal",
				"openPS" : "action_PricePlan_Open_PS_View"
			}
			var IconsToShowHide = {};

			if ((pSelectedRecord.data["Deleted Deal"] && pSelectedRecord.data["Deleted Time"] != "") || m_blnIsFrontlinePP) {
				if ((pMonthSelected >= (m_arrMonths.indexOf(pSelectedRecord.data["Deleted Time"]) + 1)) || m_blnIsFrontlinePP) {
					IconsToShowHide["delete"] = ContextNameIdmapping["delete"];
					IconsToShowHide["clone"] = ContextNameIdmapping["clone"];
					IconsToShowHide["openPS"] = ContextNameIdmapping["openPS"];
					if (getPricePlanControllerManagerObj().readOnlyPricePlan) {
						IconsToShowHide["edit"] = ContextNameIdmapping["edit"];
					}
				}
			}

			for (var item in m_contextMenu.items.items) {
				if (Object.getOwnPropertyNames(IconsToShowHide).length > 0) {
					for (var IconId in IconsToShowHide) {
						if (m_contextMenu.items.items[item].id == IconsToShowHide[IconId]) {
							m_contextMenu.items.items[item].setDisabled(true);
							break;
						} else {
							if (m_contextMenu.items.items[item].id == 'action_PricePlan_Delete_Deal') {
								if (!m_Bln_CloneDeal_ACL) {
									m_contextMenu.items.items[item].setDisabled(false);
								}
							} else if (m_contextMenu.items.items[item].id == 'action_PricePlan_Clone_Deal') {
								if (!m_Bln_DeleteDeal_ACL) {
									m_contextMenu.items.items[item].setDisabled(false);
								}
							} else if (m_contextMenu.items.items[item].id == 'action_PricePlan_Open_PS_View') {
								if (!m_Bln_OpenPS_ACL) {
									m_contextMenu.items.items[item].setDisabled(false);
								}
							}

						}
					}
				} else {
					if (m_contextMenu.items.items[item].id == 'action_PricePlan_Delete_Deal') {
						if (!m_Bln_CloneDeal_ACL) {
							m_contextMenu.items.items[item].setDisabled(false);
						}
					} else if (m_contextMenu.items.items[item].id == 'action_PricePlan_Clone_Deal') {
						if (!m_Bln_DeleteDeal_ACL) {
							m_contextMenu.items.items[item].setDisabled(false);
						}
					} else if (m_contextMenu.items.items[item].id == 'action_PricePlan_Open_PS_View') {
						if (!m_Bln_OpenPS_ACL) {
							m_contextMenu.items.items[item].setDisabled(false);
						}
					}
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.createDealMenu = function () { // creation of deal menu *SAGAR*
		try {

			var l_PricePlanCopy;
			var l_PricePlanPaste;

			l_PricePlanCopy = Ext.create('Ext.Action', {
					disabled : false,
					cls : 'copy-dealContext-menu',
					//iconCls : 'icon-copy-deal-menu',
					icon : 'null',
					id : 'action_PricePlan_Copy_Deal',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onCopyDealClick(m_selectedRecord, m_channel)
					}

				});

			l_PricePlanPaste = Ext.create('Ext.Action', {
					disabled : false,
					cls : 'paste-dealContext-menu',
					//iconCls : 'icon-paste-deal-menu',
					icon : 'null',
					id : 'action_PricePlan_Paste_Deal',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onPasteDealClick(m_selectedRecord, m_channel)
					}

				});

			m_dealMenu = Ext.create('Ext.menu.Menu', {
					showSeparator : false,
					cls : 'clsContextMenu',
					id : 'menu_PricePlan_Deal',
					items : [

						l_PricePlanCopy,
						l_PricePlanPaste

					],
					//Added to hide deal menu
					listeners : {
						blur : function (dealMenu) {
							dealMenu.hide();
						}
					}
				});
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onCopyDealClick = function (p_record, pchannel) {
		try {
			m_copyData = {
				"DealID" : p_record.data.DealID,
				"Channel" : pchannel,
				"Months" : {
					"Jan" : p_record.data.Jan,
					"Feb" : p_record.data.Feb,
					"Mar" : p_record.data.Mar,
					"Apr" : p_record.data.Apr,
					"May" : p_record.data.May,
					"Jun" : p_record.data.Jun,
					"Jul" : p_record.data.Jul,
					"Aug" : p_record.data.Aug,
					"Sep" : p_record.data.Sep,
					"Oct" : p_record.data.Oct,
					"Nov" : p_record.data.Nov,
					"Dec" : p_record.data.Dec
				}

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onPasteDealClick = function (p_record, pchannel) {
		try {
			var l_objEditedKeyValue = {};
			var isPasteOperationPerformed = false;
			for (var monthKey in m_copyData.Months) {
				if (getCommonFuncMgr().m_PP_PG_Effectivity[monthKey] && p_record.get(monthKey) !== m_copyData.Months[monthKey]) {
					if ((getCommonFuncMgr().m_PP_EditableFrom != "") && (m_arrMonths.indexOf(monthKey) >= m_arrMonths.indexOf(getCommonFuncMgr().m_PP_EditableFrom))) {
						if (p_record.data["Deleted Time"] != "" && m_arrMonths.indexOf(monthKey) < m_arrMonths.indexOf(p_record.data["Deleted Time"])) {
							p_record.set(monthKey, m_copyData.Months[monthKey]);
							l_objEditedKeyValue[monthKey] = m_copyData.Months[monthKey];
							isPasteOperationPerformed = true;
						} else if (p_record.data["Deleted Time"] == "") {
							p_record.set(monthKey, m_copyData.Months[monthKey]);
							l_objEditedKeyValue[monthKey] = m_copyData.Months[monthKey];
							isPasteOperationPerformed = true;
						}
					}

				}
			}
			if (isPasteOperationPerformed) {
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(l_objEditedKeyValue, pchannel, p_record.data.DealID);
				if (pchannel == "ON") {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
				} else {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.createContextMenu = function () {
		try {
			var l_PricePlanEdit;
			var l_PricePlanDelete;
			var l_PricePlanDealClone;
			var l_PricePlanOpenPSView;

			l_PricePlanEdit = Ext.create('Ext.Action', {

					disabled : false,
					cls : 'edit-context-menu',
					//iconCls : 'icon-edit-context-menu',
					icon : 'null',
					id : 'action_PricePlan_Edit_Deal',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onEditContextClick(m_selectedRecord, m_selectedMonth, m_channel);
					}
				});
			l_PricePlanOpenPSView = Ext.create('Ext.Action', {

					disabled : false,
					cls : 'open-ps-context-menu',
					icon : 'null',
					//iconCls : 'icon-Open-PS-View-context-menu',
					id : 'action_PricePlan_Open_PS_View',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onOpenPSViewContextClick(m_selectedRecord, m_selectedMonth, m_channel);
					}
				});
			l_PricePlanDelete = Ext.create('Ext.Action', {
					disabled : false,
					cls : 'delete-context-menu',
					//iconCls : 'icon-delete-context-menu',
					icon : 'null',
					id : 'action_PricePlan_Delete_Deal',
					handler : function (widget, event) {

						getPricePlanControllerManagerObj().getPricePlanUIManager().onDeleteContextClick(m_selectedRecord, m_selectedMonth);

					}
				});

			l_PricePlanDealClone = Ext.create('Ext.Action', {

					disabled : false,
					cls : 'clone-context-menu',
					//iconCls : 'icon-clone-context-menu',
					icon : 'null',
					id : 'action_PricePlan_Clone_Deal',
					handler : function (widget, event) {

						getPricePlanControllerManagerObj().getPricePlanUIManager().onCloneContextClick(m_selectedRecord, m_selectedMonth, m_channel);

					}
				});

			m_contextMenu = Ext.create('Ext.menu.Menu', {
					showSeparator : false,
					cls : 'clsContextMenu',
					id : 'menu_PricePlan_Context',
					items : [
						l_PricePlanOpenPSView,
						l_PricePlanEdit,
						l_PricePlanDealClone,
						l_PricePlanDelete

					],
					//Added to hide context menu
					listeners : {
						blur : function (contextMenu) {
							contextMenu.hide();
						}
					}
				});
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onEditContextClick = function (pRecord, pselectedMonth, pchannel) {
		try {

			var l_config = {
				"RecordSelected" : m_selectedRecord,
				"MonthSelected" : m_selectedMonth,
				"Channel" : pchannel
			}
			fn_DealOperation(l_config, "editContextClick");

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.onOpenPSViewContextClick = function (pRecord, pselectedMonth, pchannel) {
		try {
			/*Hide Price Plan Button Window on IPAD*/
			var l_config = {
				"RecordSelected" : m_selectedRecord,
				"MonthSelected" : m_selectedMonth,
				"Channel" : pchannel
			}
			fn_DealOperation(l_config, "openPSViewContextClick");

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.getTimeMemberCode = function (pselectedMonth) {
		try {
			var l_planningYear = Ext.getCmp(m_CmbWorkFlowId).getValue().year
				if (pselectedMonth < 10) {
					return l_planningYear.concat("0", pselectedMonth, "01");
				} else {
					return l_planningYear.concat(pselectedMonth, "01");
				}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onDeleteContextClick = function (pSelectedRecord, pselectedMonth) {

		try {

			Ext.MessageBox.confirm(m_MESSAGES["Delete Deal"]["Title"], m_MESSAGES["Delete Deal"]["Message"], getPricePlanControllerManagerObj().getPricePlanUIManager().DeletePricePlanConfirmatonCallback);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.DeletePricePlanConfirmatonCallback = function (p_btn) {
		try {
			if (p_btn == "yes") { {
					getPricePlanControllerManagerObj().setPricePlanViewWaitCursor("viewContainer", "Deleting Deal...");
					Ext.defer(function () {
						var l_config = {
							"RecordSelected" : m_selectedRecord,
							"MonthSelected" : m_selectedMonth
						};
						fn_DealOperation(l_config, "deleteContextClick");
					}, 500);
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onCloneContextClick = function (pRecord, pselectedMonth, pchannel) {
		try {

			var l_config = {
				"DealSelected" : pRecord,
				"MonthSelected" : pselectedMonth,
				"Channel" : pchannel
			}
			fn_DealOperation(l_config, "cloneContextClick");

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.handleAfterRenderEvent = function () {
		try {
			if (m_contextMenu === undefined)
				this.createContextMenu();
			if (m_dealMenu === undefined)
				this.createDealMenu();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.hideSummaryCurrentGridRows = function (record, rowIndex, rowParams, store) {
		try {

			if (record.data.Metrics.indexOf("RAB") != -1) {
				return 'clshideRow';
			}
			if (record.data.YearType != undefined) {
				for (var rowType in m_arrSummaryGridCurrentRowHide) {
					if (record.data.YearType == m_arrSummaryGridCurrentRowHide[rowType]) {
						return 'clshideRow';
					}
				}
			}
			if (record.data.Metrics != undefined) {
				for (var rowType in m_arrSummaryGridCurrentRowHide) {
					if (record.data.Metrics == m_arrSummaryGridCurrentRowHide[rowType]) {
						return 'clshideRow';
					}
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.hideSummaryProposedGridRows = function (record, rowIndex, rowParams, store) {
		try {

			var objFixedHiddenRow = getCommonFuncMgr().objSummaryGrdFixedHiddenField;
			if (this.checkRowHideCondition(objFixedHiddenRow.dataIndex, objFixedHiddenRow.rowsToHide, record)) {
				return 'clshideRow';
			}
			var objHiddenRow = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo;
			for (var rows in objHiddenRow) {
				if (objHiddenRow[rows].hidden) {
					if (this.checkRowHideCondition(objHiddenRow[rows].dataIndex, objHiddenRow[rows].rowsToHide, record)) {
						return 'clshideRow';
					}
				}
			}
			/*if (!m_btnSummaryCurrentPressed) {
			if (record.data.Type.indexOf("Current") != -1) {
			return 'clshideRow';
			}
			}
			if (record.data.Metrics.indexOf("RAB") != -1) {
			return 'clshideRow';
			}
			if (record.data.YearType != undefined) {
			for (var channel in m_arrSummaryGridProposedRowHide) {
			for (var rowType in m_arrSummaryGridProposedRowHide[channel]) {
			if (record.data.Type.indexOf(channel) != -1  && record.data.YearType == m_arrSummaryGridProposedRowHide[channel][rowType]) {
			return 'clshideRow';
			}
			}
			}
			}
			if (record.data.Metrics != undefined) {
			for (var channel in m_arrSummaryGridProposedRowHide) {
			for (var rowType in m_arrSummaryGridProposedRowHide[channel]) {
			if (record.data.Type.indexOf(channel) != -1 && record.data.Metrics == m_arrSummaryGridProposedRowHide[channel][rowType]) {
			return 'clshideRow';
			}
			}
			}
			}*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.checkRowHideCondition = function (p_arrDataIndex, p_arrRowsToHide, p_record) {
		try {
			//if (p_record.data[p_arrDataIndex[dataIndex]] == p_arrRowsToHide[dataIndex][rows])
			var flag;
			for (var dataIndex in p_arrDataIndex) {
				flag = true;
				if (p_record.data.hasOwnProperty(p_arrDataIndex[dataIndex])) {
					for (var rows in p_arrRowsToHide[dataIndex]) {
						if (p_record.data[p_arrDataIndex[dataIndex]] == p_arrRowsToHide[dataIndex][rows]) {
							flag = !flag;
						}
					}
				}
				if (flag) {
					return false
				}
			}
			return true;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.onbtnSummaryToggle_click = function (button, e, eOpts) {
		try {

			//var tabOffPremise = VistaarExtjs.getCmp("tabPnlSummary");

			/*if (button.pressed) {
			m_btnSummaryCurrentPressed = true;

			} else {
			m_btnSummaryCurrentPressed = false;

			}*/
			var obj_CurrentRow_config = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo.Current;
			obj_CurrentRow_config.hidden = !obj_CurrentRow_config.hidden;
			VistaarExtjs.getCmp("grdSummaryProposed").DGObj.getView().refresh();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onOffPremiseToggle_Click = function (button, e, eOpts) {
		try {
			//alert(button.pressed);
			var tabOffPremise = VistaarExtjs.getCmp("tabPnlOffPremise");
			var tabOffPremisePG = VistaarExtjs.getCmp("tabFGOffPremise");
			var objTG_OffPremisesCurrent = Ext.getCmp(m_IdTGOffPremisesCurrent).TGObj;
			var objTG_OffPremisesProposed = Ext.getCmp(m_IdTGOffPremisesProposed).TGObj;
			var objDG_PG_OffPremisesProposed = Ext.getCmp(m_DG_PG_OFFPREMISESPROPOSED);
			var objDG_PG_OffPremisesCurrent = Ext.getCmp(m_DG_PG_OFFPREMISESCURRENT);

				if (button.pressed) {
					tabOffPremise.setActiveTab(1);
					tabOffPremisePG.setActiveTab(1);

				if (!m_bln_OFF_CurrentSorted) {

				Ext.defer(function () {
				var objTGStore_OffPremisesCurrentStore = objTG_OffPremisesCurrent.getStore();
				var l_sortOrder = getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().m_UserPrefrence.sort == "Ascending" ? "AESC" : "DESC";
				objTGStore_OffPremisesCurrentStore.sort("NetList", l_sortOrder);
				getPricePlanControllerManagerObj().setDealCountInGirdHeader();
				}, 1);
				m_bln_OFF_CurrentSorted = true;
					getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnTotalClickCallBack(m_blnIsTotalsColumnsExpanded);
				}
				objTG_OffPremisesCurrent.view.refresh();
				objTG_OffPremisesCurrent.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();

				//Sync Scroll of Promo Goods grid ... PG Enhancement m_DGSUMMARYPROPOSED
				if (!getCommonFuncMgr().isNonDeskTopView() && objDG_PG_OffPremisesCurrent && objDG_PG_OffPremisesCurrent.DGObj.isVisible()) {
					objDG_PG_OffPremisesCurrent.DGObj.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();
				}

			} else {
				tabOffPremise.setActiveTab(0);
				tabOffPremisePG.setActiveTab(0);
				objTG_OffPremisesProposed.view.refresh();
				objTG_OffPremisesProposed.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();
				//Sync Scroll of Promo Goods grid ... PG Enhancement
				if (!getCommonFuncMgr().isNonDeskTopView() && objDG_PG_OffPremisesProposed && objDG_PG_OffPremisesProposed.DGObj.isVisible()) {
					objDG_PG_OffPremisesProposed.DGObj.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).view.getEl().getScrollLeft();
				}
			}
			//getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().getPricePlanGridManager().refreshAllPricePlanGridsView();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onOnPremiseToggle_Click = function (button, e, eOpts) {
		try {
			//alert(button.pressed);

			var tabOnPremise = VistaarExtjs.getCmp("tabPnlOnPremise");
			var tabOnPremisePG = VistaarExtjs.getCmp("tabFGOnPremise");
			var objTG_OnPremisesProposed = Ext.getCmp(m_IdTGOnPremisesProposed).TGObj;
			var objTG_OnPremisesCurrent = Ext.getCmp(m_IdTGOnPremisesCurrent).TGObj;
			var objDG_PG_OnPremisesProposed = Ext.getCmp(m_DG_PG_ONPREMISESPROPOSED);
			var objDG_PG_OnPremisesCurrent = Ext.getCmp(m_DG_PG_ONPREMISESCURRENT);
			if (button.pressed) {
				tabOnPremise.setActiveTab(1);
				tabOnPremisePG.setActiveTab(1);
				if (!m_bln_ON_CurrentSorted) {
				var l_GridContainer = Ext.getCmp('cntPricePlanGridView');
				l_GridContainer.scrollTo(button.getX(), 0, false);
				l_GridContainer.scrollTo(button.getX(), button.getY() - l_GridContainer.getY() - 100, false);
				Ext.defer(function () {
				var objTGStore_OnPremisesCurrentStore = objTG_OnPremisesCurrent.getStore();
				var l_sortOrder = getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().m_UserPrefrence.sort == "Ascending" ? "AESC" : "DESC";
				objTGStore_OnPremisesCurrentStore.sort("NetList", l_sortOrder);
				getPricePlanControllerManagerObj().setDealCountInGirdHeader();
				}, 1);
				m_bln_ON_CurrentSorted = true;
					getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnTotalClickCallBack(m_blnIsTotalsColumnsExpanded);
				}
				objTG_OnPremisesCurrent.view.refresh();
				objTG_OnPremisesCurrent.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();

				/*	var objTGStore_OnPremisesProposed = Ext.getCmp(m_IdTGOnPremisesProposed).TGObj.getStore();
				Ext.defer(function () {
				var objTGStore_OnPremisesCurrent = Ext.getCmp("TG_OnPremisesCurrent").TGObj.getStore();
				objTGStore_OnPremisesCurrent.sort(objTGStore_OnPremisesProposed.sorters.items[0].config.property, objTGStore_OnPremisesProposed.sorters.items[0].config.direction);
				}, 10);*/

				/*getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
				this.callGridSort();
				}, 1, this);*/

				//Sync Scroll of Promo Goods grid ... PG Enhancement
				if (!getCommonFuncMgr().isNonDeskTopView() && objDG_PG_OnPremisesCurrent && objDG_PG_OnPremisesCurrent.DGObj.isVisible()) {
					objDG_PG_OnPremisesCurrent.DGObj.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();
				}
			} else {
				tabOnPremise.setActiveTab(0);
				tabOnPremisePG.setActiveTab(0);
				objTG_OnPremisesProposed.view.refresh();
				objTG_OnPremisesProposed.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();
				//Sync Scroll of Promo Goods grid ... PG Enhancement
				if (!getCommonFuncMgr().isNonDeskTopView() && objDG_PG_OnPremisesProposed && objDG_PG_OnPremisesProposed.DGObj.isVisible()) {
					objDG_PG_OnPremisesProposed.DGObj.view.getEl().dom.scrollLeft = VistaarExtjs.getCmp(m_IdDGSummaryProposed).DGObj.view.getEl().getScrollLeft();
				}
			}
			//getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().getPricePlanGridManager().refreshAllPricePlanGridsView();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onbtnImpact = function (button, e, eOpts) {
		try {

			getObjectFactory().getImpactAnalysisManager().btnImpactAnalyisis_Click();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ImpactAnalysisOpenClick = function (l_field) {
		try {

			var l_PricePlanData = getPricePlanControllerManagerObj().getPricePlanData(this.getPricePlanScopeManager().getScopeDataKey());
			getObjectFactory().getImpactAnalysisManager().btnImpactAnalyisis_Click(l_PricePlanData);
			return false;

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.OnbtnSaveClick = function () {
		try {
			alert("Hello");
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.getUserPrefrence = function () {
		try {

			if (m_PricePlanPreferenceObject == undefined) {
				//getPrefrence from backend
				this.m_UserPrefrence = Vistaar.frameworkUtil.VistaarAjax.callAjax("data/PricePlan/PricePlanPrefrence.json", "", false);
				return this.m_UserPrefrence;
			} else {
				return this.m_UserPrefrence;

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.updatePricePlanPrefrenceForm = function () {
		try {

			var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence").getForm();
			if (JSON.stringify(this.m_UserPrefrence) != JSON.stringify(obj_PricePlanPrefrenceForm.getFieldValues())) {
				//send preference call to backend
				this.m_UserPrefrence = obj_PricePlanPrefrenceForm.getFieldValues();
				if (this.m_UserPrefrence.hasOwnProperty("RAB") || this.m_UserPrefrence.hasOwnProperty("RAB_Less_Bkg")) {
					m_hideRAB = false;
				}
				obj_PricePlanPrefrenceForm.setValues(this.m_UserPrefrence);
			} else {
				obj_PricePlanPrefrenceForm.setValues(this.m_UserPrefrence);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.SetPricePlanPrefrenceGrid = function (record, rowIndex, rowParams, store) {
		try {

			if ((record.data.MetricsType == "PG") && (m_blnIsFrontlinePP || VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled())) {
				return 'clshideRow';
			}

			if (record.data.FactCode != undefined) {
				if (m_hideRAB && (record.data.FactCode == "RAB" || record.data.FactCode == "RAB_Less_Bkg")) {
					return 'clshideRow';
				}

				for (var prefrence in this.m_UserPrefrence) {
					if (this.m_UserPrefrence[prefrence] == false) {
						if (record.data.FactCode.toLowerCase() == prefrence.toLowerCase()) {
							return 'clshideRow';
						}
					}
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Purpose:listen check box selection
	this.onPricePlanPrefrenceCheckboxSelect = function (field, newValue, oldValue, eOpts) {
		try {
			//suspends Check box "ALL" events
			var objChkAllPricePlanPrefrence = Ext.getCmp("chkPricePlanPrefrenceAll");
			objChkAllPricePlanPrefrence.suspendEvents(false);

			var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence");
			var obj_form = obj_PricePlanPrefrenceForm.getForm();
			var l_fields = obj_form.getFieldValues();
			if (field.getChecked().length == m_factsLength) {
				l_fields['All'] = 'true';
				getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence["All"]=true;
				obj_form.setValues(l_fields);

			} else {
				l_fields['All'] = 'false';
				getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence["All"]=false;
				obj_form.setValues(l_fields);
			}

			//Resume Check box "ALL" events
			objChkAllPricePlanPrefrence.resumeEvents();
			//this.refreshAllPricePlanGridsView();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Purpose:listen check box "ALL" selection
	this.onPricePlanPrefrenceonCheckboxAllSelect = function (field, newValue, oldValue, eOpts) {
		try {
			var objChkGrpPricePlanPrefrence = Ext.getCmp("chkGrpPricePlanPrefrence");
			objChkGrpPricePlanPrefrence.suspendEvents(false);

			if (newValue == true) {
				var arrcheckBoxes = Ext.getCmp('chkGrpPricePlanPrefrence').query('[isCheckbox]');
				for (var checkbox in arrcheckBoxes) {
					arrcheckBoxes[checkbox].setValue(true);
				}
			} else if (newValue == false) {
				var arrcheckBoxes = Ext.getCmp('chkGrpPricePlanPrefrence').query('[isCheckbox]');
				for (var checkbox in arrcheckBoxes) {
					arrcheckBoxes[checkbox].setValue(false);
				}
			}

			objChkGrpPricePlanPrefrence.resumeEvents();
			//this.refreshAllPricePlanGridsView();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onradioPricePlanPrefrenceChange = function (field, newValue, oldValue, eOpts) {
		try {

			//this.sortGrid();
			//this.sortGrid(newValue.sort);
			//this.updatePricePlanPrefrenceForm();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.btnResetOffPremise = function (button, e, eOpts) {
		try {

			var OffProObj = Ext.getCmp(m_IdTGOffPremisesProposed);
			var Store_OffPro = OffProObj.TGObj.getStore();
			var l_records = Store_OffPro.getRange();
			var l_blnDirty = true;
			/*for (var i = 0; i < l_records.length; i++) {
			var rec = l_records[i];

			if (rec.dirty == true) {
			l_blnDirty = true;
			break;
			//Save data

			}
			}
			 */
			if (l_blnDirty) {
				Ext.MessageBox.confirm(m_MESSAGES["ResetOffPremisesPropposed"]["Title"], m_MESSAGES["ResetOffPremisesPropposed"]["Message"], getPricePlanControllerManagerObj().getPricePlanUIManager().ResetOffPremisesPropposedConfirmCallback);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ResetOffPremisesPropposedConfirmCallback = function (p_btn) {
		try {
			if (p_btn == "yes") {
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				var ChannelType = "OFF";
				var tabOffPremise = VistaarExtjs.getCmp("tabPnlOffPremise");

				//RESET OFF PREMISE PRICE PLAN DATA..................................
				var gridData = getPricePlanControllerManagerObj().resetPricePlanData(ChannelType);
				//As reload TG API doesn't working properly. So destroying and recreating the tree-grid....

				//Reset Proposed Price Plan Grid...................
				VistaarTG.destroyTreeGrid(m_IdTGOffPremisesProposed);
				var l_offPremise_ProposedGrdConfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigProposed();

				tabOffPremise.setActiveTab(0);
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOffPremiseProGridObject = VistaarTG.createTreeGrid(l_offPremise_ProposedGrdConfig, gridData[ChannelType].Proposed);

				//Reset Current Price Plan Grid.............................
				VistaarTG.destroyTreeGrid(m_IdTGOffPremisesCurrent);
				var l_offpremise_CurrentGrdConfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigCurrent();

				tabOffPremise.setActiveTab(1);
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOffPremiseCurGridObject = VistaarTG.createTreeGrid(l_offpremise_CurrentGrdConfig, gridData[ChannelType].Current);

				//setDealCountInGirdHeader
				getPricePlanControllerManagerObj().setDealCountInGirdHeader();
				/*VistaarTG.setDataOfTreeGrid(m_IdTGOffPremisesProposed, gridData[ChannelType].Proposed.children);*/
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
					VistaarDG.reloadDGWithData("DG_PGOffPremisesProposed", gridData.PG_OFF.Proposed);
					VistaarDG.reloadDGWithData("DG_PG_Qual_OffPreProposed", gridData.PG_OFF.Qualifier_Proposed);
				}

				//restore back grid column to users previous expanded/collapse state
				getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnClick(m_blnIsColumnsExpanded);

				//restore back total grid column to users previous expanded/collapse state
				getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnTotalClick(m_blnIsTotalsColumnsExpanded);

				Ext.defer(function () {
					getPricePlanControllerManagerObj().getPricePlanUIManager().swapCurrentProposed("OFF");
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
					/***Back-end PG related changes****/

					if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChangesONLoad();
					}
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
					getPricePlanControllerManagerObj().getPricePlanUIManager().callGridSort();
				}, 50);

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.btnResetOnPremise = function (button, e, eOpts) {
		try {

			var OnProObj = Ext.getCmp(m_IdTGOnPremisesProposed);
			var Store_OnPro = OnProObj.TGObj.getStore();

			var l_records = Store_OnPro.getRange();
			var l_blnDirty = true;
			/*for (var i = 0; i < l_records.length; i++) {
			var rec = l_records[i];

			if (rec.dirty == true) {
			l_blnDirty = true;
			break;
			//Save data

			}
			}*/

			if (l_blnDirty) {
				Ext.MessageBox.confirm(m_MESSAGES["ResetOnPremisesPropposed"]["Title"], m_MESSAGES["ResetOnPremisesPropposed"]["Message"], getPricePlanControllerManagerObj().getPricePlanUIManager().ResetOnPremisesPropposedConfirmCallback);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ResetOnPremisesPropposedConfirmCallback = function (p_btn) {
		try {
			if (p_btn == "yes") {

				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				var tabOnPremise = VistaarExtjs.getCmp("tabPnlOnPremise");
				var ChannelType = "ON";

				//RESET ON PREMISE PRICE PLAN DATA..................................
				var gridData = getPricePlanControllerManagerObj().resetPricePlanData(ChannelType);
				//As reload TG API doesn't working properly. So destroying and recreating the tree-grid....
				VistaarTG.destroyTreeGrid(m_IdTGOnPremisesProposed);
				var l_onpremise_ProposedGrdConfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigProposed();

				tabOnPremise.setActiveTab(0);

				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOnPremiseProGridObject = VistaarTG.createTreeGrid(l_onpremise_ProposedGrdConfig, gridData[ChannelType].Proposed);

				//Reset Current Price Plan Grid.............................
				VistaarTG.destroyTreeGrid(m_IdTGOnPremisesCurrent);
				var l_onpremise_CurrentGrdConfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigCurrent();

				tabOnPremise.setActiveTab(1);

				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOnPremiseCurGridObject = VistaarTG.createTreeGrid(l_onpremise_CurrentGrdConfig, gridData[ChannelType].Current);

				//setDealCountInGirdHeader
				getPricePlanControllerManagerObj().setDealCountInGirdHeader();

				//VistaarTG.setDataOfTreeGrid(m_IdTGOnPremisesProposed, gridData[ChannelType].Proposed.children);
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
					VistaarDG.reloadDGWithData("DG_PGOnPremisesProposed", gridData.PG_ON.Proposed);
					VistaarDG.reloadDGWithData("DG_PG_Qual_OnPreProposed", gridData.PG_ON.Qualifier_Proposed);
				}

				//restore back grid column to users previous expanded/collapse state
				getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnClick(m_blnIsColumnsExpanded);

				//restore back total grid column to users previous expanded/collapse state
				getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnTotalClick(m_blnIsTotalsColumnsExpanded);

				Ext.defer(function () {
					getPricePlanControllerManagerObj().getPricePlanUIManager().swapCurrentProposed("ON");
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
					/***Back-end PG related changes****/

					if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChangesONLoad();
					}
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
					getPricePlanControllerManagerObj().getPricePlanUIManager().callGridSort();

				}, 50);

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//Reset Price Plan for all channels @Recall & Reject flow Related...
	this.resetPricePlanOnRecall = function () {
		try {
			//Activate Price Plan View...
			this.renderPricePlanGridView();
			//RESET ON PREMISE PRICE PLAN DATA..................................
			var gridData = getPricePlanControllerManagerObj().resetPricePlanData();

			//Reset ON Premise Grid
			VistaarTG.destroyTreeGrid(m_IdTGOnPremisesProposed);
			var l_onpremise_ProposedGrdConfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigProposed();
			VistaarExtjs.getCmp("tabPnlOnPremise").setActiveTab(0);
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOnPremiseProGridObject = VistaarTG.createTreeGrid(l_onpremise_ProposedGrdConfig, gridData["ON"].Proposed);

			//Reset OFF Premise Grid
			VistaarTG.destroyTreeGrid(m_IdTGOffPremisesProposed);
			var l_offPremise_ProposedGrdConfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigProposed();
			VistaarExtjs.getCmp("tabPnlOffPremise").setActiveTab(0);
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().m_PricePlanOffPremiseProGridObject = VistaarTG.createTreeGrid(l_offPremise_ProposedGrdConfig, gridData["OFF"].Proposed);

			//setDealCountInGirdHeader
			getPricePlanControllerManagerObj().setDealCountInGirdHeader();

			// Reset Promo-Goods Grids
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
				VistaarDG.reloadDGWithData("DG_PGOnPremisesProposed", gridData.PG_ON.Proposed);
				VistaarDG.reloadDGWithData("DG_PG_Qual_OnPreProposed", gridData.PG_ON.Qualifier_Proposed);
				VistaarDG.reloadDGWithData("DG_PGOffPremisesProposed", gridData.PG_OFF.Proposed);
				VistaarDG.reloadDGWithData("DG_PG_Qual_OffPreProposed", gridData.PG_OFF.Qualifier_Proposed);

			}
			//Reset Summary Grid Data ....
			VistaarDG.reloadDGWithData("grdSummaryProposed", gridData["Price Plan"].Summary);

			//restore back grid column to users previous expanded/collapse state
			getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnClick(m_blnIsColumnsExpanded);
			//restore back total grid column to users previous expanded/collapse state
			getPricePlanControllerManagerObj().getPricePlanUIManager().onGridColumnTotalClick(m_blnIsTotalsColumnsExpanded);
			/** Grid Calculation **/
			Ext.defer(function () {
				getPricePlanControllerManagerObj().getPricePlanUIManager().swapCurrentProposed();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOnPremisesGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateOffPremisesGrid();
				/***Back-end PG related changes****/
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChangesONLoad();
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
				getPricePlanControllerManagerObj().getPricePlanUIManager().callGridSort();
				getPricePlanControllerManagerObj().setPricePlanMainView();
			}, 50);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.setProposedPricePlanActive = function () {
		try {

			if (!m_SummaryGridShowHide) {
				Ext.getCmp("btnPricePlanHideSummary").toggle(false);
				this.onbtnPricePlanHideSummary_click();

			}
			if (!m_OffPremiseShowHide) {
				Ext.getCmp("btnPricePlanOffHide").toggle(false);
				this.onbtnPricePlanOffHide_click();
			}
			if (!m_OnPremiseShowHide) {
				Ext.getCmp("btnPricePlanOnHide").toggle(false);
				this.onbtnPricePlanOnHide_click();
			}

			//VistaarExtjs.getCmp("cntParentFGOffPremise").setHidden(false);
			//VistaarExtjs.getCmp("cntParentFGOnPremise").setHidden(false);
			if (Ext.getCmp("btnOnPremiseToggleValues").pressed) {
				Ext.getCmp("btnOnPremiseToggleValues").toggle();
				/**Active Proposed PG grid.(Not Checked In)**/
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
					VistaarExtjs.getCmp("tabFGOnPremise").setActiveTab(0);
				}
				//VistaarExtjs.getCmp("tabPnlOnPremise").setActiveTab(0);
			}
			if (Ext.getCmp("btnOffPremiseToggleValues").pressed) {
				Ext.getCmp("btnOffPremiseToggleValues").toggle();
				/**Active Proposed PG grid.(Not Checked In)**/
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
					VistaarExtjs.getCmp("tabFGOffPremise").setActiveTab(0);
				}
				//VistaarExtjs.getCmp("tabPnlOffPremise").setActiveTab(0);
			}

			//setExit full screen button hidden
			if (!m_isFullInFullScreenMode) {
				Ext.getCmp("btn_PP_ExitFullScreen").setVisible(false);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.getMonthFormTimeMemberCode = function (p_TimeMemberCode) {
		var l_Month = (p_TimeMemberCode.substring(4, 6) - 1);
		return m_arrMonths[parseInt(l_Month)];

	};

	this.getPricePlanScopeManager = function () {
		if (m_PricePlanScopeManager == undefined) {
			m_PricePlanScopeManager = new PricePlanScopeManager();
		}

		return m_PricePlanScopeManager;
	};
	this.getPricePlanGridManager = function () {
		if (m_PricePlanGridManager == undefined) {
			m_PricePlanGridManager = new PricePlanGridManager();
		}
		return m_PricePlanGridManager;
	};

	this.btnPricePlanAddClick = function (button, e, eOpts) {
		try {

			//Check the Price Plan Channel ...............

			var l_ChannelType;
			var l_timeMemberCode = this.getTimeMemberCode("1");
			if (button.id == "btnPricePlanOffAdd") {
				l_ChannelType = "OFF";
			} else if (button.id == "btnPricePlanOnAdd") {
				l_ChannelType = "ON";
			}

			var l_config = {
				"timeMemberCode" : l_timeMemberCode,
				"Channel" : l_ChannelType

			}
			m_channel = l_ChannelType;
			fn_DealOperation(l_config, "addContextClick");

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onBtnPricePlanExportClick = function (button, e, eOpts) {
		try {
			/*Implementation for Export*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onBtnBestPracticesClick = function (button, e, eOpts) {
		try {
			if (button.pressed) {
				//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				//Ext.defer(function () {
				this.getPriceBestPracticeManager().show(button.getX(), button.getY(), button.getWidth(), button.getHeight());
				//}, 20, getPricePlanControllerManagerObj().getPricePlanUIManager());
			} else {
				//		this.getPriceBestPracticeManager().hide();
			}
		} catch (err) {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			getCommonFuncMgr().printLog(err);
		}

	};

	this.btn_PP_Historical_Click = function (button, e, eOpts) {
		try {
			//getObjectFactory().getImpactAnalysisManager().hideImpactAnalysisCommentsWindow();
			/* if (button.pressed) {
			VistaarExtjs.getCmp("Cnt_TabPnl_ImpactHistory_TaskHistory").setHidden(false);
			VistaarExtjs.getCmp("tabPnlImpact_History").setActiveTab(1);

			getObjectFactory().getImpactHistoricalManager().openHistoricImpactView();
			} else {
			VistaarExtjs.getCmp("Cnt_TabPnl_ImpactHistory_TaskHistory").setHidden(true);

			} */
			if (button.pressed) {
				getObjectFactory().getImpactHistoricalManager().showHistoricImpactReportWindow(button)
				getObjectFactory().getImpactHistoricalManager().loadHistoricImpactReportData();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.menuBestPracticesHide = function (component, eOpts) {

		var btnBestPractices = Ext.getCmp("btnBestPractices");
		btnBestPractices.toggle(false);

	}

	this.menuHistoricImpactHide = function (component, eOpts) {

		var btnBestPractices = Ext.getCmp("btn_PP_Historical");
		btnBestPractices.toggle(false);

	}

	this.toogleBestPracticeButton = function () {

		var btnBestPractice = VistaarFunctionLib.getCompByReference(this.m_PricePlanMain, 'btnBestPractices');

		btnBestPractice.toggle();

	};

	this.getPriceBestPracticeManager = function () {
		if (m_BestPracticeManager == undefined) {
			m_BestPracticeManager = new PricePlanBestPracticesManager();
		}
		return m_BestPracticeManager;
	};

	/**** Purpose : Destroy Price Plan PopUps
	 **** @param : Hide Price Plan Tab Tools window --- IPAD(OPTIONAL)
	 **/
	this.destroyPricePlanPopups = function (p_Opt_bln_hidePricePlanTabTools) {
		try {
			VistaarAuditingManager.audit({
				"name" : "destroyPricePlanPopups started..."
			}, m_IS_AUDIT_REQUIRED, 5031);
			if (this.m_PricePlanMain != undefined) {
				this.getPriceBestPracticeManager().hide();
				this.getPriceBestPracticeManager().hideBestPracticePopup();
				this.getPriceBestPracticeManager().removeCountOnBestButton();
				VistaarExtjs.getCmp("btnBestPractices").setPressed(false);
			}
			VistaarAuditingManager.audit({
				"name" : "destroyPricePlanPopups ended..."
			}, m_IS_AUDIT_REQUIRED, 5031);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.destroyTabTools = function () {
		try {
			if (obj_pricePlanButtonsWindow != undefined) {
				obj_pricePlanButtonsWindow.destroy();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/**** Purpose : API exposed to hide Price Plan Tab Tools window **/
	this.hidePricePlanTabTools = function () {
		try {
			if (obj_pricePlanButtonsWindow != undefined) {
				obj_pricePlanButtonsWindow.hide();
				// var l_obj = Ext.getCmp('btnExpandCollpseToolBar');
				// if (l_obj != undefined) {
				// l_obj.hide();
				// }
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	/**** Purpose : API exposed to show Price Plan Tab Tools window **/
	this.enablePricePlanTabTools = function () {
		try {
			if (obj_pricePlanButtonsWindow != undefined) {
				obj_pricePlanButtonsWindow.show();
				getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
				// var l_obj = Ext.getCmp('btnExpandCollpseToolBar');
				// if (l_obj != undefined) {
				// l_obj.show();
				// }
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.disableORenableIconsOnFLPricePlan = function (blnEnable, strWfStateOrblnClosedPP, pblnHistoricPlan) {
		try {
			//Initialize the closedPP flag ............
			m_bln_IsClosedPricePlan = false;
			m_blnIsFrontlinePP = false;
			VistaarExtjs.getCmp("btn_PP_TaskHistory").enable();
			VistaarExtjs.getCmp("btn_IA_TaskHistory").enable();
			/*strWfStateOrClosedPP parameter is optional. Only for published plan to disable Submit button or for Previous year Plan to disable all Operation */
			if (blnEnable) {

				VistaarExtjs.getCmp("btnPricePlanOffAdd").enable();
				VistaarExtjs.getCmp("btnPricePlanOnAdd").enable();
				VistaarExtjs.getCmp("btnPricePlanDelete").enable();
				if (m_contextMenu != undefined) {
					VistaarExtjs.getCmp("action_PricePlan_Clone_Deal").enable();
					VistaarExtjs.getCmp("action_PricePlan_Delete_Deal").enable();
					VistaarExtjs.getCmp("action_PricePlan_Open_PS_View").enable(); //25-11-15
				}
				/**PG Enhancement**/
				if (m_PG_contextMenu != undefined) {
					VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").enable();
				}
				getObjectFactory().getUIACLManager().applyACL(getGlobalConstantsObj().PRICEPLAN);
				//APPLY ACL FOR PENDING APPROVAL AND APPROVED STATE............
				if (strWfStateOrblnClosedPP != "WIP" && strWfStateOrblnClosedPP != "Published") {
					VistaarExtjs.getCmp("btnSavePricePlan").disable();
					VistaarExtjs.getCmp("btnPricePlanDelete").disable();
					if (m_contextMenu != undefined) {
						VistaarExtjs.getCmp("action_PricePlan_Clone_Deal").disable();
						VistaarExtjs.getCmp("action_PricePlan_Delete_Deal").disable();
					}
					if (m_PG_contextMenu != undefined) {
						VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").disable();
					}
					VistaarExtjs.getCmp("btnPricePlanOffAdd").disable();
					VistaarExtjs.getCmp("btnPricePlanOnAdd").disable();
				}
				//Disabled for Published Workflow state
				if (strWfStateOrblnClosedPP == "Published") {
					VistaarExtjs.getCmp("btnSubmit").disable();
				}
				if (m_contextMenu != undefined) {
					m_Bln_DeleteDeal_ACL = VistaarExtjs.getCmp("action_PricePlan_Delete_Deal").isDisabled();
					m_Bln_CloneDeal_ACL = VistaarExtjs.getCmp("action_PricePlan_Clone_Deal").isDisabled();
					m_Bln_OpenPS_ACL = VistaarExtjs.getCmp("action_PricePlan_Open_PS_View").isDisabled();
				}
				if (m_PG_contextMenu != undefined) {
					m_Bln_DeletePG_ACL = VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").isDisabled();
				}

				//disable impact analysis button..................
				//VistaarExtjs.getCmp("btnImpactAnalysisOpen").disable();
				//VistaarExtjs.getCmp("btnFobCalculator").disable();
			} else if (!blnEnable) {
				getObjectFactory().getUIACLManager().applyACL(getGlobalConstantsObj().PRICEPLAN);
				VistaarExtjs.getCmp("btnPricePlanOffAdd").disable();
				VistaarExtjs.getCmp("btnPricePlanOnAdd").disable();
				if (m_contextMenu != undefined) {
					VistaarExtjs.getCmp("action_PricePlan_Clone_Deal").disable();
					VistaarExtjs.getCmp("action_PricePlan_Delete_Deal").disable();
				}
				if (m_PG_contextMenu != undefined) {
					VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").disable();
				}
				VistaarExtjs.getCmp("btnSubmit").disable();
				VistaarExtjs.getCmp("btnPricePlanDelete").disable();
				//disable impact analysis button...............
				//VistaarExtjs.getCmp("btnImpactAnalysisOpen").disable();
				if (strWfStateOrblnClosedPP) {
					//disable save button....................
					VistaarExtjs.getCmp("btnSavePricePlan").disable();
					m_bln_IsClosedPricePlan = true;
					//Disable Workflow button for previous year plan....
					VistaarExtjs.getCmp("btn_PP_Approve_OR_Publish_WorkFlow").disable();
					VistaarExtjs.getCmp("btn_PP_Reject_WorkFlow").disable();
				} else {
					m_blnIsFrontlinePP = true;
					VistaarExtjs.getCmp("btn_PP_TaskHistory").disable();
					VistaarExtjs.getCmp("btn_IA_TaskHistory").disable();
				}
				if (m_contextMenu != undefined) {
					m_Bln_DeleteDeal_ACL = VistaarExtjs.getCmp("action_PricePlan_Delete_Deal").isDisabled();
					m_Bln_CloneDeal_ACL = VistaarExtjs.getCmp("action_PricePlan_Clone_Deal").isDisabled();
					m_Bln_OpenPS_ACL = VistaarExtjs.getCmp("action_PricePlan_Open_PS_View").isDisabled();
				}
				if (m_PG_contextMenu != undefined) {
					m_Bln_DeletePG_ACL = VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").isDisabled();
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.updateFactsListPrefrenceWindow = function (pFactsList) {
		//this.m_UserPrefrence = Vistaar.frameworkUtil.VistaarAjax.callAjax("data/PricePlan/PricePlanPrefrence.json", "", false);
		var l_objMenuPrefrence = Ext.getCmp("menuPreference");
		if (m_PricePlanPreferenceObject == undefined)
			m_PricePlanPreferenceObject = l_objMenuPrefrence;
		this.fetchUserPreference(pFactsList);
		if (pFactsList != undefined)
			m_factsLength = pFactsList.length;
		var l_configCheckGroup = Ext.getCmp("chkGrpPricePlanPrefrence");
		//remove Previous check box list(facts)
		l_configCheckGroup.removeAll();
		var l_prefrenceWindowconfig = this.getConfigForPreferenceWindow(pFactsList);
		l_configCheckGroup.add(l_prefrenceWindowconfig);
		var obj_PricePlanPrefrenceForm = Ext.getCmp("formPricePlanPrefrence").getForm();
		obj_PricePlanPrefrenceForm.setValues(this.m_UserPrefrence);
		if (Ext.getCmp("radioPricePlanPrefrenceDescending") != undefined) {
			if (Ext.getCmp("radioPricePlanPrefrenceDescending").isMasked())
				Ext.getCmp("radioPricePlanPrefrenceDescending").unmask();
		}
		if (Ext.getCmp("radioPricePlanPrefrenceAscending") != undefined) {
			if (Ext.getCmp("radioPricePlanPrefrenceAscending").isMasked())
				Ext.getCmp("radioPricePlanPrefrenceAscending").unmask();
		}

	}

	this.getConfigForPreferenceWindow = function (pFactsList) {
		var items = [];
		for (var l_facts in pFactsList) {
			var l_object = {};
			l_object["fieldLabel"] = "";
			l_object["boxLabel"] = pFactsList[l_facts]["Name"];
			l_object["name"] = pFactsList[l_facts]["Code"];
			l_object["cls"] = "clsPPCheckBoxes";
			items.push(JSON.parse(JSON.stringify(l_object)));
		}

		return items;
	}

	this.fetchUserPreference = function (pFactsList) {
		var l_preference = {};
		var l_factslist = JSON.parse(JSON.stringify(pFactsList));
		for (var l_facts in l_factslist) {
			if (l_factslist[l_facts]["Code"] == "RAB" || l_factslist[l_facts]["Code"] == "RAB_Less_Bkg" || l_factslist[l_facts]["Code"] == "Scan") {
				l_preference[l_factslist[l_facts]["Code"]] = false;
			} else {
				l_preference[l_factslist[l_facts]["Code"]] = true;
			}

		}
		l_preference["All"] = false;
		l_preference["sort"] = "Descending";

		this.m_UserPrefrence = JSON.parse(JSON.stringify(l_preference));

	}

	this.createDummyDeal = function (pFactList) {
		var l_dummyDeal = getObjectFactory().getConfigurationManager().getDummyDeal().DummyDeal;
		for (var l_fact in pFactList) {
			var l_dummyFact = JSON.parse(JSON.stringify({
						"Sep" : "",
						"Feb" : "",
						"Mar" : "",
						"rowtype" : "$",
						"EditableFrom" : "",
						"Oct" : "",
						"Qualifier" : "",
						"Nov" : "",
						"FactCode" : "",
						"leaf" : true,
						"Aug" : "",
						"Apr" : "",
						"May" : "",
						"Jan" : "",
						"Dec" : "",
						"Jul" : "",
						"Jun" : "",
						"Deleted Time" : ""
					}))

				l_dummyFact["Qualifier"] = pFactList[l_fact]["Name"];
			l_dummyFact["FactCode"] = pFactList[l_fact]["Code"];
			l_dummyDeal.children.push(l_dummyFact)

		}
		return l_dummyDeal;
	}

	this.disableRAB = function () {
		var l_configCheckGroup = VistaarExtjs.getCmp("chkGrpPricePlanPrefrence");
		getObjectFactory().getImpactAnalysisManager().m_hideRAB = true;
		var l_RABFound = false;
		if (l_configCheckGroup !== undefined) {
			for (var l_facts in l_configCheckGroup.items.items) {
				if (l_configCheckGroup.items.items[l_facts]["name"] == "RAB") {
					l_configCheckGroup.items.items[l_facts].disable();
					l_RABFound = true;
					m_hideRAB = true;

				}
				if (l_configCheckGroup.items.items[l_facts]["name"] == "RAB_Less_Bkg") {
					l_configCheckGroup.items.items[l_facts].disable();
					l_RABFound = true;
					m_hideRAB = true;

				}
			}
			if (l_RABFound) {
				Ext.getCmp("chkPricePlanPrefrenceAll").disable();
			}
		}
	}

	this.enableRAB = function () {
		getObjectFactory().getImpactAnalysisManager().m_hideRAB = true;
		var l_configCheckGroup = VistaarExtjs.getCmp("chkGrpPricePlanPrefrence");
		var l_RABFound = false;
		if (l_configCheckGroup !== undefined) {
			for (var l_facts in l_configCheckGroup.items.items) {
				if (l_configCheckGroup.items.items[l_facts]["name"] == "RAB") {
					l_configCheckGroup.items.items[l_facts].enable();
					l_RABFound = true;
					m_hideRAB = false;
				}
				if (l_configCheckGroup.items.items[l_facts]["name"] == "RAB_Less_Bkg") {
					l_configCheckGroup.items.items[l_facts].enable();
					l_RABFound = true;
					m_hideRAB = false;
				}
			}
			if (l_RABFound) {
				Ext.getCmp("chkPricePlanPrefrenceAll").enable();
			}
		}
	}
	this.handleRowSelectionEvent = function (pchannel, tableview, record, tr, rowIndex, e, eOpts) {
		try {
			if (m_prev_Cell_Selected_ID != undefined) {
				var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
					l_obj_GirdCell.removeCls("clsSelectedCell");
			}

			switch (pchannel) {
			case "ON":
				VistaarExtjs.getCmp(m_IdTGOffPremisesCurrent)[m_TGObject].getSelectionModel().deselectAll();
				VistaarExtjs.getCmp(m_IdTGOffPremisesProposed)[m_TGObject].getSelectionModel().deselectAll();
				break;
			case "OFF":
				VistaarExtjs.getCmp(m_IdTGOnPremisesCurrent)[m_TGObject].getSelectionModel().deselectAll();
				VistaarExtjs.getCmp(m_IdTGOnPremisesProposed)[m_TGObject].getSelectionModel().deselectAll();
				break;
			default: {
					VistaarExtjs.getCmp(m_IdTGOffPremisesCurrent)[m_TGObject].getSelectionModel().deselectAll();
					VistaarExtjs.getCmp(m_IdTGOffPremisesProposed)[m_TGObject].getSelectionModel().deselectAll();
					VistaarExtjs.getCmp(m_IdTGOnPremisesCurrent)[m_TGObject].getSelectionModel().deselectAll();
					VistaarExtjs.getCmp(m_IdTGOnPremisesProposed)[m_TGObject].getSelectionModel().deselectAll();
					break;
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	this.selectRowOnChangeDealInDealPennel = function (p_DealId, p_str_Channel, p_factCode) {
		if (p_str_Channel != undefined) {
			if (p_str_Channel == "ALL") {
				p_str_Channel = m_channel;
			}

			this.handleRowSelectionEvent();
			var l_obj_gridId = {
				"ON" : m_IdTGOnPremisesProposed,
				"OFF" : m_IdTGOffPremisesProposed
			}

			var l_obj_ToggleButtonID = {
				"ON" : "btnOnPremiseToggleValues",
				"OFF" : "btnOffPremiseToggleValues"

			}

			var l_obj_PannelID = {
				"ON" : "tabPnlOnPremise",
				"OFF" : "tabPnlOffPremise"
			}

			if (VistaarExtjs.getCmp(l_obj_ToggleButtonID[p_str_Channel]).pressed) {
				VistaarExtjs.getCmp(l_obj_ToggleButtonID[p_str_Channel]).toggle();
				VistaarExtjs.getCmp(l_obj_PannelID[p_str_Channel]).setActiveTab(0);
			}
			var l_tgObj = VistaarExtjs.getCmp(l_obj_gridId[p_str_Channel])[m_TGObject];
			var l_tgStore = l_tgObj.getStore();
			var l_rec = l_tgStore.findRecord("DealID", p_DealId);
			if (p_factCode != undefined) {
				for (var i = 0; i < l_rec.childNodes.length; i++) {
					if (l_rec.childNodes[i].data["FactCode"] == p_factCode) {
						l_rec = l_rec.childNodes[i];
					}
				}
			}
			var selModel = l_tgObj.getSelectionModel();
			if (l_rec != null) {
				selModel.select(l_rec);
				var l_column;
				var l_gridView = l_tgObj.getView();
				for (var l_colIdx in l_tgObj.columns) {
					if (l_tgObj.columns[l_colIdx].dataIndex == m_arrMonths[m_selectedMonth - 1]) {
						l_column = l_tgObj.columns[l_colIdx];
						break
					}
				}
				if (l_column != undefined) {
					var l_obj_cell = l_gridView.getCell(l_rec, l_column);
				}

				if (m_prev_Cell_Selected_ID != undefined) {
					var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
					if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
						l_obj_GirdCell.removeCls("clsSelectedCell");
				}
				m_prev_Cell_Selected_ID = Ext.clone(l_obj_cell.id);
				var l_obj_GirdCell = Ext.get(l_obj_cell.id);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
					l_obj_GirdCell.addCls('clsSelectedCell');
					var l_GridContainer = Ext.getCmp('cntPricePlanGridView');
					l_GridContainer.scrollTo(l_obj_GirdCell.getX(), 0, false);
					l_GridContainer.scrollTo(l_obj_GirdCell.getX(), l_obj_GirdCell.getY() - l_GridContainer.getY() - 100, false);
				}
			}

		}

	}
	this.btn_PP_PromoGoods_Click = function (button, e, eOpts) {
		try {
			var obj_PromoGoods_Hidden_Config = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo.PG_Rows;
			if (!this.m_PG_Applicable_Market || obj_PromoGoods_Hidden_Config.hidden) {
				//Non Applicable Promo-Goods Market....................
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
					getPricePlanControllerManagerObj().getPricePlanUIManager().btn_PP_PromoGoods_Click_CallBack(obj_PromoGoods_Hidden_Config);

				}, 50, this);
			}
			//PG Applicable Market................
			if (this.m_PG_Applicable_Market) {
				VistaarExtjs.getCmp("btn_PP_PromoGoods").toggle(true);
			}
			this.refreshPGButtonsState(); /*Mobility*/
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.btn_PP_PromoGoods_Click_CallBack = function (pobj_PromoGoods_Hidden_Config) {
		try {
			pobj_PromoGoods_Hidden_Config.hidden = !pobj_PromoGoods_Hidden_Config.hidden;
			VistaarExtjs.getCmp("grdSummaryProposed").DGObj.getView().refresh();
			VistaarExtjs.getCmp("cntParentFGOffPremise").setHidden(pobj_PromoGoods_Hidden_Config.hidden);
			VistaarExtjs.getCmp("cntParentFGOnPremise").setHidden(pobj_PromoGoods_Hidden_Config.hidden);
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().refreshAllPricePlanGridsView();
			getPricePlanControllerManagerObj().setDealCountInGirdHeader();
			if (!pobj_PromoGoods_Hidden_Config.hidden) {
				//Expand Collapsed PG Grid Column..............
				this.expandCollapse_PG_GridColumn();
				//Expand Collapsed PG Total column............
				this.expandCollapse_PG_TotalColumn();
			}

			/***Back-end PG related changes***/
			Ext.defer(function () {
				if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChangesONLoad();
					getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
				}
			}, 50, this);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}
	}

	this.onBtnOffPremisePGHideClick = function (button, e, eOpts) {
		try {
			var bln_Hide_Condition = false;
			if (button.pressed) {
				bln_Hide_Condition = true;
			}
			VistaarExtjs.getCmp("tabFGOffPremise").setHidden(bln_Hide_Condition);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onBtnOnPremisePGHideClick = function (button, e, eOpts) {
		try {
			var bln_Hide_Condition = false;
			if (button.pressed) {
				bln_Hide_Condition = true;
			}
			VistaarExtjs.getCmp("tabFGOnPremise").setHidden(bln_Hide_Condition);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.createPromoGoodsContextMenu = function () {
		try {
			var l_PricePlan_PG_Edit;
			var l_PricePlan_PG_Delete;
			l_PricePlan_PG_Edit = Ext.create('Ext.Action', {

					disabled : false,
					icon : 'null',
					cls : 'edit-context-menu cls_PG_Edit_Context',
					//iconCls : 'icon-edit-context-menu cls_PG_Edit_Context',
					id : 'action_PricePlan_PG_Edit_Deal',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onPromoGoodsEditContextClick();
					}
				});
			l_PricePlan_PG_Delete = Ext.create('Ext.Action', {
					disabled : false,
					icon : 'null',
					cls : 'delete-context-menu cls_PG_Delete_Context',
					//iconCls : 'icon-delete-context-menu cls_PG_Delete_Context',
					id : 'action_PricePlan_PG_Delete_Deal',
					handler : function (widget, event) {
						getPricePlanControllerManagerObj().getPricePlanUIManager().onPromoGoodsDeleteContextClick();
					}
				});
			m_PG_contextMenu = Ext.create('Ext.menu.Menu', {
					showSeparator : false,
					cls : 'clsContextMenu',
					id : 'menu_PricePlan_PG_Context',
					items : [
						l_PricePlan_PG_Edit,
						l_PricePlan_PG_Delete
					],
					//Added to hide context menu
					listeners : {
						blur : function (contextMenu) {
							contextMenu.hide();
						}
					}

				});
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.showPGContextMenu = function (p_view, p_tableCell, p_columnIndex, p_record, p_tableRow, p_rowIndex, p_channel) {
		try {
			if (m_prev_Cell_Selected_ID != undefined) {
				var l_obj_GirdCell = Ext.get(m_prev_Cell_Selected_ID);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null)
					l_obj_GirdCell.removeCls("clsSelectedCell");
			}
			//m_prev_Cell_Selected_ID = Ext.clone(p_tableCell.id);

			var blnShowContextMenu = false;
			var l_currSelectedColHeader = p_view.getColumnManager().getHeaderAtIndex(p_columnIndex).dataIndex;
			/**Handled Previous Year functionality (Not Checked in SVN) **/
			if (getCommonFuncMgr().m_PP_PG_Effectivity[l_currSelectedColHeader] && p_record.data.MetricsType != "Allocated Budget" && m_arrMonths.indexOf(l_currSelectedColHeader) > -1 && (isAdminRole() || (m_arrMonths.indexOf(p_record.data.EditableFrom) !== -1 && (m_arrMonths.indexOf(l_currSelectedColHeader) >= m_arrMonths.indexOf(p_record.data.EditableFrom))))) {
				blnShowContextMenu = true;
			} else {
				blnShowContextMenu = false;
			}

			if (blnShowContextMenu) {
				/** PG Enhancement : If PG is already deleted for selected channel then disable delete btn**/
				if (!m_Bln_DeletePG_ACL) {
					/**1-OFF 2-ON 3-Both**/
					if (m_PRG_Availability == 0 || (m_PRG_Availability == 1 && p_channel == "ON") || (m_PRG_Availability == 2 && p_channel == "OFF")) {
						VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").disable();
					} else {
						VistaarExtjs.getCmp("action_PricePlan_PG_Delete_Deal").enable();
					}
				}
				/**Disable edit button for percent of business row**/
				if (p_record.data.MetricsType == "Percent of Business") {
					VistaarExtjs.getCmp("action_PricePlan_PG_Edit_Deal").disable();
				} else {
					VistaarExtjs.getCmp("action_PricePlan_PG_Edit_Deal").enable();
				}
				/********select Cell********/
				var l_selctedColumn;
				var l_gridColumns = p_view.getColumnManager().getColumns();
				for (var l_colIdx in l_gridColumns) {
					if (l_gridColumns[l_colIdx].dataIndex == l_currSelectedColHeader) {
						l_selctedColumn = l_gridColumns[l_colIdx];
					}
				}
				//var l_obj_GirdCell = p_view.getCell(p_record, l_selctedColumn);
				//SVN Check-in required....
				l_obj_GirdCell = VistaarExtjs.getCmp(p_view.id).getView().getCell(p_record, l_selctedColumn);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
					l_obj_GirdCell.addCls('clsSelectedCell');
				}
				m_prev_Cell_Selected_ID = l_obj_GirdCell.id;
				/********select Cell********/

				/*var l_obj_GirdCell = Ext.get(p_tableCell.id);
				if (l_obj_GirdCell != undefined || l_obj_GirdCell != null) {
				l_obj_GirdCell.addCls('clsSelectedCell');
				}*/

				m_PG_Context_SelectedMonth = l_currSelectedColHeader;
				m_PG_Context_Record = p_record;
				m_PG_Context_ChannelType = p_channel;
				/* Mobility*/
				//m_PG_contextMenu.showAt([p_tableCell.getBoundingClientRect().left - 25, p_tableCell.getBoundingClientRect().top - 45]);
				//m_PG_contextMenu.focus();
				//Destroy Price Plan PopUps
				getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().destroyPricePlanPopups();
				Ext.defer(function(){
				m_PG_contextMenu.showAt([p_tableCell.getBoundingClientRect().left - 25, p_tableCell.getBoundingClientRect().top - 45]);
				var c = p_view.ownerGrid.columns[p_columnIndex];
				if(c.getEditor())
				{
					//c.getEditor().hide();
					c.getEditor().setHeight(0);
				}
				//m_contextMenu.focus();
				},25,this);
				return false;
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};
	this.handleAfter_PG_RenderEvent = function () {
		try {
			if (m_PG_contextMenu === undefined)
				this.createPromoGoodsContextMenu();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	/*this.onPromoGoodsDeleteContextClick = function () {
	try {
	var PG_Grid_Id = {
	"ON" : "DG_PGOnPremisesProposed",
	"OFF" : "DG_PGOffPremisesProposed"
	};
	var l_objEditedValues = {};
	for (var l_month in m_arrMonths) {
	if (getCommonFuncMgr().m_PP_PG_Effectivity[m_arrMonths[l_month]] && (l_month >= m_arrMonths.indexOf(m_PG_Context_SelectedMonth))) {
	VistaarExtjs.getCmp(PG_Grid_Id[m_PG_Context_ChannelType]).DGObj.getStore().getAt(0).set(m_arrMonths[l_month], 0);
	l_objEditedValues[m_arrMonths[l_month]] = 0;
	}
	}
	getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChanges(m_PG_Context_Record.data.MetricsType, m_PG_Context_SelectedMonth, m_PG_Context_ChannelType);
	getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(l_objEditedValues, m_PG_Context_ChannelType, null, m_PG_Context_Record.data.MetricsType);
	} catch (err) {
	getCommonFuncMgr().printLog(err);
	}

	}*/
	/* PG Enhancement*/
	this.onPromoGoodsDeleteContextClick = function () {
		try {
			//Check already edited Published Plan Scenrio 
			getPricePlanControllerManagerObj().validateDeletePromoGoods();
			
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.PromoGoodsDeleteConfirmCallback = function (p_btn) {
		try {
			if (p_btn == "yes") {
				getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
					getPricePlanControllerManagerObj().PromoGoodsDeleteScriptCall(m_PG_Context_ChannelType, m_PG_Context_SelectedMonth);
				}, 50);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//ON PG_EDIT CONTEXT MENU CLICK OPERATION...........
	this.onPromoGoodsEditContextClick = function () {
		//CONFIG TO BE SEND FOR OPEN PG_CALCULATOR..........
		var l_obj_PG_EditConfig = {
			"channel" : m_PG_Context_ChannelType,
			"month" : m_PG_Context_SelectedMonth,
		}
		//OPEN PG_CALCULATOR VIEW........................
		getObjectFactory().getPromoGoodsManager().OpenPGCalculator(l_obj_PG_EditConfig);
	}

	//Update PG_SDA (Promo-Goods) from PG_calculator
	this.updatePGSDA_From_PGCalculator = function (p_PGSDA_Config) {
		try {
			//Promo-Goods Grid ID...............
			var PG_Grid_Id = {
				"ON" : "DG_PGOnPremisesProposed",
				"OFF" : "DG_PGOffPremisesProposed"
			};
			//Promo-Goods Qualifier Grids Id.............
			var PG_QUL_GRID_ID = {
				"ON" : "DG_PG_Qual_OnPreProposed",
				"OFF" : "DG_PG_Qual_OffPreProposed"
			};

			var l_objEditedValues = {};
			var l_Store_PG_Grid = VistaarExtjs.getCmp(PG_Grid_Id[p_PGSDA_Config["Channel"]]).DGObj.getStore();
			//Find the rowIndex of PG_SDA row..............
			var l_index_PG_SDA_Row = l_Store_PG_Grid.find("MetricsType", "PG_SDA");
			//Update the Promo-Goods Data..............
			for (var l_month in m_arrMonths) {
				if (getCommonFuncMgr().m_PP_PG_Effectivity[m_arrMonths[l_month]] && (l_month >= m_arrMonths.indexOf(p_PGSDA_Config["Month"]))) {
					l_Store_PG_Grid.getAt(l_index_PG_SDA_Row).set(m_arrMonths[l_month], p_PGSDA_Config["PG_SDA"]);
					l_objEditedValues[m_arrMonths[l_month]] = p_PGSDA_Config["PG_SDA"];
				}
			}
			VistaarExtjs.getCmp(PG_QUL_GRID_ID[p_PGSDA_Config["Channel"]]).DGObj.getStore().getAt(0).set("Qualifier", p_PGSDA_Config["Qualifier"]);
			//COMMIT CHANGES OF QUALIFIER................
			/**PG_Qualifier commit changes(not checked in)**/
			VistaarExtjs.getCmp(PG_QUL_GRID_ID[p_PGSDA_Config["Channel"]]).DGObj.getStore().commitChanges();
			getPricePlanControllerManagerObj().updatePG_Qualifier_From_PGCalculator(p_PGSDA_Config["Channel"], p_PGSDA_Config["Qualifier"]);
			//Calculate the PromoGoods Grid Data....................
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChanges(m_PG_Context_Record.data.MetricsType, p_PGSDA_Config["Month"], p_PGSDA_Config["Channel"]);
			//Add the Updated Info  for Save PP Operation............
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(l_objEditedValues, p_PGSDA_Config["Channel"], null, m_PG_Context_Record.data.MetricsType);
			//Add the Updated PG_Qual Info for Save PP Operation............
			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(p_PGSDA_Config["Qualifier"], p_PGSDA_Config["Channel"], null, "PRG_Qualifier");
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.treeNodeExpandCallback = function () {
		alert("Node Exapnd Click");
	}

	this.swapCurrentProposed = function (pChannel) {
		//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
		var tabOnPremise = VistaarExtjs.getCmp("tabPnlOnPremise");
		var tabOffPremise = VistaarExtjs.getCmp("tabPnlOffPremise");

		var l_transition_ON = (Ext.getCmp("btnOnPremiseToggleValues").pressed) ? [0, 1] : [1, 0];
		var l_transition_OFF = (Ext.getCmp("btnOffPremiseToggleValues").pressed) ? [0, 1] : [1, 0];
		switch (pChannel) {
		case "ON": {

				for (var l_setActive in l_transition_ON) {
					tabOnPremise.setActiveTab(l_transition_ON[l_setActive]);
				}

				break;
			}
		case "OFF": {

				for (var l_setActive in l_transition_OFF) {
					tabOffPremise.setActiveTab(l_transition_OFF[l_setActive]);
				}

				break;
			}
		default: {
				for (var l_setActive in l_transition_ON) {
					tabOnPremise.setActiveTab(l_transition_ON[l_setActive]);
				}
				for (var l_setActive in l_transition_OFF) {
					tabOffPremise.setActiveTab(l_transition_OFF[l_setActive]);
				}

				break;
			}
		}

	}

	//PG_Qualifier Before Cell Edit callback.......................
	this.onCellBeforeEditPG_Qualifier = function (editor, e, eOpts) {
		try {
			if (!m_bln_IsClosedPricePlan) {
				return true;
			} else {
				return false;
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onBtnOnPremiseExpanAllClick = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			Ext.defer(function () {
				getPricePlanControllerManagerObj().getPricePlanUIManager().expandAllCallBack(button, "ON");

			}, 50);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};
	this.onBtnOnPremiseCollapseAllClick = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			Ext.defer(function () {
				getPricePlanControllerManagerObj().getPricePlanUIManager().collapseAllCallBack(button, "ON");

			}, 50);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};
	this.onBtnOffPremiseExpanAllClick = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			Ext.defer(function () {
				getPricePlanControllerManagerObj().getPricePlanUIManager().expandAllCallBack(button, "OFF");

			}, 50);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	this.onBtnOffPremiseCollapseAllClick = function (button, e, eOpts) {
		try {
			getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
			Ext.defer(function () {
				getPricePlanControllerManagerObj().getPricePlanUIManager().collapseAllCallBack(button, "OFF");

			}, 50);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	this.expandAllCallBack = function (pButton, pChannel) {
		try {
			if (pChannel == "OFF") {
				var l_objGridOffCurrent = VistaarExtjs.getCmp(m_IdTGOffPremisesCurrent).TGObj;
				var l_objGridOffProposed = VistaarExtjs.getCmp(m_IdTGOffPremisesProposed).TGObj;

				if (Ext.getCmp("btnOffPremiseToggleValues").pressed) {
					l_objGridOffCurrent.expandAll();
				} else {
					l_objGridOffProposed.expandAll();
				}

			} else if (pChannel == "ON") {
				var l_objGridOnCurrent = VistaarExtjs.getCmp(m_IdTGOnPremisesCurrent).TGObj;
				var l_objGridOnProposed = VistaarExtjs.getCmp(m_IdTGOnPremisesProposed).TGObj;

				if (Ext.getCmp("btnOnPremiseToggleValues").pressed) {
					l_objGridOnCurrent.expandAll();
				} else {
					l_objGridOnProposed.expandAll();
				}

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	this.collapseAllCallBack = function (pButton, pChannel) {

		try {
			if (pChannel == "OFF") {
				var l_objGridOffCurrent = VistaarExtjs.getCmp(m_IdTGOffPremisesCurrent).TGObj;
				var l_objGridOffProposed = VistaarExtjs.getCmp(m_IdTGOffPremisesProposed).TGObj;

				if (Ext.getCmp("btnOffPremiseToggleValues").pressed) {
					l_objGridOffCurrent.collapseAll();
				} else {
					l_objGridOffProposed.collapseAll();
				}

			} else if (pChannel == "ON") {
				var l_objGridOnCurrent = VistaarExtjs.getCmp(m_IdTGOnPremisesCurrent).TGObj;
				var l_objGridOnProposed = VistaarExtjs.getCmp(m_IdTGOnPremisesProposed).TGObj;

				if (Ext.getCmp("btnOnPremiseToggleValues").pressed) {
					l_objGridOnCurrent.collapseAll();
				} else {
					l_objGridOnProposed.collapseAll();
				}

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
		finally {
			getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		}

	}

	//PG Expand Collapsed implementation..........................

	this.expandCollapse_PG_GridColumn = function () {
		try {
			var l_arrPG_Config = [{
					"GrdId" : m_DG_PG_OFFPREMISESPROPOSED,
					"TabId" : "tabFGOffPremise"
				}, {
					"GrdId" : m_DG_PG_OFFPREMISESCURRENT,
					"TabId" : "tabFGOffPremise"
				}, {
					"GrdId" : m_DG_PG_ONPREMISESPROPOSED,
					"TabId" : "tabFGOnPremise"
				}, {
					"GrdId" : m_DG_PG_ONPREMISESCURRENT,
					"TabId" : "tabFGOnPremise"
				}
			];
			//var width = 196;
			//var width = 246;
			var width = m_staticMetricPGColumnWidth;
			if (m_blnIsColumnsExpanded) {
				// width = 328;
				//width = 378;
				width = m_staticMetricPGColumnExpandedWidth;
			}
			if (VistaarExtjs.getCmp(l_arrPG_Config[0]["GrdId"]).DGObj.getColumnManager().getColumns()[0].getWidth() != width) {
				//Decreasing column width Of PG Grid.........
				for (var PG_Index in l_arrPG_Config) {
					var l_obj_PG_Grid = VistaarExtjs.getCmp(l_arrPG_Config[PG_Index]["GrdId"]);
					if (l_obj_PG_Grid != undefined) {
						VistaarExtjs.getCmp(l_arrPG_Config[PG_Index]["TabId"]).setActiveTab(PG_Index % 2);
						l_obj_PG_Grid.DGObj.getColumnManager().getColumns()[0].setWidth(width);
						//VistaarExtjs.getCmp(l_obj_PG_Grid.DGObj.containerId).setHidden(true);
					}
				}
				if (!Ext.getCmp("btnOffPremiseToggleValues").pressed) {
					VistaarExtjs.getCmp("tabFGOffPremise").setActiveTab(0)
				}
				if (!Ext.getCmp("btnOnPremiseToggleValues").pressed) {
					VistaarExtjs.getCmp("tabFGOnPremise").setActiveTab(0)
				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.btn_FOBCalculator_Click = function (button, e, eOpts) {
		window.open("http://thevine.ejgallo.com/sites/Controlstatecalculators/SitePages/Home.aspx");

	}

	this.btn_ExpandCollapsePricePlanTabTool_Click = function (button, e, eOpts) {
		var obj_cntPricePlanTabTool = Ext.ComponentQuery.query('#cntPricePlanTabTools')[0];

		var obj_cntPricePlanTabToolOperationButtons = Ext.ComponentQuery.query('#cntPPOperationButtonsTab', Ext.ComponentQuery.query('#cntPricePlanTabTools')[0])[0];

		var obj_btnExpandColapse = Ext.ComponentQuery.query('#btnExpandCollpseToolBar', Ext.ComponentQuery.query('#cntPricePlanTabTools')[0])[0];

		var l_PPSummaryHideObj = Ext.ComponentQuery.query('#btnPricePlanHideSummary')[0];
		if (button.pressed) {
			obj_cntPricePlanTabTool.removeCls('clsWindowCollapse');
			obj_cntPricePlanTabTool.setHeight(20);
			obj_cntPricePlanTabToolOperationButtons.setVisible(true);
			//Ext.ComponentQuery.query('#cntPricePlanTabTools')[0].showAt((l_PPSummaryHideObj.getX() * 19), l_PPSummaryHideObj.getY() - 10);
			getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
			obj_btnExpandColapse.removeCls('clsCollapsed');
			obj_btnExpandColapse.addCls('clsExpanded');
		} else {
			obj_cntPricePlanTabTool.addCls('clsWindowCollapse');
			obj_cntPricePlanTabTool.setHeight(20);
			obj_cntPricePlanTabToolOperationButtons.setVisible(false);
			//obj_cntPricePlanTabTool.showAt((l_PPSummaryHideObj.getX() * 33), l_PPSummaryHideObj.getY());
			getPricePlanControllerManagerObj().getPricePlanUIManager().setPricePlanTabToolsPosition();
			obj_btnExpandColapse.removeCls('clsExpanded');
			obj_btnExpandColapse.addCls('clsCollapsed');
		}

	}

	this.setPricePlanTabToolsPosition = function () {
		try {
			var l_scopeObj = Ext.ComponentQuery.query('#cntScope')[0];
			var l_viewPortWidth = Ext.Element.getViewportWidth();
			var l_PPTopSObj = Ext.ComponentQuery.query('#cnt_PricePlanTop_Summary')[0];
			var l_btnObj = Ext.ComponentQuery.query('#btnExpandCollpseToolBar')[0];
			var l_PPTabToolsObj = Ext.ComponentQuery.query('#cntPricePlanTabTools')[0];
			var l_pricePlanCardTop = Ext.getCmp('cntPricePlanCard').getY();
			if (!Ext.getCmp('cntPricePlanMain').isVisible())
			{
				l_PPTabToolsObj.hide();
			}
			else
			{
			if(Ext.getCmp('window_DealPanelView')==undefined || (Ext.getCmp('window_DealPanelView') && !Ext.getCmp('window_DealPanelView').isVisible()))
			{
			if (l_btnObj.pressed) {
				/*Mobility*/
				l_PPTabToolsObj.showAt((l_viewPortWidth - 50 - l_PPTabToolsObj.getWidth()), (l_pricePlanCardTop + 4));
				//l_PPTabToolsObj.showAt((l_viewPortHeight - 50 - l_PPTabToolsObj.getWidth()), ((l_PPTopSObj.getY()) + (l_PPTopSObj.getHeight()) + 8));
				//l_PPTabToolsObj.showAt((l_viewPortHeight - 500), ((l_PPTopSObj.getY()) + (l_PPTopSObj.getHeight()) + 8));
			} else {
				l_PPTabToolsObj.showAt((l_viewPortWidth - 100), (l_pricePlanCardTop + 4));
				//l_PPTabToolsObj.showAt((l_viewPortHeight - 100), ((l_PPTopSObj.getY()) + (l_PPTopSObj.getHeight()) + 16));
					}
				}
			}
			//sc.getY() + sc.getHeight() + pps.getHeight() + 25
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Purpose : Expand Total Column Brfore Navigation of Best Practices
	this.expandTotalColumn_Prior_BP_Nav = function () {
		try {
			if (!m_blnIsTotalsColumnsExpanded) {
				this.onGridColumnTotalClickCallBack(true);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	/*Mobility*/
	this.onbtnOffPGToggleIdClick = function (button, e, eOpts) {
		try {
			if(button.pressed)
			{	
				/*Ext.getCmp('pnlFGOffPremiseCurrent').show();
				Ext.getCmp('pnlFGOffPremiseProposed').show();*/
				Ext.getCmp('cntParentFGOffPremise').show();
			}
			else
			{				
				/*Ext.getCmp('pnlFGOffPremiseCurrent').hide();
				Ext.getCmp('pnlFGOffPremiseProposed').hide();
				*/
				Ext.getCmp('cntParentFGOffPremise').hide();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.onbtnOnPGToggleIdClick = function (button, e, eOpts) {
		try {

			//alert('On Click ' + button.pressed);
			if(button.pressed)
			{	
					/*Ext.getCmp('pnlFGOnPremiseCurrent').show();
					Ext.getCmp('pnlFGOnPremiseProposed').show();*/
					Ext.getCmp('cntParentFGOnPremise').show();
			}
			else
			{
				/*Ext.getCmp('pnlFGOnPremiseCurrent').hide();
				Ext.getCmp('pnlFGOnPremiseProposed').hide();*/
				Ext.getCmp('cntParentFGOnPremise').hide();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.isPGApplicableForPricePlan = function()
	{
		//return !VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled();
		return this.m_PG_Applicable_Market;
	};
	this.arePGGridsVisible = function()
	{
		return !VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed;
	};
	this.isPGButtonEnabled = function()
	{
		return !VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled();
	}
	this.refreshPGButtonsState = function()
	{
		try {
			var me = getPricePlanControllerManagerObj().getPricePlanUIManager();
			if(getCommonFuncMgr().isNonDeskTopView())
			{
				if(me.isPGApplicableForPricePlan() || me.arePGGridsVisible())
				{
					Ext.getCmp("btnOnPGToggleId").show();
					Ext.getCmp("btnOnPGToggleId").toggle(true);
					Ext.getCmp("btnOffPGToggleId").show();
					Ext.getCmp("btnOffPGToggleId").toggle(true);
					/*Show All PG related Containers */
					Ext.getCmp('pnlFGOffPremiseCurrent').show();
					Ext.getCmp('pnlFGOffPremiseProposed').show();
					Ext.getCmp('pnlFGOnPremiseCurrent').show();
					Ext.getCmp('pnlFGOnPremiseProposed').show();
				}
				else if(me.isPGButtonEnabled())
				{
					Ext.getCmp("btnOnPGToggleId").hide();
					Ext.getCmp("btnOffPGToggleId").hide();
					Ext.getCmp("btnOnPGToggleId").toggle(false);
					Ext.getCmp("btnOffPGToggleId").toggle(false);
				}
				else
				{
					Ext.getCmp("btnOnPGToggleId").hide();
					Ext.getCmp("btnOffPGToggleId").hide();
				}
			}
			else
			{
				/* The buttons above are present only in IPAD. So nothing needs to be handled if its Desktop View */	
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.setPricePlanAsActiveView = function()
	{
		
		VistaarExtjs.getCmp("cntPricePlanMain").setActiveItem(getPricePlanControllerManagerObj().getPricePlanUIManager().m_PricePlanMain);		
		//This is required on IPAD else blank screen is visible
		Ext.getCmp('cntPricePlanMain').doLayout();
		
	}

	
	this.enableOrDisablePricePlanScope = function(p_blnEnable)
	{
		var l_cntScope = Ext.getCmp('cntScope');
		if(p_blnEnable)
		{
			l_cntScope.unmask();
		}
		else
		{
			l_cntScope.mask();
		}
	}
}
