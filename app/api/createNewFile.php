<?php
  // echo  $_POST["name"];

  $newFile = "../../" . $_POST["name"] . ".html";

  if(file_exists($newFile)) {
    header("HTTP/1.o 400 Bad Request");
  } else {
    fopen($newFile, "w");
  }