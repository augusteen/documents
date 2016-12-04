
/** 
     * @fileOverview This files contain Creator Matrix functions for BRMS Creator deployment
     * @author anadar
     * @version 1.0.0
     */
    
/**
 * @module  CreatorMatrix
 */
importPackage(com.vistaar.docserver.util);
importPackage(org.json);
importPackage(java.lang);

var inpRoles= new org.json.JSONArray(docServerManager.getAllRolesDetails());
var BRMSConnector = VistaarJSUtils.getBRMSConnector(userConnInfo);

var CreatorMatrix = "CWF_CreatorMatrix_DT";
var creatorRuleSetObject = BRMSConnector.loadRuleSet(CreatorMatrix);

var creatorRuleSetObjectJSON = new org.json.JSONObject(creatorRuleSetObject.toString());
creatorRuleSetObjectJSON.get("DecisionTableInfo").put("Data",[]);

addToCreatorMatrix(inpRoles,creatorRuleSetObjectJSON);

var CreatorMatrixRuleSet=new com.vistaar.rules.dataObjects.RuleSet(creatorRuleSetObjectJSON.toString());
BRMSConnector.saveRuleSet(CreatorMatrixRuleSet);
var retVal = BRMSConnector.registerRules("DOA_CreatorMatrix_RB", 1 , true);
output="success";

function addToCreatorMatrix(inpRoles,CreatorMatrix_DT)
{	
	try{
		var ruleSetData = JSON.parse(CreatorMatrix_DT.get("DecisionTableInfo").get("Data"));
		
		var l_inpRolesLen=inpRoles.length();
		var l_role=null;
		for(var roleItr=0;roleItr < l_inpRolesLen;roleItr++)
		{
			l_role=String(inpRoles.get(roleItr).get("roleName"));
			if(l_role=="Administrator" || l_role=="ADMIN-ALL GEOGRAPHY-ALL")
			{	
				var tmpArr=["PricePlan","All Geography","All Geography","All Product","All Product",false,null,null,"",null];
				tmpArr[8]=l_role;
				ruleSetData.push(tmpArr);
				continue;
			}
			var l_roleSplitArr=l_role.split("-");
			var l_cust=l_roleSplitArr[0];
			if(l_cust=="AP1" || l_cust=="AP2" || l_cust=="CR" || l_cust=="CRNR" || l_cust=="CRSD")
			{
				var geographyArr=l_roleSplitArr[1].split("_");
				var productArr=l_roleSplitArr[2].split("_");
				var geographyArrLen=geographyArr.length;
				var productArrLen=productArr.length;
				for(var geoItr=0;geoItr < geographyArrLen;geoItr++)
				{
					var CreatorMatrixEntry=["PricePlan","","","","",false,null,null,"",null];
					CreatorMatrixEntry[8]=l_role;
					var geog=geographyArr[geoItr];
					addGeography(CreatorMatrixEntry,geog);

					for(var prodItr=0;prodItr<productArrLen;prodItr++)
					{
						var finalCreatorMatrixEntry=JSON.parse(JSON.stringify(CreatorMatrixEntry));
						var prod=productArr[prodItr];
						addProduct(finalCreatorMatrixEntry,prod);
						ruleSetData.push(finalCreatorMatrixEntry);
					}
				}
			}
		}
		CreatorMatrix_DT.get("DecisionTableInfo").put("Data",ruleSetData);
		
	}catch(err){
		println('Error while adding user roles ' + err);
	}
}

function addGeography(CreatorMatrixEntry,geog)
{
	if(geog=="ALL GEOGRAPHY")
	{
		CreatorMatrixEntry[1]="All Geography";
		CreatorMatrixEntry[2]="All Geography";
	}
	else if(geog.charAt(0)=="S")
	{
		CreatorMatrixEntry[1]="State";
		CreatorMatrixEntry[2]=geog;
	}
	else if(geog.charAt(0)=="R")
	{
		CreatorMatrixEntry[1]="Region";
		CreatorMatrixEntry[2]=geog;
	}else{
		throw "GEOGRAPHY LEVEL is not supported";
	}
}

function addProduct(CreatorMatrixEntry,prod)
{
	if(prod=="ALL")
	{
		CreatorMatrixEntry[3]="All Product";
		CreatorMatrixEntry[4]="All Product";
	}
	else
	{
		CreatorMatrixEntry[3]="Business Unit";
		CreatorMatrixEntry[4]=prod;
	}
}