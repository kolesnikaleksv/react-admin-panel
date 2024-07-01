<?php

  $file = "../../wertqwer_34wsdfs.html";

  if(file_exists($file)) {
   unlink($file);
  } else {
    header("HTTP/1.o 400 Bad Request");
  }