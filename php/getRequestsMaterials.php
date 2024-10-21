<?php
include 'headers.php';
include 'connect.php';

$requestID = $_GET['id'];

    $sql = "SELECT
            PurchaseRequestDetails.RequestDetailID,
            PurchaseRequestDetails.MaterialID,
            PurchaseRequestDetails.RequestedAmount,
            PurchaseRequestDetails.OrderedAmount,
            PurchaseRequestDetails.OfferedAmount,
            PurchaseRequestDetails.ProvidedAmount,
            PurchaseRequestDetails.MaterialStatus
            FROM PurchaseRequestDetails
            WHERE PurchaseRequestDetails.IsDeleted = 0
            AND PurchaseRequestDetails.RequestID = $requestID"; 

    $materials = [];
    
    $stmt = sqlsrv_query($conn, $sql);

    if ($stmt !== false) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $materials[] = array(
                "RequestDetailID"   => $row["RequestDetailID"],
                "MaterialID"        => $row["MaterialID"],
                "RequestedAmount"   => $row["RequestedAmount"],
                "OrderedAmount"     => $row["OrderedAmount"],
                "OfferedAmount"     => $row["OfferedAmount"],
                "ProvidedAmount"    => $row["ProvidedAmount"],
                "MaterialStatus"    => $row["MaterialStatus"]
            );
        }
        sqlsrv_free_stmt($stmt);
    }
    sqlsrv_close($conn);

    echo json_encode($materials);

?>
