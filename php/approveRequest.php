<?php
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $sql = "UPDATE PurchaseRequests
            SET RequestStatus = ?
            WHERE RequestID = ?";
    $stmt = sqlsrv_query($conn, $sql, array(
                        $input["Approve"] ? 2 : 3,
                        $input["RequestID"]));
    sqlsrv_close($conn);
}
?>
