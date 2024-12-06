<?php
include 'headers.php';
include 'connect.php';

$requestID = $_GET['id'];

    $sql = "SELECT
            PurchaseRequests.RequestID,
            PurchaseRequestDetails.RequestDeadline,
            PurchaseRequestDetails.RequestDescription,
            PurchaseRequestDetails.RequestedBy,
            PurchaseRequests.RequestStatus
            FROM PurchaseRequests
            JOIN PurchaseRequestDetails
            ON PurchaseRequests.RequestID = PurchaseRequestDetails.RequestID
            WHERE PurchaseRequests.IsDeleted = 0
            AND PurchaseRequests.RequestID = $requestID"; 

    $data = [];
    
    $stmt = sqlsrv_query($conn, $sql);
    
    if ($stmt !== false) {
        if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data = array(
                "RequestID" => $row["RequestID"],
                "RequestDeadline" => $row["RequestDeadline"]->format("Y-m-d"),
                "RequestedBy" => $row["RequestedBy"],
                "RequestDescription" => $row["RequestDescription"],
                "RequestStatus" => $row["RequestStatus"]
            );
        }
        sqlsrv_free_stmt($stmt);
    }
    sqlsrv_close($conn);

    echo json_encode($data);

?>
