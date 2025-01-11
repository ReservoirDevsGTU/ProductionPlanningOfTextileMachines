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

            INSERT INTO PurchaseOffers(OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
            OUTPUT INSERTED.OfferID INTO @id
            VALUES(?, ?, GETDATE(), ?, 0);

            INSERT INTO PurchaseOfferDetails(OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
            VALUES((SELECT val FROM @id), ?, ?, ?, ?, ?, 0, 0);

            INSERT INTO PurchaseOfferItems(OfferID, RequestItemID, MaterialID, OfferRequestedAmount, OfferedAmount, OfferedPrice, ItemStatus, IsDeleted) VALUES

            SQL;

    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        $oramt = $m["OfferRequestedAmount"];
        $oamt = $m["OfferedAmount"] ? $m["OfferedAmount"] : "NULL";
        $op = $m["OfferedPrice"] ? $m["OfferedPrice"] : "NULL";
        $riid = $m["RequestItemID"] ? $m["RequestItemID"] : "NULL";
        $sql .= "((SELECT val FROM @id), $riid, $mid, $oramt, $oamt, $op, 0, 0),";
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
