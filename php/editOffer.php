<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["OfferGroupID"],
    $input["OfferID"],
    $input["OfferDate"],
    $input["OfferDeadline"],
    $input["OfferDescription"],
    $input["OfferStatus"],
    $input["SupplierID"],
    $input["Materials"])
   and count($input["Materials"]) > 0
   and ($input["OfferStatus"] == 1 or $input["OfferStatus"] == 2)
  ) {
    $id = $input["OfferID"];

    $sql =  <<<SQL

            DECLARE @status INT;

            SET @status = (SELECT OfferStatus FROM PurchaseOffers WHERE OfferID = $id);

            IF @status NOT IN (0, 1, 2)
                THROW 50000, 'The offer is not editable.', $id;
            
            UPDATE PurchaseOffers
            SET OfferGroupID = ?,
                OfferStatus = ?
            WHERE OfferID = $id;

            UPDATE PurchaseOfferDetails
            SET OfferDate = ?,
                OfferDeadline = ?,
                OfferDescription = ?,
                SupplierID = ?
            WHERE OfferID = $id;

            SQL;

    foreach($input["Materials"] as $m) {
        $oiid = $m["OfferItemID"];
        $amt = $m["OfferedAmount"];
        $price = $m["OfferedPrice"];

        $sql .= <<<SQL

                UPDATE PurchaseOfferItems
                SET OfferedAmount = $amt,
                    OfferedPrice = $price
                WHERE ItemID = $oiid
                AND OfferID = $id;

                SQL;
    }

    echo $sql;

    sqlsrv_begin_transaction($conn);
    $sql = substr($sql, 0, strlen($sql) - 1);

    $stmt = sqlsrv_query($conn, $sql, array(
        $input["OfferGroupID"],
        $input["OfferStatus"],
        $input["OfferDate"],
        $input["OfferDeadline"],
        $input["OfferDescription"],
        $input["SupplierID"],
    ));

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
