<?php
include 'headers.php';
include 'connect.php';

$sql = "INSERT INTO PurchaseRequests(RequestID, CreatedBy, CreationDate, RequestStatus, IsDeleted)
        OUTPUT INSERTED.RequestID
        VALUES((SELECT ISNULL(MAX(RequestID)+1,1) FROM PurchaseRequests), ?, GETDATE(), ?, 0)";

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $stmt = sqlsrv_query($conn, $sql, array(
        $input["CreatedBy"],
        $input["IsDraft"] ? 0 : 1
    ));

    if($stmt !== false) {
        $id = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)["RequestID"];
        sqlsrv_free_stmt($stmt);
        $sql1 = "INSERT INTO PurchaseRequestDetails(RequestInfoID, RequestID, RequestedBy, RequestDeadline, RequestDescription, ManufacturingUnitID, RequestDetailStatus, IsDeleted)
        VALUES((SELECT ISNULL(MAX(RequestInfoID)+1,1) FROM PurchaseRequestDetails), ?, ?, ?, ?, ?, 1, 0)";
        $stmt1 = sqlsrv_query($conn, $sql1, array(
            $id,
            $input["RequestedBy"],
            $input["RequestDeadline"],
            $input["RequestDescription"],
            $input["ManufacturingUnitID"]
        ));
        sqlsrv_free_stmt($stmt1);
        $sql2 = "INSERT INTO PurchaseRequestItems(ItemID, RequestID, MaterialID, RequestedAmount, ProvidedAmount, ItemStatus, IsDeleted)
        VALUES((SELECT ISNULL(MAX(ItemID)+1,1) FROM PurchaseRequestItems), ?, ?, ?, ?, ?, 1, 0)";
        foreach($input["Materials"] as $m) {
            $stmt2 = sqlsrv_query($conn, $sql2, array(
                $id,
                $m["MaterialID"],
                $m["RequestedAmount"],
                $m["ProvidedAmount"]
            ));
            sqlsrv_free_stmt($stmt2);
        }
    }
    else {
        die(json_encode(sqlsrv_errors(), true));
    }

    sqlsrv_close($conn);
}
?>
