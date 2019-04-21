<?php
/*
PekeUpload
Copyright (c) 2013 Pedro Molina
*/

//Security. Only ajax calls from server
define('IS_AJAX', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
if (!IS_AJAX) {
    die('Restricted access');
}

$pos = strpos($_SERVER['HTTP_REFERER'], getenv('HTTP_HOST'));
if ($pos === false) {
    die('Restricted access');
}

// Define a destination
$targetFolder = 'views/img/'; // Relative to the location of this file


if (!empty($_FILES)) {
	$tempFile = $_FILES['file']['tmp_name'];
	$targetPath = dirname(__FILE__) . '/' . $targetFolder;
	$targetFile = rtrim($targetPath,'/') . '/' . $_FILES['file']['name'];
	
	// Validate the file type
	$fileTypes = array('jpg','jpeg','gif','png'); // File extensions
	$fileParts = pathinfo($_FILES['file']['name']);
	$response = array ();
	if (in_array($fileParts['extension'],$fileTypes)) {
        $response['success'] = 0;
        $response['error'] = 'General failure!';
		if (move_uploaded_file($tempFile,$targetFile)) {
            $response['success'] = 1;
            $response['error'] = 'Uploaded files moved to target location.';
            foreach ($_POST as $key => $value){
                $response[$key] = $value;
            }
        } else {
            $response['success'] = 0;
            $response['error'] = 'Error while moving uploaded file(s) to the target location! ' . $targetPath . ' | ' . $targetFile;
        };
	} else {
		$response['success'] = 0;
		$response['error'] = 'Invalid file type.';
	}
    
    echo json_encode($response);
    
}
?>
