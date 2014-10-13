(function ( $ ) {

	$.fn.teidragdrop = function(params) {
		var $elements = this; //Represent $($elements).teidragdrop(params)
		//This should be the textarea where we retrieve our text to create a grid

		var $defaultParameters = {
			"watch" : true,	//If set to true, the plugin will watch for modifications made on the $elements
			"line" : "<l />",
			"linegroup" : "<lg />", //Dom elements to regroup lines
			"linebreak" : null, //Element to insert before the end of a line
			"grid-selector" : null 
		}
		if(!$elements.is("textarea")) {
			console.log("Element on which instance is built is not a textarea.")
		}

		var $originalValue = $($elements.value())

		console.log($originalValue)

	}

});