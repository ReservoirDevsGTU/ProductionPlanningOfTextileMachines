<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $sql1 = "INSERT INTO PurchaseOffers(OfferID, OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
             OUTPUT INSERTED.OfferID
             VALUES((SELECT ISNULL(MAX(OfferID)+1,1) FROM PurchaseOffers), ?, ?, GETDATE(), 0, 0)";
    $sql2 = "INSERT INTO PurchaseOfferDetails(DetailID, OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
             VALUES((SELECT ISNULL(MAX(DetailID)+1,1) FROM PurchaseOfferDetails),
                    ?, ?, ?, ?, ?, ?, 0, 0)";
    $sql3 = "INSERT INTO PurchaseOfferItems(ItemID, OfferID, RequestItemID, MaterialID, OfferRequestedAmount, OfferedAmount, ConformationStatus, ItemStatus, IsDeleted)
             VALUES((SELECT ISNULL(MAX(ItemID)+1,1) FROM PurchaseOfferItems),
                    ?, ?, ?, ?, 0, 0, 0, 0)";
    sqlsrv_begin_transaction($conn);
    foreach($input["Suppliers"] as $supplier) {
        $stmt = sqlsrv_query($conn, $sql1, array(
            $input["OfferGroupID"],
            $input["CreatedBy"]
        ));
        if($stmt) {
            $id = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)["OfferID"];
            sqlsrv_free_stmt($stmt);
            $stmt = sqlsrv_query($conn, $sql2, array(
                $id,
                $input["OfferDate"],
                $input["OfferDeadline"],
                $input["RequestedBy"],
                $input["OfferDescription"],
                $supplier["SupplierID"]
            ));
            sqlsrv_free_stmt($stmt);
            if(!$stmt) {
                $errors = sqlsrv_errors();
                sqlsrv_rollback($conn);
                die(json_encode($errors, true));
            }
            foreach($input["Materials"] as $material) {
                $stmt = sqlsrv_query($conn, $sql3, array(
                    $id,
                    $material["RequestItemID"],
                    $material["MaterialID"],
                    $material["OfferRequestedAmount"],
                ));
                if(!$stmt) {
                    $errors = sqlsrv_errors();
                    sqlsrv_rollback($conn);
                    die(json_encode($errors, true));
                }
                sqlsrv_free_stmt($stmt);
            }
        }
        else {
            $errors = sqlsrv_errors();
            sqlsrv_rollback($conn);
            die(json_encode($errors, true));
        }
    }
}
sqlsrv_commit($conn);
sqlsrv_close($conn);
?>
