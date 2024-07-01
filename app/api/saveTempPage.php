<?php
  $_POST = json_decode( file_get_contents("php://input"), true);

  $neFile = "../../wertqwer_34wsdfs.html";

  if($_POST["html"]) {
    file_put_contents($neFile, $_POST["html"]);
  } else {
    header("HTTP/1.o 400 Bad Request");
  }