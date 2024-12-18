<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $sql = "INSERT INTO PurchaseOffers(OfferID, OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
            OUTPUT INSERTED.OfferID
            VALUES((SELECT ISNULL(MAX(OfferID)+1,1) FROM PurchaseOffers), ?, ?, GETDATE(), 0, 0)";
    $stmt = sqlsrv_query($conn, $sql, array(
        $input["OfferGroupID"],
        $input["CreatedBy"]
    ));
    if($stmt !== false) {
        $id = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)["OfferID"];
        sqlsrv_free_stmt($stmt);
        $sql = "INSERT INTO PurchaseOfferDetails(DetailID, OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
                VALUES((SELECT ISNULL(MAX(DetailID)+1,1) FROM PurchaseOfferDetails), ?, ?, ?, ?, ?, ?, 0, 0)";
        foreach($input["Suppliers"] as $supplier) {
            $stmt = sqlsrv_query($conn, $sql, array(
                $id,
                $input["OfferDate"],
                $input["OfferDeadline"],
                $input["RequestedBy"],
                $input["OfferDescription"],
                $supplier["SupplierID"]
            ));
            sqlsrv_free_stmt($stmt);
        }
        $sql = "INSERT INTO PurchaseOfferItems(ItemID, OfferID, RequestItemID, MaterialID, RequestedAmount, OfferedAmount, ConformationStatus, ItemStatus, IsDeleted)
                VALUES((SELECT ISNULL(MAX(ItemID)+1,1) FROM PurchaseOfferItems),
                ?, ?, ?, ?, ?, 0, 0, 0)";
        foreach($input["Materials"] as $material) {
            $stmt = sqlsrv_query($conn, $sql, array(
                $id,
                $material["RequestItemID"],
                $material["MaterialID"],
                $material["RequestedAmount"],
                $material["OfferedAmount"],
            ));
            sqlsrv_free_stmt($stmt);
        }
    }
    else {
        die(json_encode(sqlsrv_errors(), true));
    }
}
sqlsrv_close($conn);
?>
