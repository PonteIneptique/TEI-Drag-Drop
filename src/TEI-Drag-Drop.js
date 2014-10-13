(function ( $ ) {
	//PLACEHOLDER FOR FUTURE I18N
	var $lang = {
		"GetXML" : "Get XML",
		"ToggleXML" : "Show / Hide XML",
		"UpdateLines" : "Update Lines",
		"Lines" : "Lines"
	}

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
				"toolbar" : ["Serialize", "ToggleXML"], //List of available buttons to add in the toolbar 
				"linegroup" : "<lg />", //Dom elements to regroup lines
				"linebreak" : "<lb />", //Element to insert before the end of a line
				"grid-selector" : null, //If not set, create a grid after $elements. Else create a grid IN grid-selector
				"rows" : 4, // "Base widget dimensions in pixels. The first index is the width, the second is the height."
				"widthHeightRatio" : 2, //"widthHeightRatio" applied for blocks
				"btn.class" : "btn", //Class for the button
				"btn.legend" : "Serialize",
				"btn" : null, //Generate the button if null, else should be a DOM object
				"startline" : 1, //Line from which we count
				"pre" : true, //Append a <pre> in the toolbar if set to true
				"linestool" : true //Add a tool to add lines to grid
			}

		//<- Grid Plugin Dependent functions

		var _toolbarGeneration = function() {
			/*
			 *	Generate a toolbar
			 */

			//Toolbar itself
			var $toolbar = $("<div />", {
				"class" : "teidragdrop-toolbar"
				});
				
			if($params["toolbar"].length > 0) {
				//<pre> For XML SHOWING
				var $pre = $("<pre />", {
					"style" : "width:90%;"
					});
				//Button for export and serialize to XML
				var $exportBtn = $("<button />", {
					"class" : "btn btn-default",
					"type" : "button",
					"text" : $lang["GetXML"]
					});
				$exportBtn.on("click", function() { $pre.text(_serialize()); })
				var $hideXML = $("<button />", {
					"class" : "btn btn-default",
					"type" : "button",
					"text" : $lang["ToggleXML"]
					});
				$hideXML.on("click", function() { $pre.toggle(); })

				//List of Available buttons
				var $available = {
					"Serialize" : $exportBtn,
					"ToggleXML" : $hideXML
				}

				//Button group for buttons
				var $buttongroup = $("<div />", {
					"class" : "btn-group"
					});

				for(var i = 0; i < $params["toolbar"].length; i++) {
					$buttongroup.append($available[$params["toolbar"][i]])
				}
				$toolbar.append($buttongroup);
			}

			if($params["linestool"]) {
				var $inputgroup = $("<div />", { "class" : "input-group", "style" : "width:200px; float:left; margin-right:10px;"}),
					$inputaddon = $("<span />", { "class" : "input-group-addon", text : $lang["UpdateLines"]}),
					$inputtext = $("<input />", { "class" : "form-control", type : "text", value : $params["rows"], placeholder : $lang["Lines"]})
				
				$inputtext.on("change", function() { _upgradeLines($inputtext.val()) });
				$inputaddon.on("click", function() { _upgradeLines($inputtext.val()) });
				$inputgroup.append($inputaddon, $inputtext);
				$toolbar.append($inputgroup);
			}

			$toolbar.append($("<div />").append($pre))
			$container.after($toolbar);

		}

		var _upgradeLines = function(lines) {
			/*
			 *	Reload with given number of lines
			 */
			if(!isNaN(lines)) {
				$params["rows"] = parseInt(lines);
				var $instance = _getInstance();
				if(typeof $instance !== "undefined") {
					$instance.resize($params["rows"])
				}
			}
		}

		var _checksum = function(DOMObject) {
			/*
			 *	Generate a unique checksum for a DOMObject
			 */
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
			/*
			 *	Return nodes from the textarea, verifying duplicates and textNodes
			 */
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

		var _addBlocks = function(list) {
			/*
			 *	Add a list of blocks to the grid
			 */
			$.each(list, function(index, block) {
				_addBlock(index, block)
			})
		}
		//->Grid Plugin Dependent functions

		var _addBlock = function(index, block) {
			/*
			 *	Add a block to the grid
			 */
			var $block = $("<li />"),
				$wrapper = $("<div />").html(block),	//Work around for getting proper properties
				$xy  = _lastItem($grid.find("li").length + 1);


			$block.data("xml-representation", $wrapper.html())
			$block.append($("<div />", { "class" : "inner" }).text($wrapper.text()))
			$block.attr("data-w", 1)
			$block.attr("data-h", 1)

			$block.attr("data-x", $xy[0])
			$block.attr("data-y", $xy[1])

			//A new item should be added at the end of the list

			$grid.append($block);
		}

		var _initiateGrid = function() {
			/*
			 *		Initiate the grid. Only function to be called at the end of the setting
			 */
			//If there is not <ul>, we need to create one
			if($container.find("ul").length == 0) {  $container.append("<ul></ul>"); }
			//We initialize gridster
			$grid = $container.find("ul");

			_addBlocks($blocks)
			_createGrid()
			
		}



		var _createGrid = function() {
			/*
			 *		Create the grid
			 */
			$grid.gridList({
				rows: $params["rows"],
				widthHeightRatio : $params["widthHeightRatio"]
			});
		}

		var _getInstance = function() {
			return $grid.data('_gridList');
		}

		var _applyXY = function() {
			/*
			 *		Apply XY position attributes to each li
			 */
			$.each(_getInstance()._items, function(index, element) {
				element.$element.attr("data-x", element.x)
				element.$element.attr("data-y", element.y)
			});
		}


		var _reload = function () {
			/*
			 *		Reload Grid
			 */
			if(typeof _getInstance()._items !== "undefined") { _applyXY(); }
			var instance = $grid.data('_gridList', false)
			_createGrid()
		}

		var _changed = function () {
			/*
			 *		Function to be called when textarea targeted is changed
			 */
			_addBlocks(_returnNodes())
			_reload()
		}

		var _serialize = function() {
			/*
			 *	Serialize the grid with its XML representation
			 */
			var $items = $grid.data('_gridList')._items;
			var $rows = {}
			$.each($items, function(index, element) {
				if(typeof $rows[element.y] === "undefined") { $rows[element.y] = {}; }
				$rows[element.y][element.x] = element.$element.data("xml-representation");
			})

			return _toXML(_toArray($rows));
		}

		var _toArray = function(object) {
			/*
			 *		Transform an object using int keys as an array
			 */
			var data = []
			for(var i = 0; i < Object.keys(object).length; i++) {
				data.push("");
			}
			$.each(object, function(index, element) {
				if (element !== null && typeof element === 'object') {
					element = _toArray(element)
				}
				data[parseInt(index)] = element;
			});
			return data;
		}

		var _toXML = function(rows) {
			/*
			 *		Convert a 2 dimensional array to an XML object text representation
			 */
			var lines = [];

			for(var i = 0; i < rows.length; i++) {
				var $l = $($params["line"]);
				var n = i + $params["startline"];
				$l.attr("n", n)

				if($params["linebreak"]) {
					rows[i].push(
						$("<div />").html(
							$($params["linebreak"]).attr("n", n)
						).html()
					)
				}

				$l.html("\n\t" + rows[i].join("\n\t") + "\n")

				lines.push(
					$("<div />").html($l).html()
				)
			}

			return lines.join("\n")
		}

		var _lastItem = function (items) {			
			/*
			 *		Return the position for a new item, including if $grid is not instantiated
			 */
			if(typeof $grid === "undefined" || typeof $grid.data('_gridList') === "undefined" || typeof $grid.data('_gridList')._items === "undefined" ) {
				if(typeof items === "number") {
					return [items - 1, 0];
				} else {
					return false;
				}
			}

			var $items = $grid.data('_gridList')._items,
				$rows = {},
				x = 0,
				y = 0;
			$.each($items, function(index, element) {
				if(typeof $rows[element.y] === "undefined") { $rows[element.y] = {}; }
				$rows[element.y][element.x] = element.$element.data("xml-representation");
			})
			$rows = _toArray($rows);
			y = $rows.length;
			x = $rows[y-1].length;

			return [x, y - 1];
		}



		/*********************************************************************
		 *********************************************************************
		 *******INIT**********************************************************
		 *********************************************************************
		 *********************************************************************/

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



		//Params dependent watch
		if($params["watch"] === true) {
			$elements.on("change", function() {
				_changed()
			})
		}
		if($params["btn"]) {
			$params["btn"].on("click", function() {
				console.log(_serialize())
			});
		}

		_initiateGrid()
		if($params["toolbar"].length > 0) { 
			console.log("Initiating ToolBar")
			_toolbarGeneration()
		}

		//<- Debug which should throw error
		if(!$elements.is("textarea")) {
			console.log("Element on which instance is built is not a textarea.")
		}
		//-> Debug

		//API ACCESS
		this.reload = _reload;

		//Mandatory
		return this;
	};

}( jQuery ));