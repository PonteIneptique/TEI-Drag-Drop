(function ( $ ) {

	$.fn.teidragdrop = function(params) {
		var	$elements = this, //Represent $($elements).teidragdrop(params). This should be the textarea where we retrieve our text to create a grid
			$blocks = $($elements.val()), //Dom Set of the original elements
			$container = null, //Grid container (<div> or whatever)
			$grid = null, //Grid (<ul>)
			$gridster = null, //Grister instance placeholder
			$params = { //Default Params
				"watch" : true,	//If set to true, the plugin will watch for modifications made on the $elements
				"line" : "<l />",
				"linegroup" : "<lg />", //Dom elements to regroup lines
				"linebreak" : null, //Element to insert before the end of a line
				"grid-selector" : null //If not set, create a grid after $elements. Else create a grid IN grid-selector
			}

		//Extends and merge params
		$.extend($params, params);

		//Initiating the grid
		if($params["grid-selector"] != null) {
			var $container = $($params["grid-selector"]);
		} else {
			instanceNumber = 0;
			while ($(".teidragdrop-container" + instanceNumber).length != 0) {
				instanceNumber++;
			}
			var $container = $(".teidragdrop-container" + instanceNumber);
		}

		var _addBlock = function(index, block) {
			var $block = $("<li />");
			var $wrapper = $("<div />").html(block);	//Work around for getting proper properties

			$block.data("xml-representation", $wrapper.html())
			$block.text($wrapper.text())

			$gridster.add_widget($block)
		}

		var _initiateGrid = function() {
			//If there is not <ul>, we need to create one
			if($container.find("ul").length == 0) {  $container.append("<ul></ul>"); }
			//We initialize gridster
			$grid = $container.find("ul");
			$gridster = $grid.gridster().data('gridster');
			$.each($blocks, function(index, block) {
				_addBlock(index, block)
			})
		}
		_initiateGrid()

		//<- Debug
		if(!$elements.is("textarea")) {
			console.log("Element on which instance is built is not a textarea.")
		}
		//-> Debug

		//Mandatory
		return this;
	};

}( jQuery ));