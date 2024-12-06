<?php
include 'headers.php';
include 'connect.php';

$requestID = $_GET['id'];

    $sql = "SELECT
            PurchaseRequestItems.ItemID,
            PurchaseRequestItems.MaterialID,
            PurchaseRequestItems.RequestedAmount,
            PurchaseRequestItems.OrderedAmount,
            PurchaseRequestItems.ProvidedAmount,
            PurchaseRequestItems.ItemStatus,
            Materials.MaterialName,
            MaterialInventory.Quantity,
            MaterialSpecs.UnitID,
            MaterialSpecs.MaterialNo,
            MaterialSpecs.SuckerNo
            FROM PurchaseRequestItems
            JOIN MaterialInventory
            ON MaterialInventory.MaterialID = PurchaseRequestItems.MaterialID
            JOIN Materials
            ON Materials.MaterialID = PurchaseRequestItems.MaterialID
            JOIN MaterialSpecs
            ON MaterialSpecs.MaterialID = PurchaseRequestItems.MaterialID
            WHERE PurchaseRequestItems.IsDeleted = 0
            AND PurchaseRequestItems.RequestID = $requestID"; 

    $data = [];
    $materials = [];
    
    $stmt = sqlsrv_query($conn, $sql);

    if ($stmt !== false) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data[$row["MaterialID"]] = $row;
        }
        foreach($data as $i) {
            $materials[] = $i;
        }
        sqlsrv_free_stmt($stmt);
    }
    else {
        die(json_encode(sqlsrv_errors(), true));
    }
    sqlsrv_close($conn);

    echo json_encode($materials);

?>
