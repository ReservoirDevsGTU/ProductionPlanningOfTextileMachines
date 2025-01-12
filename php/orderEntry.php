<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["OrderID"],
    $input["SupplierID"],
    $input["Materials"])
   and count($input["Materials"]) > 0
  ) {
    $id = $input["OrderID"];

    $sql =  <<<SQL

            DECLARE @status INT;

            SET @status = (SELECT OrderStatus FROM PurchaseOrders WHERE OrderID = $id);

            IF @status = 2
                THROW 50000, 'The order is not editable.', $id;

            UPDATE PurchaseOrderDetails
            SET SupplierID = ?
            WHERE OrderID = $id;

            SQL;

    foreach($input["Materials"] as $m) {
        $oiid = $m["OrderItemID"];
        $pamt = $m["ProvidedAmount"];
        $price = $m["UnitPrice"];

        $sql .= <<<SQL

                UPDATE PurchaseOrderItems
                SET ProvidedAmount = $pamt,
                    UnitPrice = $price
                WHERE ItemID = $oiid
                AND OrderID = $id;

                SQL;
    }

    $sql .= <<<SQL

            UPDATE PurchaseOrders
            SET OrderStatus = CASE
                WHEN (SELECT SUM(OrderedAmount - ProvidedAmount)
                      FROM PurchaseOrderItems
                      WHERE OrderID = $id
                      AND IsDeleted = 0) > 0
                    THEN 1
                    ELSE 2
                END
            WHERE OrderID = $id

            SQL;

    //echo $sql;

    sqlsrv_begin_transaction($conn);
    $sql = substr($sql, 0, strlen($sql) - 1);

    $stmt = sqlsrv_query($conn, $sql, array(
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
