var itd_waitstrings = /[\[\(][TW][\]\)]/i;
if (typeof itd_interval == "undefined")
	var itd_oldtitle = document.title;
var itd_interval;
var itd_notify;

function itd_timer() {

	if (!itd_interval) {
		var time = +prompt('Refresh time in minutes', 5);
		if (time) {
			itd_notify = confirm('Enable HTML5 desktop notifications?');
			itd_interval = window.setInterval(itd_go, time * 60000);
			itd_go()
		}
	} else {
		window.clearInterval(itd_interval);
		alert('Timer stopped');
		itd_interval = null;
		document.title = itd_oldtitle;
	}
}

function itd_go() {

	var time = new Date().toTimeString().substr(0, 5);
	if (!/Inbox|Home/.test(window.frames["CRMApplicationFrame"].frames["WorkAreaFrame1"].document.querySelectorAll("td.th-l-title")[0].title)) {
		console.info("Not in Inbox/Home, refresh skipped");
		document.title = "NR " + time + " " + itd_oldtitle;
		return false;
	}

	// click the button and wait
	window.frames[0].frames[1].document.querySelectorAll("span.th-bt-up")[2].children[0].click();
	// console.info("Go button clicked, waiting 5s ...");
	setTimeout(process, 5000);
	
	function process() {
		// alert("processing");
		// console.info("Processing:");
		var rows = window.frames["CRMApplicationFrame"].frames["WorkAreaFrame1"].document.querySelectorAll("tr.th-clr-row-nsel");
		// rows[0] is header row
		var cols = rows[0].querySelectorAll('span.th-tx-value');
		var col_names = new Array();
		for (var i = 0; i < cols.length; i++)
			col_names[i+1] = cols[i].innerHTML
			
		var waits = 0;
		var processed = 0;
		var newdescs = new Array();
		for (var i = 1; i < rows.length; i++) {
			
			var desc = rows[i].children[col_names.indexOf("Description")];
			var proc = rows[i].children[col_names.indexOf("Processor")];
			var SID = rows[i].children[col_names.indexOf("System ID")];
			var cat = rows[i].children[col_names.indexOf("Category")];
			var prio = rows[i].children[col_names.indexOf("Priority (Description)")]
			
			if (desc) desc = desc.children[0].innerHTML; else desc = ""
			if (proc) proc = proc.children[0].innerHTML; else proc = ""
			if (SID) SID = SID.children[0].innerHTML; else SID = ""
			if (cat) cat = cat.children[0].innerHTML; else cat = ""
			if (prio) prio = prio.children[0].innerHTML; else prio = ""
			
			switch (cat.substr(0,4)) {
			case "SRIS":
				cat = "SR";
				break;
			case "IMIS":
				cat = "IM";
				break;
			case "CMIS":
				cat = "CR";
				break;
			default:
				cat = "-";
				break;
			}
			switch (prio) {
			case "Very high":
				prio = "VH";
				break;
			case "High":
				prio = "H";
				break;
			case "Medium":
				prio = "M";
				break;
			case "Low":
				prio = "L";
				break;
			default:
				prio = "-";
				break;
			}
			if (SID.length == 3)
				SID = " (" + SID + ")";
			else
				SID = "";
			if (itd_waitstrings.test(desc)) {
				waits++;
				// console.info(prio + " " + cat + " on Wait: " + desc);
			} else if (proc != "&nbsp;") {
				processed++;
				// console.info(prio + " " + cat + " processed by " + proc + ": " + desc)
			} else {
				newdescs.push(prio + "/" + cat + ": " + desc + SID);
				// console.info(prio + " " + cat + " new: " + desc)
			}
		};
		// console.info("Tickets on wait: " + waits);
		// console.info("Tickets in process: " + processed);
		// console.info("newtickets:");

		var newtickets = rows.length - 1 - waits - processed;
		if (newtickets) {
			// console.info(newtickets + " new Ticket/s!");
			// alert code here
			var newtitle = "[" + time + "] " + newtickets + " new tickets";
			document.title = newtitle;

			var newdescstring = "";
			for (var i = 0; i < newdescs.length; i++) {
				newdescstring += newdescs[i] + "\n";
			}
			// console.info(newdescstring);

			// HTML 5 Desktop notification
			if (itd_notify) {
				var newnotstr;
				if (newtickets == 1)
					newnotstr = " new ticket!";
				else
					newnotstr = " new tickets!";
		
				if (Notification.permission !== "granted")
	    			Notification.requestPermission();
	    			n = new Notification(newtickets + newnotstr, {
						body : newdescstring,
						icon : "http://drsd00293791a/scripts/lol.png"
					});
				n.onshow = setTimeout(function () {n.close()}, 3000);
    			}
    			
			/*	var blinktitle = newtickets + " new ticket/s at " + time;
			function blink_title() {
			console.info("blink");
			document.title == newtitle ? document.title = blinktitle : document.title = newtitle;
			};
			var blink = window.setInterval(blink_title, 2000);
			console.info(blink);

			window.frames[0].frames[0].document.onclick = clear();
			window.frames[0].frames[1].document.onclick = clear();

			function clear() {
			window.clearInterval(blink);
			document.title = newtitle;
			}
			 */
		} else {
			// console.info("No new tickets");
			document.title = "[" + time + "] " + "No new tickets";
		}
	};
	return this;
}

// start it
itd_timer();
