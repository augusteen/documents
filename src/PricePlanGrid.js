var g_massCopyDeals = {};
g_massCopyDeals = {
	"on" : [],
	"off" : []
};
function PricePlanGridManager() {
	var m_arrMonths = getGlobalConstantsObj().m_ARR_MONTH_KEY;
	var m_selectedMonth;
	var m_DGObject = "DGObj";
	var m_TGObject = "TGObj";

	var m_DGSUMMARYPROPOSED = "grdSummaryProposed";
	var m_TGOFFPREMISESPROPOSED = "TG_OffPremisesProposed";
	var m_TGONPREMISESPROPOSED = "TG_OnPremisesProposed";

	var m_TGOFFPREMISESCURRENT = "TG_OffPremisesCurrent";
	var m_TGONPREMISESCURRENT = "TG_OnPremisesCurrent";

	var m_CmbWorkFlowId = "cmbWorkflow";
	var m_PricePlanSummaryProGridObject;
	var m_PricePlanSummaryCurGridObject;
	this.m_PricePlanOffPremiseProGridObject;
	this.m_PricePlanOffPremiseCurGridObject;
	this.m_PricePlanOnPremiseProGridObject;
	this.m_PricePlanOnPremiseCurGridObject;
	var m_PricePlanFreezeColumnGridObject;

	//var m_planningYear = Ext.getCmp(m_CmbWorkFlowId).getValue().year;
	var m_arrGridEditRecord = [];
	var m_CmbPRICINGGROUP = "cmbIdPricingGroup";
	var m_PricePlanPGOnPremiseProGrdObject;
	var m_PricePlanPGOnPremiseCurGrdObject;
	var m_PricePlanPGOffPremiseProGrdObject;
	var m_PricePlanPGOffPremiseCurGrdObject;
	var m_DG_PG_OFFPREMISESPROPOSED = "DG_PGOffPremisesProposed";
	var m_DG_PG_ONPREMISESPROPOSED = "DG_PGOnPremisesProposed";
	var m_DG_PG_OFFPREMISESCURRENT = "DG_PGOffPremisesCurrent";
	var m_DG_PG_ONPREMISESCURRENT = "DG_PGOnPremisesCurrent";
	var m_PP_PG_Qualifier_OnPremise_ProGrdObject;
	var m_PP_PG_Qualifier_OnPremise_CurGrdObject;
	var m_PP_PG_Qualifier_OffPremise_ProGrdObject;
	var m_PP_PG_Qualifier_OffPremise_CurGrdObject;
	var m_PRG_Qualifier = "PRG_Qualifier";
	// Stack for maintaining edited record Info in order......
	var m_Stack_EditedCellInfo = [];
	var m_IS_AUDIT_REQUIRED = false;

	//Dipali
	/*var g_massCopyDealCounter = 0;
	var g_massCopyDeals = [];*/
	//var m_PricePlanGridScope = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager();
	var m_arrProposedNetFOB = [[{
				"title" : "FY",
				"statistics" : "",
				"format" : "$",
				"cls" : "'data_cont_stat statWidth color_ytd'",
				"key" : "FY"
			}, {
				"title" : "YTD",
				"statistics" : "",
				"format" : "$",
				"cls" : "'data_cont_stat statWidth color_ytd'",
				"key" : "YTD"
			}, {
				"title" : "4 MTHS",
				"statistics" : "",
				"format" : "$",
				"cls" : "'data_cont_stat statWidth color_ytd'",
				"key" : "4MTHS"
			}, {
				"title" : "PY",
				"statistics" : "",
				"format" : "$",
				"cls" : "'data_cont_stat statWidth color_oth'",
				"key" : "PY"
			}, {
				"title" : "FY vs PY (Vol)",
				"statistics" : "",
				"format" : "%",
				"cls" : "'data_cont_stat statWidth color_oth'",
				"key" : "FYvsPY"
			}
		], [{
				"header" : "NetFOB",
				"clsOuter" : "'IpadclsOuterNetFOB'",
				"KPI" : [{
						'title' : 'FY',
						'statistics' : 47.29,
						'format' : '$',
						"key" : "FY",
						'header' : 'NetFOB'
					}, {
						'title' : 'YTD',
						'statistics' : 49.20,
						'format' : '$',
						"key" : "YTD",
						'header' : 'NetFOB'
					}, {
						'title' : '4 Months',
						'statistics' : 29.60,
						'format' : '$',
						"key" : "4MTHS",
						'header' : 'NetFOB'
					}, {
						'title' : 'PY',
						'statistics' : 160.01,
						'format' : '$',
						"key" : "PY",
						'header' : 'NetFOB'
					}
				]
			}, {
				"header" : "Volume",
				"clsOuter" : "'IpadclsOuterVolume'",
				"KPI" : [{
						'title' : 'FY vs PY',
						'statistics' : 5,
						'format' : '%',
						"key" : "FYvsPY",
						'header' : 'Volume'
					}
				]
			}
		]];
	var m_PricePlanCodeNameMapping = {
		"SKU_Count" : "SKU Count",
		"Distributor_Count" : "Dist Count",
		"Shelf" : "Shelf",
		"BPC" : "Selling Units",
		"RMU_PERC" : "RMU %",
		"Net_List_per_Selling_Unit" : "Net List per SU",
		"Net_List" : "Net List",
		"DM_PERC" : "DM %",
		"Landed" : "Landed",
		"Net_FOB" : "Net FOB",
		"SDA" : "SDA",
		"Bill_FOB" : "FOB",
		"RAB" : "RAB",
		"RAB_Less_Bkg" : "RAB (Less Bkg)",
		"Volume" : "Volume",
		"Business" : "Business",
		"DealID" : "DealID",
		"Qualifier" : "Qualifier",
		"Freight" : "Freight",
		"Allowance" : "Allowance",
		"State Tax" : "State Tax",
		"Deleted Deal" : "Deleted Deal"

	};

	//Purpose :set all grids on price plan screen
	this.setPricePlanGrids = function (p_GridData, p_arrEditedData) {
		 VistaarAuditingManager.audit({
			"name" : "Start:Price Plan Grid Creation"
			}, m_IS_AUDIT_REQUIRED, 6101); 
		/*load price plan summary grid */
		var IsIPADView = getCommonFuncMgr().isNonDeskTopView();
		var pnlParentCard;
		if (IsIPADView) {
			pnlParentCard = VistaarExtjs.getCmp('cnt_PricePlan_Grid_Card');
			Ext.getCmp('cntPricePlanMain').show();
			Ext.getCmp('cntTab').show();
			if(Ext.getCmp('window_DealPanelView')==undefined || (Ext.getCmp('window_DealPanelView') && !Ext.getCmp('window_DealPanelView').isVisible()))
			{
				Ext.getCmp('cntPricePlanTabTools').show();
			}
		}
		try {
			if(!IsIPADView)
			Ext.suspendLayouts(); /* Commented for Mobility*/

			if (p_arrEditedData != undefined) {
				m_arrGridEditRecord = p_arrEditedData;
			} else {
				m_arrGridEditRecord = [];
			}
			m_Stack_EditedCellInfo = [];

			var tabOnPremise = VistaarExtjs.getCmp("tabPnlOnPremise");
			var tabOffPremise = VistaarExtjs.getCmp("tabPnlOffPremise");
			//Set Price Plan header Info..........
			var l_obj_SummaryNetFOBProposedRow;
			var l_obj_SummaryVolumeProposed;
			var l_ObjSummaryProposed = p_GridData["Price Plan"].Summary;
			for (var l_proposedDataIndex in l_ObjSummaryProposed) {
				if (l_ObjSummaryProposed[l_proposedDataIndex].Type == "Proposed" && l_ObjSummaryProposed[l_proposedDataIndex].MetricsType == "NetFOB") {
					//Extracting Proposed NetFOB Row from Summary Grid............
					l_obj_SummaryNetFOBProposedRow = l_ObjSummaryProposed[l_proposedDataIndex];
				} else if (l_ObjSummaryProposed[l_proposedDataIndex].Type == "Proposed" && l_ObjSummaryProposed[l_proposedDataIndex].MetricsType == "Current") {
					//Extracting Proposed Volume Row from Summary Grid............
					l_obj_SummaryVolumeProposed = l_ObjSummaryProposed[l_proposedDataIndex];
				}
			}

			//for (var l_proposedDataIndex in l_ObjSummaryProposed) {
			/*if (l_ObjSummaryProposed[l_proposedDataIndex].Type == "Proposed" && l_ObjSummaryProposed[l_proposedDataIndex].MetricsType == "NetFOB") {*/
			this.setPricePlanHeaderInfo(l_obj_SummaryNetFOBProposedRow, l_obj_SummaryVolumeProposed);
			//	break;
			//}
			//}

			if (m_PricePlanFreezeColumnGridObject == undefined) {
				var summaryPro_gdconfig = getObjectFactory().getConfigurationManager().getFreezeColumnGridConfig();
				m_PricePlanFreezeColumnGridObject = VistaarDG.createDynamicGrid(summaryPro_gdconfig, []);

			} else {
				//VistaarDG.reloadDGWithData("PP_ColumnFreezeGrd",[]);
				//getPricePlanControllerManagerObj().getPricePlanUIManager().summaryGridAfterRenderEvent();
			}
			if (m_PricePlanSummaryProGridObject == undefined) {
				var summaryPro_gdconfig = getObjectFactory().getConfigurationManager().getPPSummaryGrdConfigProposed();
				m_PricePlanSummaryProGridObject = VistaarDG.createDynamicGrid(summaryPro_gdconfig, p_GridData["Price Plan"].Summary);

			} else {
				VistaarDG.reloadDGWithData("grdSummaryProposed", p_GridData["Price Plan"].Summary);
				//getPricePlanControllerManagerObj().getPricePlanUIManager().summaryGridAfterRenderEvent();
			}
			/*if (m_PricePlanSummaryCurGridObject == undefined) {
			var summaryCur_gdconfig = getObjectFactory().getConfigurationManager().getPPSummaryGrdConfigCurrent();
			m_PricePlanSummaryCurGridObject = VistaarDG.createDynamicGrid(summaryCur_gdconfig, p_GridData["Price Plan"].Summary.Current);
			} else {
			VistaarDG.reloadDGWithData("grdSummaryCurrent", p_GridData["Price Plan"].Summary.Current);
			}*/

			/*load price plan tree grid*/

			if(pnlParentCard)
			{
				pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cnt_PricePlanOnPremise"));
			}
			if (this.m_PricePlanOnPremiseProGridObject == undefined) {
				var onpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigProposed();
				//Dipali
				p_GridData.ON.Proposed = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().massCopySelect(p_GridData.ON.Proposed);
				this.m_PricePlanOnPremiseProGridObject = VistaarTG.createTreeGrid(onpremise_gdconfig, p_GridData.ON.Proposed);
			} else {

				//VistaarTG.destroyTreeGrid("TG_OnPremisesProposed");
				var onpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigProposed();
				//Dipali
				p_GridData.ON.Proposed = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().massCopySelect(p_GridData.ON.Proposed);
				//this.m_PricePlanOnPremiseProGridObject = VistaarTG.createTreeGrid(onpremise_gdconfig, p_GridData.ON.Proposed);
				//VistaarTG.reconfigureTreeGrid(onpremise_gdconfig, p_GridData.ON.Proposed,true);
				this.loadTGwithData("TG_OnPremisesProposed",p_GridData.ON.Proposed,m_TGObject);
			}
			tabOnPremise.setActiveTab(1);
			if (this.m_PricePlanOnPremiseCurGridObject == undefined) {
				var onpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigCurrent();
				this.m_PricePlanOnPremiseCurGridObject = VistaarTG.createTreeGrid(onpremise_gdconfig, p_GridData.ON.Current);
			} else {

				//VistaarTG.destroyTreeGrid("TG_OnPremisesCurrent");
				var onpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOnPremisesConfigCurrent();
				//this.m_PricePlanOnPremiseCurGridObject = VistaarTG.createTreeGrid(onpremise_gdconfig, p_GridData.ON.Current);
				//VistaarTG.reconfigureTreeGrid(onpremise_gdconfig, p_GridData.ON.Proposed,true);
				this.loadTGwithData("TG_OnPremisesCurrent",p_GridData.ON.Current,m_TGObject);
			}
			tabOnPremise.setActiveTab(0);
			if (pnlParentCard) {
				pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cnt_PricePlanOffPremise"));
			}
			if (this.m_PricePlanOffPremiseProGridObject == undefined) {
				var offpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigProposed();
				//Dipali
				p_GridData.OFF.Proposed = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().massCopySelect(p_GridData.OFF.Proposed);
				this.m_PricePlanOffPremiseProGridObject = VistaarTG.createTreeGrid(offpremise_gdconfig, p_GridData.OFF.Proposed);
			} else {
				//VistaarTG.destroyTreeGrid("TG_OffPremisesProposed");
				var offpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigProposed();
				//Dipali
				p_GridData.OFF.Proposed = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().massCopySelect(p_GridData.OFF.Proposed);
				//this.m_PricePlanOffPremiseProGridObject = VistaarTG.createTreeGrid(offpremise_gdconfig, p_GridData.OFF.Proposed);
				//VistaarTG.reconfigureTreeGrid(offpremise_gdconfig, p_GridData.OFF.Proposed,true);
				this.loadTGwithData("TG_OffPremisesProposed",p_GridData.OFF.Proposed,m_TGObject);
			}
			 /*Commented for Mobility*/

			
			tabOffPremise.setActiveTab(1);
			/*Commented for Mobility*/


			if (this.m_PricePlanOffPremiseCurGridObject == undefined) {
				var offpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigCurrent();
				this.m_PricePlanOffPremiseCurGridObject = VistaarTG.createTreeGrid(offpremise_gdconfig, p_GridData.OFF.Current);

			} else {
				//VistaarTG.destroyTreeGrid("TG_OffPremisesCurrent");
				var offpremise_gdconfig = getObjectFactory().getConfigurationManager().getPPOffPremisesConfigCurrent();
				//this.m_PricePlanOffPremiseCurGridObject = VistaarTG.createTreeGrid(offpremise_gdconfig, p_GridData.OFF.Current);
				//VistaarTG.reconfigureTreeGrid(offpremise_gdconfig, p_GridData.OFF.Current,true);
				this.loadTGwithData("TG_OffPremisesCurrent",p_GridData.OFF.Current,m_TGObject);
			}
			
			tabOffPremise.setActiveTab(0);

			//CHECK WHETHER PG EXIST FOR GIVEN MARKET..........
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled()) {
				/*PROMO-GOODS ONPREMISE PROPOSED GRID */
				
				if (m_PricePlanPGOnPremiseProGrdObject == undefined) {
					var OnPremisePro_PG_GrdConfig = getObjectFactory().getConfigurationManager().getPGConfig().DG_PGOnPremises.Proposed;
					m_PricePlanPGOnPremiseProGrdObject = VistaarDG.createDynamicGrid(OnPremisePro_PG_GrdConfig, p_GridData.PG_ON.Proposed);

				} else {
					VistaarDG.reloadDGWithData("DG_PGOnPremisesProposed", p_GridData.PG_ON.Proposed);
				}
				if (m_PP_PG_Qualifier_OnPremise_ProGrdObject == undefined) {
					var OnPremisePro_PG_Qual_GrdConfig = getObjectFactory().getConfigurationManager().getPGQualOnPremisesProposed();
					m_PP_PG_Qualifier_OnPremise_ProGrdObject = VistaarDG.createDynamicGrid(OnPremisePro_PG_Qual_GrdConfig, p_GridData.PG_ON.Qualifier_Proposed);
				} else {
					VistaarDG.reloadDGWithData("DG_PG_Qual_OnPreProposed", p_GridData.PG_ON.Qualifier_Proposed);
				}
				
				
				/*PROMO-GOODS ONPREMISE CURRENT GRID */
				
				VistaarExtjs.getCmp("tabFGOnPremise").setActiveTab(1);// PG Enhancement changes
				
				if (m_PricePlanPGOnPremiseCurGrdObject == undefined) {
					var OnPremiseCur_PG_GrdConfig = getObjectFactory().getConfigurationManager().getPGConfig().DG_PGOnPremises.Current;
					m_PricePlanPGOnPremiseCurGrdObject = VistaarDG.createDynamicGrid(OnPremiseCur_PG_GrdConfig, p_GridData.PG_ON.Current);

				} else {
					VistaarDG.reloadDGWithData("DG_PGOnPremisesCurrent", p_GridData.PG_ON.Current);
				}
				if (m_PP_PG_Qualifier_OnPremise_CurGrdObject == undefined) {
					var OnPremiseCur_PG_Qual_GrdConfig = getObjectFactory().getConfigurationManager().getPGQualOnPremisesCurrent();
					m_PP_PG_Qualifier_OnPremise_CurGrdObject = VistaarDG.createDynamicGrid(OnPremiseCur_PG_Qual_GrdConfig, p_GridData.PG_ON.Qualifier_Current);
				} else {
					VistaarDG.reloadDGWithData("DG_PG_Qual_OnPreCurrent", p_GridData.PG_ON.Qualifier_Current);
				}
				
				VistaarExtjs.getCmp("tabFGOnPremise").setActiveTab(0);// PG Enhancement changes
				
				/*PROMO-GOODS OFFPREMISE PROPOSED GRID */
				if (m_PricePlanPGOffPremiseProGrdObject == undefined) {
					var OffPremisePro_PG_GrdConfig = getObjectFactory().getConfigurationManager().getPGConfig().DG_PGOffPremises.Proposed;
					m_PricePlanPGOffPremiseProGrdObject = VistaarDG.createDynamicGrid(OffPremisePro_PG_GrdConfig, p_GridData.PG_OFF.Proposed);

				} else {
					VistaarDG.reloadDGWithData("DG_PGOffPremisesProposed", p_GridData.PG_OFF.Proposed);
				}
				if (m_PP_PG_Qualifier_OffPremise_ProGrdObject == undefined) {
					var OffPremisePro_PG_Qual_GrdConfig = getObjectFactory().getConfigurationManager().getPGQualOffPremisesProposed();
					m_PP_PG_Qualifier_OffPremise_ProGrdObject = VistaarDG.createDynamicGrid(OffPremisePro_PG_Qual_GrdConfig, p_GridData.PG_OFF.Qualifier_Proposed);
				} else {
					VistaarDG.reloadDGWithData("DG_PG_Qual_OffPreProposed", p_GridData.PG_OFF.Qualifier_Proposed);
				}
				
				/*PROMO-GOODS OFFPREMISE CURRENT GRID */
				
				VistaarExtjs.getCmp("tabFGOffPremise").setActiveTab(1);// PG Enhancement changes
				
				if (m_PricePlanPGOffPremiseCurGrdObject == undefined) {
					var OffPremiseCur_PG_GrdConfig = getObjectFactory().getConfigurationManager().getPGConfig().DG_PGOffPremises.Current;
					m_PricePlanPGOffPremiseCurGrdObject = VistaarDG.createDynamicGrid(OffPremiseCur_PG_GrdConfig, p_GridData.PG_OFF.Current);
				} else {
					VistaarDG.reloadDGWithData("DG_PGOffPremisesCurrent", p_GridData.PG_OFF.Current);
				}
				if (m_PP_PG_Qualifier_OffPremise_CurGrdObject == undefined) {
					var OffPremiseCur_PG_Qual_GrdConfig = getObjectFactory().getConfigurationManager().getPGQualOffPremisesCurrent();
					m_PP_PG_Qualifier_OffPremise_CurGrdObject = VistaarDG.createDynamicGrid(OffPremiseCur_PG_Qual_GrdConfig, p_GridData.PG_OFF.Qualifier_Current);
				} else {
					VistaarDG.reloadDGWithData("DG_PG_Qual_OffPreCurrent", p_GridData.PG_OFF.Qualifier_Current);
				}
				
				VistaarExtjs.getCmp("tabFGOffPremise").setActiveTab(0);// PG Enhancement changes
			}

			
			/* //TO SWAP TO PROPOSED */

			//Ext.resumeLayouts(true);
			if (pnlParentCard)
				pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cntPricePlanSummary"));

			 VistaarAuditingManager.audit({
			"name" : "End:Price Plan Grid Creation"
			}, m_IS_AUDIT_REQUIRED, 6101); 
			//set the edit data into grid
			/*Ext.defer(function () {
			this.updatePricePlanData();
			}, 20, this);*/
			//this.updatePricePlanData();
		} catch (err) {
			//Ext.resumeLayouts(true);
			getCommonFuncMgr().printLog(err);
		}finally{
			if(!IsIPADView)
			Ext.resumeLayouts(true);
			//this.refreshTG();
		}
	};

	// this.refreshTG=function(){
	// this.refreshTGbyid("TG_OffPremisesCurrent")
	// this.refreshTGbyid("TG_OffPremisesProposed");
	// this.refreshTGbyid("TG_OnPremisesProposed");
	// this.refreshTGbyid("TG_OnPremisesCurrent");
	// }
	// this.refreshTGbyid = function(p_TGID){
	// 	var TGObj = Ext.getCmp(p_TGID)[m_TGObject];
	// 	var TGStore = TGObj.getStore();
	// 	TGObj.getView().refresh(TGStore);
	// }
	/** Performance Enhancement***/
	this.loadTGwithData = function(p_TGID,data,gridType){
		var TGObj = Ext.getCmp(p_TGID)[gridType];
		// var TGStore = TGObj.getStore();
		//TGStore.suspendEvents();
		data.expanded = true;
		//TGStore.removeAll(true);
		//TGStore.loadRawData(data);
		TGObj.setRootNode(data);
		//TGStore.resumeEvents();
// 		TGObj.getView().refresh(TGStore);
	}
	/* this.setLatestDataFromPricePlanGridsToCloneCopy = function (p_ObjPricePlan) {
	//getSummary grid data
	p_ObjPricePlan["Price Plan"].Summary = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DGSUMMARYPROPOSED));

	//get Proposed Section data
	p_ObjPricePlan.OFF.Proposed = Ext.clone(VistaarTG.getDataFromTreeGrid(m_TGOFFPREMISESPROPOSED));
	p_ObjPricePlan.ON.Proposed = Ext.clone(VistaarTG.getDataFromTreeGrid(m_TGONPREMISESPROPOSED));
	p_ObjPricePlan.PG_ON.Proposed = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_ON_PG_PROPOSED));
	p_ObjPricePlan.PG_OFF.Proposed = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_OFF_PG_PROPOSED));
	p_ObjPricePlan.PG_ON.Qualifier_Proposed = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_ON_PG_QUALIFIER_PROPOSED));
	p_ObjPricePlan.PG_OFF.Qualifier_Proposed = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_OFF_PG_QUALIFIER_PROPOSED));

	//get Current Section data
	p_ObjPricePlan.OFF.Current = Ext.clone(VistaarTG.getDataFromTreeGrid(m_TGOFFPREMISESCURRENT));
	p_ObjPricePlan.ON.Current = Ext.clone(VistaarTG.getDataFromTreeGrid(m_TGONPREMISESCURRENT));
	p_ObjPricePlan.PG_ON.Current = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_ON_PG_CURRENT));
	p_ObjPricePlan.PG_OFF.Current = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_OFF_PG_CURRENT));
	p_ObjPricePlan.PG_ON.Qualifier_Current = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_ON_PG_QUALIFIER_CURRENT));
	p_ObjPricePlan.PG_OFF.Qualifier_Current = Ext.clone(VistaarDG.getDataFromDynamicGrid(m_DG_OFF_PG_QUALIFIER_CURRENT));
	} */

	//Purpose:Set PricePlan Header(NETFOB)
	this.setPricePlanHeaderInfo = function (p_obj_SummaryNetFOBProposedRow, p_obj_SummaryVolumeProposed, p_blnLoadStore) {
		try {

			if (Ext.os.deviceType == "Phone" || Ext.os.deviceType == "Tablet") {
				if (!p_blnLoadStore) {
				if(p_obj_SummaryNetFOBProposedRow!=undefined){
				for (var l_indexHeaderLabel in m_arrProposedNetFOB[1]) {
					if (m_arrProposedNetFOB[1][l_indexHeaderLabel]["header"] == "NetFOB") {
						for (var l_indexNetFOB in m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"]) {
							m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexNetFOB].statistics = Ext.util.Format.number(p_obj_SummaryNetFOBProposedRow[m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexNetFOB].key], getCommonFuncMgr().CurrencyFormat.Currency);
						}
					} else {
						for (var l_indexVolume in m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"]) {
							m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexVolume].statistics = Ext.util.Format.number(p_obj_SummaryVolumeProposed[m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexVolume].key], getCommonFuncMgr().CurrencyFormat.Currency);
						}
					}
					//m_arrProposedNetFOB[0][l_indexHeaderLabel].statistics = "";

					}
				}
				else
				{
					for (var l_indexHeaderLabel in m_arrProposedNetFOB[1]) {
						if (m_arrProposedNetFOB[1][l_indexHeaderLabel]["header"] == "NetFOB") {
							for (var l_indexNetFOB in m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"]) {
								m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexNetFOB].statistics = "";
							}
						} else {
							for (var l_indexVolume in m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"]) {
								m_arrProposedNetFOB[1][l_indexHeaderLabel]["KPI"][l_indexVolume].statistics = "";
							}
						}
						//m_arrProposedNetFOB[0][l_indexHeaderLabel].statistics = "";
					}
				}
				}
				Ext.getStore('ProposedNetFOB').loadData(m_arrProposedNetFOB[1]);
			} else {
				if (!p_blnLoadStore) {
				if (p_obj_SummaryNetFOBProposedRow == undefined) {
					for (var l_indexHeaderLabel in m_arrProposedNetFOB[0]) {
						m_arrProposedNetFOB[0][l_indexHeaderLabel].statistics = "";
					}
				} else {
					for (var l_indexHeaderLabel in m_arrProposedNetFOB[0]) {
						if (m_arrProposedNetFOB[0].length - 1 != l_indexHeaderLabel) {
							m_arrProposedNetFOB[0][l_indexHeaderLabel].statistics = Ext.util.Format.number(p_obj_SummaryNetFOBProposedRow[m_arrProposedNetFOB[0][l_indexHeaderLabel].key], getCommonFuncMgr().CurrencyFormat.Currency);
						} else {
							m_arrProposedNetFOB[0][l_indexHeaderLabel].statistics = Ext.util.Format.number(p_obj_SummaryVolumeProposed[m_arrProposedNetFOB[0][l_indexHeaderLabel].key], getCommonFuncMgr().CurrencyFormat.Currency);
							}
						}
					}
				}
				Ext.getStore('ProposedNetFOB').loadData(m_arrProposedNetFOB[0]);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.updatePricePlanData = function () {
		try {

			if (m_arrGridEditRecord.length > 0) {
				for (var key in m_arrGridEditRecord) {
					var TreeGridId;
					var rowIndex = 0;
					if (m_arrGridEditRecord[key]["Variable Attributes"].Channels === "ON") {
						TreeGridId = "TG_OnPremisesProposed";
					} else {
						TreeGridId = "TG_OffPremisesProposed";
					}
					var l_arrGridData = Ext.getCmp(TreeGridId).TGObj.getStore().getData();
					for (var l_rowIdx in l_arrGridData.items) {
						if (l_arrGridData.items[l_rowIdx].data.DealID != undefined) {
							if (l_arrGridData.items[l_rowIdx].data.DealID === m_arrGridEditRecord[key]["Variable Attributes"].DealID) {
								rowIndex = l_rowIdx;
								break;
							}
						}
					}
					for (var editField in m_arrGridEditRecord[key]["Values"]) {
						if (rowIndex === 0) {
							Ext.getCmp(TreeGridId).TGObj.getStore().getData().getAt(rowIndex).set(editField, m_arrGridEditRecord[key]["Values"][editField]);
						} else {
							Ext.getCmp(TreeGridId).TGObj.getStore().getData().getAt(rowIndex).set(editField, (m_arrGridEditRecord[key]["Values"][editField]) * 100);
						}
					}
				}
				this.calculateOffPremisesGrid();
				this.calculateOnPremisesGrid();
				this.calculateSummaryGrid();
				getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.validateedit = function (editor, e) {
		try {
			var l_orignalValue = Ext.clone(e.originalValue);
			var l_eValue = Ext.clone(e.value);
			if (l_eValue === null || l_eValue === 0) {}
			else {
				l_orignalValue = Math_toFixedTo(l_orignalValue, 2);
				l_eValue = Math_toFixedTo(l_eValue, 2);
				if (l_orignalValue == l_eValue) {
					e.cancel = true;
				}
			}

		} catch (l_objException) {
			getCommonFuncMgr().printLog(JSON.stringify(l_objException), 3);
		}
	};

	this.onCellEditingBeforeEdit = function (editor, e, eOpts) {
		try {
			/*if (!Ext.getCmp("menu_PricePlan_Context").isVisible()) {
			if ((e.record.data.children != null || e.record.data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) && (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data.EditableFrom))) {
			if (e.record.data["Deleted Deal"]) {
			if (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data["Deleted Time"])) {
			return false
			}
			} else if (e.record.data.EditableFrom === "") {
			return false;
			} else {
			return true;
			}
			}
			} else {
			return false;
			}*/
			/**Commenting the above code as its not working properly**/
			//if (!getCommonFuncMgr().isNonDeskTopView() && getCommonFuncMgr().m_PP_PG_Effectivity[e.field]) {
			if (getCommonFuncMgr().m_PP_PG_Effectivity[e.field]) {
				if (e.record.data.children != null && (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(getCommonFuncMgr().m_PP_EditableFrom))) {

					if (e.record.data["Deleted Deal"]) {
						if (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data["Deleted Time"])) {
							return false
						}
					} else if (getCommonFuncMgr().m_PP_EditableFrom === "") {
						return false;
					} else {
						return true;
					}
				} else if (e.record.data.MetricsType == m_PricePlanCodeNameMapping["Volume"] && (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data.EditableFrom))) {

					if (e.record.data["Deleted Deal"]) {
						if (m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data["Deleted Time"])) {
							return false
						}
					} else if (e.record.data.EditableFrom === "") {
						return false;
					} else {
						return true;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onCellEditingEditOnPremises = function (editor, e, eOpts) {
		try {
			if (e.value !== e.originalValue) {
				//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
					this.CallCellEditingEditOnPremises(e);
				}, 1, getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager());

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.CallCellEditingEditOnPremises = function (e) {
		try {
			var l_strChannelType = "ON";
			if (!(e.originalValue === "" && e.value === null)) {
				if (e.value !== e.originalValue) {

					var l_objEditedKeyValue = {};
					//adding
					l_objEditedKeyValue[e.field] = e.value;
					//IT# 818 :If planed DealMix is zero store it as null.
					// Deal-Mix percentage changes ----- Consider 0% as Null value
					if (e.record.data.MetricsType != "Volume" && e.value === 0) {
						//Set Deal-Mix percentage as null...
						e.record.set(e.field, null);
						l_objEditedKeyValue[e.field] = null;
					}
					this.calculateOnPremisesGrid(e);
					if (e.record.data.MetricsType != m_PricePlanCodeNameMapping["Volume"]) {
						this.addUpdatedData(l_objEditedKeyValue, l_strChannelType, e.record.get(m_PricePlanCodeNameMapping["DealID"]));
					} else {
						this.addUpdatedData(l_objEditedKeyValue, l_strChannelType, null, "Values");
						if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
							this.calculatePromoGoodChanges(e.record.data.MetricsType, e.field, l_strChannelType, e);
						}
					}

					this.calculateSummaryGrid(e);
				}
			}
			//	getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onCellEditingEditOffPremises = function (editor, e, eOpts) {
		try {

			if (e.value !== e.originalValue) {
				//getPricePlanControllerManagerObj().setPricePlanViewWaitCursor();
				Ext.defer(function () {
					this.CallCellEditingEditOffPremises(e);
				}, 1, getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager());
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.CallCellEditingEditOffPremises = function (e) {
		try {
			var l_strChannelType = "OFF";
			if (!(e.originalValue === "" && e.value === null)) {
				if (e.value !== e.originalValue) {
					var l_objEditedKeyValue = {};
					l_objEditedKeyValue[e.field] = e.value;
					//IT# 818 :If planed DealMix is zero store it as null.
					// Deal-Mix percentage changes ----- Consider 0% as Null value
					if (e.record.data.MetricsType != "Volume" && e.value === 0) {
						//Set Deal-Mix percentage as null...
						e.record.set(e.field, null);
						l_objEditedKeyValue[e.field] = null;
					}
					this.calculateOffPremisesGrid(e);

					if (e.record.data.MetricsType != "Volume") {
						this.addUpdatedData(l_objEditedKeyValue, l_strChannelType, e.record.get(m_PricePlanCodeNameMapping["DealID"]));

					} else {
						this.addUpdatedData(l_objEditedKeyValue, l_strChannelType, null, "Values");
						if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
							this.calculatePromoGoodChanges(e.record.data.MetricsType, e.field, l_strChannelType, e);
						}
					}

					this.calculateSummaryGrid(e);
				}
			}
			//getPricePlanControllerManagerObj().setPricePlanViewDefaultCursor();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateSummaryGrid = function (e) {
		try {

			var l_objSummaryProObj = Ext.getCmp([m_DGSUMMARYPROPOSED])[m_DGObject];
			var l_storeSummaryPro = l_objSummaryProObj.getStore();
			var l_dataSummaryPro = l_storeSummaryPro.data;

			var l_objOffPro = Ext.getCmp([m_TGOFFPREMISESPROPOSED])[m_TGObject];
			var l_storeOffPro = l_objOffPro.getStore();
			var l_dataOffproposed = l_storeOffPro.data;

			var l_objOnPro = Ext.getCmp([m_TGONPREMISESPROPOSED])[m_TGObject];
			var l_storeOnPro = l_objOnPro.getStore();
			var l_dataOnproposed = l_storeOnPro.data;

			var l_rowIdxSeasonality;
			var l_rowIdxVolPriorYear;
			var l_rowIdxVolCurrentYear;
			var l_rowIdxVolProposedYear;

			var l_rowIdxNetFob;
			var l_rowIdxNetFobOffPremise;
			var l_rowIdxNetFobOnPremise;

			var l_rowIdxOffVolumeOffPremises;
			var l_rowIdxTotPerBuisnessOffPremises;

			var l_rowIdxOnVolumeOnPremises;
			var l_rowIdxTotPerBuisnessOnPremises;

			var l_rowIdxAlloCostPreCase;
			var l_rowIdxAlloCostPreCaseOff;
			var l_rowIdxAlloCostPreCaseOn;

			var l_rowIdxNetFobExclusivePromo;
			var l_rowIdxNetFobExclusivePromoOff;
			var l_rowIdxNetFobExclusivePromoOn;
			//getRowindex
			/*	l_rowIdxSeasonality = l_storeSummaryPro.find("MetricsType", "Seasonality");
			l_rowIdxVolPriorYear = l_storeSummaryPro.find("YearType", "Prior");
			l_rowIdxVolCurrentYear = l_storeSummaryPro.find("YearType", "Current");
			l_rowIdxVolProposedYear = l_storeSummaryPro.find("YearType", "Future");
			l_rowIdxNetFob = l_storeSummaryPro.find("Metrics", "Net FOB");
			l_rowIdxNetFobOffPremise = l_storeSummaryPro.find("Metrics", "Off Premise Net FOB");
			l_rowIdxNetFobOnPremise = l_storeSummaryPro.find("Metrics", "On Premise Net FOB");*/

			for (var l_rowIdx in l_dataSummaryPro.items) {
				if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "Seasonality" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxSeasonality = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "Future" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxVolPriorYear = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "Current" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxVolCurrentYear = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "Prior" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxVolProposedYear = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromo = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_OFF_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromoOff = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_ON_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromoOn = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCase = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_OFF_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCaseOff = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_ON_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCaseOn = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFob = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "OffPremiseNetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobOffPremise = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "OnPremiseNetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobOnPremise = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_RAB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxRABExclusivePromo = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_OFF_RAB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxRABExclusivePromoOff = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_ON_RAB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxRABExclusivePromoOn = l_rowIdx
				}
			}

			//getRowindex
			for (var l_rowIdx in l_dataOffproposed.items) {
				if (l_dataOffproposed.items[l_rowIdx].data.MetricsType != undefined) {
					if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
						l_rowIdxOffVolumeOffPremises = l_rowIdx;
					} else if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
						l_rowIdxTotPerBuisnessOffPremises = l_rowIdx;
					}
				}
			}

			//getRowindex
			for (var l_rowIdx in l_dataOnproposed.items) {
				if (l_dataOnproposed.items[l_rowIdx].data.MetricsType != undefined) {
					if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
						l_rowIdxOnVolumeOnPremises = l_rowIdx;
					} else if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
						l_rowIdxTotPerBuisnessOnPremises = l_rowIdx;
					}
				}
			}
			if (e == undefined) {
				//CALCULATE TOTAL VOLUME (CURRENT)
				this.calculateCurrentVolumeSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises);

				//CALCULATE SEASONALITY
				this.calculateSeasonalitySummaryGrid(l_dataSummaryPro, l_rowIdxSeasonality, l_rowIdxVolCurrentYear);

				//CALCULATE OFF PREMISES NET FOB EXCLUSIVE
				if (l_dataOffproposed.length > 0)
					this.calculateOffPremisesNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_rowIdxNetFobExclusivePromoOff, l_rowIdxOffVolumeOffPremises);

				//CALCULATE ON PREMISES NET FOB EXCLUSIVE
				if (l_dataOnproposed.length > 0)
					this.calculateOnPremisesNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOnproposed, l_rowIdxNetFobExclusivePromoOn, l_rowIdxOnVolumeOnPremises);

				//CALCULATE NETFOB EXCLUSIVE
				this.calculateNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxNetFobExclusivePromo, l_rowIdxNetFobExclusivePromoOff, l_rowIdxNetFobExclusivePromoOn, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises);

				//TO CALCULATE ALLOCATION COST PER CASE
				if (!Ext.getCmp("btn_PP_PromoGoods").isDisabled() && Ext.getCmp("btn_PP_PromoGoods").pressed) {
					this.calculatePGAllocationCostSummaryGrid();
				}

				//CALCULATE NET FOB  ................
				this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFob, l_rowIdxNetFobExclusivePromo, l_rowIdxAlloCostPreCase, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data);

				//CALCULATE NET FOB  OFF................
				if (l_dataOffproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFobOffPremise, l_rowIdxNetFobExclusivePromoOff, l_rowIdxAlloCostPreCaseOff, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);

				//CALCULATE NET FOB  ON................
				if (l_dataOnproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFobOnPremise, l_rowIdxNetFobExclusivePromoOn, l_rowIdxAlloCostPreCaseOn, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);

				//CALCULATE OFF PREMISES RAB EXCLUSIVE
				if (l_dataOffproposed.length > 0)
					this.calculateOffPremisesRABExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_rowIdxRABExclusivePromoOff, l_rowIdxOffVolumeOffPremises);

				//CALCULATE ON PREMISES RAB EXCLUSIVE
				if (l_dataOnproposed.length > 0)
					this.calculateOnPremisesRABExclusiveSummaryGrid(l_dataSummaryPro, l_dataOnproposed, l_rowIdxRABExclusivePromoOn, l_rowIdxOnVolumeOnPremises);

				//CALCULATE RAB EXCLUSIVE
				this.calculateRABExclusive(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxRABExclusivePromo, l_rowIdxRABExclusivePromoOff, l_rowIdxRABExclusivePromoOn, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises);

				
							
				//CALCULATE RAB  ................
				this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromo, l_rowIdxRABExclusivePromo, l_rowIdxAlloCostPreCase, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data);

				
				//CALCULATE RAB  OFF................
				if (l_dataOffproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromoOff, l_rowIdxRABExclusivePromoOff, l_rowIdxAlloCostPreCaseOff, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);

				
				//CALCULATE RAB  ON................
				if (l_dataOnproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromoOn, l_rowIdxRABExclusivePromoOn, l_rowIdxAlloCostPreCaseOn, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);

				this.setPricePlanHeaderInfo(l_dataSummaryPro.items[l_rowIdxNetFob].data, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data);
			} else if (e != undefined) {
				if (e.record.data.MetricsType == "Volume") {
					//CALCULATE TOTALVOLUME (CURRENT)
					this.calculateCurrentVolumeSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises, e);

					//CALCULATE SEASONALITY
					this.calculateSeasonalitySummaryGrid(l_dataSummaryPro, l_rowIdxSeasonality, l_rowIdxVolCurrentYear);
				}

				//CALCULATE OFF PREMISES NET FOB
				if (l_dataOffproposed.length > 0)
					this.calculateOffPremisesNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_rowIdxNetFobExclusivePromoOff, l_rowIdxOffVolumeOffPremises, e);

				//CALCULATE ON PREMISES NET FOB
				if (l_dataOnproposed.length > 0)
					this.calculateOnPremisesNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOnproposed, l_rowIdxNetFobExclusivePromoOn, l_rowIdxOnVolumeOnPremises, e);

				//CALCULATE NETFOB
				this.calculateNetFOBExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxNetFobExclusivePromo, l_rowIdxNetFobExclusivePromoOff, l_rowIdxNetFobExclusivePromoOn, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises, e);

				//TO CALCULATE ALLOCATION COST PER CASE
				if (!Ext.getCmp("btn_PP_PromoGoods").isDisabled() && Ext.getCmp("btn_PP_PromoGoods").pressed) {
					this.calculatePGAllocationCostSummaryGrid(e);
				}
				//CALCULATE NET FOB  OFF................
				if (l_dataOffproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFobOffPremise, l_rowIdxNetFobExclusivePromoOff, l_rowIdxAlloCostPreCaseOff, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data, e);

				//CALCULATE NET FOB  ON................
				if (l_dataOnproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFobOnPremise, l_rowIdxNetFobExclusivePromoOn, l_rowIdxAlloCostPreCaseOn, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data, e);

				this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxNetFob, l_rowIdxNetFobExclusivePromo, l_rowIdxAlloCostPreCase, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data, e);

				//CALCULATE OFF PREMISES RAB EXCLUSIVE
				if (l_dataOffproposed.length > 0)
					this.calculateOffPremisesRABExclusiveSummaryGrid(l_dataSummaryPro, l_dataOffproposed, l_rowIdxRABExclusivePromoOff, l_rowIdxOffVolumeOffPremises, e);

				//CALCULATE ON PREMISES RAB EXCLUSIVE
				if (l_dataOnproposed.length > 0)
					this.calculateOnPremisesRABExclusiveSummaryGrid(l_dataSummaryPro, l_dataOnproposed, l_rowIdxRABExclusivePromoOn, l_rowIdxOnVolumeOnPremises, e);

				//CALCULATE RAB EXCLUSIVE
				this.calculateRABExclusive(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxRABExclusivePromo, l_rowIdxRABExclusivePromoOff, l_rowIdxRABExclusivePromoOn, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises, e);

				
				//CALCULATE RAB  ................
				this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromo, l_rowIdxRABExclusivePromo, l_rowIdxAlloCostPreCase, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data,e);

				
				//CALCULATE RAB  OFF................
				if (l_dataOffproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromoOff, l_rowIdxRABExclusivePromoOff, l_rowIdxAlloCostPreCaseOff, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data,e);

				
				//CALCULATE RAB  ON................
				if (l_dataOnproposed.length > 0)
					this.calculateNetFOB_RABInclusive(l_dataSummaryPro, l_rowIdxRABExclusivePromoOn, l_rowIdxRABExclusivePromoOn, l_rowIdxAlloCostPreCaseOn, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data,e);
		
		
				this.setPricePlanHeaderInfo(l_dataSummaryPro.items[l_rowIdxNetFob].data, l_dataSummaryPro.items[l_rowIdxVolCurrentYear].data);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateCurrentVolumeSummaryGrid = function (pdataSummary, pdataOffPremises, pdataOnPremises, prowIdxCurVol, prowIdxOffVolumeOffPremises, prowIdxOnVolumeOnPremises, e) {
		try {

			if (e == undefined) {
				for (var l_Month in m_arrMonths) {
					var tempTotVolume = 0;
					var tempOffVolumeOffPremises = 0;
					var tempOnVolumeOnPremises = 0;
					var blnUpdateZero = false;

					//get OffPremises volume
					if (pdataOffPremises.items[prowIdxOffVolumeOffPremises] != undefined) {
						tempOffVolumeOffPremises = this.ValidateNumberReturnZero(pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[m_arrMonths[l_Month]]);
						if (pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[m_arrMonths[l_Month]] == 0)
							blnUpdateZero = true;
					}

					//get OnPremises volume
					if (pdataOnPremises.items[prowIdxOnVolumeOnPremises] != undefined) {
						tempOnVolumeOnPremises = this.ValidateNumberReturnZero(pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[m_arrMonths[l_Month]]);
						if (pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[m_arrMonths[l_Month]] == 0)
							blnUpdateZero = true;

					}

					tempTotVolume = tempOffVolumeOffPremises + tempOnVolumeOnPremises;

					if (!blnUpdateZero && tempTotVolume == 0) {
						tempTotVolume = "";
					}
					pdataSummary.items[prowIdxCurVol].set(m_arrMonths[l_Month], tempTotVolume);
				}

				//calculate totals pdataSummary Grid
				var l_totals = this.calculateSumTotals(pdataSummary.items[prowIdxCurVol].data);
				pdataSummary.items[prowIdxCurVol].set("FY", l_totals.FY);
				pdataSummary.items[prowIdxCurVol].set("YTD", l_totals.YTD);
				pdataSummary.items[prowIdxCurVol].set("4MTHS", l_totals.FMTHS);
				pdataSummary.items[prowIdxCurVol].set("FYvsPY", l_totals.FYvsPY);

			} else if (e != undefined) {
				var tempTotVolume = 0;
				var tempOffVolumeOffPremises = 0;
				var tempOnVolumeOnPremises = 0;
				if (e.record.data.MetricsType != undefined) {
					if (e.record.data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
						//get OffPremises volume
						if (pdataOffPremises.items[prowIdxOffVolumeOffPremises] != undefined)
							tempOffVolumeOffPremises = this.ValidateNumberReturnZero(pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[e.field]);

						//get OnPremises volume
						if (pdataOnPremises.items[prowIdxOnVolumeOnPremises] != undefined)
							tempOnVolumeOnPremises = this.ValidateNumberReturnZero(pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[e.field]);

						tempTotVolume = tempOffVolumeOffPremises + tempOnVolumeOnPremises;
						pdataSummary.items[prowIdxCurVol].set(e.field, tempTotVolume);

					}

					//calculate totals pdataSummary Grid
					var l_totals = this.calculateSumTotals(pdataSummary.items[prowIdxCurVol].data);
					pdataSummary.items[prowIdxCurVol].set("FY", l_totals.FY);
					pdataSummary.items[prowIdxCurVol].set("YTD", l_totals.YTD);
					pdataSummary.items[prowIdxCurVol].set("4MTHS", l_totals.FMTHS);
					pdataSummary.items[prowIdxCurVol].set("FYvsPY", l_totals.FYvsPY);

				}

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateSeasonalitySummaryGrid = function (pdataSummaryPro, prowIdxSeasonality, prowIdxCurVol, e) {
		try {

			if (e == undefined) {
				//calculate Seasonality
				for (var l_Month in m_arrMonths) {
					var l_fy = pdataSummaryPro.items[prowIdxCurVol].data["FY"];
					var temp_seasonality = (pdataSummaryPro.items[prowIdxCurVol].data[m_arrMonths[l_Month]] / l_fy) * 100;
					temp_seasonality = this.ValidateNumberReturnBlank(temp_seasonality);
					pdataSummaryPro.items[prowIdxSeasonality].set(m_arrMonths[l_Month], temp_seasonality);
				}
			} else if (e != undefined) {
				var l_fy = pdataSummaryPro.items[prowIdxCurVol].data["FY"];
				var temp_seasonality = (pdataSummaryPro.items[prowIdxCurVol].data[e.field] / l_fy) * 100;
				temp_seasonality = this.ValidateNumberReturnBlank(temp_seasonality);
				pdataSummaryPro.items[prowIdxSeasonality].set(e.field, temp_seasonality);
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateNetFOBExclusiveSummaryGrid = function (pdataSummary, pdataOffPremises, pdataOnPremises, prowIdxVolCurrentYear, prowIdxNetFob, prowIdxNetFobOffPremise, prowIdxNetFobOnPremises, prowIdxOffVolumeOffPremises, prowIdxOnVolumeOnPremises, e) {
		try {
			if (e == undefined) {
				//calculate net fob pdataSummary grid
				for (var l_Month in m_arrMonths) {
					var l_tempnetfob = 0;
					var l_tempNetFobOffPremise = 0;
					var l_tempOffVolumeOffPremises = 0;
					var l_tempNetFobOnPremises = 0;
					var l_tempOnVolumeOnPremises = 0;

					if (pdataOffPremises.length > 0) {
						l_tempNetFobOffPremise = pdataSummary.items[prowIdxNetFobOffPremise].data[m_arrMonths[l_Month]];
						l_tempOffVolumeOffPremises = pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[m_arrMonths[l_Month]];
					}

					if (pdataOnPremises.length > 0) {
						l_tempNetFobOnPremises = pdataSummary.items[prowIdxNetFobOnPremises].data[m_arrMonths[l_Month]];
						l_tempOnVolumeOnPremises = pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[m_arrMonths[l_Month]];
					}
					l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempNetFobOffPremise, l_tempOffVolumeOffPremises, l_tempNetFobOnPremises, l_tempOnVolumeOnPremises);

					pdataSummary.items[prowIdxNetFob].set(m_arrMonths[l_Month], l_tempnetfob);
				}

				//get Totals (NetFOb) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFob].data, pdataSummary.items[prowIdxVolCurrentYear].data);

				pdataSummary.items[prowIdxNetFob].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFob].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFob].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFob].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {

				//calculate net fob pdataSummary grid
				var l_tempnetfob = 0;
				var l_tempNetFobOffPremise = 0;
				var l_tempOffVolumeOffPremises = 0;
				var l_tempNetFobOnPremises = 0;
				var l_tempOffVolumeOnPremises = 0;

				if (pdataOffPremises.length > 0) {
					l_tempNetFobOffPremise = pdataSummary.items[prowIdxNetFobOffPremise].data[e.field];
					l_tempOffVolumeOffPremises = pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[e.field];
				}

				if (pdataOnPremises.length > 0) {
					l_tempNetFobOnPremises = pdataSummary.items[prowIdxNetFobOnPremises].data[e.field];
					l_tempOffVolumeOnPremises = pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[e.field];
				}
				l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempNetFobOffPremise, l_tempOffVolumeOffPremises, l_tempNetFobOnPremises, l_tempOffVolumeOnPremises);

				pdataSummary.items[prowIdxNetFob].set(e.field, l_tempnetfob);

				//get Totals (NetFOb) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFob].data, pdataSummary.items[prowIdxVolCurrentYear].data);

				pdataSummary.items[prowIdxNetFob].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFob].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFob].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFob].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateOffPremisesNetFOBExclusiveSummaryGrid = function (pdataSummary, pdataOffPremises, prowIdxNetFobOffPremises, prowIdxOffVolumeOffPremises, e) {
		try {
			/** ET# 777 : Added PG vol-mix percentage in Calculation **/
			var l_idx_PromoGoodDeal,
			l_idx_FrontlineDeal,
			l_idx_Fact_NetFOB;
			if (e == undefined) {
				for (var l_Month in m_arrMonths) {
					l_idx_PromoGoodDeal = -1;
					l_idx_FrontlineDeal = -1;
					var tempvalue = 0;
					for (var rowIdxOffProData in pdataOffPremises.items) {
						if (pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {

							if (pdataOffPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
								// PG deal row index....
								l_idx_PromoGoodDeal = rowIdxOffProData;
							}
							var tempnet = 0;
							if (this.ValidateNumberReturnBlank(pdataOffPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]) == "") {
								tempnet = 0;
							} else {
								tempnet = parseFloat(pdataOffPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]);
							}
							tempnet = tempnet / 100;
							for (var l_facts in pdataOffPremises.items[rowIdxOffProData].data.children) {
								if (pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["Net_FOB"]) {

									if (pdataOffPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
										//  FL deal row index...
										l_idx_Fact_NetFOB = l_facts;
										l_idx_FrontlineDeal = rowIdxOffProData;
									}
									tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[rowIdxOffProData].data.children[l_facts][m_arrMonths[l_Month]]));
									break;

								}
							}
						}

					}
					//Add PG deal mix Percentage data in Weighted Average NetFOB
					if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]]) != "") {
						tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_NetFOB][m_arrMonths[l_Month]]));
					}
					pdataSummary.items[prowIdxNetFobOffPremises].set(m_arrMonths[l_Month], tempvalue);

				}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFobOffPremises].data, pdataOffPremises.items[prowIdxOffVolumeOffPremises].data);

				pdataSummary.items[prowIdxNetFobOffPremises].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFobOffPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFobOffPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFobOffPremises].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {
				//if (e.record.data.children.length > 0) {
				var tempvalue = 0;
				l_idx_PromoGoodDeal = -1;
				l_idx_FrontlineDeal = -1;
				for (var rowIdxOffProData in pdataOffPremises.items) {
					if (pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
						if (pdataOffPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
							// PG deal row index....
							l_idx_PromoGoodDeal = rowIdxOffProData;
						}
						var tempnet = 0;
						if (this.ValidateNumberReturnBlank(pdataOffPremises.items[rowIdxOffProData].data[e.field]) == "") {
							tempnet = 0;
						} else {
							tempnet = parseFloat(pdataOffPremises.items[rowIdxOffProData].data[e.field]);
						}

						tempnet = tempnet / 100;
						for (var l_facts in pdataOffPremises.items[rowIdxOffProData].data.children) {
							if (pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["Net_FOB"]) {
								if (pdataOffPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
									//  FL deal row index...
									l_idx_Fact_NetFOB = l_facts;
									l_idx_FrontlineDeal = rowIdxOffProData;
								}
								tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[rowIdxOffProData].data.children[l_facts][e.field]));
								break;
							}
						}
					}
				}
				//Add PG deal mix Percentage data in Weighted Average NetFOB
				if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[e.field]) != "") {
					tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[e.field])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_NetFOB][e.field]));
				}

				VistaarAuditingManager.audit({
					"name" : "UIProcessing initialize Set Summary Grid NetFob OFF Premises"
				}, true, 400);

				//pdataSummary.items[prowIdxNetFobOffPremises].beginEdit();
				pdataSummary.items[prowIdxNetFobOffPremises].set(e.field, tempvalue);
				//pdataSummary.items[prowIdxNetFobOffPremises].endEdit();

				VistaarAuditingManager.audit({
					"name" : "UIProcessing end Set Summary Grid NetFob OFF Premises"
				}, true, 400);

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFobOffPremises].data, pdataOffPremises.items[prowIdxOffVolumeOffPremises].data);

				VistaarAuditingManager.audit({
					"name" : "UIProcessing initialize Set Summary Grid NetFob OFF Premises FY"
				}, true, 402);
				pdataSummary.items[prowIdxNetFobOffPremises].set("FY", l_weightedAvg.FY);

				VistaarAuditingManager.audit({
					"name" : "UIProcessing end Set Summary Grid NetFob OFF Premises FY"
				}, true, 402);

				pdataSummary.items[prowIdxNetFobOffPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFobOffPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFobOffPremises].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateOnPremisesNetFOBExclusiveSummaryGrid = function (pdataSummary, pdataOnPremises, prowIdxNetFobOnPremises, prowIdxOnVolumeOnPremises, e) {
		try {
			/** ET# 777 : Added PG vol-mix percentage in Calculation **/
			var l_idx_PromoGoodDeal,
			l_idx_FrontlineDeal,
			l_idx_Fact_NetFOB;
			if (e == undefined) {
				for (var l_Month in m_arrMonths) {
					var tempvalue = 0;
					l_idx_PromoGoodDeal = -1;
					l_idx_FrontlineDeal = -1;
					for (var rowIdxOffProData in pdataOnPremises.items) {
						if (pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							if (pdataOnPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
								// PG deal row index....
								l_idx_PromoGoodDeal = rowIdxOffProData;
							}
							var tempnet = 0;
							if (this.ValidateNumberReturnBlank(pdataOnPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]) == "") {
								tempnet = 0;
							} else {
								tempnet = parseFloat(pdataOnPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]);
							}
							tempnet = tempnet / 100;
							for (var l_facts in pdataOnPremises.items[rowIdxOffProData].data.children) {
								if (pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["Net_FOB"]) {
									if (pdataOnPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
										//  FL deal row index...
										l_idx_Fact_NetFOB = l_facts;
										l_idx_FrontlineDeal = rowIdxOffProData;
									}
									tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[rowIdxOffProData].data.children[l_facts][m_arrMonths[l_Month]]));
									break;

								}
							}
						}
					}
					//Add PG deal mix Percentage data in Weighted Average NetFOB
					if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]]) != "") {
						tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_NetFOB][m_arrMonths[l_Month]]));
					}
					pdataSummary.items[prowIdxNetFobOnPremises].set(m_arrMonths[l_Month], tempvalue)
				}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFobOnPremises].data, pdataOnPremises.items[prowIdxOnVolumeOnPremises].data);

				pdataSummary.items[prowIdxNetFobOnPremises].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFobOnPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFobOnPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFobOnPremises].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {
				//if (e.record.data.children.length > 0) {
				var tempvalue = 0;
				l_idx_PromoGoodDeal = -1;
				l_idx_FrontlineDeal = -1;
				for (var rowIdxOffProData in pdataOnPremises.items) {
					if (pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
						if (pdataOnPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
							// PG deal row index....
							l_idx_PromoGoodDeal = rowIdxOffProData;
						}
						var tempnet = 0;
						if (this.ValidateNumberReturnBlank(pdataOnPremises.items[rowIdxOffProData].data[e.field]) == "") {
							tempnet = 0;
						} else {
							tempnet = parseFloat(pdataOnPremises.items[rowIdxOffProData].data[e.field]);
						}
						tempnet = tempnet / 100;
						for (var l_facts in pdataOnPremises.items[rowIdxOffProData].data.children) {
							if (pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["Net_FOB"]) {
								if (pdataOnPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
									//  FL deal row index...
									l_idx_Fact_NetFOB = l_facts;
									l_idx_FrontlineDeal = rowIdxOffProData;
								}
								tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[rowIdxOffProData].data.children[l_facts][e.field]));
								break;
							}
						}
					}
				}
				//Add PG deal mix Percentage data in Weighted Average NetFOB
				if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[e.field]) != "") {
					tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[e.field])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_NetFOB][e.field]));
				}
				pdataSummary.items[prowIdxNetFobOnPremises].set(e.field, tempvalue);
				//}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFobOnPremises].data, pdataOnPremises.items[prowIdxOnVolumeOnPremises].data);

				pdataSummary.items[prowIdxNetFobOnPremises].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFobOnPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFobOnPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFobOnPremises].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//calculation on  "off" premises
	this.calculateOffPremisesGrid = function (e) {
		try {

			var l_objOffPro = Ext.getCmp([m_TGOFFPREMISESPROPOSED])[m_TGObject];
			var l_storeOffPro = l_objOffPro.getStore();
			var l_dataOffproposed = l_storeOffPro.data;

			var l_rowIdxOffVolumeOffPremises;
			var l_rowIdxTotPerBuisnessOffPremises;

			if (l_dataOffproposed.length > 0) {

				for (var l_rowIdx in l_dataOffproposed.items) {
					if (l_dataOffproposed.items[l_rowIdx].data.MetricsType != undefined) {
						if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
							l_rowIdxOffVolumeOffPremises = l_rowIdx;
						} else if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
							l_rowIdxTotPerBuisnessOffPremises = l_rowIdx;
						}
					}
				}

				if (e == undefined) {
					for (var l_record in l_dataOffproposed.items) {

						if (l_dataOffproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && l_dataOffproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							if (l_dataOffproposed.items[l_record].data.children != null && l_dataOffproposed.items[l_record].data.children != undefined && l_dataOffproposed.items[l_record].data.children != "") {
								if (l_dataOffproposed.items[l_record].data.children.length > 0) {
									var l_weightedAvg = this.calculateWeightedAverageTotals(
											l_dataOffproposed.items[l_record].data, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);
									l_dataOffproposed.items[l_record].set("FY", l_weightedAvg.FY);
									l_dataOffproposed.items[l_record].set("YTD", l_weightedAvg.YTD);
									l_dataOffproposed.items[l_record].set("4MTHS", l_weightedAvg.FMTHS);
								}
							}
						}
					}
					//calculate total percentage of business
					this.calculateTotalPercentageBuisness(l_dataOffproposed, l_rowIdxTotPerBuisnessOffPremises);

					//calculate totals(volume) offPremises
					var l_totals = this.calculateSumTotals(l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);
					l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("FY", l_totals.FY);
					l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("YTD", l_totals.YTD);
					l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("4MTHS", l_totals.FMTHS);
					l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("FYvsPY", l_totals.FYvsPY);

				} else if (e != undefined) {

					if (e.record.data.MetricsType == "Volume") {
						for (var l_record in l_dataOffproposed.items) {
							if (l_dataOffproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && l_dataOffproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
								if (l_dataOffproposed.items[l_record].data.children != null && l_dataOffproposed.items[l_record].data.children != undefined && l_dataOffproposed.items[l_record].data.children != "") {
									if (l_dataOffproposed.items[l_record].data.children.length > 0) {
										var l_weightedAvg = this.calculateWeightedAverageTotals(
												l_dataOffproposed.items[l_record].data, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);
										VistaarAuditingManager.audit({
											"name" : "UIProcessing initialize Set off grid"
										}, true, 401);

										l_dataOffproposed.items[l_record].set("FY", l_weightedAvg.FY);

										VistaarAuditingManager.audit({
											"name" : "UIProcessing end Set off grid"
										}, true, 401);
										l_dataOffproposed.items[l_record].set("YTD", l_weightedAvg.YTD);
										l_dataOffproposed.items[l_record].set("4MTHS", l_weightedAvg.FMTHS);

									}
								}
							}
						}
						//calculate totals(volume) offPremises
						var l_totals = this.calculateSumTotals(l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);
						l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("FY", l_totals.FY);
						l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("YTD", l_totals.YTD);
						l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("4MTHS", l_totals.FMTHS);
						l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].set("FYvsPY", l_totals.FYvsPY);

					} else if (e.record.data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && e.record.data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {

						if (l_dataOffproposed.items[e.rowIdx].data.children != null && l_dataOffproposed.items[e.rowIdx].data.children != undefined && l_dataOffproposed.items[e.rowIdx].data.children != "") {
							if (l_dataOffproposed.items[e.rowIdx].data.children.length > 0) {
								var l_weightedAvg = this.calculateWeightedAverageTotals(
										l_dataOffproposed.items[e.rowIdx].data, l_dataOffproposed.items[l_rowIdxOffVolumeOffPremises].data);

								l_dataOffproposed.items[e.rowIdx].set("FY", l_weightedAvg.FY);
								l_dataOffproposed.items[e.rowIdx].set("YTD", l_weightedAvg.YTD);
								l_dataOffproposed.items[e.rowIdx].set("4MTHS", l_weightedAvg.FMTHS);

							}

							////calculate total Percentage buisness
							this.calculateTotalPercentageBuisness(l_dataOffproposed, l_rowIdxTotPerBuisnessOffPremises, e);
						}
					}

				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//calculation on "on" premises
	this.calculateOnPremisesGrid = function (e) {
		try {

			var l_objOnPro = Ext.getCmp([m_TGONPREMISESPROPOSED])[m_TGObject];
			var l_storeOnPro = l_objOnPro.getStore();
			var l_dataOnproposed = l_storeOnPro.data;
			var l_rowIdxOnVolumeOnPremises;
			var l_rowIdxTotPerBuisnessOnPremises;
			if (l_dataOnproposed.length > 0) {
				for (var l_rowIdx in l_dataOnproposed.items) {
					if (l_dataOnproposed.items[l_rowIdx].data.MetricsType != undefined) {
						if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
							l_rowIdxOnVolumeOnPremises = l_rowIdx;
						} else if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
							l_rowIdxTotPerBuisnessOnPremises = l_rowIdx;
						}
					}
				}

				if (e == undefined) {
					for (var l_record in l_dataOnproposed.items) {
						if (l_dataOnproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && l_dataOnproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							if (l_dataOnproposed.items[l_record].data.children != null && l_dataOnproposed.items[l_record].data.children != undefined && l_dataOnproposed.items[l_record].data.children != "") {
								if (l_dataOnproposed.items[l_record].data.children.length > 0) {
									var l_weightedAvg = this.calculateWeightedAverageTotals(
											l_dataOnproposed.items[l_record].data, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);
									l_dataOnproposed.items[l_record].set("FY", l_weightedAvg.FY);
									l_dataOnproposed.items[l_record].set("YTD", l_weightedAvg.YTD);
									l_dataOnproposed.items[l_record].set("4MTHS", l_weightedAvg.FMTHS);
								}
							}
						}
					}

					this.calculateTotalPercentageBuisness(l_dataOnproposed, l_rowIdxTotPerBuisnessOnPremises);

					//calculate totals(volume) offPremises
					var l_totals = this.calculateSumTotals(l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);
					l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("FY", l_totals.FY);
					l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("YTD", l_totals.YTD);
					l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("4MTHS", l_totals.FMTHS);
					l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("FYvsPY", l_totals.FYvsPY);

				} else if (e != undefined) {
					if (e.record.data.MetricsType == "Volume") {
						for (var l_record in l_dataOnproposed.items) {
							if (l_dataOnproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && l_dataOnproposed.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
								if (l_dataOnproposed.items[l_record].data.children != null && l_dataOnproposed.items[l_record].data.children != undefined && l_dataOnproposed.items[l_record].data.children != "") {
									if (l_dataOnproposed.items[l_record].data.children.length > 0) {
										var l_weightedAvg = this.calculateWeightedAverageTotals(
												l_dataOnproposed.items[l_record].data, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);
										l_dataOnproposed.items[l_record].set("FY", l_weightedAvg.FY);
										l_dataOnproposed.items[l_record].set("YTD", l_weightedAvg.YTD);
										l_dataOnproposed.items[l_record].set("4MTHS", l_weightedAvg.FMTHS);
									}
								}
							}
						}
						//calculate totals(volume) offPremises
						var l_totals = this.calculateSumTotals(l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);
						l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("FY", l_totals.FY);
						l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("YTD", l_totals.YTD);
						l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("4MTHS", l_totals.FMTHS);
						l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].set("FYvsPY", l_totals.FYvsPY);

					} else if (e.record.data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && e.record.data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {

						if (l_dataOnproposed.items[e.rowIdx].data.children != null && l_dataOnproposed.items[e.rowIdx].data.children != undefined && l_dataOnproposed.items[e.rowIdx].data.children != "") {
							if (l_dataOnproposed.items[e.rowIdx].data.children.length > 0) {
								var l_weightedAvg = this.calculateWeightedAverageTotals(
										l_dataOnproposed.items[e.rowIdx].data, l_dataOnproposed.items[l_rowIdxOnVolumeOnPremises].data);

								l_dataOnproposed.items[e.rowIdx].set("FY", l_weightedAvg.FY);
								l_dataOnproposed.items[e.rowIdx].set("YTD", l_weightedAvg.YTD);
								l_dataOnproposed.items[e.rowIdx].set("4MTHS", l_weightedAvg.FMTHS);

							}

							////calculate total Percentage buisness
							this.calculateTotalPercentageBuisness(l_dataOnproposed, l_rowIdxTotPerBuisnessOnPremises, e);
						}
					}

				}
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateTotalPercentageBuisness = function (pdata, prowIdxTotPerBuisness, e) {
		try {
			if (e == undefined) {
				//calculate total % of business
				for (var l_Month in m_arrMonths) {
					var tot_per = 0;
					var blnValueChanged = false;
					for (var l_record in pdata.items) {
						if (pdata.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdata.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							if ((pdata.items[l_record].data.children != null && pdata.items[l_record].data.children != undefined && pdata.items[l_record].data.children != "") || pdata.items[l_record].data.MetricsType == "PG") {
								if (pdata.items[l_record].data[m_arrMonths[l_Month]] !== undefined && pdata.items[l_record].data[m_arrMonths[l_Month]] !== null && pdata.items[l_record].data[m_arrMonths[l_Month]] !== "") {
									tot_per = tot_per + parseFloat(this.ValidateNumberReturnZero(pdata.items[l_record].data[m_arrMonths[l_Month]]));
									blnValueChanged = true;
								}
							}
						}
					}
					if (blnValueChanged) {
						pdata.items[prowIdxTotPerBuisness].set(m_arrMonths[l_Month], tot_per);
					} else {
						pdata.items[prowIdxTotPerBuisness].set(m_arrMonths[l_Month], "");
					}

				}
			} else if (e != undefined) {
				var tot_per = 0;
				var blnValueChanged = false;
				for (var l_record in pdata.items) {
					if (pdata.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdata.items[l_record].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
						if ((pdata.items[l_record].data.children != null && pdata.items[l_record].data.children != undefined && pdata.items[l_record].data.children != "") || pdata.items[l_record].data.MetricsType == "PG") {
							if (pdata.items[l_record].data[e.field] !== undefined && pdata.items[l_record].data[e.field] !== null && pdata.items[l_record].data[e.field] !== "") {
								tot_per = tot_per + parseFloat(this.ValidateNumberReturnZero(pdata.items[l_record].data[e.field]));
								blnValueChanged = true;
							}
						}
					}
				}
				if (blnValueChanged) {
					pdata.items[prowIdxTotPerBuisness].set(e.field, tot_per);
				} else {
					pdata.items[prowIdxTotPerBuisness].set(e.field, "");
				}
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateNetFobPricePlanSummaryGrid = function (p_tempNetFobOffPremise, p_tempOffVolumeOffPremises, p_tempNetFobOnPremises, p_tempOffVolumeOnPremises) {
		try {
			var l_tempnetfob = 0;
			var l_tempNetFobOffPremise = 0;
			var l_tempOffVolumeOffPremises = 0;
			var l_tempNetFobOnPremises = 0;
			var l_tempOffVolumeOnPremises = 0;

			if (this.ValidateNumberReturnBlank(p_tempNetFobOffPremise) == "") {
				l_tempNetFobOffPremise = 0;
			} else {
				l_tempNetFobOffPremise = p_tempNetFobOffPremise
			}

			if (this.ValidateNumberReturnBlank(p_tempOffVolumeOffPremises) == "") {
				l_tempOffVolumeOffPremises = 0;
			} else {
				l_tempOffVolumeOffPremises = p_tempOffVolumeOffPremises
			}

			if (this.ValidateNumberReturnBlank(p_tempNetFobOnPremises) == "") {
				l_tempNetFobOnPremises = 0;
			} else {
				l_tempNetFobOnPremises = p_tempNetFobOnPremises
			}

			if (this.ValidateNumberReturnBlank(p_tempOffVolumeOnPremises) == "") {
				l_tempOffVolumeOnPremises = 0;
			} else {
				l_tempOffVolumeOnPremises = p_tempOffVolumeOnPremises
			}

			l_tempnetfob = (l_tempNetFobOffPremise * l_tempOffVolumeOffPremises + l_tempNetFobOnPremises * l_tempOffVolumeOnPremises) / (l_tempOffVolumeOffPremises + l_tempOffVolumeOnPremises);

			return this.ValidateNumberReturnBlank(l_tempnetfob);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateWeightedAverageTotals = function (p_array1, p_array2) {
		try {
			var l_currMonth = getGlobalConstantsObj().getcurrentMonthIndex();
			//var l_planningYear=getGlobalConstantsObj().m_planningYear;
			var l_prodsumFy = 0;
			var l_denominatorSumFY = 0;
			var l_FY = 0;

			var l_prodsumYTD = 0;
			var l_denominatorSumYTD = 0;
			var l_YTD = 0;

			var l_prodsumFMTHS = 0;
			var l_denominatorSumFMTHS = 0;
			var l_FMTHS = 0;

			var l_PY = 0;
			var l_FYvsPY = 0;
			for (var l_month in m_arrMonths) {

				//	if (!(p_array1[m_arrMonths[l_month]] == "" || isNaN(p_array1[m_arrMonths[l_month]]) || p_array1[m_arrMonths[l_month]] == undefined || p_array1[m_arrMonths[l_month]] == null || p_array2[m_arrMonths[l_month]] == "" || p_array2[m_arrMonths[l_month]] == undefined || isNaN(p_array2[m_arrMonths[l_month]]) || p_array2[m_arrMonths[l_month]] == null))
				var l_temp1 = this.ValidateNumberReturnZero(p_array1[m_arrMonths[l_month]]);
				var l_temp2 = this.ValidateNumberReturnZero(p_array2[m_arrMonths[l_month]]);
				/*p_array1[m_arrMonths[l_month]] = 0;
				}
				if ((p_array2[m_arrMonths[l_month]] == "" || p_array2[m_arrMonths[l_month]] == undefined || p_array2[m_arrMonths[l_month]] == null)) {
				p_array2[m_arrMonths[l_month]] = 0;
				}*/
				//calculate FY
				//l_prodsumFy = l_prodsumFy + parseFloat(l_temp1) * parseFloat(l_temp2);
				//l_denominatorSumFY = l_denominatorSumFY + parseFloat(l_temp2);
				l_prodsumFy = l_prodsumFy + parseFloat(l_temp1) * parseFloat(l_temp2);
				l_denominatorSumFY = l_denominatorSumFY + parseFloat(l_temp2);

				if (getGlobalConstantsObj().m_planningYear == getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
					//calculate YTD
					if (l_month < l_currMonth) // && l_month > (l_currMonth - 6))
					{

						l_prodsumYTD = l_prodsumYTD + parseFloat(l_temp1) * parseFloat(l_temp2);
						l_denominatorSumYTD = l_denominatorSumYTD + parseFloat(l_temp2);
					}
					//calculate 4months
					if (l_month < l_currMonth && l_month > (l_currMonth - 5)) {
						l_prodsumFMTHS = l_prodsumFMTHS + parseFloat(l_temp1) * parseFloat(l_temp2);
						l_denominatorSumFMTHS = l_denominatorSumFMTHS + parseFloat(l_temp2);
					}
				}
				/*else if (getGlobalConstantsObj().m_planningYear < getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
				//calculate YTD
				l_prodsumYTD = l_prodsumYTD + parseFloat(l_temp1) * parseFloat(l_temp2);
				l_denominatorSumYTD = l_denominatorSumYTD + parseFloat(l_temp2);

				//calculate 4months
				if (l_month > (11 - 4)) {
				l_prodsumFMTHS = l_prodsumFMTHS + parseFloat(l_temp1) * parseFloat(l_temp2);
				l_denominatorSumFMTHS = l_denominatorSumFMTHS + parseFloat(l_temp2);
				}

				} else if (getGlobalConstantsObj().m_planningYear > getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
				//calculate YTD
				l_prodsumYTD = 0;
				l_denominatorSumYTD = 0;
				//calculate 4months
				l_prodsumFMTHS = 0;
				l_denominatorSumFMTHS = 0;

				}*/
			}

			if (p_array1.PY == "" || p_array1.PY == null || p_array1.PY == undefined) {
				l_PY = 0;
			} else {
				l_PY = p_array1.PY;
			}
			l_FY = l_prodsumFy / l_denominatorSumFY;
			l_YTD = l_prodsumYTD / l_denominatorSumYTD;
			l_FMTHS = l_prodsumFMTHS / l_denominatorSumFMTHS;

			l_FYvsPY = ((Math_toFixedTo(l_FY, 2) / Math_toFixedTo(l_PY, 2)) - 1) * 100;
			return {
				"FY" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FY, 2)),
				"YTD" : this.ValidateNumberReturnZero(Math_toFixedTo(l_YTD, 2)),
				"FMTHS" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FMTHS, 2)),
				"FYvsPY" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FYvsPY, 2))
			};

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateSumTotals = function (p_array) {
		try {

			var l_FY = 0;
			var l_YTD = 0;
			var l_FYvsPY = 0;
			var l_FMTHS = 0;
			var l_PY = 0;
			var l_currMonth = getGlobalConstantsObj().getcurrentMonthIndex();
			for (var l_month in m_arrMonths) {
				if (!(p_array[m_arrMonths[l_month]] == "" || p_array[m_arrMonths[l_month]] == undefined || p_array[m_arrMonths[l_month]] == null)) {
					/*p_array[m_arrMonths[l_month]] = 0;
					}*/

					//calculate summary grid fy
					l_FY = l_FY + parseFloat(p_array[m_arrMonths[l_month]]);

					if (getGlobalConstantsObj().m_planningYear == getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
						//calculate summary grid ytd
						if (l_month < l_currMonth) //&& l_month > (l_currMonth - 7))
							l_YTD = l_YTD + parseFloat(p_array[m_arrMonths[l_month]]);

						//calculate summary grid 4Month
						if (l_month < l_currMonth && l_month > (l_currMonth - 5))
							l_FMTHS = l_FMTHS + parseFloat(p_array[m_arrMonths[l_month]]);
					}
					/*else if (getGlobalConstantsObj().m_planningYear < getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
					//calculate summary grid ytd
					l_YTD = l_YTD + parseFloat(p_array[m_arrMonths[l_month]]);

					//calculate summary grid 4Month
					if (l_month > (11 - 4))
					l_FMTHS = l_FMTHS + parseFloat(p_array[m_arrMonths[l_month]]);
					} else if (getGlobalConstantsObj().m_planningYear > getGlobalConstantsObj().m_objCurrentDateDetails.CurrentYear) {
					//calculate summary grid ytd
					l_YTD = "";

					//calculate summary grid 4Month
					l_FMTHS = "";
					}*/
				}

			}
			if (p_array.PY == "" || p_array.PY == null || p_array.PY == undefined) {
				l_PY = 0;
			} else {
				l_PY = p_array.PY;
			}
			l_FYvsPY = ((Math_toFixedTo(l_FY, 2) / Math_toFixedTo(l_PY, 2)) - 1) * 100;
			return {
				"FY" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FY, 2)),
				"YTD" : this.ValidateNumberReturnZero(Math_toFixedTo(l_YTD, 2)),
				"FMTHS" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FMTHS, 2)),
				"FYvsPY" : this.ValidateNumberReturnZero(Math_toFixedTo(l_FYvsPY, 2))
			};

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ValidateNumberReturnZero = function (p_number) {
		try {

			if (isNaN(p_number) || !isFinite(p_number) || (p_number == null) || (p_number == "") || (p_number == undefined)) {
				return 0;
			} else {
				return p_number;
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.ValidateNumberReturnBlank = function (p_number) {
		try {

			if (isNaN(p_number) || !isFinite(p_number) || (p_number == null) || (p_number == "") || (p_number == undefined)) {
				return "";
			} else {
				return p_number;
			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.addUpdatedData = function (p_objEditedKeyValue, p_strDealChannel, p_strDealId, p_str_PGorVol_Key) {
		try {
			var l_blnDealFound = false;
			var l_blnVolumeFound = false;
			var l_objUpdatedRecord;
			if (p_strDealId !== null) {
				/*UPDATE DEAL RECORD */
				for (var key in m_arrGridEditRecord) {
					if (m_arrGridEditRecord[key]["Variable Attributes"].DealID === p_strDealId && m_arrGridEditRecord[key]["Variable Attributes"].Channels === p_strDealChannel) {
						/*ADD EDITED RECORD IN 	CORRESPONDING DEAL CONFIG */
						for (var monthKey in p_objEditedKeyValue) {
							if (p_objEditedKeyValue[monthKey] === null || p_objEditedKeyValue[monthKey] === "") {
								m_arrGridEditRecord[key].Values[monthKey] = ""
							} else {
								m_arrGridEditRecord[key].Values[monthKey] = p_objEditedKeyValue[monthKey] / 100;
							}
						}
						l_blnDealFound = true;
						break;
					}
				}
				if (!l_blnDealFound) {
					/*CREATE CONFIG FOR DEAL*/
					l_objUpdatedRecord = {
						"Variable Attributes" : {
							//Commenting this line to fix Sizes issue
							//"Sizes" : VistaarExtjs.getCmp(m_CmbPRICINGGROUP).getValue(),
							"Channels" : p_strDealChannel,
							"DealID" : p_strDealId,
							"Version" : "Proposed"
						},
						"Values" : {}
					}
					/*ADD EDITED RECORD IN 	CORRESPONDING DEAL CONFIG */
					for (var monthKey in p_objEditedKeyValue) {
						if (p_objEditedKeyValue[monthKey] === null || p_objEditedKeyValue[monthKey] === "") {
							l_objUpdatedRecord["Values"][monthKey] = ""
						} else {
							l_objUpdatedRecord["Values"][monthKey] = p_objEditedKeyValue[monthKey] / 100;
						}
					}
					m_arrGridEditRecord.push(l_objUpdatedRecord);
				}
				this.addEditedCellInfoToStack(p_objEditedKeyValue, p_strDealChannel, "DealValues", p_strDealId);

			} else {
				/*UPDATE VOLUME OR PROMO-GOODS RECORD*/
				for (var key in m_arrGridEditRecord) {
					if (!m_arrGridEditRecord[key]["Variable Attributes"].hasOwnProperty("DealID") && m_arrGridEditRecord[key]["Variable Attributes"].Channels === p_strDealChannel) {
						if (p_str_PGorVol_Key == m_PRG_Qualifier) {
							m_arrGridEditRecord[key][p_str_PGorVol_Key] = p_objEditedKeyValue;
						} else {
							if (!m_arrGridEditRecord[key].hasOwnProperty(p_str_PGorVol_Key)) {
								m_arrGridEditRecord[key][p_str_PGorVol_Key] = {};
							}
							for (var monthKey in p_objEditedKeyValue) {
								m_arrGridEditRecord[key][p_str_PGorVol_Key][monthKey] = p_objEditedKeyValue[monthKey];
							}
						}
						l_blnVolumeFound = true;
						break;
					}
				}
				if (!l_blnVolumeFound) {
					l_objUpdatedRecord = {
						"Variable Attributes" : {
							//Commenting this line to fix Sizes issue
							//"Sizes" : VistaarExtjs.getCmp(m_CmbPRICINGGROUP).getValue(),
							"Channels" : p_strDealChannel,
							"Version" : "Proposed"
						},
					}
					if (p_str_PGorVol_Key == m_PRG_Qualifier) {
						l_objUpdatedRecord[p_str_PGorVol_Key] = p_objEditedKeyValue;
					} else {
						l_objUpdatedRecord[p_str_PGorVol_Key] = {};
						for (var monthKey in p_objEditedKeyValue) {
							l_objUpdatedRecord[p_str_PGorVol_Key][monthKey] = p_objEditedKeyValue[monthKey];
						}
					}
					m_arrGridEditRecord.push(l_objUpdatedRecord);

				}
				this.addEditedCellInfoToStack(p_objEditedKeyValue, p_strDealChannel, p_str_PGorVol_Key);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	};

	//Purpose:returns data edited by user
	this.getEditedData = function () {
		try {
			return m_arrGridEditRecord;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.clearAllPricePlanGridData = function () {
		try {
			//For Non Desktop view
			if(getCommonFuncMgr().isNonDeskTopView())
			{
				Ext.getCmp('cntPricePlanMain').hide();
				Ext.getCmp('cntPricePlanTabTools').hide();
				Ext.getCmp('cntTab').hide();
			}
			else
			{
			if (m_PricePlanSummaryProGridObject != undefined) {
				VistaarDG.reloadDGWithData("grdSummaryProposed", []);
			}
			/*if (m_PricePlanSummaryCurGridObject != undefined) {
			VistaarDG.reloadDGWithData("grdSummaryCurrent", []);
			}*/
			if (this.m_PricePlanOnPremiseProGridObject != undefined) {
				VistaarTG.setDataOfTreeGrid("TG_OnPremisesProposed", []);
			}
			if (this.m_PricePlanOnPremiseCurGridObject != undefined) {
				VistaarTG.setDataOfTreeGrid("TG_OnPremisesCurrent", []);
			}
			if (this.m_PricePlanOffPremiseProGridObject != undefined) {
				VistaarTG.setDataOfTreeGrid("TG_OffPremisesProposed", []);
			}
			if (this.m_PricePlanOffPremiseCurGridObject != undefined) {
				VistaarTG.setDataOfTreeGrid("TG_OffPremisesCurrent", []);
			}
			/* VistaarExtjs.getCmp("grdSummaryCurrent").DGObj.store.removeAll();
			VistaarExtjs.getCmp("grdSummaryCurrent").DGObj.view.refresh();
			 */
			this.setPricePlanHeaderInfo();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.sortGrid = function (p_arrUserPreference) {
		try {
			VistaarAuditingManager.audit({
				"name" : "Sort Grid Started"
			}, m_IS_AUDIT_REQUIRED, 6102);
			if(!getCommonFuncMgr().isNonDeskTopView())
			Ext.suspendLayouts()
			if (this.m_PricePlanOffPremiseProGridObject == undefined) {}
			else {
				var objTGStore_OffPremisesProposed = Ext.getCmp("TG_OffPremisesProposed").TGObj.getStore();
				var objTGStore_OnPremisesProposed = Ext.getCmp("TG_OnPremisesProposed").TGObj.getStore();
				var objTGStore_OffPremisesCurrent = Ext.getCmp("TG_OffPremisesCurrent").TGObj.getStore();
				var objTGStore_OnPremisesCurrent = Ext.getCmp("TG_OnPremisesCurrent").TGObj.getStore();

				if (p_arrUserPreference.sort == "Descending") {

					objTGStore_OffPremisesProposed.sort("NetList", "DESC");
					objTGStore_OnPremisesProposed.sort("NetList", "DESC");
					objTGStore_OffPremisesCurrent.sort("NetList", "DESC");
					objTGStore_OnPremisesCurrent.sort("NetList", "DESC");

				} else if (p_arrUserPreference.sort == "Ascending") {

					objTGStore_OffPremisesProposed.sort("NetList", "ASC");
					objTGStore_OnPremisesProposed.sort("NetList", "ASC");
					objTGStore_OffPremisesCurrent.sort("NetList", "ASC");
					objTGStore_OnPremisesCurrent.sort("NetList", "ASC");

				}
			}
			if(!getCommonFuncMgr().isNonDeskTopView())
			Ext.resumeLayouts();
			VistaarAuditingManager.audit({
				"name" : "Sort Grid Ended"
			}, m_IS_AUDIT_REQUIRED, 6102);

		} catch (err) {
			Ext.resumeLayouts();
			getCommonFuncMgr().printLog(err);
		}
	};

	this.refreshAllPricePlanGridsView = function (pstrChannel) {
		try {

			switch (pstrChannel) {
			case "OFF": {
					var objTG_OffPremisesProposed = Ext.getCmp("TG_OffPremisesProposed").TGObj;
					objTG_OffPremisesProposed.view.refresh();
					var objTG_OnPremisesProposed = Ext.getCmp("TG_OnPremisesProposed").TGObj;
					objTG_OnPremisesProposed.view.refresh();
					break;
				}
			case "ON": {
					var objTG_OffPremisesCurrent = Ext.getCmp("TG_OffPremisesCurrent").TGObj;
					objTG_OffPremisesCurrent.view.refresh();
					var objTG_OnPremisesCurrent = Ext.getCmp("TG_OnPremisesCurrent").TGObj;
					objTG_OnPremisesCurrent.view.refresh();
					break;
				}
			default: {
					var objTG_OffPremisesProposed = Ext.getCmp("TG_OffPremisesProposed").TGObj;
					objTG_OffPremisesProposed.view.refresh();
					var objTG_OnPremisesProposed = Ext.getCmp("TG_OnPremisesProposed").TGObj;
					objTG_OnPremisesProposed.view.refresh();
					var objTG_OffPremisesCurrent = Ext.getCmp("TG_OffPremisesCurrent").TGObj;
					objTG_OffPremisesCurrent.view.refresh();
					var objTG_OnPremisesCurrent = Ext.getCmp("TG_OnPremisesCurrent").TGObj;
					objTG_OnPremisesCurrent.view.refresh();
					break;
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.commitPricePlanGridChanges = function (p_editRecord) {
		try {
			m_arrGridEditRecord = p_editRecord;
			m_Stack_EditedCellInfo = [];
			VistaarExtjs.getCmp("TG_OffPremisesProposed").TGObj.getStore().commitChanges();
			VistaarExtjs.getCmp("TG_OnPremisesProposed").TGObj.getStore().commitChanges();
			VistaarExtjs.getCmp("grdSummaryProposed").DGObj.getStore().commitChanges();
			//Added PG_Qualifiers commit changes (need to be checked in).
			if (!VistaarExtjs.getCmp("btn_PP_PromoGoods").isDisabled() && VistaarExtjs.getCmp("btn_PP_PromoGoods").pressed) {
				VistaarExtjs.getCmp("DG_PGOffPremisesProposed").DGObj.getStore().commitChanges();
				VistaarExtjs.getCmp("DG_PGOnPremisesProposed").DGObj.getStore().commitChanges();
				VistaarExtjs.getCmp("DG_PG_Qual_OffPreProposed").DGObj.getStore().commitChanges();
				VistaarExtjs.getCmp("DG_PG_Qual_OnPreProposed").DGObj.getStore().commitChanges();
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.onCellEditingEditOffPremisesPG = function (editor, e, eOpts) {
		try {
			if (e.value !== e.originalValue && !(e.originalValue === "" && e.value === null)) {
				var l_strChannelType = "OFF";
				var l_objEditedValues = {};
				// this.calculateOnPremisesGrid(e);
				// this.calculateSummaryGrid(e);
				if (e.record.data.MetricsType === "PG_SDA") {
					//Populate till December...............
					for (var l_month in m_arrMonths) {
						if (getCommonFuncMgr().m_PP_PG_Effectivity[m_arrMonths[l_month]] && l_month >= m_arrMonths.indexOf(e.field)) {
							VistaarExtjs.getCmp("DG_PGOffPremisesProposed").DGObj.getStore().getAt(e.rowIdx).set(m_arrMonths[l_month], e.value);
							l_objEditedValues[m_arrMonths[l_month]] = e.value;
						}
					}
				} else {
					l_objEditedValues[e.field] = e.value;
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(l_objEditedValues, l_strChannelType, null, e.record.data.MetricsType);
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChanges(e.record.data.MetricsType, e.field, l_strChannelType, e);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.onCellEditingEditOnPremisesPG = function (editor, e, eOpts) {
		try {
			if (e.value !== e.originalValue && !(e.originalValue === "" && e.value === null)) {
				var l_strChannelType = "ON";
				var l_objEditedValues = {};
				if (e.record.data.MetricsType === "PG_SDA") {
					for (var l_month in m_arrMonths) {
						if (l_month >= m_arrMonths.indexOf(e.field)) {
							VistaarExtjs.getCmp("DG_PGOnPremisesProposed").DGObj.getStore().getAt(e.rowIdx).set(m_arrMonths[l_month], e.value);
							l_objEditedValues[m_arrMonths[l_month]] = e.value;
						}
					}
				} else {
					l_objEditedValues[e.field] = e.value;
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(l_objEditedValues, l_strChannelType, null, e.record.data.MetricsType);
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculatePromoGoodChanges(e.record.data.MetricsType, e.field, l_strChannelType, e);
				//
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.onCellEditingEditOnPremisesPGQualifier = function (editor, e, eOpts) {
		try {
			if (e.value !== e.originalValue && !(e.originalValue === "" && e.value === null)) {
				var l_strChannelType = "ON";
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(e.value, l_strChannelType, null, m_PRG_Qualifier);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}
	this.onCellEditingEditOffPremisesPGQualifier = function (editor, e, eOpts) {
		try {
			if (e.value !== e.originalValue && !(e.originalValue === "" && e.value === null)) {
				var l_strChannelType = "OFF";
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().addUpdatedData(e.value, l_strChannelType, null, m_PRG_Qualifier);
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	this.onCellEditingBeforeEditPG = function (editor, e, eOpts) {
		try {
			if (getCommonFuncMgr().m_PP_PG_Effectivity[e.field] && e.record.data.MetricsType != "Allocated Budget" &&(isAdminRole() || m_arrMonths.indexOf(e.field) >= m_arrMonths.indexOf(e.record.data.EditableFrom))) {
				if (!isAdminRole() && e.record.data.EditableFrom === "") {
					return false;
				} else {
					return true
				}
			} else {
				return false;
			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}
	this.calculatePromoGoodChanges = function (p_GridRowType, p_selectedMonth, p_str_Channel, e) {
		try {
			/* GRID ID CONFING FOR BOTH CHANNELS */
			var l_objGridID = {
				"ON" : {
					"PG" : m_DG_PG_ONPREMISESPROPOSED,
					"TG" : m_TGONPREMISESPROPOSED
				},
				"OFF" : {
					"PG" : m_DG_PG_OFFPREMISESPROPOSED,
					"TG" : m_TGOFFPREMISESPROPOSED
				}
			};
			var l_Store_PG = VistaarExtjs.getCmp(l_objGridID[p_str_Channel]["PG"]).DGObj.getStore();
			var l_RowRecord_Business = l_Store_PG.data.find("MetricsType", "Percent of Business").getData();
			var l_RowRecord_PG_SDA = l_Store_PG.data.find("MetricsType", "PG_SDA").getData();
			var l_RowRecord_AllocatedCost = l_Store_PG.data.find("MetricsType", "Allocated Budget");
			var l_volumeRowRecord = VistaarExtjs.getCmp(l_objGridID[p_str_Channel]["TG"]).TGObj.getStore().data.find("MetricsType", "Volume").getData();
			if (p_GridRowType == "Volume") {
				var l_calculateAllocatedCost = this.ValidateNumberReturnZero(l_volumeRowRecord[p_selectedMonth]) * this.ValidateNumberReturnZero(l_RowRecord_PG_SDA[p_selectedMonth]) * (this.ValidateNumberReturnZero(l_RowRecord_Business[p_selectedMonth]) / 100);
				l_RowRecord_AllocatedCost.set(p_selectedMonth, l_calculateAllocatedCost);
			} else {
				for (var l_month in m_arrMonths) {
					if (l_month >= m_arrMonths.indexOf(p_selectedMonth)) {
						var l_calculateAllocatedCost = this.ValidateNumberReturnZero(l_volumeRowRecord[m_arrMonths[l_month]]) * this.ValidateNumberReturnZero(l_RowRecord_PG_SDA[m_arrMonths[l_month]]) * (this.ValidateNumberReturnZero(l_RowRecord_Business[m_arrMonths[l_month]]) / 100);
						l_RowRecord_AllocatedCost.set(m_arrMonths[l_month], l_calculateAllocatedCost);
					}
				}
			}

			//calculate totals for Allocated Cost
			var l_totals = this.calculateSumTotals(l_RowRecord_AllocatedCost.data);
			l_RowRecord_AllocatedCost.set("FY", l_totals.FY);
			l_RowRecord_AllocatedCost.set("YTD", l_totals.YTD);
			l_RowRecord_AllocatedCost.set("4MTHS", l_totals.FMTHS);
			l_RowRecord_AllocatedCost.set("FYvsPY", l_totals.FYvsPY);

			getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculatePromoGoodChangesONLoad = function () {
		try {

			/* GRID ID CONFING FOR BOTH CHANNELS */
			var l_objGridID = {
				"ON" : {
					"PG" : m_DG_PG_ONPREMISESPROPOSED,
					"TG" : m_TGONPREMISESPROPOSED
				},
				"OFF" : {
					"PG" : m_DG_PG_OFFPREMISESPROPOSED,
					"TG" : m_TGOFFPREMISESPROPOSED
				}

			};

			for (var l_str_Channel in l_objGridID) {
				var l_Store_PG = VistaarExtjs.getCmp(l_objGridID[l_str_Channel]["PG"]).DGObj.getStore();
				var l_RowRecord_Business = l_Store_PG.data.find("MetricsType", "Percent of Business").getData();
				var l_RowRecord_PG_SDA = l_Store_PG.data.find("MetricsType", "PG_SDA").getData();
				var l_RowRecord_AllocatedCost = l_Store_PG.data.find("MetricsType", "Allocated Budget");
				/** PG Enhancement**/
				var l_ClosedMonthIndex = m_arrMonths.indexOf(l_RowRecord_AllocatedCost.getData()["EditableFrom"]);
				var l_volumeRowRecord = VistaarExtjs.getCmp(l_objGridID[l_str_Channel]["TG"]).TGObj.getStore().data.find("MetricsType", "Volume").getData();
				for (var l_month in m_arrMonths) {
					/** PG Enhancement**/
					if (l_ClosedMonthIndex != -1 && l_month >= l_ClosedMonthIndex) {
						var l_calculateAllocatedCost = this.ValidateNumberReturnZero(l_volumeRowRecord[m_arrMonths[l_month]]) * this.ValidateNumberReturnZero(l_RowRecord_PG_SDA[m_arrMonths[l_month]]) * (this.ValidateNumberReturnZero(l_RowRecord_Business[m_arrMonths[l_month]]) / 100);
						l_RowRecord_AllocatedCost.set(m_arrMonths[l_month], l_calculateAllocatedCost);
					}

				}
				//calculate totals for Allocated Cost
				var l_totals = this.calculateSumTotals(l_RowRecord_AllocatedCost.data);
				l_RowRecord_AllocatedCost.set("FY", l_totals.FY);
				l_RowRecord_AllocatedCost.set("YTD", l_totals.YTD);
				l_RowRecord_AllocatedCost.set("4MTHS", l_totals.FMTHS);
				l_RowRecord_AllocatedCost.set("FYvsPY", l_totals.FYvsPY);

			}

			//getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().calculateSummaryGrid();

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculatePGAllocationCostSummaryGrid = function (e) {
		try {
			//GET STORE AND DATA OF SUMMAY GRID...................
			var l_objSummaryProObj = Ext.getCmp([m_DGSUMMARYPROPOSED])[m_DGObject];
			var l_storeSummaryPro = l_objSummaryProObj.getStore();
			var l_dataSummaryPro = l_storeSummaryPro.data;

			//GET STORE AND DATA OF OFF PREMISES PROPOSED...............
			var l_objOffPro = Ext.getCmp([m_TGOFFPREMISESPROPOSED])[m_TGObject];
			var l_storeOffPro = l_objOffPro.getStore();
			var l_dataOffproposed = l_storeOffPro.data;

			//GET STORE AND DATA OF ON PREMISES PROPOSED..............
			var l_objOnPro = Ext.getCmp([m_TGONPREMISESPROPOSED])[m_TGObject];
			var l_storeOnPro = l_objOnPro.getStore();
			var l_dataOnproposed = l_storeOnPro.data;

			//GET STORE AND DATA OF ON  PREMISES PROPOSED PG..............
			var l_objPGONPro = Ext.getCmp([m_DG_PG_ONPREMISESPROPOSED])[m_DGObject];
			var l_storePGONPro = l_objPGONPro.getStore();
			var l_dataPGONPro = l_storePGONPro.data;

			//GET STORE AND DATA OF OFF PREMISES PROPOSED PG...................
			var l_objPGOFFPro = Ext.getCmp([m_DG_PG_OFFPREMISESPROPOSED])[m_DGObject];
			var l_storePGOFFPro = l_objPGOFFPro.getStore();
			var l_dataPGOFFPro = l_storePGOFFPro.data;

			var l_rowIdxVolCurrentYear;
			var l_rowIdxNetFob;
			var l_rowIdxNetFobOffPremise;
			var l_rowIdxNetFobOnPremise;
			var l_rowIdxAlloCostPreCase;
			var l_rowIdxAlloCostPreCaseOff;
			var l_rowIdxAlloCostPreCaseOn;
			var l_rowIdxNetFobExclusivePromo;
			var l_rowIdxNetFobExclusivePromoOff;
			var l_rowIdxNetFobExclusivePromoOn;

			var l_rowIdxOffVolumeOffPremises;
			var l_rowIdxTotPerBuisnessOffPremises;

			var l_rowIdxOnVolumeOnPremises;
			var l_rowIdxTotPerBuisnessOnPremises;

			//GET ROW-INDEX OF RECORDS SUMMARY GRID.................
			for (var l_rowIdx in l_dataSummaryPro.items) {
				if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "Current" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxVolCurrentYear = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFob = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "OffPremiseNetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobOffPremise = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "OnPremiseNetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobOnPremise = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCase = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_OFF_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCaseOff = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_ON_CASES" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxAlloCostPreCaseOn = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromo = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_OFF_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromoOff = l_rowIdx
				} else if (l_dataSummaryPro.items[l_rowIdx].data.MetricsType == "PG_ON_NetFOB" && l_dataSummaryPro.items[l_rowIdx].data.Type == "Proposed") {
					l_rowIdxNetFobExclusivePromoOn = l_rowIdx
				}
			}

			//GET ROW-INDEX OF RECORDS OFF PROPOSED GRID.................
			for (var l_rowIdx in l_dataOffproposed.items) {
				if (l_dataOffproposed.items[l_rowIdx].data.MetricsType != undefined) {
					if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
						l_rowIdxOffVolumeOffPremises = l_rowIdx;
					} else if (l_dataOffproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
						l_rowIdxTotPerBuisnessOffPremises = l_rowIdx;
					}
				}
			}

			//GET ROW-INDEX OF RECORDS ON PROPOSED GRID.................
			for (var l_rowIdx in l_dataOnproposed.items) {
				if (l_dataOnproposed.items[l_rowIdx].data.MetricsType != undefined) {
					if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Volume"]) {
						l_rowIdxOnVolumeOnPremises = l_rowIdx;
					} else if (l_dataOnproposed.items[l_rowIdx].data.MetricsType == m_PricePlanCodeNameMapping["Business"]) {
						l_rowIdxTotPerBuisnessOnPremises = l_rowIdx;
					}
				}
			}

			//GET ROW WITH RECORDS OFF PROPOSED PG GRID.................
			var l_storePGOFFPro = VistaarExtjs.getCmp(m_DG_PG_OFFPREMISESPROPOSED).DGObj.getStore();
			var l_RowRecord_Business_OFF = l_storePGOFFPro.data.find("MetricsType", "Percent of Business").getData();
			var l_RowRecord_PG_SDA_OFF = l_storePGOFFPro.data.find("MetricsType", "PG_SDA").getData();
			var l_RowRecord_AllocatedCost_OFF = l_storePGOFFPro.data.find("MetricsType", "Allocated Budget").getData();

			//GET ROW WITH RECORDS ON PROPOSED PG GRID.................
			var l_storePGONPro = VistaarExtjs.getCmp(m_DG_PG_ONPREMISESPROPOSED).DGObj.getStore();
			var l_RowRecord_Business_ON = l_storePGONPro.data.find("MetricsType", "Percent of Business").getData();
			var l_RowRecord_PG_SDA_ON = l_storePGONPro.data.find("MetricsType", "PG_SDA").getData();
			var l_RowRecord_AllocatedCost_ON = l_storePGONPro.data.find("MetricsType", "Allocated Budget").getData();

			//CHECK IF OFF PREMISES SECTION EXIST AND THEN CALCULATE ALLOCATED COST PER CASE OFF PREMISES.................
			if (l_dataOffproposed.length > 0)
				this.calculateAlloCostPreCaseChannel(l_dataSummaryPro, l_dataOffproposed, l_rowIdxAlloCostPreCaseOff, l_rowIdxOffVolumeOffPremises, l_RowRecord_Business_OFF, l_RowRecord_PG_SDA_OFF, l_RowRecord_AllocatedCost_OFF, e);

			//CHECK IF ON PREMISES SECTION EXIST AND THEN CALCULATE ALLOCATED COST PER CASE ON PREMISES.................
			if (l_dataOnproposed.length > 0)
				this.calculateAlloCostPreCaseChannel(l_dataSummaryPro, l_dataOnproposed, l_rowIdxAlloCostPreCaseOn, l_rowIdxOnVolumeOnPremises, l_RowRecord_Business_ON, l_RowRecord_PG_SDA_ON, l_RowRecord_AllocatedCost_ON, e);

			//CALCULATE ALLOCATED COST PER CASE.................
			this.calculateAlloCostPreCase(l_dataSummaryPro, l_dataOffproposed, l_dataOnproposed, l_rowIdxVolCurrentYear, l_rowIdxAlloCostPreCase, l_rowIdxAlloCostPreCaseOff, l_rowIdxAlloCostPreCaseOn, l_rowIdxOffVolumeOffPremises, l_rowIdxOnVolumeOnPremises, e);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.calculateAlloCostPreCaseChannel = function (p_dataSummaryPro, p_dataproposed, p_rowIdxAlloCostPreCase, p_rowIdxChannelVolume, p_RowRecord_Business, p_RowRecord_PG_SDA, p_RowRecord_AllocatedCost, e) {
		try {

			if (e == undefined) {

				for (var l_Month in m_arrMonths) {
					var l_tempAlloCostPreCaseON = 0;
					/*l_tempAlloCostPreCaseON = this.ValidateNumberReturnZero(p_RowRecord_Business[m_arrMonths[l_Month]] / 100) * this.ValidateNumberReturnZero(p_RowRecord_PG_SDA[m_arrMonths[l_Month]]) * this.ValidateNumberReturnZero(p_RowRecord_AllocatedCost[m_arrMonths[l_Month]]) / this.ValidateNumberReturnZero(p_dataproposed.items[p_rowIdxChannelVolume].data[m_arrMonths[l_Month]]);*/

					l_tempAlloCostPreCaseON = this.ValidateNumberReturnZero(p_RowRecord_AllocatedCost[m_arrMonths[l_Month]]) / this.ValidateNumberReturnZero(p_dataproposed.items[p_rowIdxChannelVolume].data[m_arrMonths[l_Month]]);

					p_dataSummaryPro.getAt(p_rowIdxAlloCostPreCase).set(m_arrMonths[l_Month], this.ValidateNumberReturnZero(l_tempAlloCostPreCaseON));
				}
			} else if (e != undefined) {

				var l_tempAlloCostPreCaseON = 0;

				l_tempAlloCostPreCaseON = this.ValidateNumberReturnZero(p_RowRecord_AllocatedCost[e.field]) / this.ValidateNumberReturnZero(p_dataproposed.items[p_rowIdxChannelVolume].data[e.field]);

				p_dataSummaryPro.getAt(p_rowIdxAlloCostPreCase).set(e.field, this.ValidateNumberReturnZero(l_tempAlloCostPreCaseON));

			}
			var l_weightedAvg = this.calculateWeightedAverageTotals(
					p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].data, p_dataproposed.items[p_rowIdxChannelVolume].data);

			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("FY", l_weightedAvg.FY);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("YTD", l_weightedAvg.YTD);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("4MTHS", l_weightedAvg.FMTHS);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("FYvsPY", l_weightedAvg.FYvsPY);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	this.calculateAlloCostPreCase = function (p_dataSummaryPro, p_dataOffproposed, p_dataOnproposed, p_rowIdxVolCurrentYear, p_rowIdxAlloCostPreCase, p_rowIdxAlloCostPreCaseOff, p_rowIdxAlloCostPreCaseOn, p_rowIdxOffVolumeOffPremises, p_rowIdxOnVolumeOnPremises, e) {
		try {
			if (e == undefined) {
				for (var l_Month in m_arrMonths) {
					var l_tempAlloCostPreCase = 0;
					var l_tempAlloCostPreCaseOFF = 0;
					var l_tempAlloCostPreCaseON = 0;
					var l_tempOffVolumeOffPremises = 0;
					var l_tempOnVolumeOnPremises = 0;

					if (p_dataOffproposed.length > 0) {
						l_tempAlloCostPreCaseOFF = p_dataSummaryPro.items[p_rowIdxAlloCostPreCaseOff].data[m_arrMonths[l_Month]];
						l_tempOffVolumeOffPremises = p_dataOffproposed.items[p_rowIdxOffVolumeOffPremises].data[m_arrMonths[l_Month]];
					}

					if (p_dataOnproposed.length > 0) {
						l_tempAlloCostPreCaseON = p_dataSummaryPro.items[p_rowIdxAlloCostPreCaseOn].data[m_arrMonths[l_Month]];
						l_tempOnVolumeOnPremises = p_dataOnproposed.items[p_rowIdxOnVolumeOnPremises].data[m_arrMonths[l_Month]];
					}
					var l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempAlloCostPreCaseOFF, l_tempOffVolumeOffPremises, l_tempAlloCostPreCaseON, l_tempOnVolumeOnPremises);

					p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set(m_arrMonths[l_Month], l_tempnetfob);
				}

			} else if (e != undefined) {

				var l_tempAlloCostPreCase = 0;
				var l_tempAlloCostPreCaseOFF = 0;
				var l_tempAlloCostPreCaseON = 0;
				var l_tempOffVolumeOffPremises = 0;
				var l_tempOnVolumeOnPremises = 0;

				if (p_dataOffproposed.length > 0) {
					l_tempAlloCostPreCaseOFF = p_dataSummaryPro.items[p_rowIdxAlloCostPreCaseOff].data[e.field];
					l_tempOffVolumeOffPremises = p_dataOffproposed.items[p_rowIdxOffVolumeOffPremises].data[e.field];
				}

				if (p_dataOnproposed.length > 0) {
					l_tempAlloCostPreCaseON = p_dataSummaryPro.items[p_rowIdxAlloCostPreCaseOn].data[e.field];
					l_tempOnVolumeOnPremises = p_dataOnproposed.items[p_rowIdxOnVolumeOnPremises].data[e.field];
				}
				var l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempAlloCostPreCaseOFF, l_tempOffVolumeOffPremises, l_tempAlloCostPreCaseON, l_tempOnVolumeOnPremises);

				p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set(e.field, l_tempnetfob);

			}
			var l_weightedAvg = this.calculateWeightedAverageTotals(
					p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].data, p_dataSummaryPro.items[p_rowIdxVolCurrentYear].data);

			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("FY", l_weightedAvg.FY);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("YTD", l_weightedAvg.YTD);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("4MTHS", l_weightedAvg.FMTHS);
			p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].set("FYvsPY", l_weightedAvg.FYvsPY);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateNetFOB_RABInclusive = function (p_dataSummaryPro, p_rowIdxNetFob, p_rowIdxNetFobInclusivePromos, p_rowIdxAlloCostPreCase, p_rowVolCurrentYear, e) {
		try {

			if (e == undefined) {
				if (!Ext.getCmp("btn_PP_PromoGoods").isDisabled() && Ext.getCmp("btn_PP_PromoGoods").pressed) {
					for (var l_Month in m_arrMonths) {
						p_dataSummaryPro.items[p_rowIdxNetFob].set(m_arrMonths[l_Month], (this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxNetFobInclusivePromos].data[m_arrMonths[l_Month]]) - this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].data[m_arrMonths[l_Month]])));
					}

				} else {
					for (var l_Month in m_arrMonths) {
						p_dataSummaryPro.items[p_rowIdxNetFob].set(m_arrMonths[l_Month], (this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxNetFobInclusivePromos].data[m_arrMonths[l_Month]])));
					}
				}
			} else {
				if (!Ext.getCmp("btn_PP_PromoGoods").isDisabled() && Ext.getCmp("btn_PP_PromoGoods").pressed) {

					p_dataSummaryPro.items[p_rowIdxNetFob].set(e.field, (this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxNetFobInclusivePromos].data[e.field]) - this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxAlloCostPreCase].data[e.field])));

				} else {

					p_dataSummaryPro.items[p_rowIdxNetFob].set(e.field, (this.ValidateNumberReturnZero(p_dataSummaryPro.items[p_rowIdxNetFobInclusivePromos].data[e.field])));
				}

			}
			//get Totals (NetFOb) SummaryGrid
			var l_weightedAvg = this.calculateWeightedAverageTotals(
					p_dataSummaryPro.items[p_rowIdxNetFob].data, p_rowVolCurrentYear);

			p_dataSummaryPro.items[p_rowIdxNetFob].set("FY", l_weightedAvg.FY);
			p_dataSummaryPro.items[p_rowIdxNetFob].set("YTD", l_weightedAvg.YTD);
			p_dataSummaryPro.items[p_rowIdxNetFob].set("4MTHS", l_weightedAvg.FMTHS);
			p_dataSummaryPro.items[p_rowIdxNetFob].set("FYvsPY", l_weightedAvg.FYvsPY);

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};
	//calculate RAB
	this.calculateRABExclusive = function (pdataSummary, pdataOffPremises, pdataOnPremises, prowIdxVolCurrentYear, prowIdxNetFob, prowIdxRABOffPremises, prowIdxRABOnPremises, prowIdxOffVolumeOffPremises, prowIdxOnVolumeOnPremises, e) {
		try {
			if (e == undefined) {
				//calculate net fob pdataSummary grid
				for (var l_Month in m_arrMonths) {
					var l_tempnetfob = 0;
					var l_tempNetFobOffPremise = 0;
					var l_tempOffVolumeOffPremises = 0;
					var l_tempNetFobOnPremises = 0;
					var l_tempOnVolumeOnPremises = 0;

					if (pdataOffPremises.length > 0) {
						l_tempNetFobOffPremise = pdataSummary.items[prowIdxRABOffPremises].data[m_arrMonths[l_Month]];
						l_tempOffVolumeOffPremises = pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[m_arrMonths[l_Month]];
					}

					if (pdataOnPremises.length > 0) {
						l_tempNetFobOnPremises = pdataSummary.items[prowIdxRABOnPremises].data[m_arrMonths[l_Month]];
						l_tempOnVolumeOnPremises = pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[m_arrMonths[l_Month]];
					}
					l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempNetFobOffPremise, l_tempOffVolumeOffPremises, l_tempNetFobOnPremises, l_tempOnVolumeOnPremises);

					pdataSummary.items[prowIdxNetFob].set(m_arrMonths[l_Month], l_tempnetfob);
				}

				//get Totals (NetFOb) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFob].data, pdataSummary.items[prowIdxVolCurrentYear].data);

				pdataSummary.items[prowIdxNetFob].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFob].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFob].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFob].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {

				//calculate net fob pdataSummary grid
				var l_tempnetfob = 0;
				var l_tempNetFobOffPremise = 0;
				var l_tempOffVolumeOffPremises = 0;
				var l_tempNetFobOnPremises = 0;
				var l_tempOffVolumeOnPremises = 0;

				if (pdataOffPremises.length > 0) {
					l_tempNetFobOffPremise = pdataSummary.items[prowIdxRABOffPremises].data[e.field];
					l_tempOffVolumeOffPremises = pdataOffPremises.items[prowIdxOffVolumeOffPremises].data[e.field];
				}

				if (pdataOnPremises.length > 0) {
					l_tempNetFobOnPremises = pdataSummary.items[prowIdxRABOnPremises].data[e.field];
					l_tempOffVolumeOnPremises = pdataOnPremises.items[prowIdxOnVolumeOnPremises].data[e.field];
				}
				l_tempnetfob = this.calculateNetFobPricePlanSummaryGrid(l_tempNetFobOffPremise, l_tempOffVolumeOffPremises, l_tempNetFobOnPremises, l_tempOffVolumeOnPremises);

				pdataSummary.items[prowIdxNetFob].set(e.field, l_tempnetfob);

				//get Totals (NetFOb) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxNetFob].data, pdataSummary.items[prowIdxVolCurrentYear].data);

				pdataSummary.items[prowIdxNetFob].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxNetFob].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxNetFob].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxNetFob].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateOffPremisesRABExclusiveSummaryGrid = function (pdataSummary, pdataOffPremises, prowIdxRABOffPremisess, prowIdxOffVolumeOffPremises, e) {
		try {
			/** ET# 777 : Added PG vol-mix percentage in Calculation **/
			if (e == undefined) {
				var l_idx_PromoGoodDeal,
				l_idx_FrontlineDeal,
				l_idx_Fact_RAB;
				for (var l_Month in m_arrMonths) {
					var tempvalue = 0;
					l_idx_PromoGoodDeal = -1;
					l_idx_FrontlineDeal = -1;
					for (var rowIdxOffProData in pdataOffPremises.items) {
						if (pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							var tempnet = 0;
							if (this.ValidateNumberReturnBlank(pdataOffPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]) == "") {
								tempnet = 0;
							} else {
								tempnet = parseFloat(pdataOffPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]);
							}
							if (pdataOffPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
								// PG deal row index....
								l_idx_PromoGoodDeal = rowIdxOffProData;
							}
							tempnet = tempnet / 100;
							for (var l_facts in pdataOffPremises.items[rowIdxOffProData].data.children) {
								if (pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["RAB"]) {

									if (pdataOffPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
										//  FL deal row index...
										l_idx_Fact_RAB = l_facts;
										l_idx_FrontlineDeal = rowIdxOffProData;
									}
									tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[rowIdxOffProData].data.children[l_facts][m_arrMonths[l_Month]]));
									break;

								}
							}
						}

					}
					//Add PG deal mix Percentage data in Weighted Average NetFOB
					if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]]) != "") {
						tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_RAB][m_arrMonths[l_Month]]));
					}

					pdataSummary.items[prowIdxRABOffPremisess].set(m_arrMonths[l_Month], tempvalue);

				}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxRABOffPremisess].data, pdataOffPremises.items[prowIdxOffVolumeOffPremises].data);

				pdataSummary.items[prowIdxRABOffPremisess].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxRABOffPremisess].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxRABOffPremisess].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxRABOffPremisess].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {
				//if (e.record.data.children.length > 0) {
				var tempvalue = 0;
				l_idx_PromoGoodDeal = -1;
				l_idx_FrontlineDeal = -1;
				for (var rowIdxOffProData in pdataOffPremises.items) {
					if (pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOffPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
						if (pdataOffPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
							// PG deal row index....
							l_idx_PromoGoodDeal = rowIdxOffProData;
						}
						var tempnet = 0;
						if (this.ValidateNumberReturnBlank(pdataOffPremises.items[rowIdxOffProData].data[e.field]) == "") {
							tempnet = 0;
						} else {
							tempnet = parseFloat(pdataOffPremises.items[rowIdxOffProData].data[e.field]);
						}

						tempnet = tempnet / 100;
						for (var l_facts in pdataOffPremises.items[rowIdxOffProData].data.children) {
							if (pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOffPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["RAB"]) {
								if (pdataOffPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
									//  FL deal row index...
									l_idx_Fact_RAB = l_facts;
									l_idx_FrontlineDeal = rowIdxOffProData;
								}
								tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[rowIdxOffProData].data.children[l_facts][e.field]));
								break;
							}
						}
					}
				}
				//Add PG deal mix Percentage data in Weighted Average NetFOB
				if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[e.field]) != "") {
					tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOffPremises.items[l_idx_PromoGoodDeal].data[e.field])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOffPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_RAB][e.field]));
				}

				VistaarAuditingManager.audit({
					"name" : "UIProcessing initialize Set Summary Grid NetFob OFF Premises"
				}, true, 400);

				//pdataSummary.items[prowIdxRABOffPremisess].beginEdit();
				pdataSummary.items[prowIdxRABOffPremisess].set(e.field, tempvalue);
				//pdataSummary.items[prowIdxRABOffPremisess].endEdit();

				VistaarAuditingManager.audit({
					"name" : "UIProcessing end Set Summary Grid NetFob OFF Premises"
				}, true, 400);

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxRABOffPremisess].data, pdataOffPremises.items[prowIdxOffVolumeOffPremises].data);

				VistaarAuditingManager.audit({
					"name" : "UIProcessing initialize Set Summary Grid NetFob OFF Premises FY"
				}, true, 402);
				pdataSummary.items[prowIdxRABOffPremisess].set("FY", l_weightedAvg.FY);

				VistaarAuditingManager.audit({
					"name" : "UIProcessing end Set Summary Grid NetFob OFF Premises FY"
				}, true, 402);

				pdataSummary.items[prowIdxRABOffPremisess].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxRABOffPremisess].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxRABOffPremisess].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	this.calculateOnPremisesRABExclusiveSummaryGrid = function (pdataSummary, pdataOnPremises, prowIdxRABOnPremises, prowIdxOnVolumeOnPremises, e) {
		try {
			/** ET# 777 : Added PG vol-mix percentage in Calculation **/
			if (e == undefined) {
				var l_idx_PromoGoodDeal,
				l_idx_FrontlineDeal,
				l_idx_Fact_RAB;
				for (var l_Month in m_arrMonths) {
					var tempvalue = 0;
					l_idx_PromoGoodDeal = -1;
					l_idx_FrontlineDeal = -1;
					for (var rowIdxOffProData in pdataOnPremises.items) {
						if (pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
							if (pdataOnPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
								// PG deal row index....
								l_idx_PromoGoodDeal = rowIdxOffProData;
							}
							var tempnet = 0;
							if (this.ValidateNumberReturnBlank(pdataOnPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]) == "") {
								tempnet = 0;
							} else {
								tempnet = parseFloat(pdataOnPremises.items[rowIdxOffProData].data[m_arrMonths[l_Month]]);
							}
							tempnet = tempnet / 100;
							for (var l_facts in pdataOnPremises.items[rowIdxOffProData].data.children) {
								if (pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["RAB"]) {
									if (pdataOnPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
										//  FL deal row index...
										l_idx_Fact_RAB = l_facts;
										l_idx_FrontlineDeal = rowIdxOffProData;
									}
									tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[rowIdxOffProData].data.children[l_facts][m_arrMonths[l_Month]]));
									break;
								}
							}
						}
					}
					//Add PG deal mix Percentage data in Weighted Average NetFOB
					if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]]) != "") {
						tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[m_arrMonths[l_Month]])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_RAB][m_arrMonths[l_Month]]));
					}
					pdataSummary.items[prowIdxRABOnPremises].set(m_arrMonths[l_Month], tempvalue)
				}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxRABOnPremises].data, pdataOnPremises.items[prowIdxOnVolumeOnPremises].data);

				pdataSummary.items[prowIdxRABOnPremises].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxRABOnPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxRABOnPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxRABOnPremises].set("FYvsPY", l_weightedAvg.FYvsPY);
			} else if (e != undefined) {
				//if (e.record.data.children.length > 0) {
				var tempvalue = 0;
				l_idx_PromoGoodDeal = -1;
				l_idx_FrontlineDeal = -1;
				for (var rowIdxOffProData in pdataOnPremises.items) {
					if (pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Volume"] && pdataOnPremises.items[rowIdxOffProData].data.MetricsType != m_PricePlanCodeNameMapping["Business"]) {
						if (pdataOnPremises.items[rowIdxOffProData].data["MetricsType"] == "PG") {
							// PG deal row index....
							l_idx_PromoGoodDeal = rowIdxOffProData;
						}
						var tempnet = 0;
						if (this.ValidateNumberReturnBlank(pdataOnPremises.items[rowIdxOffProData].data[e.field]) == "") {
							tempnet = 0;
						} else {
							tempnet = parseFloat(pdataOnPremises.items[rowIdxOffProData].data[e.field]);
						}
						tempnet = tempnet / 100;
						for (var l_facts in pdataOnPremises.items[rowIdxOffProData].data.children) {
							if (pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier != undefined && pdataOnPremises.items[rowIdxOffProData].data.children[l_facts].Qualifier == m_PricePlanCodeNameMapping["RAB"]) {
								if (pdataOnPremises.items[rowIdxOffProData].data["DealLevelCode"] == "Frontline") {
									//  FL deal row index...
									l_idx_Fact_RAB = l_facts;
									l_idx_FrontlineDeal = rowIdxOffProData;
								}
								tempvalue = tempvalue + tempnet * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[rowIdxOffProData].data.children[l_facts][e.field]));
								break;
							}
						}
					}
				}
				//Add PG deal mix Percentage data in Weighted Average NetFOB
				if (l_idx_PromoGoodDeal != -1 && l_idx_FrontlineDeal != -1 && this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[e.field]) != "") {
					tempvalue += parseFloat(this.ValidateNumberReturnBlank(pdataOnPremises.items[l_idx_PromoGoodDeal].data[e.field])) / 100 * parseFloat(this.ValidateNumberReturnZero(pdataOnPremises.items[l_idx_FrontlineDeal].data.children[l_idx_Fact_RAB][e.field]));
				}
				pdataSummary.items[prowIdxRABOnPremises].set(e.field, tempvalue)
				//}

				//get Totals (OffPremises) SummaryGrid
				var l_weightedAvg = this.calculateWeightedAverageTotals(
						pdataSummary.items[prowIdxRABOnPremises].data, pdataOnPremises.items[prowIdxOnVolumeOnPremises].data);

				pdataSummary.items[prowIdxRABOnPremises].set("FY", l_weightedAvg.FY);
				pdataSummary.items[prowIdxRABOnPremises].set("YTD", l_weightedAvg.YTD);
				pdataSummary.items[prowIdxRABOnPremises].set("4MTHS", l_weightedAvg.FMTHS);
				pdataSummary.items[prowIdxRABOnPremises].set("FYvsPY", l_weightedAvg.FYvsPY);

			}

		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	};

	//////****************************** CALCULATE CURRENT SECTION ************************************//////////
	this.calculateCurrentSectionOnLoad = function (p_Data) {
		//GET STORE AND DATA OF SUMMAY GRID...................
		var l_dataSummary = p_Data["Price Plan"]["Summary"];

		//GET STORE AND DATA OF OFF PREMISES CURRENT...............
		var l_dataOff = p_Data["OFF"]["Current"];

		//GET STORE AND DATA OF ON PREMISES CURRENT..............
		var l_dataOn = p_Data["ON"]["Current"];

		//GET STORE AND DATA OF ON  PREMISES CURRENT PG..............
		var l_dataPGONPro = p_Data["PG_ON"]["Current"];

		//GET STORE AND DATA OF OFF PREMISES CURRENT PG...................
		var l_dataPGOFFPro = p_Data["PG_OFF"]["Current"];

		var l_rowVolCurrentYear;
		var l_rowNetFob;
		var l_rowNetFobOffPremise;
		var l_rowNetFobOnPremise;
		var l_rowAlloCostPreCase;
		var l_rowAlloCostPreCaseOff;
		var l_rowAlloCostPreCaseOn;
		var l_rowNetFobExclusivePromo;
		var l_rowNetFobExclusivePromoOff;
		var l_rowNetFobExclusivePromoOn;

		var l_rowOffVolumeOffPremises;
		var l_rowTotPerBuisnessOffPremises;

		var l_rowOnVolumeOnPremises;
		var l_rowTotPerBuisnessOnPremises;

		//GET ROW WITH RECORDS SUMMARY GRID.................
		for (var l_rowIdx in l_dataSummary) {
			if (l_dataSummary[l_rowIdx].MetricsType == "Current" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowVolCurrentYear = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "NetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFob = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "OffPremiseNetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFobOffPremise = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "OnPremiseNetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFobOnPremise = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_CASES" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowAlloCostPreCase = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_OFF_CASES" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowAlloCostPreCaseOff = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_ON_CASES" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowAlloCostPreCaseOn = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_NetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFobExclusivePromo = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_OFF_NetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFobExclusivePromoOff = l_dataSummary[l_rowIdx];
			} else if (l_dataSummary[l_rowIdx].MetricsType == "PG_ON_NetFOB" && l_dataSummary[l_rowIdx].Type == "Current") {
				l_rowNetFobExclusivePromoOn = l_dataSummary[l_rowIdx];
			}
		}

		//GET ROW WITH OF RECORDS OFF CURRENT GRID.................
		l_rowOffVolumeOffPremises = this.getRow(l_dataOff.children, "MetricsType", "Volume");
		l_rowTotPerBuisnessOffPremises = this.getRow(l_dataOff.children, "MetricsType", "Business");

		//GET ROW WITH OF RECORDS ON CURRENT GRID.................
		l_rowOnVolumeOnPremises = this.getRow(l_dataOn.children, "MetricsType", "Volume");
		l_rowTotPerBuisnessOnPremises = this.getRow(l_dataOn.children, "MetricsType", "Business");

		//GET ROW WITH RECORDS OFF CURRENT PG GRID.................
		var l_RowRecord_Business_OFF = this.getRow(l_dataPGOFFPro, "MetricsType", "Percent of Business");
		var l_RowRecord_PG_SDA_OFF = this.getRow(l_dataPGOFFPro, "MetricsType", "PG_SDA");
		var l_RowRecord_AllocatedCost_OFF = this.getRow(l_dataPGOFFPro, "MetricsType", "Allocated Budget");

		//GET ROW WITH RECORDS ON CURRENT PG GRID.................
		var l_RowRecord_Business_ON = this.getRow(l_dataPGONPro, "MetricsType", "Percent of Business");
		var l_RowRecord_PG_SDA_ON = this.getRow(l_dataPGONPro, "MetricsType", "PG_SDA");
		var l_RowRecord_AllocatedCost_ON = this.getRow(l_dataPGONPro, "MetricsType", "Allocated Budget");

		//********************CALCULATE ALLOCATED BUDGET PG GIRDS************************//
		for (var l_month in m_arrMonths) {
			l_RowRecord_AllocatedCost_OFF[m_arrMonths[l_month]] = this.ValidateNumberReturnZero(l_rowOffVolumeOffPremises[m_arrMonths[l_month]]) * this.ValidateNumberReturnZero(l_RowRecord_PG_SDA_OFF[m_arrMonths[l_month]]) * (this.ValidateNumberReturnZero(l_RowRecord_Business_OFF[m_arrMonths[l_month]]) / 100);

			l_RowRecord_AllocatedCost_ON[m_arrMonths[l_month]] = this.ValidateNumberReturnZero(l_rowOnVolumeOnPremises[m_arrMonths[l_month]]) * this.ValidateNumberReturnZero(l_RowRecord_PG_SDA_ON[m_arrMonths[l_month]]) * (this.ValidateNumberReturnZero(l_RowRecord_Business_ON[m_arrMonths[l_month]]) / 100);
		}

		//***************CALCULATE NETFOB EXCLUSIVE*******************//
		this.copynetFOBExcluisveFromNetFOB(l_rowNetFobExclusivePromoOff, l_rowNetFobOffPremise);
		this.copynetFOBExcluisveFromNetFOB(l_rowNetFobExclusivePromoOn, l_rowNetFobOnPremise);
		this.copynetFOBExcluisveFromNetFOB(l_rowNetFobExclusivePromo, l_rowNetFob);

		//***************CALCULATE ALLOCATION COST PER CASE************//
		for (var l_Month in m_arrMonths) {
			l_rowAlloCostPreCaseOff[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero(this.ValidateNumberReturnZero(l_RowRecord_AllocatedCost_OFF[m_arrMonths[l_Month]]) / this.ValidateNumberReturnZero(l_rowOffVolumeOffPremises[m_arrMonths[l_Month]]));

			l_rowAlloCostPreCaseOn[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero(this.ValidateNumberReturnZero(l_RowRecord_AllocatedCost_ON[m_arrMonths[l_Month]]) / this.ValidateNumberReturnZero(l_rowOnVolumeOnPremises[m_arrMonths[l_Month]]));

			l_rowAlloCostPreCase[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero((this.ValidateNumberReturnZero(l_rowAlloCostPreCaseOff[m_arrMonths[l_Month]]) * this.ValidateNumberReturnZero(l_rowOffVolumeOffPremises[m_arrMonths[l_Month]]) + this.ValidateNumberReturnZero(l_rowAlloCostPreCaseOn[m_arrMonths[l_Month]]) * this.ValidateNumberReturnZero(l_rowOnVolumeOnPremises[m_arrMonths[l_Month]])) / this.ValidateNumberReturnZero(l_rowVolCurrentYear[m_arrMonths[l_Month]]));

		}

		this.setTotals(l_rowAlloCostPreCaseOff, this.calculateWeightedAverageTotals(l_rowAlloCostPreCaseOff, l_rowOffVolumeOffPremises), true);

		this.setTotals(l_rowAlloCostPreCaseOn, this.calculateWeightedAverageTotals(l_rowAlloCostPreCaseOn, l_rowOnVolumeOnPremises), true);

		this.setTotals(l_rowAlloCostPreCase, this.calculateWeightedAverageTotals(l_rowAlloCostPreCase, l_rowVolCurrentYear), true)

		//***************CALCULATE NET FOB CURRENT************//
		for (var l_Month in m_arrMonths) {
			l_rowNetFobOffPremise[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero(l_rowNetFobExclusivePromoOff[m_arrMonths[l_Month]]) - this.ValidateNumberReturnZero(l_rowAlloCostPreCaseOff[m_arrMonths[l_Month]]);

			l_rowNetFobOnPremise[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero(l_rowNetFobExclusivePromoOn[m_arrMonths[l_Month]]) - this.ValidateNumberReturnZero(l_rowAlloCostPreCaseOn[m_arrMonths[l_Month]]);

			l_rowNetFob[m_arrMonths[l_Month]] = this.ValidateNumberReturnZero(l_rowNetFobExclusivePromo[m_arrMonths[l_Month]]) - this.ValidateNumberReturnZero(l_rowAlloCostPreCase[m_arrMonths[l_Month]]);

		}
		this.setTotals(l_rowNetFobOffPremise, this.calculateWeightedAverageTotals(l_rowNetFobOffPremise, l_rowOffVolumeOffPremises), true);

		this.setTotals(l_rowNetFobOnPremise, this.calculateWeightedAverageTotals(l_rowNetFobOnPremise, l_rowOnVolumeOnPremises), true);

		this.setTotals(l_rowNetFob, this.calculateWeightedAverageTotals(l_rowNetFob, l_rowVolCurrentYear), true)

	}

	this.getRow = function (p_Data, p_columnDataIdx, p_Key) {
		for (var l_record in p_Data) {
			if (p_Data[l_record][p_columnDataIdx] == p_Key) {
				return p_Data[l_record];
			}
		}
	}

	this.copynetFOBExcluisveFromNetFOB = function (p_rowNetFOBExclusive, p_rowNetFOB) {
		if (p_rowNetFOB != undefined) {
			var l_netFOB = Ext.clone(p_rowNetFOB);
			for (var l_Month in m_arrMonths) {
				p_rowNetFOBExclusive[m_arrMonths[l_Month]] = l_netFOB[m_arrMonths[l_Month]];
			}

			p_rowNetFOBExclusive['FY'] = l_netFOB['FY'];
			p_rowNetFOBExclusive['YTD'] = l_netFOB['YTD'];
			p_rowNetFOBExclusive['4MTHS'] = l_netFOB['4MTHS'];
			p_rowNetFOBExclusive['FYvsPY'] = l_netFOB['FYvsPY'];
		}

	}

	this.setTotals = function (p_row, p_Total, p_FYvsPYRequierd) {
		p_row["FY"] = p_Total.FY;
		p_row["YTD"] = p_Total.YTD;
		p_row["4MTHS"] = p_Total.FMTHS;
		if (p_FYvsPYRequierd) {
			p_row["FYvsPY"] = p_Total.FYvsPY;
		}
	}

	/**Grid Synchronize implementation**/
	this.synchronizeGrigsScroll = function (e, t, gridID) {
		try {
			var l_arrTreeGridsId = [m_TGOFFPREMISESPROPOSED, m_TGOFFPREMISESCURRENT, m_TGONPREMISESPROPOSED, m_TGONPREMISESCURRENT];
			var l_arrGridId = [m_DGSUMMARYPROPOSED, m_DG_PG_OFFPREMISESPROPOSED, m_DG_PG_ONPREMISESPROPOSED, m_DG_PG_OFFPREMISESCURRENT, m_DG_PG_ONPREMISESCURRENT];
			for (var l_treeId in l_arrTreeGridsId) {
				if (gridID != l_arrTreeGridsId[l_treeId] && VistaarExtjs.getCmp(l_arrTreeGridsId[l_treeId]).TGObj.isVisible()) {
					VistaarExtjs.getCmp(l_arrTreeGridsId[l_treeId]).TGObj.view.getEl().dom.scrollLeft = t.scrollLeft;
				}
			}
			for (var l_gridId in l_arrGridId) {
				if (gridID != l_arrGridId[l_gridId] && Ext.getCmp(l_arrGridId[l_gridId]) && VistaarExtjs.getCmp(l_arrGridId[l_gridId]).DGObj.isVisible()) {
					VistaarExtjs.getCmp(l_arrGridId[l_gridId]).DGObj.view.getEl().dom.scrollLeft = t.scrollLeft;
				}
			}
			VistaarExtjs.getCmp("PP_ColumnFreezeGrd").DGObj.view.getEl().dom.scrollLeft = t.scrollLeft;
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	/**Ctrl+Z  stack implementation**/
	this.addEditedCellInfoToStack = function (p_objEditedKeyValue, p_strChannel, p_AttributeName, p_Opt_DealID) {
		try {
			var l_objEditedCellInfo;
			if (p_AttributeName == "PRG_Qualifier") {
				l_objEditedCellInfo = {
					"Channel" : p_strChannel,
					"AttributeName" : p_AttributeName
				}
				//create id for each record.............
				var l_recordKey = "";
				for (var attrName in l_objEditedCellInfo) {
					l_recordKey += l_objEditedCellInfo[attrName];
				}
				l_objEditedCellInfo["id"] = l_recordKey;

				//Remove the object if its already exists in array........
				for (var index in m_Stack_EditedCellInfo) {
					if (m_Stack_EditedCellInfo[index]["id"] == l_recordKey) {
						m_Stack_EditedCellInfo.splice(index, 1);
						break;
					}
				}
				//PUSH Edited cell info object into stack.........
				m_Stack_EditedCellInfo.push(l_objEditedCellInfo);
			} else {
				for (var monthKey in p_objEditedKeyValue) {
					l_objEditedCellInfo = {
						"Channel" : p_strChannel,
						"Month" : monthKey,
						"AttributeName" : p_AttributeName
					}
					if (p_Opt_DealID != undefined) {
						l_objEditedCellInfo["DealID"] = p_Opt_DealID;
					}
					//create id for each record.............
					var l_recordKey = "";
					for (var attrName in l_objEditedCellInfo) {
						l_recordKey += l_objEditedCellInfo[attrName];
					}
					l_objEditedCellInfo["id"] = l_recordKey;

					//Remove the object if its already exists in array........
					for (var index in m_Stack_EditedCellInfo) {
						if (m_Stack_EditedCellInfo[index]["id"] == l_recordKey) {
							m_Stack_EditedCellInfo.splice(index, 1);
							break;
						}
					}
					//PUSH Edited cell info object into stack.........
					m_Stack_EditedCellInfo.push(l_objEditedCellInfo);
				}
			}

			//console.log(m_Stack_EditedCellInfo);
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}

	}

	//Stack Pop Operation......
	this.popEditedStackTopData = function () {
		if (m_Stack_EditedCellInfo.length > 0) {
			var l_objStackTop = m_Stack_EditedCellInfo.pop();
			this.removeRecordFromEditedInfo(l_objStackTop)
			return l_objStackTop;
		}
	}

	//Remove deleted deal related info from stack...
	this.removeEditedCellInfoData = function (p_attributeKey, p_intKeyValue, p_intSelectedMonth) {
		// For Jan --> p_intSelectedMonth = 1..........
		/*if(p_intSelectedMonth == undefined){
		p_intSelectedMonth = 1;
		}*/
		for (var index = 0; index < m_Stack_EditedCellInfo.length; index++) {
			if (m_Stack_EditedCellInfo[index][p_attributeKey] == p_intKeyValue) {
				if (p_intSelectedMonth == undefined) {
					m_Stack_EditedCellInfo.splice(index, 1);
					index--;
					break;
				} else if (p_intSelectedMonth <= m_arrMonths.indexOf(m_Stack_EditedCellInfo[index].Month) + 1) {
					m_Stack_EditedCellInfo.splice(index, 1);
					index--;
				}
			}
		}
	}

	//Fetch edit grid Info Array
	this.fetchEditedInfo = function(){
		return m_arrGridEditRecord;
	}
	//Remove data from Edited info After Ctrl+Z operation.......
	this.removeRecordFromEditedInfo = function (p_objRecord) {
		try {
			if (p_objRecord.hasOwnProperty("DealID")) {
				for (var recordIndex in m_arrGridEditRecord) {
					if (m_arrGridEditRecord[recordIndex]["Variable Attributes"]["Channels"] == p_objRecord["Channel"] && m_arrGridEditRecord[recordIndex]["Variable Attributes"]["DealID"] == p_objRecord["DealID"]) {
						//Remove edited details.....
						delete m_arrGridEditRecord[recordIndex]["Values"][p_objRecord.Month];
						//Delete Empty object...........
						if (Object.getOwnPropertyNames(m_arrGridEditRecord[recordIndex]["Values"]).length == 0) {
							delete m_arrGridEditRecord[recordIndex]["Values"];
						}
						//Remove Edited Info object if changes is not present..........
						if (Object.getOwnPropertyNames(m_arrGridEditRecord[recordIndex]).length == 1) {
							m_arrGridEditRecord.splice(recordIndex, 1);
						}
						break;
					}
				}

			} else {
				for (var recordIndex in m_arrGridEditRecord) {
					if (m_arrGridEditRecord[recordIndex]["Variable Attributes"]["Channels"] == p_objRecord["Channel"]) {
						//Remove edited details.....
						if (p_objRecord.AttributeName == "PRG_Qualifier") {
							delete m_arrGridEditRecord[recordIndex][p_objRecord.AttributeName];
						} else {
							delete m_arrGridEditRecord[recordIndex][p_objRecord.AttributeName][p_objRecord.Month];
							//Delete Empty object...........
							if (Object.getOwnPropertyNames(m_arrGridEditRecord[recordIndex][p_objRecord.AttributeName]).length == 0) {
								delete m_arrGridEditRecord[recordIndex][p_objRecord.AttributeName];
							}
						}
						//Remove Edited Info object if changes is not present..........
						if (Object.getOwnPropertyNames(m_arrGridEditRecord[recordIndex]).length == 1) {
							m_arrGridEditRecord.splice(recordIndex, 1);
						}
						break;
					}
				}

			}
		} catch (err) {
			getCommonFuncMgr().printLog(err);
		}
	}

	//Dipali
	this.massCopySelect = function (p_GridData) {
		for (i = 0; i < p_GridData.children.length; i++) {
			if (p_GridData.children[i].MetricsType == undefined) {
				p_GridData.children[i]["MassCopySelect"] = false;
				//console.log("MassCopySelect");
				//p_GridData.children[i].checked=true;
			}
		}
		return p_GridData;
	}

	//Changes by Dipali - for Copy deals from PP
	this.isAllChecked = function (gridObj) {
		var gridStore = gridObj.TGObj.getStore();
		for (i = 2; i < gridStore.data.length; i++) {
			if (gridStore.data.items[i].data.checked == false) {
				return false;
			}
		}
		return true;
	}

	this.isAllUnChecked = function (gridObj) {
		var gridStore = gridObj.TGObj.getStore();
		for (i = 2; i < gridStore.data.length; i++) {
			if (gridStore.data.items[i].data.checked == true) {
				return false;
			}
		}
		return true;
	}
	this.hideshowMassCopyButton = function (btnId, flag) {
		var MassCopyBtn = Ext.getCmp(btnId);
		if (MassCopyBtn != undefined) {
			if (!flag) {
				//g_massCopyDeals = [];
				MassCopyBtn.hide();
			} else {
				MassCopyBtn.show();
			}
		}
	};
	
	//15Apr16
	this.resetDealCopyData = function () {
		g_massCopyDeals = {
			"on" : [],
			"off" : []
		};
	};

	this.grid_headerCheck = function (gridObj, ct, column, e, t, eOpts) {

		var gridStore = gridObj.TGObj.getStore();
		var isAllChecked = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().isAllChecked(gridObj);
		//30Mar16
		//g_massCopyDeals = [];
		//g_massCopyDealCounter = 0;

		if (isAllChecked == false) {
			/*for (i = 2; i < gridStore.data.length; i++) {
			if (gridStore.data.items[i].data.checked == false) {
			gridStore.data.items[i].data.checked = true;
			gridStore.data.items[i].data.MassCopySelect = true;
			}
			//30Mar16
			var dealData = gridStore.data.items[i].data;
			g_massCopyDeals.push(dealData);
			g_massCopyDealCounter++;
			}*/

			//show MassCopy btn
			if (gridObj.id == "TG_OffPremisesProposed" || gridObj.id == "TG_OffPremisesCurrent") {
				g_massCopyDeals["off"] = [];
				for (i = 2; i < gridStore.data.length; i++) {
					if (gridStore.data.items[i].data.checked == false) {
						gridStore.data.items[i].data.checked = true;
						gridStore.data.items[i].data.MassCopySelect = true;
					}
					//30Mar16
					var dealData = gridStore.data.items[i].data;
					g_massCopyDeals["off"].push(dealData);
					//g_massCopyDealCounter++;
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOffPremise_MassCopy", true);
			}
			if (gridObj.id == "TG_OnPremisesProposed" || gridObj.id == "TG_OnPremisesCurrent") {
				g_massCopyDeals["on"] = [];
				for (i = 2; i < gridStore.data.length; i++) {
					if (gridStore.data.items[i].data.checked == false) {
						gridStore.data.items[i].data.checked = true;
						gridStore.data.items[i].data.MassCopySelect = true;
					}
					//30Mar16
					var dealData = gridStore.data.items[i].data;
					g_massCopyDeals["on"].push(dealData);
					//g_massCopyDealCounter++;
				}
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOnPremise_MassCopy", true);
			}

			gridObj.TGObj.view.refresh();
			if (column.hasCls("clsPPHeaderCheckBoxUnChecked")) {
				column.removeCls("clsPPHeaderCheckBoxUnChecked");
				column.addCls("clsPPHeaderCheckBoxChecked");
			}
		} else {
			for (i = 2; i < gridStore.data.length; i++) {
				if (gridStore.data.items[i].data.checked == true) {
					gridStore.data.items[i].data.checked = false;
					gridStore.data.items[i].data.MassCopySelect = false;
				}
			}
			gridObj.TGObj.view.refresh();
			if (column.hasCls("clsPPHeaderCheckBoxChecked")) {
				column.removeCls("clsPPHeaderCheckBoxChecked");
				column.addCls("clsPPHeaderCheckBoxUnChecked");
			}
			//hide MassCopy btn
			if (gridObj.id == "TG_OffPremisesProposed" || gridObj.id == "TG_OffPremisesCurrent") {
				g_massCopyDeals["off"] = [];
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOffPremise_MassCopy", false);
			}
			if (gridObj.id == "TG_OnPremisesProposed" || gridObj.id == "TG_OnPremisesCurrent") {
				g_massCopyDeals["on"] = [];
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOnPremise_MassCopy", false);
			}
		}
	};

	this.grid_CheckChange = function (gridObj, checkcolumn, rowIndex, checked, eOpts) {
		//var gridStore = gridObj.TGObj.getStore();

		var isAllChecked = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().isAllChecked(gridObj);
		if (isAllChecked) {
			if (checkcolumn.hasCls("clsPPHeaderCheckBoxUnChecked")) {
				checkcolumn.removeCls("clsPPHeaderCheckBoxUnChecked");
				checkcolumn.addCls("clsPPHeaderCheckBoxChecked");
			}
		} else {
			if (checkcolumn.hasCls("clsPPHeaderCheckBoxChecked")) {
				checkcolumn.removeCls("clsPPHeaderCheckBoxChecked");
				checkcolumn.addCls("clsPPHeaderCheckBoxUnChecked");
			}
		}

		var isAllUnChecked = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().isAllUnChecked(gridObj);
		if (isAllUnChecked) {
			//hide MassCopy btn
			if (gridObj.id == "TG_OffPremisesProposed" || gridObj.id == "TG_OffPremisesCurrent") {
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOffPremise_MassCopy", false);
			}
			if (gridObj.id == "TG_OnPremisesProposed" || gridObj.id == "TG_OnPremisesCurrent") {
				getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().hideshowMassCopyButton("BtnPricePlanOnPremise_MassCopy", false);
			}
		}

		//30Mar16
		getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getDealsForMassCopy(gridObj, rowIndex, checked);
		/*if (gridObj.id == "TG_OffPremisesProposed" || gridObj.id == "TG_OffPremisesCurrent") {
		getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getOffPremiseDeals(gridStore, rowIndex, checked);
		}
		if (gridObj.id == "TG_OnPremisesProposed" || gridObj.id == "TG_OnPremisesCurrent") {
		getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().getOnPremiseDeals(gridStore, rowIndex, checked);
		}*/
	};

	this.getDealsForMassCopy = function (gridObj, index, checked) {

		/*var dealData = gridStore.data.items[index].data;
		if (checked == true) {
		g_massCopyDeals.push(dealData);
		g_massCopyDealCounter++;
		} else {
		for (i = 0; i < g_massCopyDeals.length; i++) {
		if (g_massCopyDeals[i].DealID == dealData.DealID) {
		g_massCopyDeals.splice(i, 1);
		g_massCopyDealCounter--;
		}
		}
		}*/
		var gridStore = gridObj.TGObj.getStore();
		if (gridObj.id == "TG_OffPremisesProposed" || gridObj.id == "TG_OffPremisesCurrent") {
			var dealData = gridStore.data.items[index].data;
			if (checked == true) {
				/*if (g_massCopyDeals["off"] == undefined) {
				g_massCopyDeals["off"] = [];
				}*/
				g_massCopyDeals["off"].push(dealData);
				//g_massCopyDealCounter_off++;
			} else {
				for (i = 0; i < g_massCopyDeals["off"].length; i++) {
					if (g_massCopyDeals["off"][i].DealID == dealData.DealID) {
						g_massCopyDeals["off"].splice(i, 1);
						//g_massCopyDealCounter_off--;
					}
				}
			}
		}
		if (gridObj.id == "TG_OnPremisesProposed" || gridObj.id == "TG_OnPremisesCurrent") {
			var dealData = gridStore.data.items[index].data;
			if (checked == true) {
				/*if (g_massCopyDeals["on"] == undefined) {
				g_massCopyDeals["on"] = [];
				}*/
				g_massCopyDeals["on"].push(dealData);
				//g_massCopyDealCounter_on++;
			} else {
				for (i = 0; i < g_massCopyDeals["on"].length; i++) {
					if (g_massCopyDeals["on"][i].DealID == dealData.DealID) {
						g_massCopyDeals["on"].splice(i, 1);
						//g_massCopyDealCounter_on--;
					}
				}
			}
		}
	};

	this.getDealsForMassCopy1 = function () {
		var l_massCopyDeals = g_massCopyDeals["off"].concat(g_massCopyDeals["on"])
			return l_massCopyDeals;
	};

	this.setDealsArray = function () {
		g_massCopyDeals = {
			"on" : [],
			"off" : []
		};
	};
}
