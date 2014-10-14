#Examples

##Simple integration
[Example 1](Form-Generation.html) - This use a textarea as container and use no-hierarchical information

###Javascript

```javascript
$("#textarea").teidragdrop({});
```

###Source

```xml
	<w facs="urn:cite:perseus:epifacsimg.77@0.0691,0.3912,0.032,0.0498">εἴ</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.1051,0.3807,0.0601,0.0559">τις</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.1712,0.3852,0.0521,0.0483">ἐν</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.2242,0.3852,0.2032,0.0483">ἀνθρώποις</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.4274,0.3852,0.1401,0.0514">ἀρετῆς</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.5656,0.3807,0.1021,0.0589">ἕνεκ'</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.6677,0.3852,0.2923,0.0529">ἐστεφανώθη</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.0711,0.4426,0.1952,0.0498">πλεῖστον</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.2633,0.435,0.0891,0.0514">ἐγὼ</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.3554,0.4381,0.2122,0.0468">μετέχων</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.5656,0.4381,0.0831,0.0453">τοδ'</w>
	<w facs="urn:cite:perseus:epifacsimg.77@0.6426,0.4381,0.1592,0.0498">ἔτυχον</w>
```

##Hierarchical data used as input

[Example 2](Hierarchy.html) - This use a textarea as container and use no-hierarchical information

###Javascript

```javascript
	$("#textarea").teidragdrop({
		"line" : "<div />",	//The wrapper for elements is a div
		"linegroup" : "<body />", //The wrapper of wrappers is body
		"linebreak" : null,  //No milestone system before the end of div
		"hierarchical" : true, //Our data are hierarchical, we input data such as <lg /><l />
		"blocksWidth" : 2 //We set the width to 2
	});
```
###Source

```xml
<lg>
	<l>I am a line with two levels</l>
	<l>Which is fun</l>
</lg>
<lg>
	<l>I am a line with three levels</l>
	<l>Which is fun, really</l>
	<l>I said really</l>
	I am a text node, nobody cares
</lg>
<lg>
	<l>I am a line with one level :'(</l>
</lg>
<lg>
	<l>I am another line with one level :'(</l>
</lg>
```