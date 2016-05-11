<?php
if (isset ( $_REQUEST ["action_id"] ) && $_REQUEST ["action_id"] != "") {
	$data = $_REQUEST ["temperature"];
	$sxe = new SimpleXMLElement ( 'data.xml', NULL, TRUE );
	$sxe->temperature = $data;
	file_put_contents ( 'data.xml', $sxe->asXML () );
	echo "Temperature updated sucessfully";
}
if (file_exists ( 'data.xml' )) {
	$xml = simplexml_load_file ( 'data.xml' );
} else {
	exit ( 'Failed to open data.' );
}
$data = $xml->temperature;

?>
<html>
<head>
<title>Edit Temperature</title>
</head>
<body>
	<form method="post" action="#" />
	<input type="hidden" name="action_id" value="1" /> Temperature In
	Degree Celsius
	<input type="text" name="temperature"
		value="<?php if(isset($data)){echo $data;} ?>"
		style="text-align: center" />
	<input type="submit" value="Update" />
	</form>
</body>
</html>