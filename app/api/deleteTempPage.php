<?php
  session_start();
  if($_SESSION["auth"] != true) {
    header("HTTP/1.o 403 Forbidden");
    die;
  }

  $file = "../../wertqwer_34wsdfs.html";

  if(file_exists($file)) {
   unlink($file);
  } else {
    header("HTTP/1.o 400 Bad Request");
  }