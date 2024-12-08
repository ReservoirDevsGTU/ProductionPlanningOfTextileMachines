<?php
include 'headers.php';
include 'connect.php';

$sql = "SELECT
        pr.RequestID,
        prd.RequestDeadline,
        prd.RequestDescription,
        prd.RequestedBy,
        u.UserName,
        pr.RequestStatus
        FROM PurchaseRequests pr
        JOIN PurchaseRequestDetails prd
        ON pr.RequestID = prd.RequestID
        JOIN Users u
        ON prd.RequestedBy = u.UserID
        WHERE pr.IsDeleted = 0
        ";
$stmt = sqlsrv_query($conn, $sql);

$data = [];
if ($stmt !== false) {
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $row["RequestDeadline"] = $row["RequestDeadline"]->format("Y-m-d");
        $data[] = $row;
    }
    sqlsrv_free_stmt($stmt);
}

sqlsrv_close($conn);

echo json_encode($data);
?>
