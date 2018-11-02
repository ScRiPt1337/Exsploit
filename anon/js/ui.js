var anonymox = anonymox || {};
anonymox.Widget = {};

anonymox.Widget.Dropdown = function (el) {
	// the Dropdown Widget assumes the following html structure:
	// <div class="dropdown">
	//    <div class="dropdown-arrow"></div>
	//    <div class="items">
	//        <div><img src="design/skin/flags/world.png" /> <span data-message="All">__MSG_All__</span></div>
	//    </div>
	// </div>
	//
	// the div.items will be filled up with other divs which represent an item which will be available to the user 
	// in a dropdown list. eaach items div will have an img element and the item text - without a span element. eg:
	// <div><img src="design/skin/flags/de.png" /> DE</div>

	var arrow = el.querySelector(".dropdown-arrow"),
		items = el.querySelector(".items"),
		status = "open",
		callback,
		pub;

	function init () {
		moveFirstItemTop();
		toggle();
		bindEvents();

		// bind this to el for later use by other code
		el.observer = pub;
	};

	function moveFirstItemTop () {
		// moves first item (eg: the "ALL" flag) between div.dropdown-arrow and div.items

		var item = items.querySelector("div");
		
		// clone because insertBefore() removes el from parent
		el.insertBefore(item.cloneNode(true), items);
	};

	function changeCurrentElement (newEl) {
		// changes the currently visible element to a new element. currently visible == between div.dropdown-arrow and div.items

		var currentEl = el.querySelector("div:nth-child(2)");

		// remove currentEl from dom
		currentEl.parentElement.removeChild(currentEl);

		// insert new element before div.items, eg set as visible element
		el.insertBefore(newEl.cloneNode(true), items);

		// the visible element has changed. trigger callback function registered by onChange() method
		if (callback) {
			callback(pub.getValue());
		}
	};

	function hideItems () {
		// closes the dropdown list

		items.style.display = "none";
		status = "closed";
	};

	function showItems () {
		// opens the dropdown list

		items.style.display = "block";
		status = "open";
	};

	function toggle () {
		// toglle between closed and open state

		if (status == "closed") {
			showItems();
		} else {
			hideItems();
		}
	};

	function bindEvents () {
		// register all event handlers necessary

		el.addEventListener("click", function (e) {
			// special case for clicking on flags or the <span>All</span>
			// if a click happened on an img or span element ..
			if (e.target.nodeName == "IMG" || e.target.nodeName == "SPAN") {
				// .. check if the parent of the div is the items element
				if (e.target.parentElement.parentElement == items) {
					changeCurrentElement(e.target.parentElement);
				}
			}
			
			// normal case, the click happened on the div itself (which parent is items)
			if (e.target.parentElement == items) {
				changeCurrentElement(e.target);	
			}
			
			toggle();
		});

		// listen for clicks on document. if click is not on element and element is open, close!
		// this mimics the default behaviour of <select> elements for example.
		document.addEventListener("click", function (e) {
			
			// bugfix: if user clicks on "All/Alle" or world icon the list should not be closed
			if (
					e.target.nodeName == "IMG" && e.target.src.match(/world.png/)
					||
					e.target.nodeName == "SPAN" && e.target.innerHTML.match(/all/i)
				) {
				return true;
			}

			// if target is not el, not a child of el and the dropdown is open, close it.
			// this basically means the click happend anywhere outside the dropdown.
			if (e.target != el && e.target.parentElement != el && status == "open") {
				hideItems();
			}
		})
	};

	pub = {
		getCurrentEl: function () {
			// returns currently active el
			return el.querySelector("div:nth-child(2)");
		},

		getValue: function () {
			// return value for currently active el
			return el.querySelector("div:nth-child(2)").innerText.trim();
		},

		addEl: function (el) {
			// adds an element to items
			items.appendChild(el);
		},

		add: function (imgPath, text) {
			// adds a new child to items. creation of div container and img element is taken care of

			var div = document.createElement("div");

			div.innerHTML = '<img src="' + imgPath + '" /> ' + text;
			items.appendChild(div);
		},

		onChange: function (callbackFn) {
			// register a callback function for any changes happening
			callback = callbackFn;
		},

		setCurrentEl: function (value) {
			// sets the current element to one of the items available which value matches

			// if no value is specified or value is ".*" get translation for "All"
			if (!value || value == ".*") {
				value = chrome.i18n.getMessage("All");
			}

			var children = items.children,
				i = 0,
				l = children.length;

			// loop through children and find the element which innerText matches value and set it as currently visible element.
			for (i; i < l; i += 1) {
				if (children[i].innerText.trim() === value) {
					changeCurrentElement(children[i]);
					break;
				}
			}
		},

		removeEl: function (value) {
			// this function removes an element (a country) from the items list

			var i = 0,
				children = items.querySelectorAll("div"),
				l = children.length;

			// remove all items
			items.innerHTML = "";

			// loop through children and re-append only those whose value doesn't match
			for (i; i < l; i += 1) {
				if (children[i].innerText.trim() != value.toUpperCase()) {
					items.appendChild(children[i]);
				}
			}
		}
	};

	init();

	return pub;
};


anonymox.Widget.Identities = function (el) {
	// the Identities Widget assumes the following html structure:
	// <div id="identities"></div>
	//
	// the div#identities will be filled with identity divs of this structure:
	// <div data-value="146.185.31.212:88">uk5i</div>
	// an active element looks like this:
	// <div data-value="146.185.31.212:88" class="selected">uk5i</div>

	var activeEl,
		callback,
		pub;

	function init () {
		// we don't need to initialise anything beside event listeners, so we do that right here

		// on mousedown de-select the active el
		el.addEventListener("mousedown", function (e) {
			// bugfix: don't de-select if clicked on el. (also means clicked on the scroll-bar/-buttons)
			if (e.target == el) {
				return false;
			}

			if (activeEl) {
				activeEl.className = "";
			}
		});
		
		// on mouseup set the element clicked an as active element and append "selected" class
		el.addEventListener("mouseup", function (e) {
			if (e.target != el) {
				activeEl = e.target;
				activeEl.className = "selected";
				
				// trigger callback
				if (callback) {
					callback(activeEl.dataset.value);
				}
			}
		});

		// bind this to el for later use by other code
		el.observer = pub;
	};

	pub = {
		getSelectedEl: function () {
			// returns the currently selected element
			return activeEl;
		},

		getText: function () {
			// returns innerText of currently selected element

			if (!activeEl) {
				return;
			}

			return activeEl.innerText.trim();
		},

		getValue: function () {
			// returns data-value of currently selected element

			if (!activeEl) {
				return;
			}
			
			return activeEl.dataset.value;
		},

		add: function (text, value) {
			// adds a new identity element to div#identities

			var div = document.createElement("div");

			div.innerText = text;
			div.dataset.value = value;

			el.appendChild(div);
		},

		filterBy: function (country) {
			// this function hides all elements that are not matched by `country` and displays all that are matched

			var i = 0,
				l = el.children.length,
				regEx = new RegExp(country, "i");

			for (i; i < l; i += 1) {
				if (!el.children[i].innerText.match(regEx)) {
					el.children[i].style.display = "none";
				} else {
					el.children[i].style.display = "block";
				}
			}
		},

		onChange: function (callbackFn) {
			// register callback function triggered by other function which change something
			callback = callbackFn;
		},

		setActiveByIp: function (ip) {
			// this function searches all identities for the one which matches the provided `ìp`
			// and sets this element as "selected" and `activeEl`

			var children = el.children,
				i = 0,
				l = children.length,
				regex = new RegExp(ip),
				found = false;

			// de-select currently active element
			if (activeEl) {
				activeEl.className = "";
			}

			// loop through children, search for regex and set matched as activeEl
			for (i; i < l; i += 1) {
				if (children[i].dataset.value.match(regex)) {
					activeEl = children[i];
					activeEl.className = "selected";
					found = true;
				}
			}

			// return if we found an element or not
			return found;
		},

		clearSelected: function () {
			// clear selected element

			if (activeEl) {
				activeEl.className = "";
				activeEl = undefined;
			}
		},

		selectNext: function () {
			// select the next identity relative to the currently selected one

			if (!activeEl) {
				// this happens when the proxy is disabled but the user clicks on change identity button
				console.warn("anonymox.Widget.Identities.selectNext() -> no activeEl. something went wrong!");
				return false;
			}

			// step 1: find all children
			var children = activeEl.parentElement.children,
				i = 0,
				l = children.length,
				visible = [];

			// step 2: find only children that are not `.style.display = none` eg. "visible"
			for (i; i < l; i += 1) {
				if (children[i].style.display !== "none") {
					visible.push(children[i]);
				}
			}

			// step 3: select next visible element, de-select currently selected
			i = 0;
			l = visible.length;
			var next;
			for (i; i < l; i += 1) {
				if (visible[i].className == "selected") {
					visible[i].className = "";
					
					next = i + 1;
					
					// if next is outside boundary, select first as next
					if (next >= l) {
						next = 0;
					}
				}
			}
			
			// step 4: set next visible element as activeEl
			activeEl = visible[next];
			activeEl.className = "selected";

			callback(activeEl.dataset.value);
		},

		scrollToSelected: function () {
			// scroll to currently selected identitiy

			if (!activeEl) {
				return false;
			}

			// each element is 25px high, we need to subtract that from .offsetTop
			var offset = activeEl.offsetTop - 25;

			// scroll to offset position
			if (offset > 150) {
				// scroll to bottom of list
				el.scrollTop = offset - 130;
			} else {
				// scroll to top of list
				el.scrollTop = offset - 120;
			}
		},

		visibleLength: function () {
			// this function counts visible identities

			var children = el.children,
				i = 0,
				l = children.length,
				visibleCount = 0;

			for (i; i < l; i += 1) {
				if (children[i].style.display != "none") {
					visibleCount += 1;
				}
			}

			return visibleCount;
		},

		destroy: function () {
			// destroy the widget eg. reset to the state it has at start
			this.clearSelected();
			el.innerHTML = "";
		}
	};

	init();

	return pub;
};

(function init () {
	// select dom elements necessary for widgets, if they exist intitialise widget

	var dropdown = document.querySelector(".dropdown"),
		identities = document.getElementById("identities");

	if (dropdown) {
		anonymox.Widget.Dropdown(dropdown);
	}

	if (identities) {
		anonymox.Widget.Identities(identities);
	}
})();

