<?php
  session_start();
  if($_SESSION["auth"] != true) {
    header("HTTP/1.o 403 Forbidden");
    die;
  }

  $_POST = json_decode( file_get_contents("php://input"), true);

  $newFile = "../../" . $_POST["name"] . ".html";

  if(file_exists($newFile)) {
    header("HTTP/1.o 400 Bad Request");
  } else {
    fopen($newFile, "w");
  }