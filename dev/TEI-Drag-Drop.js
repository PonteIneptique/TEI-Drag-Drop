(function ( $ ) {

	$.fn.teidragdrop = function(params) {
		var $elements = this; //Represent $($elements).teidragdrop(params)
		//This should be the textarea where we retrieve our text to create a grid

		var $originalValue = $($elements.val()) //Dom Set of the original elements

		//Default Params
		var $params = {
			"watch" : true,	//If set to true, the plugin will watch for modifications made on the $elements
			"line" : "<l />",
			"linegroup" : "<lg />", //Dom elements to regroup lines
			"linebreak" : null, //Element to insert before the end of a line
			"grid-selector" : null //If not set, create a grid after $elements. Else create a grid IN grid-selector
		}

		//Extends and merge params
		$.extend($params, params);

		//<- Debug
		console.log($params)
		if(!$elements.is("textarea")) {
			console.log("Element on which instance is built is not a textarea.")
		}
		console.log($originalValue)
		//-> Debug

		//Mandatory
		return this;
	};

}( jQuery ));