<?php
include 'connect.php';
include 'headers.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["OfferID"],
    $input["cancelOthers"],
    $input["OfferDescription"])) {

    $offerIDs = "";

    foreach($input["OfferID"] as $id) {
        $offerIDs .= ", " . $id;
    }

    $offerIDs = "(" . substr($offerIDs, 2) .")";

    $sql =  <<<SQL

            IF EXISTS (SElECT 1 FROM PurchaseOffers WHERE OfferStatus != 2 AND OfferID IN $offerIDs)
                THROW 50000, 'All of the offers should be taken offers.', 1

            DECLARE @data TABLE (OfferGroupID INT);

            UPDATE PurchaseOffers
            SET OfferStatus = 3
            OUTPUT INSERTED.OfferGroupID INTO @data
            WHERE OfferID IN $offerIDs;

            UPDATE PurchaseOfferDetails
            SET OfferDescription = ?
            WHERE OfferID IN $offerIDs;

            SQL;

    if($input["cancelOthers"]) {
        $sql .= <<<SQL

                UPDATE PurchaseOffers
                SET IsDeleted = 1
                WHERE OfferID NOT IN $offerIDs
                AND OfferGroupID IN (SELECT OfferGroupID FROM @data)
                AND OfferStatus < 3;

                SQL;
    }

    //echo $sql;

    sqlsrv_begin_transaction($conn);

    $stmt = sqlsrv_query($conn, $sql, array($input["OfferDescription"]));

    if($stmt !== false) {
        sqlsrv_free_stmt($stmt);
        sqlsrv_commit($conn);
    }
    else {
        echo json_encode(sqlsrv_errors(), true);
        sqlsrv_rollback($conn);
    }
}

sqlsrv_close($conn);
?>
