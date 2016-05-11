<?php
if (file_exists ( 'data.xml' )) {
	$xml = simplexml_load_file ( 'data.xml' );
} else {
	exit ( 'Failed to open data.' );
}
$data = $xml->temperature;
$xml = null;

echo $data;

?>