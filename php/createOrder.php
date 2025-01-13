<?php
include 'headers.php';
include 'connect.php';
include 'mailer.php';
$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["SupplierID"],
    $input["OrderDate"],
    $input["ShippingDate"],
    $input["OrderDeadline"],
    $input["OrderNotes"],
    $input["Materials"])
   and count($input["Materials"]) > 0
  ) {

    $sql =  <<<SQL

            DECLARE @id TABLE(val INT);

            INSERT INTO PurchaseOrders(CreatedBy, CreationDate, OrderStatus, IsDeleted)
            OUTPUT INSERTED.OrderID INTO @id
            VALUES(?, GETDATE(), 0, 0);

            INSERT INTO PurchaseOrderDetails(OrderID, OrderDate, OrderDeadline, ShippingDate, OrderNotes, SupplierID, DetailStatus, IsDeleted)
            VALUES((SELECT val FROM @id), ?, ?, ?, ?, ?, 0, 0);

            INSERT INTO PurchaseOrderItems(OrderID, OfferItemID, RequestItemID, MaterialID, OrderedAmount, ProvidedAmount, UnitPrice, ItemStatus, IsDeleted)
            VALUES

            SQL;

    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        $oamt = $m["OrderedAmount"];
        $up = $m["UnitPrice"];
        $riid = $m["RequestItemID"] ? $m["RequestItemID"] : "NULL";
        $oiid = $m["OfferItemID"] ? $m["OfferItemID"] : "NULL";
        $sql .= "((SELECT val FROM @id), $oiid, $riid, $mid, $oamt, 0, $up, 0, 0),\n";
    }

    $sql[strlen($sql) - 2] = ';';
    $sql .= "\nSELECT val AS OrderID FROM @id;";

    //echo $sql;

    sqlsrv_begin_transaction($conn);

    $stmt = sqlsrv_query($conn, $sql, array(
        $input["CreatedBy"],
        $input["OrderDate"],
        $input["OrderDeadline"],
        $input["ShippingDate"],
        $input["OrderNotes"],
        $input["SupplierID"],
    ));

    if($stmt !== false) {
        if(isset($input['ContactID']) && !empty($input['ContactID'])) {
            $orderData = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

            if ($orderData) {
                $orderID = $orderData['OrderID'];

                $emailInput = [
                    "OrderID" => $orderID,
                    "ContactID" => $input["ContactID"] ?? []
                ];

                sendEmailsBasedOnInput($emailInput);
            }
        }
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
