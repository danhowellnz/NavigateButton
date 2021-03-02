({
	// Your renderer method overrides go here
	afterRender : function(component,helper){
        this.superAfterRender();
        var elements = document.querySelectorAll('[data-holder="NavButtonHolder"]');

       //add after last element
        if(component.get("v.appendFloatClearDiv")) {
			var lastElement = elements[elements.length-1 ];
            var newItem = document.createElement("div"); 
            newItem.setAttribute("style", "clear:both;display:block");
            newItem.setAttribute("special-type", "floatClear");
            lastElement.appendChild(newItem);
		}
        
        //Always ensure a button is clickable
        if(component.get("v.appendSldsCardStyle")) {
            var newCSSstyle= document.createElement("style"); 
            newCSSstyle.innerHTML = '.slds-card {clear: both;    min-height: 6.5REM;' ; 
            lastElement.appendChild(newCSSstyle);
        }
        
        
        //STop weird alignment from
        ////apply to first only nav button on page
      	elements[0].setAttribute("style", "margin-bottom: .75REM;");
   
        

     
    }
})
