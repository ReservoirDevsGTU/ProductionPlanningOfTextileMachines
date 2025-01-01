<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["RequestID"],
    $input["RequestStatus"],
    $input["RequestedBy"],
    $input["RequestDeadline"],
    $input["RequestDescription"],
    $input["Materials"])
   and count($input["Materials"]) > 0
   and ($input["RequestStatus"] == 0 or $input["RequestStatus"] == 1)
  ) {
    $id = $input["RequestID"];

    $materialIDs = "";

    $materialUpdates = "";

    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        $amt = $m["RequestedAmount"];

        $materialIDs .= ", " . $mid;

        $materialUpdates .= <<<SQL

                           IF EXISTS (SELECT 1 FROM @previousIDs WHERE MaterialID = $mid)

                           UPDATE PurchaseRequestItems
                           SET RequestedAmount = $amt
                           WHERE MaterialID = $mid
                           AND RequestID = $id
                           AND IsDeleted = 0;

                           ELSE

                           INSERT INTO PurchaseRequestItems (ItemID, RequestID, MaterialID, RequestedAmount, ItemStatus, IsDeleted)
                           VALUES ((SELECT ISNULL(MAX(ItemID)+1,1) FROM PurchaseRequestItems), $id, $mid, $amt, 0, 0);

                           SQL;
    }

    $materialIDs = "(" . substr($materialIDs, 2) . ")";

    $sql =  <<<SQL

            DECLARE @status INT;

            SET @status = (SELECT RequestStatus FROM PurchaseRequests WHERE RequestID = $id);

            IF @status != 0
                THROW 50000, 'The request is not editable.', $id;
            
            DECLARE @previousIDs TABLE(MaterialID INT);

            INSERT INTO @previousIDs (MaterialID)
            SELECT MaterialID 
            FROM PurchaseRequestItems
            WHERE RequestID = $id
            AND IsDeleted = 0;

            UPDATE PurchaseRequests
            SET RequestStatus = ?
            WHERE RequestID = $id;

            UPDATE PurchaseRequestDetails
            SET RequestedBy = ?,
                RequestDeadline = ?,
                RequestDescription = ?
            WHERE RequestID = $id;
            
            UPDATE PurchaseRequestItems
            SET IsDeleted = 1
            WHERE RequestID = $id
            AND MaterialID NOT IN $materialIDs;

            SQL
            . $materialUpdates;

    //echo $sql;

    sqlsrv_begin_transaction($conn);
    $sql = substr($sql, 0, strlen($sql) - 1);

    $stmt = sqlsrv_query($conn, $sql, array(
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
