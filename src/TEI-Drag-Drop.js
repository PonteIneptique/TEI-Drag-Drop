(function (factory) {
	if (typeof define === "function" && define.amd) {
	// AMD. Register as an anonymous module.
		define(["jquery"], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	//PLACEHOLDER FOR FUTURE I18N
	var $lang = {
		"GetXML" : "Get XML",
		"ToggleXML" : "Show / Hide XML",
		"UpdateLines" : "Update Lines",
		"Lines" : "Lines"
	};

	//IE FIX for indexOf ( http://stackoverflow.com/questions/1181575/javascript-determine-whether-an-array-contains-a-value )
	var indexOf = function(needle) {
		if(typeof Array.prototype.indexOf === "function") {
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

	var pluginName = "TeiDragDrop",
		$default = { //Default Params
			"watch" : true,	//If set to true, the plugin will watch for modifications made on the $elements
			"line" : "<l />",
			"toolbar" : ["Serialize", "ToggleXML"], //List of available buttons to add in the toolbar 
			"linegroup" : "<lg />", //Dom elements to regroup lines
			"linebreak" : "<lb />", //Element to insert before the end of a line
			"grid-selector" : null, //If not set, create a grid after $elements. Else create a grid IN grid-selector
			"rows" : 4, // "Base widget dimensions in pixels. The first index is the width, the second is the height."
			"widthHeightRatio" : 2, //"widthHeightRatio" applied for blocks
			"startline" : 1, //Line from which we count
			"pre" : true, //Append a <pre> in the toolbar if set to true
			"linestool" : true, //Add a tool to add lines to grid
			"rowHeight" : 50,
			"hierarchical" : false, //Take hierarchical informations from node
			"blocksWidth" : 1 //Default size for blocks
		};


	function Plugin ( element, options ) {
		this.element = $(element);
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend( {}, $default, options );
		this._defaults = $default;
		this._name = pluginName;

		this.blocks = []; //Dom Set of the original elements
		this.container = null; //Grid container (<div> or whatever)
		this.grid = null; //Grid (<ul>)
		this.hashes = []; //Known hashes list
		this.lang = $lang; //I18n Data

		this.init();
	}

	$.extend(Plugin.prototype, {
		init: function () {
			this.blocks = this.returnNodes();

			//Initiating the grid
			if(this.settings["grid-selector"] !== null) {
				this.container = $(this.settings["grid-selector"]);
			} else {
				instanceNumber = 0;
				while ($(".teidragdrop-container" + instanceNumber).length !== 0) {
					instanceNumber++;
				}
				this.container = $("<div />", {
					"class" : "teidragdrop-container teidragdrop-container" + instanceNumber
				});
				this.element.after(this.container);
			}



			//Params dependent watch
			if(this.settings.watch === true) {
				self = this;
				this.element.on("change", function() {
					self.changed();
				});
			}

			this.initiateGrid();
			if(this.settings.toolbar.length > 0) { 
				console.log("Initiating ToolBar");
				this.toolbarGeneration();
			}
		},
		toolbarGeneration : function() {
			/*
			 *	Generate a toolbar
			 */

			var self = this,
			//Toolbar itself
				$toolbar = $("<div />", {
				"class" : "teidragdrop-toolbar"
				}),
				$pre;
				
			if(this.settings.toolbar.length > 0) {
				//<pre> For XML SHOWING
				$pre = $("<pre />", {
						"style" : "width:90%;"
					});
				//Button for export and serialize to XML
				var	$exportBtn = $("<button />", {
						"class" : "btn btn-default",
						"type" : "button",
						"text" : self.lang.GetXML
					}),
					$hideXML = $("<button />", {
						"class" : "btn btn-default",
						"type" : "button",
						"text" : self.lang.ToggleXML
					});
				$exportBtn.on("click", function() { $pre.text(self.serialize()); });
				$hideXML.on("click", function() { $pre.toggle(); });

				//List of Available buttons
				var $available = {
						"Serialize" : $exportBtn,
						"ToggleXML" : $hideXML
					},
				//Button group for buttons
					$buttongroup = $("<div />", {
						"class" : "btn-group"
					});

				for(var i = 0; i < this.settings.toolbar.length; i++) {
					$buttongroup.append($available[this.settings.toolbar[i]]);
				}
				$toolbar.append($buttongroup);
			}
			if(this.settings.linestool) {
				var $inputgroup = $("<div />", { "class" : "input-group", "style" : "width:200px; float:left; margin-right:10px;"}),
					$inputaddon = $("<span />", { "class" : "input-group-addon", text : this.lang.UpdateLines}),
					$inputtext = $("<input />", { "class" : "form-control", type : "text", value : this.settings.rows, placeholder : this.lang.Lines});
				
				$inputtext.on("change", function() { self.upgradeLines($inputtext.val()); });
				$inputaddon.on("click", function() { self.upgradeLines($inputtext.val()); });
				$inputgroup.append($inputaddon, $inputtext);
				$toolbar.append($inputgroup);
			}
			if(typeof $pre !== "undefined") { $toolbar.append($("<div />").append($pre)); }
			this.container.after($toolbar);
		},
		upgradeLines : function(lines) {
			/*
			 *	Reload with given number of lines
			 */
			if(!isNaN(lines)) {
				this.settings.rows = parseInt(lines);
				var $instance = this.getInstance();
				if(typeof $instance !== "undefined") {
					$instance.resize(this.settings.rows);
				}
			}
		},
		returnNodes : function() {
			/*
			 *	Return nodes from the textarea, verifying duplicates and textNodes
			 */
			var hashes = this.hashes;
			var blocks = [];
			$.each($(this.element.val()), function(index, block) {
				var hash = _checksum(block);
				if(block.nodeType !== 3 && indexOf.call(hashes, hash) === -1) {
					blocks.push(block);
					hashes.push(hash);


				}
			});
			this.hashes = hashes;
			return blocks;
		},
		addBlock : function(index, block) {
			/*
			 *	Add a block to the grid
			 */
			var $block = $("<li />"),
				$wrapper = $("<div />").html(block),	//Work around for getting proper properties
				$xy  = this.lastItem(this.grid.children("li").length + 1),
				$inner = $("<div />", { "class" : "inner" });


			$block.data("xml-representation", $wrapper.html());

			if(this.settings.hierarchical) {
				$block.attr("data-h", $(block).find("*").length);
				$block.append();
				var $ul = $("<ul />", { "class" : "list-unstyled inner"});
				$(block).find("*").each(function(index, element) {
					$ul.append($("<li />", {
						text : $(element).text()
					}));
				});
				$inner.append($ul);

			} else {
				$block.attr("data-h", 1);
				$inner.text($wrapper.text());
			}
			$block.attr("data-w", this.settings.blocksWidth);
			$block.attr("data-x", $xy[0]);
			$block.attr("data-y", $xy[1]);

			$block.append($inner);
			//A new item should be added at the end of the list
			this.grid.append($block);
		},
		addBlocks : function(list) {
			/*
			 *	Add a list of blocks to the grid
			 */
			var self = this;
			$.each(list, function(index, block) {
				self.addBlock(index, block);
			});
		},
		initiateGrid : function() {
			/*
			 *		Initiate the grid. Only function to be called at the end of the setting
			 */
			//If there is not <ul>, we need to create one
			if(this.container.find("ul").length === 0) {  
				this.container.append($("<ul />").css("width", "100%").css("height", this.settings.rowHeight * this.settings.rows));
			}
			//We initialize gridster
			this.grid = this.container.find("ul");

			this.addBlocks(this.blocks);
			this.createGrid();
		},
		createGrid : function() {
			/*
			 *		Create the grid
			 */
			this.grid.gridList({
				rows: this.settings.rows,
				widthHeightRatio : this.settings.widthHeightRatio
			});
		},
		getInstance : function() {
			/*
			 *	Return the Grid Instance
			 */
			 return this.grid.data("_gridList");
		},
		applyXY : function() {
			/*
			 *		Apply XY position informations when moved to each li as Html attributes
			 */
			$.each(this.getInstance()._items, function(index, element) {
				element.$element.attr("data-x", element.x);
				element.$element.attr("data-y", element.y);
			});
		},
		reload : function () {
			/*
			 *		Reload Grid
			 */
			if(typeof this.getInstance()._items !== "undefined") { this.applyXY(); }
			this.grid.data("_gridList", false);
			this.createGrid();
		},
		changed : function () {
			/*
			 *		Function to be called when textarea targeted is changed
			 */
			this.addBlocks(this.returnNodes());
			this.reload();
		},
		serialize : function() {
			/*
			 *	Serialize the grid with its XML representation
			 */
			var $items = this.getInstance()._items,
				$rows = {};
				
			for (var i = this.settings.rows - 1; i >= 0; i--) {
				$rows[i] = {}
			};
			$.each($items, function(index, element) {
				if(typeof $rows[element.y] === "undefined") { $rows[element.y] = {}; }
				$rows[element.y][element.x] = element.$element.data("xml-representation");
			});
			return this.toXML(this.toArray($rows));
		},
		toArray : function(object) {
			/*
			 *		Transform an object using int keys as an array
			 */
			var data = [],
				self = this;
			for(var i = 0; i < Object.keys(object).length; i++) {
				data.push("");
			}
			$.each(object, function(index, element) {
				if (element !== null && typeof element === "object") {
					element = self.toArray(element);
				}
				data[parseInt(index)] = element;
			});
			return data;
		},
		toXML : function(rows) {
			/*
			 *		Convert a 2 dimensional array to an XML object text representation
			 */
			var lines = [];

			for(var i = 0; i < rows.length; i++) {
				var $l = $(this.settings.line),
					n = i + this.settings.startline;
				$l.attr("n", n);

				if(this.settings.linebreak) {
					rows[i].push(
						$("<div />").html(
							$(this.settings.linebreak).attr("n", n)
						).html()
					);
				}

				$l.html("\n\t" + rows[i].join("\n\t") + "\n");

				lines.push(
					$("<div />").html($l).html()
				);
			}

			return lines.join("\n");
		},
		lastItem : function (items) {			
			/*
			 *		Return the position for a new item, including if $grid is not instantiated
			 */
			 //Should use now the grid element size  this.settings.blocksWidth
			if(typeof this.grid === "undefined" || typeof this.getInstance() === "undefined" || typeof this.getInstance()._items === "undefined" ) {
				if(typeof items === "number") {
					var x;
					if(items === 1) {
						x = items - 1; // items = length of children
					} else {
						x = (items - 1 ) * this.settings.blocksWidth ;
					}
					return [x, 0];
				} else {
					return false;
				}
			}

			var $items = this.getInstance()._items,
				$rows = {},
				x = 0,
				y = 0;
			$.each($items, function(index, element) {
				if(typeof $rows[element.y] === "undefined") { $rows[element.y] = {}; }
				$rows[element.y][element.x] = element.$element.data("xml-representation");
			});
			$rows = _toArray($rows);
			y = $rows.length;
			x = $rows[y-1].length;

			return [x, y - 1];
		}

	});

	$.fn.teidragdrop = function(options) {
		if (!window.GridList) {
			throw new Error("GridList lib required");
		}

    	if (options === undefined || typeof options === "object") {
    		return this.each(function () {
                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, "_teidragdrop")) {
                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, "_teidragdrop", new Plugin( this, options ));
                }
            });
		} else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
			// Cache the method call
			// to make it possible
			// to return a value
			var returns;

			this.each(function () {
				var instance = $.data(this, "_teidragdrop");
				// Tests that there's already a plugin-instance
				// and checks that the requested public method exists
				if (instance instanceof Plugin && typeof instance[options] === "function") {
					// Call the method of our plugin instance,
					// and pass it the supplied arguments.
					returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}
				// Allow instances to be destroyed via the 'destroy' method
				if (options === "destroy") {
					$.data(this, "_teidragdrop", null);
				}
			});
			// If the earlier cached method
			// gives a value back return the value,
			// otherwise return this to preserve chainability.
			return returns !== undefined ? returns : this;
		}
	};

}));