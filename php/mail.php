<?php
include 'headers.php';
include 'connect.php';
include 'mailer.php';
$input = json_decode(file_get_contents("php://input"), true);
sendEmailsBasedOnInput($input);
?>