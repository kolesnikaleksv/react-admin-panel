<?php
  $_POST = json_decode( file_get_contents("php://input"), true);

  $neFile = "../../temp.html";

  if($_POST["html"]) {
    file_put_contents($neFile, $_POST["html"]);
  } else {
    header("HTTP/1.o 400 Bad Request");
  }