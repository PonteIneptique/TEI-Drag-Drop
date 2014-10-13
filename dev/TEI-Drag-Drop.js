(function ( $ ) {

	//IE FIX for indexOf ( http://stackoverflow.com/questions/1181575/javascript-determine-whether-an-array-contains-a-value )
	var indexOf = function(needle) {
		if(typeof Array.prototype.indexOf === 'function') {
			indexOf = Array.prototype.indexOf;
		} else {
			indexOf = function(needle) {
				var i = -1, index = -1;
				for(i = 0; i < this.length; i++) {
					if(this[i] === needle) {
						index = i;
						break;
					}
				}
				return index;
			};
		}

		return indexOf.call(this, needle);
	};

	$.fn.teidragdrop = function(params) {
		var	$elements = this, //Represent $($elements).teidragdrop(params). This should be the textarea where we retrieve our text to create a grid
			$blocks = [], //Dom Set of the original elements
			$container = null, //Grid container (<div> or whatever)
			$grid = null, //Grid (<ul>)
			$gridster = null, //Grister instance placeholder
			$hashes = [], //Known hashes list
			$params = { //Default Params
				"watch" : true,	//If set to true, the plugin will watch for modifications made on the $elements
				"line" : "<l />",
				"linegroup" : "<lg />", //Dom elements to regroup lines
				"linebreak" : null, //Element to insert before the end of a line
				"grid-selector" : null, //If not set, create a grid after $elements. Else create a grid IN grid-selector
				"widget_base_dimensions" : [100,30], // "Base widget dimensions in pixels. The first index is the width, the second is the height."
				"resize.enabled" : true, //"Set to true to enable drag-and-drop widget resizing. This setting doesn't affect to the resize_widget method."
				"btn.class" : "btn", //Class for the button
				"btn.legend" : "Serialize",
				"btn" : null, //Generate the button if null, else should be a DOM object

			}

		//Return a hash for a node
		var _checksum = function(DOMObject) {
			var s = $("<div />").append(DOMObject).html(),
				hash = 0,
				strlen = s.length,
				i,
				c;
			if ( strlen === 0 ) {
				return hash;
			}
			for ( i = 0; i < strlen; i++ ) {
				c = s.charCodeAt( i );
				hash = ((hash << 5) - hash) + c;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		};

		//Return a set of filtered nodes (== No TextNode) from a given TextArea
		var _returnNodes = function() {
			var blocks = []
			$.each($($elements.val()), function(index, block) {
				var hash = _checksum(block)
				if(block.nodeType != 3 && indexOf.call($hashes, hash) == -1) {
					blocks.push(block);
					$hashes.push(hash)
				}
			});
			return blocks;
		}
		$blocks = _returnNodes()
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
			var $container = $("<div />", {
				"class" : "teidragdrop-container teidragdrop-container" + instanceNumber
			});
			$elements.after($container)
		}

		var _addBlock = function(index, block) {
			var $block = $("<li />");
			var $wrapper = $("<div />").html(block);	//Work around for getting proper properties

			$block.data("xml-representation", $wrapper.html())
			$block.text($wrapper.text())

			$gridster.add_widget($block)
		}

		var _addBlocks = function(list) {
			$.each(list, function(index, block) {
				_addBlock(index, block)
			})
		}

		var _initiateGrid = function() {
			//If there is not <ul>, we need to create one
			if($container.find("ul").length == 0) {  $container.append("<ul></ul>"); }
			//We initialize gridster
			$grid = $container.find("ul");

			$gridster = $grid.gridster({
				"widget_base_dimensions" : $params["widget_base_dimensions"],
				"resize.enabled" : $params["resize.enabled"]
			}).data('gridster');
			_addBlocks($blocks)
		}
		_initiateGrid()

		if($params["watch"] === true) {
			console.log("WATCH")
			$elements.on("change", function() {
				console.log("HEY")
				_addBlocks(_returnNodes())
			})
		}

		//<- Debug
		if(!$elements.is("textarea")) {
			console.log("Element on which instance is built is not a textarea.")
		}
		//-> Debug

		if($params["btn"]) {
			$params["btn"].on("click", function() {
				console.log($gridster.serialize())
			})
		}


		//Mandatory
		return this;
	};

}( jQuery ));