<?php
 session_start();
 if($_SESSION["auth"] != true) {
   header("HTTP/1.o 403 Forbidden");
   die;
 }

  $htmlfiles = glob("../../*.html");
  $response = [];
  foreach($htmlfiles as $file) {
    // echo basename($file);
    array_push($response, basename($file));
  };

  echo json_encode($response); // we can see this by this address - http://react-admin/admin/api/