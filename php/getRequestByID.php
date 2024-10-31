<?php
include 'headers.php';
include 'connect.php';

$requestID = $_GET['id'];

    $sql = "SELECT
            PurchaseRequests.RequestID,
            PurchaseRequestDetails.RequestDeadline,
            Users.UserName,
            PurchaseRequestDetails.RequestDescription,
            PurchaseRequests.RequestStatus
            FROM PurchaseRequests
            JOIN PurchaseRequestDetails
            ON PurchaseRequests.RequestID = PurchaseRequestDetails.RequestID
            JOIN Users
            ON PurchaseRequestDetails.RequestedBy = Users.UserID
            WHERE PurchaseRequests.IsDeleted = 0
            AND PurchaseRequests.RequestID = $requestID"; 

    $data = [];
    
    $stmt = sqlsrv_query($conn, $sql);
    
    if ($stmt !== false) {
        if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data = array(
                "RequestID" => $row["RequestID"],
                "RequestDeadline" => $row["RequestDeadline"]->format("Y-m-d"),
                "RequestedBy" => $row["UserName"],
                "RequestDescription" => $row["RequestDescription"],
                "RequestStatus" => $row["RequestStatus"]
            );
        }
        sqlsrv_free_stmt($stmt);
    }
    sqlsrv_close($conn);

    echo json_encode($data);

?>
