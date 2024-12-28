<?php
include 'connect.php';
include 'headers.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $offerIDs = "";
    foreach($input["OfferID"] as $id) {
        $offerIDs .= ", " . $id;
    }
    $offerIDs = "(" . substr($offerIDs, 2) .")";
    $sql = "DECLARE @GroupIDs TABLE (OfferGroupID INT);
            UPDATE PurchaseOffers
            SET OfferStatus = 1
            OUTPUT INSERTED.OfferGroupID INTO @GroupIDs
            WHERE OfferID IN $offerIDs;";
    if($input["cancelOthers"]) {
        $sql .= "UPDATE PurchaseOffers
                SET IsDeleted = 1
                WHERE OfferID NOT IN $offerIDs
                AND OfferGroupID IN (SELECT OfferGroupID FROM @GroupIDs);";
    }
    $stmt = sqlsrv_query($conn, $sql);
    if(!$stmt) {
        die(json_encode(sqlsrv_errors(), true));
    }
    sqlsrv_close($conn);
}
?>
