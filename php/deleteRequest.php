<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if(isset($input["RequestID"])) {
    sqlsrv_begin_transaction($conn);

    $id = $input["RequestID"];

    $sql = "IF (SELECT RequestStatus FROM PurchaseRequests WHERE RequestID = $id) != 0
            THROW 50000, 'Invalid status.', $id;
            UPDATE PurchaseRequests SET IsDeleted = 1 WHERE RequestID = $id;
            UPDATE PurchaseRequestItems SET IsDeleted = 1 WHERE RequestID = $id;
            UPDATE PurchaseRequestDetails SET IsDeleted = 1 WHERE RequestID = $id;";

    $stmt = sqlsrv_query($conn, $sql);

    if($stmt) {
        sqlsrv_commit($conn);
    }
    else {
        echo json_encode(sqlsrv_errors(), true);
        sqlsrv_rollback($conn);
    }
}

sqlsrv_close($conn);
?>
