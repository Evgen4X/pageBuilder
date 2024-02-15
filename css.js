class Element {
	constructor(tagName, properties, parent = null, innerHTML = "", show = true) {
		this.el = document.createElement(tagName);
		for (let property in properties) {
			this.el.style[property] = properties[property];
		}
		this.el.innerHTML = innerHTML;
		this.cache = {};

		if (parent != null) {
			parent.appendChild(this.el);
		}

		if (!show) {
			this.hide();
		}
	}

	show(style = null) {
		if (style == null || style == undefined || style.length == 0) {
			style = this.cache.lastDisplay;
		}
		this.el.style.display = style;
		this.cache.shown = true;
	}

	hide() {
		this.cache.lastDisplay = this.el.style.display;
		this.el.style.display = "none";
		this.cache.shown = false;
	}

	toggle(style = null) {
		if (this.cache.shown) {
			this.hide();
		} else {
			this.show(style);
		}
	}
}

class Setting {
	constructor(name, type, labelText, parent) {
		this.label = document.createElement("label");
		this.label.setAttribute("for", name);
		this.label.innerHTML = labelText;

		this.input = document.createElement("input");
		this.input.setAttribute("type", type);
		this.input.setAttribute("name", name);
		this.input.id = name;
		this.input.classList.add("elementSetting");

		this.div = document.createElement("div");
		this.div.style.display = "flex";
		this.div.style.justifyContent = "center";
		this.div.style.alignItems = "center";
		this.div.style.flexDirection = "column";
		this.div.appendChild(this.label);
		this.div.appendChild(this.input);

		parent.appendChild(this.div);
	}

	hide() {
		this.div.style.display = "none";
		// this.input.style.display = "none";
	}

	show() {
		this.div.style.display = "flex";
		// this.input.style.display = "block";
	}
}

class GroupDiv extends Element {
	constructor(title, parent = Controls) {
		super("div", {}, parent, `<p>${title}</p>`);
		this.el.classList.add("container");
	}
}

class Input extends Element {
	constructor(placeholder, type, id, parent) {
		super("input", {}, parent);
		this.el.type = type;
		this.el.placeholder = placeholder;
		this.el.id = id;
	}
}

class Struct {
	constructor(placeholder, type, id, parent, text = "") {
		this.container = new Element("div", {display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column"}, parent);
		this.label = new Element("label", {}, this.container.el, text);
		this.label.el.setAttribute("for", id);
		this.input = new Input(placeholder, type, id, this.container.el);
	}
}

class Select {
	constructor(options, id, parent, text, selectedId = 0) {
		this.container = new Element("div", {display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column"}, parent);
		this.label = new Element("label", {}, this.container.el, text);
		this.label.el.setAttribute("for", id);
		this.input = new Element("select", {}, this.container.el);
		this.input.el.id = id;
		options.forEach((option, i) => {
			if (option.startsWith("<option")) {
				this.input.el.innerHTML += option;
			} else {
				this.input.el.innerHTML += `<option${selectedId == i ? " selected" : ""}>${option}</option>\n`;
			}
		});
	}
}

function cssToHtml(selector) {
	if (selector == "*") {
		return "div";
	}
	let part = selector.split(" ");
	part = part[part.length - 1];
	if (part.match(/#/)) {
		if (part.startsWith("#")) {
			return `div id="${part.slice(1)}"`;
		} else {
			return `${part.split("#")[0]} id="${part.split("#")[1]}"`;
		}
	} else if (part.match(/\./)) {
		if (part.startsWith(".")) {
			return `div class="${part.slice(1)}"`;
		} else {
			return `${part.split(".")[0]} class="${part.split(".")[1]}"`;
		}
	}
	return part;
}

function generate() {
	let codeSpan = document.getElementById("code-code");
	if (document.getElementById("style-type").value == "external") {
		codeSpan.innerHTML = `${document.getElementById("selector").value} {<br>`;
		for (attribute in styles) {
			codeSpan.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;${attribute.trim()}: ${styles[attribute].trim().replace(/</g, "&lt;")};<br>`;
		}
		codeSpan.innerHTML += "}";
	} else {
		codeSpan.innerHTML = `&lt;${cssToHtml(document.getElementById("selector").value)} style="`;
		let i = 0;
		for (attribute in styles) {
			codeSpan.innerHTML += `${attribute.trim()}: ${styles[attribute].trim().replace(/</g, "&lt;")};${++i < Object.keys(styles).length ? "&nbsp;" : ""}`;
		}
		codeSpan.innerHTML += '">';
	}

	document.getElementById("code").style.display = "flex";
}

var styles = {};

const Target = document.getElementById("target");
const Controls = document.getElementById("controls");

const Base = new GroupDiv("Base");
const InnerHTML = new Struct("Sample text", "text", "innerHTML", Base.el, "Text inside");
InnerHTML.input.el.onchange = () => {
	Target.innerHTML = InnerHTML.input.el.value;
};
const StyleType = new Select(StyleTypes, "style-type", Base.el, "Style type", 1);
const Selector = new Struct("*", "text", "selector", Base.el, "Selector");
Selector.input.el.value = "*";

const Display = new GroupDiv("Display");
const Position = new Select(Positions, "position", Display.el, "Position", 5);
const Margin = new Struct("5px", "text", "margin", Display.el, "Margin");
const Padding = new Struct("5px", "text", "padding", Display.el, "Padding");
const ZIndex = new Struct("0", "number", "z-index", Display.el, "Z-index");
ZIndex.input.el.setAttribute("max", "2147483647");
ZIndex.input.el.setAttribute("min", "-2147483648");
const TLBR = new GroupDiv("Position", Display.el);
const Top = new Struct("5px", "text", "top", TLBR.el, "Top");
const Left = new Struct("5px", "text", "left", TLBR.el, "Left");
const Bottom = new Struct("0", "text", "bottom", TLBR.el, "Bottom");
const Right = new Struct("0", "text", "right", TLBR.el, "Right");
const Width = new Struct("100%", "text", "width", Display.el, "Width");
const Height = new Struct("100%", "text", "height", Display.el, "Height");
const AspectRatio = new Struct("1 / 1", "text", "aspect-ratio", Display.el, "Size ratio");
const DisplayType = new Select(Displays, "display", Display.el, "Display type");

const Background = new GroupDiv("Background");
const BGColor = new Struct(null, "color", "background-color", Background.el, "BG color");
const Opacity = new Struct("100%", "text", "opacity", Background.el, "Opacity");
const BorderColor = new Struct(null, "color", "border-color", Background.el, "Border color");
const BorderWidth = new Struct("1px", "text", "border-width", Background.el, "Border width");
const BorderStyle = new Select(BorderStyles, "border-style", Background.el, "Border type", 5);
const BorderRadius = new Struct("0", "text", "border-radius", Background.el, "Border radius");
const Filter = new Struct("saturate(50%)", "text", "filter", Background.el, "<a href='https://www.w3schools.com/cssref/css3_pr_filter.php' target='blank_'>BG filter</a>");

const Content = new GroupDiv("Text");
const Color = new Struct(null, "color", "color", Content.el, "Text color");
const FontSize = new Struct("1em", "text", "font-size", Content.el, "Size");
const FontWeight = new Select(FontWeights, "font-weight", Content.el, "Boldness", 1);
const TextAlign = new Select(TextAligns, "text-align", Content.el, "Align", 5);
const FontStyle = new Select(FontStyles, "font-style", Content.el, "Font style", 1);

const Special = new GroupDiv("Special");
const Overflow = new Select(Overflows, "overflow", Special.el, "On overflow", 3);
const Cursor = new Select(Cursors, "cursor", Special.el, "Cursor type", 8);

const Transforms = new GroupDiv("Transforms");
const Rotate = new Struct("0deg", "text", "rotate", Transforms.el, "Rotation");
const Scale = new Struct("1 1", "text", "scale", Transforms.el, "Scaling");
const Translate = new Struct("0px 0px", "text", "translate", Transforms.el, "Moving");
const Skew = new Struct("0deg 0deg", "text", "skew", Transforms.el, "Skewing");

document.querySelectorAll("#controls input").forEach((input) => {
	if (!notStyles.includes(input.id)) {
		input.onchange = () => {
			Target.style[input.id] = input.value;
			styles[input.id] = input.value;
		};
	}
});

document.querySelectorAll("#controls select").forEach((input) => {
	if (!notStyles.includes(input.id)) {
		input.onchange = () => {
			Target.style[input.id] = input.value;
			styles[input.id] = input.value;
		};
	}
});

Width.input.el.value = "5vw";
Height.input.el.value = "5vw";
Margin.input.el.value = "10vw";
BorderWidth.input.el.value = "1px";
BGColor.input.el.value = "#ffffff";
