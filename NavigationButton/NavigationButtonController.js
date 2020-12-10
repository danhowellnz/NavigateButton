({
    doInit : function (component, event, helper) {
        

        //If has a specifc id
        var specificrecordId = component.get("v.specificrecordId");
        if(specificrecordId!=null && specificrecordId != "" && specificrecordId != "recordId" && specificrecordId.length>15 && specificrecordId <=18){
            component.set("v.recordId",specificrecordId);
        }
        
        //Always start as not clicked
        component.set("v.Clicked",false);
        
		//If auto start
        if( component.get("v.AutoStart")
          //Not in appbuilder / flexipageEditor
          && window.location.href.indexOf("flexipageEditor") <0
          ){
        	console.log('Auto launching');
            let millisecondsdelay = 0;
            if(component.get("v.AutoStart_Delay")>0){
                millisecondsdelay = component.get("v.AutoStart_Delay")*1000;
                //Min  seconds
                if(millisecondsdelay < 2000){millisecondsdelay = 2000}
                //Launch with delay
                    window.setTimeout(
                        $A.getCallback(function() {
                            $A.enqueueAction(component.get('c.chooseAction'));  
                        }), millisecondsdelay
                    );
            }else{ //no delay
                $A.enqueueAction(component.get('c.chooseAction')); 
            }
            
            
        }
        
        
        //If has a position add in some CSS
        var buttonPosition = component.get("v.buttonPosition");
        if(buttonPosition != null) {buttonPosition = buttonPosition.toLowerCase();}
        
        var buttonStyle = component.get("v.buttonStyle");
        // needed for center
        if(buttonPosition!=null && buttonPosition != "" && buttonPosition != "default" && buttonPosition != "vertical"){
            //Add the position CSS to the front of the style
            var NewButtonStyle = 'text-align:'+buttonPosition +';'+ buttonStyle;
            component.set("v.buttonStyle",NewButtonStyle);
        }
        if(buttonPosition =='left'){
            component.set("v.NavigateButtonClass",'floatLeft');  
        }
        if(buttonPosition=='right'){
            component.set("v.NavigateButtonClass",'floatRight');  
        }
          
        
    },
    chooseAction : function (component, event, helper) {      
      
        //Mark as clicked (useful in flows)
        console.log('Clicked');
        component.set("v.Clicked", true);   
		var recordId = component.get("v.recordId");
        
        //Launch Flow
        if(component.get("v.FlowName") !=""){
             console.log('launchFlow');
              $A.enqueueAction(component.get('c.launchFlow'));
        }
        //Navigate Flow
         else if( component.get("v.FlowAction")!=""){
            	var action = component.get("v.FlowAction");	
                action = action.toUpperCase();
                if(action=="LAST" || action=="PREVIOUS" ){  action = "BACK";}
                var navigate = component.get('v.navigateFlow');  
        		navigate(action); 
            }
         //Call createNewRecord
          else  if( component.get("v.CreateObject")!=""){
                console.log('createNewRecord');
                $A.enqueueAction(component.get('c.createNewRecord'));
            }
         //Call if NavigateToUrl
            else if( component.get("v.NavigateToUrl")!=""){
                console.log('gotoURL');
                $A.enqueueAction(component.get('c.gotoURL'));
            }
        //Call Edit Record
            else if( component.get("v.recordId")!="" && component.get("v.editRecord")==true){
                console.log('editRecord');
                $A.enqueueAction(component.get('c.editRecord'));
            }
        //Go to related List
			else if( component.get("v.RelatedListId")!=""){
                console.log('gotoRelatedList');
                $A.enqueueAction(component.get('c.gotoRelatedList'));
          //Launch Quick Action
            }else if( component.get("v.QuickActionName")!=""){
                console.log('QuickAction:'+ component.get("v.QuickActionName"));
                $A.enqueueAction(component.get('c.quickAction'));
            }


        
    },
    
    
    
    launchFlow : function (component, event, helper) {
        
        var recordId = component.get("v.recordId");
        if(recordId==null || recordId=="" || recordId=="undefined"){
            recordId = component.get("v.FlowRecordId");
        }    
        if(recordId!=null && recordId!="" && recordId!="undefined"){
            var inputVariables = [ { name : "recordId", type : "String", value: recordId  }];
        }
        

    
        component.set("v.ModalOn", true);
        var flow = component.find('flow');
        flow.startFlow(component.get("v.FlowName"),inputVariables);
        console.log('flow launched');



        
        
    },
    
    gotoURL : function (component, event, helper) {
        var urlEvent = $A.get("e.force:navigateToURL");
        var NavigateToUrl = component.get("v.NavigateToUrl");
        var recordId = component.get("v.recordId");
        //add parameter with or without ? in place
        if(recordId!=null && recordId!="" && recordId!="undefined"){
        	NavigateToUrl += (NavigateToUrl.split('?')[1] ? '&':'?') + 'BeforeNavigateId='+recordId;
        }
        //Add merge field {recordId}
        if(recordId!=null && recordId!="" && recordId!="undefined" && NavigateToUrl.includes("{recordId}")){
        	NavigateToUrl = NavigateToUrl.replace("{recordId}", recordId);
        }
        console.log("NavigateToUrl: "+NavigateToUrl);
        urlEvent.setParams({
          "url": NavigateToUrl
        });
        urlEvent.fire();
    },
    
    
    
    
    
    createNewRecord: function(component, event, helper) {
        console.log('Launching createNewRecord');
        var createEvent = $A.get("e.force:createRecord");
        
        //get variables
        var CreateObject = component.get("v.CreateObject");
        	//Make first letter uppercase
        	CreateObject = CreateObject.charAt(0).toUpperCase() + CreateObject.substr(1);
        var CreateRecordtypeId = component.get("v.CreateRecordtypeId");  
        var recordid = component.get("v.recordId");
        var defaultFieldValues = component.get("v.defaultFieldValues");
        console.log('CreateRecordtypeId   '+CreateRecordtypeId);		
        
        //Set variables
        if(CreateObject!="" && CreateObject!=null){ 		createEvent.setParams({  "entityApiName": CreateObject });}
        if(CreateRecordtypeId !="" && CreateRecordtypeId!=null){ 	createEvent.setParams({  "recordTypeId": CreateRecordtypeId });}
        
        
        
        //--Very messy, capture the record ID and redirect back to the page we were on--//
        var NavigateToUrl = component.get("v.NavigateToUrl");

        //https://salesforce.stackexchange.com/questions/198168/lightning-forcecreaterecord-capture-redirect-after-save
        //console.log('NavigateToUrl wihout new recordID:   '+NavigateToUrl);
       
        //https://salesforce.stackexchange.com/questions/223283/override-e-forcecreaterecord-default-behaviour-on-save
        createEvent.setParams({ "navigationLocation": "LOOKUP" });
        
        createEvent.setParams({  "panelOnDestroyCallback": function(event) {
           console.log("panelOnDestroyCallback");
           console.log(event);
           console.log('Page after record create:   '+window.location.href);
           
           
           //Add the id and return
           //Remove the record name
           var ObjectName = window.location.href.split( '/').pop();
           var hrefwithoutname =window.location.href.replace("/"+ObjectName,"");
 
//  Not working so stopped
           //console.log('ObjectName:   '+ObjectName);
           var CreatedID = hrefwithoutname.split( '/').pop();
           // console.log('CreatedID:   '+CreatedID);
            //component.set("v.OutputCreatedID", CreatedID );
           
           if(NavigateToUrl != ''){
               NavigateToUrl += (NavigateToUrl.split('?')[1] ? '&':'?') + CreateObject+"_Id="+ CreatedID;
               console.log('Navigating to (with recordID):'+NavigateToUrl);
               setTimeout(function(){ 
                   window.location.href= NavigateToUrl;
               }, 500);
           }
      	 }
      });

        
        //set defaultFieldValues
        if(defaultFieldValues!=""){ 
            //split on ,
            var params = {};
            defaultFieldValues.split(',').forEach(
              field => {
                let parts = field.split(':',2);
                params[parts[0]] = parts[1];
              }
            );
            //console.log(params);
            createEvent.setParams({ defaultFieldValues: params });
        }
        
        createEvent.fire();
	},
    
    
    
    
    
    
    createRecord : function (component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": component.get("v.recordId"),
          "slideDevName": "related"
        });
        navEvt.fire();
    },
    
    
    
    
    
    editRecord : function(component, event, helper) {
        var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
             "recordId": component.get("v.recordId")
       });
        editRecordEvent.fire();
    },

	closeModalOnFinish : function(component, event, helper) {
        console.log('Flow component changed:'+ event.getParam('status'));
        if(event.getParam('status') === "FINISHED") {
            component.set("v.ModalOn", false);
            $A.get('e.force:refreshView').fire();
        }
 
        
    },
    

    
    
    closeFlowModal : function(component, event, helper) {
        component.set("v.ModalOn", false);
        console.log('e.force:refreshView');
        $A.get('e.force:refreshView').fire();
    },
    isRefreshed: function(component, event, helper) {
    	console.log('isRefreshed');
	},
    
    
    quickAction : function( component, event, helper) {
        var actionAPI = component.find("quickActionAPI");
        var QuickActionName = component.get("v.QuickActionName");
            
        var args = { actionName : QuickActionName};
        actionAPI.selectAction(args).then(function(result) {
            console.log(result);
        }).catch(function(e) {
            if (e.errors) {
                console.error(e.errors);
            }
        });
    },
    
  
})