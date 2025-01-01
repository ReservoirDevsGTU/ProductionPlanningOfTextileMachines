<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["CreatedBy"],
    $input["RequestStatus"],
    $input["RequestedBy"],
    $input["RequestDeadline"],
    $input["RequestDescription"],
    $input["Materials"])
   and count($input["Materials"]) > 0
   and ($input["RequestStatus"] == 0 or $input["RequestStatus"] == 1)
  ) {

    $sql = "DECLARE @id TABLE(val INT);

            INSERT INTO PurchaseRequests(RequestID, CreatedBy, CreationDate, RequestStatus, IsDeleted)
            OUTPUT INSERTED.RequestID INTO @id
            VALUES((SELECT ISNULL(MAX(RequestID)+1,1) FROM PurchaseRequests), ?, GETDATE(), ?, 0);

            INSERT INTO PurchaseRequestDetails(RequestInfoID, RequestID, RequestedBy, RequestDeadline, RequestDescription, RequestDetailStatus, IsDeleted)
            VALUES((SELECT ISNULL(MAX(RequestInfoID)+1,1) FROM PurchaseRequestDetails), (SELECT val FROM @id), ?, ?, ?, 0, 0);

            INSERT INTO PurchaseRequestItems(ItemID, RequestID, MaterialID, RequestedAmount, ItemStatus, IsDeleted) VALUES";

    $i = 1;
    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        $amt = $m["RequestedAmount"];
        $sql .= "((SELECT ISNULL(MAX(ItemID)+$i,$i) FROM PurchaseRequestItems), (SELECT val FROM @id),
                  $mid, $amt, 0, 0),";
        $i = $i + 1;
    }

    $sql = substr($sql, 0, strlen($sql) - 1);

    sqlsrv_begin_transaction($conn);

    $stmt = sqlsrv_query($conn, $sql, array(
        $input["CreatedBy"],
        $input["RequestStatus"],
        $input["RequestedBy"],
        $input["RequestDeadline"],
        $input["RequestDescription"],
    ));

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
