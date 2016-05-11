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
	// setTimeout(process, 1000);
	// function process() {};
	
		// console.info("Tickets on wait: " + waits);
		// console.info("Tickets in process: " + processed);
		// console.info("newtickets:");

		var newtickets = 1;
		if (newtickets > 0) {
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
		} else {
			document.title = "[" + time + "] " + "No new tickets";
		}
	};
	return this;
}

// start it
itd_timer();
