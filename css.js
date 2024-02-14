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
