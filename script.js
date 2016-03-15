

function PreventEnterClick(e) {
	if (e.keyCode == 13)
		alert('PreventEnterClick');//e.preventDefault();
}

function sss() {
	//alert('sss');
	var issue = $(document).find('.panel_issue');
	var description = issue.find(".Description").first();
	var header_text = description.text().trim();
	description.empty();
	description.append('<input type="text" value="' + header_text + '" maxlength="64" size="80" class="issueDescText">');	
	//description.attr('onkeydown',"if (event.keyCode == 13) alert(1);");
}

$(document).ready(function() {
	

	// $('.elementClass').on('click', function() { // code});
/*
	description.on('click', function() {
		alert('click');
	});
*/
	
	//<input type="text" value="17" maxlength="64" size="80">
	
	//class="issueDescText"

	//$('#wrap').on('click', '.issue_header', sss);
	$('#wrap').on('keydown', '.issue_header input', PreventEnterClick);

});