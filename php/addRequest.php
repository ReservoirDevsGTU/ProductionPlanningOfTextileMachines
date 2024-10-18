<?php
include 'connect.php';

$sql = "INSERT INTO PurchaseRequests(RequestID, RequestDeadline, RequestedBy, CreatedBy, CreationDate, RequestStatus, IsDeleted)
        OUTPUT INSERTED.RequestID
        VALUES((SELECT ISNULL(MAX(RequestID)+1,1) FROM PurchaseRequests), ?, ?, ?, GETDATE(), 1, 0)";

$input = json_decode(file_get_contents("php://input"), true);

$stmt = sqlsrv_query($conn, $sql, array(
    $_POST["RequestDeadline"],
    $_POST["RequestedBy"],
    $_POST["CreatedBy"]
    ));

if($stmt !== false) {
    $id = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)["RequestID"];
    sqlsrv_free_stmt($stmt);
    $sql1 = "INSERT INTO PurchaseRequestInfos(RequestInfoID, RequestID, RequestDescription, ManufacturingUnitID, RequestInfoStatus, IsDeleted)
        VALUES((SELECT ISNULL(MAX(RequestInfoID)+1,1) FROM PurchaseRequestInfos), ?, ?, ?, 1, 0)";
    $stmt1 = sqlsrv_query($conn, $sql1, array(
        $id,
        $_POST["RequestDescription"],
        $_POST["ManufacturingUnitID"]
        ));
    sqlsrv_free_stmt($stmt1);
    $sql2 = "INSERT INTO PurchaseRequestDetails(RequestDetailID, RequestID, MaterialID, RequestedAmount, OfferedAmount, OrderedAmount, ProvidedAmount, MaterialStatus, IsDeleted)
            VALUES((SELECT ISNULL(MAX(RequestDetailID)+1,1) FROM PurchaseRequestDetails), ?, ?, ?, ?, ?, ?, 1, 0)";
    foreach($input["Materials"] as $m) {
        $stmt2 = sqlsrv_query($conn, $sql2, array($id,
            $m["MaterialID"],
            $m["RequestedAmount"],
            $m["OfferedAmount"],
            $m["OrderedAmount"],
            $m["ProvidedAmount"]
            ));
        sqlsrv_free_stmt($stmt2);
    }
}
else {
    die(json_encode(sqlsrv_errors(), true));
}

sqlsrv_close($conn);
?>
