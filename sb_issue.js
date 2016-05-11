var AutoPagingInProgress = false;
var edited = [];

function EditDenied(element) {
	var issue = $(element).closest("div[data-issue]").first();

	var content = issue.find("[contenteditable]");
	// force uncollapsing this issue
	if (issue.find(".panel-collapse.collapsing").attr("aria-expanded") == "false") {
		// if onclick() has been triggered schedule an
		// one-time uncollapse for when it has finished
		issue.find(".panel-collapse").one("hidden.bs.collapse", function() {
			issue.find(".panel-collapse").collapse("show");
		});
	} else {
		issue.find(".panel-collapse").collapse("show");
	}

	// try to find an old alert and replace it, else insert it
	var new_alert = '<div class="alert alert-danger alert-dismissible" role="alert">'
			+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
			+ '<span aria-hidden="true">&times;</span>'
			+ '</button>'
			+ '<p>You are not allowed to edit this entry.</p>' + '</div>';
	var old_alert = issue.find("div[role=alert]");
	if (old_alert.length > 0) {
		old_alert.replaceWith(new_alert);
	} else {
		content.parent().prepend(new_alert);
	}
}
function EditIssue(event) {
	var issue = $(event.currentTarget).closest("div[data-issue]").first();

	if ((issue.attr("data-issue") in edited)
			&& (issue.find("[contenteditable]").attr('contenteditable') == "true"))
		return;

	var description = issue.find(".Description").first();
	var content = issue.find("[contenteditable]").first();
	// force uncollapsing this issue
	if (issue.find(".panel-collapse.collapsing").attr("aria-expanded") == "false") {
		// if onclick() has been triggered schedule an
		// one-time uncollapse for when it has finished
		issue.find(".panel-collapse").one("hidden.bs.collapse", function() {
			issue.find(".panel-collapse").collapse("show");
		});
	} else {
		issue.find(".panel-collapse").collapse("show");
	}

	// try to find an old alert and replace it, else insert it
	var new_alert = '<div class="alert alert-info" role="alert">'
			+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
			+ '<span aria-hidden="true">&times;</span>' + '</button>'
			+ '<p>Locking entry…</p>' + '</div>';
	var old_alert = issue.find("div[role=alert]");
	if (old_alert.length > 0) {
		old_alert.replaceWith(new_alert);
	} else {
		content.parent().prepend(new_alert);
	}
	// store our final alert away for the closure
	old_alert = issue.find("div[role=alert]");

	$
			.ajax({
				url : '/ajax/acquire_lock',
				type : 'POST',
				data : {
					issue : issue.attr("data-issue")
				},
				dataType : 'json',
				success : function(msg) {
					if (msg.success) {
						old_alert.slideUp(200, function() {
							$(this).remove();
						});
						if (content.attr('contenteditable') == "false") {
							DeText2Link(content);
							var toolbarID = "toolbar-" + jQuery.now();
							content
									.before('<div id="' + toolbarID
											+ '"></div>');
							content
									.ckeditor({
										sharedSpaces : {
											top : toolbarID,
										},
										smiley_path : '/ckeditor/plugins/smiley/images/',
										filebrowserBrowseUrl : '/browser/?type=Images',
										filebrowserImageUploadUrl : '/issue_upload',
										filebrowserImageBrowseUrl : '/browser?type=Images'
									}); // start wysiwyg editor
							content.attr('contenteditable', 'true');
							content.css('background-color', 'white');
							content.css('border-color', 'black');

							if (issue.attr("data-issue") != -1)
								edited[issue.attr("data-issue")] = true;

							var header_text = description.text().trim();
							description.empty();
							description.append('<input type="text" value="'
									+ header_text
									+ '" maxlength="64" size="80">');
							IssueButtonsVisibility(issue, true);
							// disable collapsing this issue
							issue.find(".panel-heading").removeAttr(
									"data-toggle");
							// convert the chevron to a pencil
							issue
									.find(".chevron_toggle")
									.hide()
									.before(
											'<span class="glyphicon glyphicon-pencil"></span>');
						}
					} else {
						old_alert
								.replaceWith('<div class="alert alert-danger alert-dismissible" role="alert">'
										+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
										+ '<span aria-hidden="true">&times;</span>'
										+ '</button>'
										+ '<p>This entry is currently locked by '
										+ msg.LockOwner.Name
										+ ' ('
										+ msg.LockOwner.UserID
										+ ') '
										+ 'until '
										+ msg.LockExpiresAt
										+ '</p>'
										+ '</div>');
					}
				},
				error : function(msg) {
					var new_alert = '<div class="alert alert-danger alert-dismissible" role="alert">'
							+ '<p>Locking this entry failed. Couldn\'t contact server</p>'
							+ '</div>';
					old_alert.replaceWith(new_alert);
				}
			});
}
function SaveIssue(event) {
	var issue = $(event.currentTarget).closest("div[data-issue]");
	var content = issue.find(".Content").first();

	// collect selected sections
	var sections_value = {}
	issue.find(".Section").each(function() {
		if ($(this).prop("checked"))
			sections_value[$(this).parent().text()] = $(this).val();
	});

	// Check if at least one section has been choosen
	if ($.isEmptyObject(sections_value)) {
		// is empty
		// alert
		var new_alert = '<div class="alert alert-danger alert-dismissible" role="alert">'
				+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
				+ '<span aria-hidden="true">&times;</span>'
				+ '</button>'
				+ '<p>Please choose at least one section.</p>' + '</div>';
		var old_alert = issue.find("div[role=alert]");
		if (old_alert.length > 0) {
			old_alert.replaceWith(new_alert);
		} else {
			content.parent().prepend(new_alert);
		}
	} else {
		// is NOT empty

		ResetEditIssue(event, false);
		IssueButtonsVisibility(issue, false);

		/* from/to */
		// var from =
		// $(issue).find('input[name="start"]').datepicker("getDate");
		// var to = $(issue).find('input[name="end"]').datepicker("getDate");
		/* save to db */
		var arr = {
			Indx : issue.attr("data-issue"),
			Description : issue.find(".Description").first().text(),
			Content : content.text(),
			ContentHtml : content.html(),
			Sections : sections_value,
			Attachment_Hash : issue.find("[hash]").map(function() {
				return this.getAttribute('hash');
			}).get(),
			archived : issue.attr('data-archived'),
			Color : issue.attr('data-issue-color') || "null",
			AutoArchiveInXhours : issue.attr("data-issue-valid-to") || "never",
		// From: from.getDate() + "-" + from.getMonth() + "-" +
		// from.getFullYear(),
		// To: to.getDate() + "-" + to.getMonth() + "-" + to.getFullYear()
		};
		$
				.ajax({
					url : '/ajax/issue/save',
					type : 'POST',
					data : arr,
					dataType : 'json',
					success : function(msg) {
						UpdateEntryDOMfromMsg(issue, msg);
						delete edited[msg.Indx];
						var old_alert = issue.find("div[role=alert]");
						if (old_alert.length > 0) {
							old_alert.remove();
						}
					},
					error : function(msg) {
						EditIssue(issue);
						var new_alert = '<div class="alert alert-danger alert-dismissible" role="alert">'
								+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
								+ '<span aria-hidden="true">&times;</span>'
								+ '</button>'
								+ '<p>Saving failed due to a server-error. Please try again.</p>'
								+ '</div>';
						var old_alert = issue.find("div[role=alert]");
						if (old_alert.length > 0) {
							old_alert.replaceWith(new_alert);
						} else {
							content.parent().prepend(new_alert);
						}
						console.log(msg);
					}
				});
	}
}
function CancelIssue(event, remove) {
	var issue = $(event.currentTarget).closest("div[data-issue]");
	if (issue.attr("data-issue") == "-1" || remove) {
		issue.slideUp(200, function() {
			issue.find("[hash]").each(function(index, hash) {
				$.get("/attachments/?delete=" + $(hash).attr("hash"));
			});
			issue.closest("form").remove();
		});
	} else {
		$.ajax({
			url : "/ajax/release_lock",
			type : 'POST',
			data : {
				issue : issue.attr("data-issue"),
			},
		});
		delete edited[issue.attr("data-issue")];
		IssueButtonsVisibility(issue, false);
		ResetEditIssue(event, true);
	}
}
function ResetEditIssue(event, cancel) {
	var issue = $(event.currentTarget).closest("div[data-issue]");
	var content = issue.find(".Content").first();
	if (content.attr('contenteditable') == "true") {
		content.removeAttr('style') // reset design
		content.attr('contenteditable', 'false'); // read only
		$("#" + content.ckeditorGet().config.sharedSpaces.top).remove();
		content.ckeditorGet().destroy(); // remove editor
	}

	var input = issue.find(".Description > input");
	var input_text = $.trim(input.val());

	/* check for empty description */
	var description = "No Description";
	if (input_text != "") {
		description = input_text;
	}
	issue.find(".Description").first().text(description);
	input.remove();

	// reset collapsibility
	issue.find(".panel-heading").attr("data-toggle", "collapse");
	issue.find(".chevron_toggle").show();
	issue.find(".glyphicon-pencil").remove();
	if (cancel) {
		LoadEntryData(event, cancel);
	}
}
function LoadEntryData(event, cancel) {
	if (!cancel)
		$(event.currentTarget).remove();
	var issue = $(event.currentTarget).closest('[data-issue]');
	var version = $(event.currentTarget).attr('data-version');
	$.ajax({
		url : '/ajax/issue/' + issue.attr("data-issue") + '/' + version,
		dataType : 'json',
		success : function(msg) {
			UpdateEntryDOMfromMsg(issue, msg)
		},
		error : function(msg) {
			console.log(msg);
		}
	});
}
function UpdateEntryDOMfromMsg(issue, msg) {
	// this function expects a jquery selection of the issue to update
	// and the ajax representation of an Issue class
	var panel;
	if (issue.hasClass('version')) {
		panel = issue.find('.panel').first();
	} else {
		panel = issue;
	}

	issue.attr("data-archived", msg.Archived);
	if (msg.Archived == 1 && msg.ValidTo == null) {
		panel.removeClass("panel-primary").addClass("panel-danger");
	} else {
		panel.removeClass("panel-danger").addClass("panel-primary");
	}

	issue.attr("data-issue", msg.Indx);
	issue.attr("data-active-version", msg.ActiveVersion);
	issue.attr("data-issue-valid-to", msg.ValidTo);
	issue.find(".archive-date").first().text(msg.ValidTo + " Hours");
	issue.find(".glyphicon-calendar").first().attr("title",
			issue.find(".archive-date-msg").first().text());
	issue.attr("data-issue-color", msg.Color);
	issue.find('[data-target="#-1"]').attr("data-target", "#" + msg.Indx);
	issue.find('[id="-1"]').attr("id", msg.Indx);
	issue.find('.issueLink').attr("href", "/Issue/" + msg.Indx).text(
			"#" + msg.Indx).removeClass("empty");
	issue.closest("form").attr("action", "/issue_upload?issue=" + msg.Indx);

	issue.find(".Description").first().text(msg.Description);

	var content = issue.find(".Content").first().html(msg.ContentHtml);

	issue.find(".Section").each(function() {
		if (msg.Sections[$(this).val()] != undefined)
			$(this).prop("checked", true);
		else
			$(this).prop("checked", false);
	});

	issue.find(".LastEditName").text(msg.LastUser.Name);
	issue.find(".LastEditDate").text(msg.LastEdited);
	Text2Link(content);

	// trigger showing the panel for version issues
	if (issue.hasClass('version'))
		panel.slideDown(200);
}
function IssueButtonsVisibility(issue, show) {
	if (show) {
		issue.find(".FooterButtons").show();
		issue.find(".Sections").show();
		issue.find(".LastEditBlock").hide();
	} else {
		issue.find(".FooterButtons").hide();
		issue.find(".Sections").hide();
		issue.find(".LastEditBlock").show();
	}
}

function ReopenIssue(event) {
	var issue = $(event.currentTarget).closest("div[data-issue]");
	issue.attr("data-issue-valid-to", "never");
	issue.find(".glyphicon-calendar").first().attr("title", "never");
	issue.attr("data-archived", "0");
	issue.removeClass("panel-danger").addClass("panel-primary");
}

function AppendIssue(paging, repeat) {
	if (paging) {
		// Get GET variable from url
		var ajax_GET = {}; // this needs to be a plain object,
		// Array.prototype.filter would mix in
		// unintentionally
		if (document.location.toString().indexOf('?') !== -1) {
			var query = document.location.toString()
			// get the query string
			.replace(/^.*?\?/, '')
			// and remove any existing hash string
			.replace(/#.*$/, '').split('&');

			for (var i = 0, l = query.length; i < l; i++) {
				var aux = decodeURIComponent(query[i]).split('=');
				ajax_GET[aux[0]] = aux[1];
			}
		}
		var last_issue = $(".panel_issue:last").attr("data-issue");
		if (!last_issue)
			// if there is no issue displayed at all, don't even bother talking
			// to the server
			return;

		var URL = '/ajax' + document.location.pathname;
		var arr = {
			last : last_issue,
			filter : ajax_GET['filter'],
			q : ajax_GET['q'],
		};
	} else {
		var arr = {
			emptyissue : 1,
		}
		var URL = '/ajax/emptyissue';
	}
	$.ajax(
			{
				url : URL,
				data : arr,
				dataType : 'html',
				success : function(data) {
					if (paging) {
						var new_issue = $(data).insertBefore(
								"#issue_placeholder_bottom").find(
								"[data-issue]");
						Text2Link(new_issue.find(".Content"));
					} else {
						var new_issue = $(data).insertAfter(
								"#issue_placeholder_top").find("[data-issue]");
						EditIssue(new_issue);
						new_issue.find(".SaveFavourite").hide();
					}
					new_issue.slideDown(250);
				},
				error : function(data) {
					console.log(data);
				},
				complete : function(data) {
					AutoPagingInProgress = false;
				},
			}).done(function() {
		// if our document still fits completely into the viewport
		// and we were asked to repeat ourselves, restart paging
		if (repeat && $(document).height() == $(window).height()) {
			AutoPagingInProgress = true;
			// 0 timeout means, we push this into the global event queue
			setTimeout(function() {
				AppendIssue(true, true);
			}, 0);
		}
	});
}
function Issue_Upload(event) {
	var form = $(event.currentTarget).closest("form");
	var file = $(event.currentTarget);
	var uploading = form.find(".issue_uploading");
	var old_text = uploading.text();
	uploading.text("uploading..");
	form.ajaxSubmit({
		dataType : 'json',
		success : function(f) {
			AddAttachment(form.find(".issue_files"), f.filename, f.database,
					"/attachments/?download=" + f.database);
			file.clearFields();
			uploading.text(old_text);
		},
		error : function(msg) {
			console.log(msg);
		}
	});
}

function AddAttachment(attach_span, name, hash, link) {
	var s = $(attach_span);
	var del = '<a href="#" onclick="RemoveAttachment(this, \'' + hash
			+ '\')"><span class="glyphicon glyphicon-remove"></span></a>&nbsp;';
	var attach_text = '<a href="' + link + '">' + name + '</a>';
	var all = '<div hash=\'' + hash + '\'>' + del + attach_text + '</div>';
	s.append(all).show();
}
function RemoveAttachment(link, hash) {
	var par = $(link).closest(".issue_files");
	$(link).closest("div").remove();
	if (par.find("div").length == 1) {
		par.find("div").remove();
	}
	$.get("/attachments/?delete=" + hash);
}

function PointChevronDown() {
	$(this).parent().find(".glyphicon-chevron-up").removeClass(
			"glyphicon-chevron-up").addClass("glyphicon-chevron-down");
}

function PointChevronUp() {
	$(this).parent().find(".glyphicon-chevron-down").removeClass(
			"glyphicon-chevron-down").addClass("glyphicon-chevron-up");
}

function PointCollapseDown(event) {
	event.stopPropagation();
	var issue = $(event.currentTarget).closest("div[data-issue]");
	var link = issue.find("a[data-target]");
	var dataTarget = parseInt(link.attr("data-target").split(".comments")[1]) + 1;
	link.attr("data-target", "[data-issue=1935] .comments" + dataTarget);
}

function SaveFavourite(element) {
	var issue = $(element).closest("div[data-issue]");
	var issueID = issue.attr("data-issue");
	var desc = issue.find(".Description");
	var star = issue.find(".favourite .glyphicon");

	star.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
	// add fav live
	$("#sidebar-favourites")
			.append(
					'<li data-issue="'
							+ issueID
							+ '">'
							+ '<span class="glyphicon glyphicon-remove text-danger DeleteFavourite pull-right"></span>'
							+ '<a href="/Issue/' + issueID + '">#' + issueID
							+ ' ' + desc.text() + '</a>' + '</li>');
	// open sidebar favourites
	$(".panel-favourite .collapse").collapse("show");
}

function DeleteFavourite(event) {
	var issueID = $(event.currentTarget).closest("[data-issue]").attr(
			"data-issue");
	// remove entry line from sidebar
	$('#sidebar-favourites [data-issue="' + issueID + '"]').remove();
	// reset star to default values
	$('div[data-issue="' + issueID + '"] .favourite').find(".glyphicon")
			.removeClass('glyphicon-star').addClass('glyphicon-star-empty');
}

function ShowNewCommentBox(event) {
	var issue = $(event.currentTarget).closest("div[data-issue]");
	var issueID = issue.attr("data-issue");
	var newcommentbox = issue.find(".NewComment");
	newcommentbox.show();
	newcommentbox.find("textarea").focus();
	$('html, body').animate({
		scrollTop : newcommentbox.find("textarea").offset().top - 200
	}, 200);
	autosize($('textarea'));
}
function HideNewCommentBox(element) {
	var issue = $(element).closest("[data-issue]");
	issue.find(".NewComment").hide();
}

function SaveComment(event) {
	var comment = $(event.currentTarget).closest(".NewComment");
	var issue = $(event.currentTarget).closest("[data-issue]").attr(
			"data-issue");
	var comment_content = comment.find("textarea");

	var arr = {
		Content : comment_content.val(),
		ContentHtml : comment_content.val(),
		Issue : issue,
	};
	$
			.ajax({
				url : '/ajax/comment_json',
				type : 'POST',
				data : arr,
				dataType : 'json',
				success : function(msg) {
					if (msg.success) {
						$(event.currentTarget)
								.closest("[data-issue]")
								.find(".comment-area")
								.append(
										'<div class="comment_area_temp">'
												+ '<span class="octicon octicon-comment"></span> <b>'
												+ msg.comment.User.Name
												+ '</b>&nbsp;'
												+ msg.comment.Timestamp
												+ '<div>'
												+ msg.comment.ContentHtml
												+ '</div>' + '</div>');
						Text2Link($(event.currentTarget)
								.closest("[data-issue]").find(
										".comment_area_temp"));
						comment_content.val("");
						HideNewCommentBox(event.currentTarget);
						var count_comments = $(event.currentTarget).closest(
								"[data-issue]").find(".count_comments").text();
						if (isNaN(count_comments)) {
							count_comments = 1;
						} else {
							count_comments++;
						}
						$(event.currentTarget).closest("[data-issue]").find(
								".count_comments").text(count_comments);
					} else {
						var comment_alert = $(event.currentTarget).closest(
								"[data-issue]").find(".panel-footer");
						var new_alert = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span>Oops! Something went wrong.</div>';
						var old_alert = comment_alert.find("div[role=alert]");
						if (old_alert.length > 0) {
							old_alert.replaceWith(new_alert);
						} else {
							comment_alert.prepend(new_alert);
						}
					}
				},
				error : function(msg) {
					console.log(msg);
				}
			});
}

function SetIssueColor() {
	var issue = $(this).closest("[data-issue]");
	var color = $(this).closest("[data-issue-color]").attr("data-issue-color");
	issue.attr("data-issue-color", color);
}

function ArchiveIssue() {
	var issue = $(this).closest("[data-issue]");
	var period = $(this).closest("[data-archive-period]").attr(
			"data-archive-period");
	issue.attr("data-archived", "1");
	var calendar = issue.find(".glyphicon-calendar").first();
	if (period == 0) {
		issue.removeClass("panel-primary").addClass("panel-danger");
		issue.attr("data-issue-valid-to", "never");
	} else {
		issue.find(".archive-date").first().text(period + " Hours");
		calendar.attr("title", issue.find(".archive-date-msg").first().text());
		issue.attr("data-issue-valid-to", period);
	}
}

function notifyMe0() {
	if (!Notification) {
		// ie
		alert('Desktop notifications not available in your browser. Try Chromium.');
		return;
	}
	if (Notification.permission !== "granted") {
		// chrome , opera
		Notification.requestPermission();
	} else {
		// mozilla
		var notification = new Notification(
				'Notification title',
				{
					icon : 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
					body : "Hey there! You've been notified!",
				});
		notification.onclick = function() {
			window.open("http://stackoverflow.com/a/13328397/1269037");
		};
	}
}

function notifyMe1() {
	// Let's check if the browser supports notifications
	if (!("Notification" in window)) {
		alert("This browser does not support desktop notification");
	}

	// Let's check if the user is okay to get some notification
	else if (Notification.permission === "granted") {
		// If it's okay let's create a notification
		var notification = new Notification("Hi there!");
	}

	// Otherwise, we need to ask the user for permission
	// Note, Chrome does not implement the permission static property
	// So we have to check for NOT 'denied' instead of 'default'
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function(permission) {

			// Whatever the user answers, we make sure we store the information
			if (!('permission' in Notification)) {
				Notification.permission = permission;
			}

			// If the user is okay, let's create a notification
			if (permission === "granted") {
				var notification = new Notification("Hi there!");
			}
		});
	}

	// At last, if the user already denied any notification, and you
	// want to be respectful there is no need to bother him any more.
}

function notifyMe2() {
	var notification = webkitNotifications.createNotification(
			'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
			'Hello!', 'Lorem ipsum...');
	var notification = webkitNotifications
			.createHTMLNotification('notification.html');
	notification.show();
}

function notifyMe3() {
	var opt = {
		type : "basic",
		title : "Primary Title",
		message : "Primary message to display",
	}
	chrome.notifications.create("111", opt);
}

// code to execute once the DOM is loaded fully

$(document).ready(
		function() {
			$('#wrap')
			// attach to each issue's collapsable content
			.on('show.bs.collapse', '[data-issue] .panel-collapse',
					PointChevronDown).on('hide.bs.collapse',
					'[data-issue] .panel-collapse', PointChevronUp)
			// attach to each issue's collapsable comment area
			.on('show.bs.collapse', 'div[data-issue] .comment-area',
					PointCollapseDown)
			// attach color bubble button to color
			.on('click', '.color-chooser li', SetIssueColor)
			// attach reopen issue
			.on('click', '.ReopenIssue', ReopenIssue)
			// attach archive issue
			.on('click', '.archive-period-chooser li', ArchiveIssue)

			// splite js from html
			.on('click', '#new_issue', function() {
				AppendIssue(false);
			})

			.on('click', '.SaveIssue', SaveIssue)

			.on('click', '.CancelIssue', CancelIssue)

			// .on('dblclick', '.issueDesc, .desc_id>.panel-body',
			// EditIssue)//php code later
			// .on('dblclick', '.issueDesc, .desc_id>.panel-body',
			// EditDenied)//php code later

			.on('click', '.new-comment-btn', ShowNewCommentBox)

			.on('click', 'a[data-version]', LoadEntryData)// php code later

			.on('change', '.issue_upload', Issue_Upload)

			.on('click', '.DeleteFavourite', DeleteFavourite)

					.on(
							'click',
							'.favourite .glyphicon',
							function(event) {
								event.stopPropagation();
								var star = $(this).closest("div[data-issue]")
										.find(".favourite .glyphicon");
								if (star.attr("class").indexOf(
										"glyphicon-star-empty") > -1)
									SaveFavourite(this);
								else
									DeleteFavourite(event);
							})

					// splite js from html

					// enter key will be disabled in description input box

					.on('keydown', '.issueDesc', function(e) {
						if (e.keyCode == 13) {
							e.preventDefault();
						}
					});

			document.addEventListener('DOMContentLoaded', function() {
				if (Notification.permission !== "granted")
					Notification.requestPermission();
			});

			if ($('body').data('infinite-scrolling')) {
				$(document).scroll(
						function(e) {
							if (AutoPagingInProgress)
								return false;
							if ($(window).scrollTop() >= $(document).height()
									- $(window).height() - 700) {
								AutoPagingInProgress = true;
								AppendIssue(true);
							}
						});
				// if our document fits at once into the viewport, start paging
				// immediately
				if ($(document).height() == $(window).height()) {
					AutoPagingInProgress = true;
					// 0 timeout means, we push this into the global event queue
					setTimeout(function() {
						AppendIssue(true, true);
					}, 0);
				}
			}
		});
