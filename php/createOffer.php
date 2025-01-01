<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["OfferGroupID"],
    $input["CreatedBy"],
    $input["OfferDate"],
    $input["OfferDeadline"],
    $input["OfferDescription"],
    $input["OfferStatus"],
    $input["Materials"],
    $input["Suppliers"])
   and count($input["Materials"]) > 0
   and count($input["Suppliers"]) > 0
   and ($input["OfferStatus"] == 0 or $input["OfferStatus"] == 1 or $input["OfferStatus"] == 2)
  ) {

    $sql =  <<<SQL

            DECLARE @id TABLE(val INT);

            INSERT INTO PurchaseOffers(OfferID, OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
            OUTPUT INSERTED.OfferID INTO @id
            VALUES((SELECT ISNULL(MAX(OfferID)+1,1) FROM PurchaseOffers), ?, ?, GETDATE(), ?, 0);

            INSERT INTO PurchaseOfferDetails(DetailID, OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
            VALUES((SELECT ISNULL(MAX(DetailID)+1,1) FROM PurchaseOfferDetails),
                   (SELECT val FROM @id), ?, ?, ?, ?, ?, 0, 0);

            INSERT INTO PurchaseOfferItems(ItemID, OfferID, RequestItemID, MaterialID, OfferRequestedAmount, OfferedAmount, OfferedPrice, ConformationStatus, ItemStatus, IsDeleted) VALUES

            SQL;

    $i = 1;
    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        $oramt = $m["OfferRequestedAmount"];
        $oamt = $m["OfferedAmount"] ? $m["OfferedAmount"] : "NULL";
        $op = $m["OfferedPrice"] ? $m["OfferedPrice"] : "NULL";
        $riid = $m["RequestItemID"] ? $m["RequestItemID"] : "NULL";
        $sql .= "((SELECT ISNULL(MAX(ItemID)+$i,$i) FROM PurchaseOfferItems), (SELECT val FROM @id),
                  $riid, $mid, $oramt, $oamt, $op, 0, 0, 0),";
        $i = $i + 1;
    }

    $sql = substr($sql, 0, strlen($sql) - 1);

    echo $sql;

    sqlsrv_begin_transaction($conn);

    foreach($input["Suppliers"] as $s) {
        $stmt = sqlsrv_query($conn, $sql, array(
            $input["OfferGroupID"],
            $input["CreatedBy"],
            $input["OfferStatus"],
            $input["OfferDate"],
            $input["OfferDeadline"],
            $input["RequestedBy"],
            $input["OfferDescription"],
            $s["SupplierID"]
        ));

        if($stmt !== false) {
            sqlsrv_free_stmt($stmt);
        }
        else {
            echo json_encode(sqlsrv_errors(), true);
            sqlsrv_rollback($conn);
            die();
        }
    }

    sqlsrv_commit($conn);
}

sqlsrv_close($conn);
?>
