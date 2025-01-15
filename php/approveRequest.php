<?php
include 'connect.php';
include 'headers.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["RequestID"],
    $input["RequestStatus"])
   and ($input["RequestStatus"] == 2 or $input["RequestStatus"] == 3)
  ) {
    $sql = "IF EXISTS (SELECT 1 FROM PurchaseRequests WHERE RequestStatus != 1 AND RequestID = ?)
                THROW 50000, 'The request is not approvable', 1;
            UPDATE PurchaseRequests
            SET RequestStatus = ?
            WHERE RequestID = ?;";

    sqlsrv_begin_transaction($conn);

    $stmt = sqlsrv_query($conn, $sql, array(
                        $input["RequestID"],
                        $input["RequestStatus"],
                        $input["RequestID"]));

    if($stmt !== false) {
        sqlsrv_free_stmt($stmt);
        sqlsrv_commit($conn);
    }
    else {
        echo json_encode(sqlsrv_errors(), true);
        sqlsrv_rollback($conn);
    }
}

sqlsrv_close($conn);
?>
