var itd_waitstrings = /[\[\(][TW][\]\)]/i;
if (typeof itd_interval == "undefined")
	var itd_oldtitle = document.title;
var itd_interval;

function itd_timer() {

	if (!itd_interval) {
		var time = +prompt('Refresh time in minutes', 5);
		if (time) {
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
		if (window.external.msisSiteMode())	// IE pinned Site Mode
			window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/019.ico", "NR");
		document.title = "NR " + time + " " + itd_oldtitle;
		return false;
	}
	
	// IE pinned Site Mode
	var refresh_interval;
	if (window.external.msisSiteMode()) {
		var state = 0;
		function ci() {
			switch (state%4) {
			case 0:
				window.external.msSiteModeClearIconOverlay();
				window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/014.ico", "0");
				break;
			case 1:
				window.external.msSiteModeClearIconOverlay();
				window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/040.ico", "1");
				break;
			case 2:
				window.external.msSiteModeClearIconOverlay();
				window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/029.ico", "2");
				break;
			case 3:
				window.external.msSiteModeClearIconOverlay();
				window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/016.ico", "3");
				break;
			}
			state++;
		}
		refresh_interval = setInterval(ci, 200)
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
			
			if (desc) desc = desc.children[0].innerHTML; else desc = ""
			if (proc) proc = proc.children[0].innerHTML; else proc = ""
			
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

		} else {
			// console.info("No new tickets");
			document.title = "[" + time + "] " + "No new tickets";
		}
		
	// IE Pinned Site Mode
		if (window.external.msisSiteMode()) {
			clearInterval(refresh_interval);
			//window.external.msSiteModeClearIconOverlay();
			if (newtickets < 10)
			window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/00" + newtickets + ".ico", newtickets);
			else
			window.external.msSiteModeSetIconOverlay("https://github.wdf.sap.corp/pages/SCB-PS-SMDB/itdtimer/icons/037.ico", newtickets);
		}		
	};
	return this;
}

// start it
itd_timer();
