<?php

header('Content-Type: text/html; charset=UTF-8');

//Security. Only ajax calls from server
define('IS_AJAX', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
if (!IS_AJAX) {
    die('Restricted access');
}

$pos = strpos($_SERVER['HTTP_REFERER'], getenv('HTTP_HOST'));
if ($pos === false) {
    die('Restricted access');
}

  // Define a destination (create a new folder, there to upload the file)
  $uniqid = uniqid();
  $targetFolder = '../uploads'.DIRECTORY_SEPARATOR.$uniqid; // Relative to the root
  while(is_dir($targetFolder)) {
  	$uniqid = uniqid();
    $targetFolder = '../uploads'.DIRECTORY_SEPARATOR.$uniqid;
  }

  mkdir($targetFolder, 0777);

  if (!empty($_FILES)) {
  	$tempFile = $_FILES['file']['tmp_name'];
  	$targetPath = dirname(__FILE__) . '/' . $targetFolder;
  	$targetFile = rtrim($targetPath,'/') . '/' . $_FILES['file']['name'];

  	// Validate the file type
  	//$fileTypes = array('jpg','jpeg','gif','png','txt','zip','swf','exe'); // File extensions
  	$fileParts = pathinfo($_FILES['file']['name']);
  	$response = array ();
  	 //if (in_array($fileParts['extension'],$fileTypes)) {
  		move_uploaded_file($tempFile,$targetFile);
  		$response['success'] = 1;
  		foreach ($_POST as $key => $value){
  			$response[$key] = $value;
  		}
  		$response['folder'] = $uniqid;
  		$response['fileName'] = $_FILES['file']['name'];
  		echo json_encode($response);
  /*	} else {
  		$response['success'] = 0;
  		$response['error'] = 'Invalid file type.';
  		echo json_encode($response);
  	 }*/
   }  else {
     $response['success'] = 0;
     $response['error'] = 'File not uploaded.';
     echo json_encode($response);
   }
?>
