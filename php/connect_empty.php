<?php
// Copy this file to connect.php and put your server config there.
// Do not put your config here.

function connectSQL() {
    $serverName = "";
    $connectionOptions = array(
        "Database" => "",
        "Uid" => "",
        "PWD" => ""
    );
    
    $conn = sqlsrv_connect($serverName, $connectionOptions);
    
    if ($conn === false) {
        die(json_encode(array("error" => sqlsrv_errors())));
    }

    return $conn;
}
?>
