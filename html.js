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

function SetSettings(tag) {
	if (closedTags.includes(tag)) {
		SettingInnerHTML.show();
		SettingColor.show();
		SettingFontSize.show();
	} else {
		SettingInnerHTML.hide();
		SettingColor.hide();
		SettingFontSize.hide();
	}

	if (inputTags.includes(tag)) {
		SettingName.show();
		if (tag == "input") {
			SettingType.show();
		} else {
			SettingType.hide();
		}
	} else {
		SettingName.hide();
		SettingType.hide();
	}
}

function applyAdditionalCSS() {
	let text = document.getElementById("additional-css").value.replace(";", "").split("\n");
	const target = elementSettings.cache.el;
	for (let line of text) {
		let property = line.split(":")[0].trim();
		let value = line.split(":")[1].trim();
		if (StyleList.includes(property)) {
			target.el.childNodes[0].style[property] = value;
		}
	}
}

function applyAdditionalAttributes() {
	let text = document.getElementById("additional-attributes").value.split("\n");
	const target = elementSettings.cache.el;
	for (let line of text) {
		let property = line.split("=")[0].trim();
		let value = line.split("=")[1].trim();
		target.el.childNodes[0][property] = value;
		target.cache.attributes[property] = value.replace(/^"/, "").replace(/"$/, "");
	}
}

function toKebab(a) {
	let res = "";
	for (let i = 0; i < a.length; ++i) {
		if (a[i] == a[i].toUpperCase()) {
			res += "-" + a[i].toLowerCase();
		} else {
			res += a[i];
		}
	}

	return res;
}

var Created = [];

const Controls = document.getElementById("controls");
const Main = document.querySelector("main");
const Body = document.querySelector("body");
const StyleList = Object.keys(Main.style).map((property) => {
	return toKebab(property);
});

const CodeWindow = new Element("div", {display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column"}, Body, `<div id='codeContainer'></div><button onclick='CodeWindow.hide();'>Close</button>`, false);
CodeWindow.el.classList.add("dialogueScreen");

const Generate = new Element("button", {}, Body, `Generate`);
Generate.el.onclick = () => {
	let code = ``;
	Created.forEach((el) => {
		let child = el.el.childNodes[0];
		console.log(child);
		let tag = child.tagName.toLowerCase();
		let style = ``;
		for (let attribute in child.style) {
			if (child.style[attribute] && StyleList.includes(toKebab(attribute))) {
				style += `${toKebab(attribute)}: ${child.style[attribute]}; `;
			}
		}

		code += `&lt;${tag}${style != "" ? ' style="' + style + '"' : ""}`;

		for (let attribute in el.cache.attributes) {
			console.log(attribute);
			if (child[attribute]) {
				code += ` ${attribute}="${child[attribute]}"`;
			}
		}

		code += ">";

		if (closedTags.includes(tag)) {
			code += `${child.innerHTML.replace(/</g, "&lt;")}&lt;/${tag}>`;
		}

		code += "<br>";
	});

	document.getElementById("codeContainer").innerHTML = code;
	CodeWindow.show();
};

const BAddElement = new Element("div", {}, Controls, `+`);
BAddElement.el.classList.add("controlsButton");
BAddElement.el.onclick = () => {
	Elements.toggle();
};

const BClearAll = new Element("div", {}, Controls, `🗑`);
BClearAll.el.classList.add("controlsButton");
BClearAll.el.onclick = () => {
	Created = [];
	Main.childNodes.forEach((child) => {
		Main.removeChild(child);
	});
};

const Elements = new Element("div", {}, Body, ``, false);
Elements.el.classList.add("dialogueScreen");

tags.forEach((tag) => {
	let div = new Element("div", {}, Elements.el);
	div.el.classList.add("elementContainer");
	let el = new Element(shownTags.includes(tag) ? tag : "div", {}, div.el, tag);
	div.el.onclick = () => {
		Elements.hide();
		let e = new Element("div", {}, Main, `<${tag}>${closedTags.includes(tag) ? tag + "</" + tag + ">" : ""}`);
		e.cache.attributes = {};
		e.el.onclick = () => {
			SetSettings(tag);
			elementSettings.show();
			elementSettings.cache.el = e;
		};
		Created.push(e);
		console.log(Created);
	};
});

const elementSettings = new Element(
	"div",
	{display: "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column"},
	Body,
	`
<div id='settingsSection1' style='display: flex; justify-content: center; align-items: center; flex-wrap: wrap;'>
	<div style='display: flex; justify-content: center; align-items: center; flex-direction: column'>
		<label for="display">Display</label><select class="elementSetting" name="display" id="display">
			<option>block</option>
			<option>contents</option>
			<option>flex</option>
			<option>flow-root</option>
			<option>grid</option>
			<option selected>inline</option>
			<option>inline-block</option>
			<option>inline-flex</option>
			<option>inline-table</option>
			<option>list-item</option>
			<option>table</option>
			<option>table-caption</option>
			<option>table-cell</option>
			<option>table-column</option>
			<option>table-column-group</option>
			<option>table-footer-group</option>
			<option>table-header-group</option>
			<option>table-row</option>
			<option>table-row-group</option>
		</select>
	</div>
</div>

<div id='settingsSection2' style='display: flex; justify-content: center; align-items: center;'>
	<div style='display: flex; justify-content: center; align-items: center; flex-direction: column'>
		<label for="text-align">Text align</label><select class="elementSetting" name="text-align" id="text-align">
			<option>center</option>
			<option>end</option>
			<option>justify</option>
			<option>left</option>
			<option>start</option>
			<option selected>unset</option>
		</select>
		</div>
		<div style='display: flex; justify-content: center; align-items: center; flex-direction: column'>
		<label for="font-weight">Font weight</label><select class="elementSetting" name="font-weight" id="font-weight">
			<option>lighter</option>
			<option selected>normal</option>
			<option>bold</option>
			<option>bolder</option>
		</select>
	</div>
</div>
	
<textarea id="additional-css" placeholder="Additional CSS" onchange='applyAdditionalCSS();'></textarea>
<textarea id="additional-attributes" placeholder="Additional attributes" onchange='applyAdditionalAttributes();'></textarea>

<button onclick='Main.removeChild(elementSettings.cache.el.el); elementSettings.hide(); Created = Created.filter((a) => a != elementSettings.cache.el);'>Remove</button>

<button onclick='elementSettings.hide();'>Close</button>
`,
	false
);
elementSettings.el.classList.add("dialogueScreen");

const settingsSection1 = document.getElementById("settingsSection1");
const SettingInnerHTML = new Setting("innerHTML", "text", "Inner HTML", settingsSection1);
const SettingBackgroundColor = new Setting("background-color", "color", "BG color", settingsSection1);
const SettingWidth = new Setting("width", "text", "Width", settingsSection1);
const SettingHeight = new Setting("height", "text", "Height", settingsSection1);
const SettingMargin = new Setting("margin", "text", "Margin", settingsSection1);
const SettingPadding = new Setting("padding", "text", "Padding", settingsSection1);
const SettingBorder = new Setting("border", "text", "Borders", settingsSection1);
const SettingBorderRadius = new Setting("border-radius", "text", "Borders radius", settingsSection1);
const SettingType = new Setting("type", "text", "Input type", settingsSection1);
const SettingName = new Setting("name", "text", "Name", settingsSection1);

const settingsSection2 = document.getElementById("settingsSection2");
const SettingFontSize = new Setting("font-size", "text", "Font size", settingsSection2);
const SettingColor = new Setting("color", "color", "Font color", settingsSection2);

document.querySelectorAll(".elementSetting").forEach((el) => {
	el.onchange = () => {
		if (el.id == "innerHTML") {
			elementSettings.cache.el.el.childNodes[0].innerHTML = el.value;
		} else {
			elementSettings.cache.el.el.childNodes[0].style[el.id] = el.value;
		}
	};
});
