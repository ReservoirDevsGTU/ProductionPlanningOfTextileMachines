<?php
include 'headers.php';
include 'connect.php';

$input = json_decode(file_get_contents("php://input"), true);

if($input
   and isset(
    $input["OrderID"],
    $input["SupplierID"],
    $input["WarehouseID"],
    $input["TransactionDate"],
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

            DECLARE @delta DECIMAL(18, 2);
            DECLARE @mid INT;
            DECLARE @riid INT;
            DECLARE @oid INT;
            DECLARE @prevInv INT;

            SQL;

    $td = $input["TransactionDate"];
    $wid = $input["WarehouseID"];
    foreach($input["Materials"] as $m) {
        $oiid = $m["OrderItemID"];
        $pamt = $m["ProvidedAmount"];
        $price = $m["UnitPrice"];

        $sql .= <<<SQL

                UPDATE PurchaseOrderItems
                SET @delta = $pamt - ProvidedAmount,
                    @mid = MaterialID,
                    @riid = RequestItemID,
                    @oid = OrderID,
                    ProvidedAmount = $pamt,
                    UnitPrice = $price
                WHERE ItemID = $oiid
                AND OrderID = $id;

                INSERT INTO MaterialTransactions (TransactionDate, TransactionTypeID, WarehouseID, CreationDate, RequestID, OrderID)
                VALUES ('$td', 4, $wid, GETDATE(),
                        (SELECT RequestID FROM PurchaseRequestItems
                         WHERE ItemID = @riid),
                        @oid);

                INSERT INTO MaterialTransactionDetails (TransactionID, MaterialID, Quantity, CreationDate)
                VALUES (SCOPE_IDENTITY(), @mid, @delta, GETDATE());

                SET @prevInv = (SELECT InventoryID FROM MaterialInventory
                                WHERE LastUpdated = (SELECT MAX(LastUpdated)
                                                     FROM MaterialInventory
                                                     WHERE MaterialID = @mid
                                                     AND WarehouseID = $wid)
                                AND MaterialID = @mid
                                AND WarehouseID = $wid);

                INSERT INTO MaterialInventory (MaterialID, WarehouseID, LastUpdated, Quantity)
                VALUES (@mid, $wid, GETDATE(),
                        CASE WHEN @prevInv IS NULL THEN @delta
                             ELSE (SELECT @delta + Quantity
                                   FROM MaterialInventory
                                   WHERE InventoryID = @prevInv)
                             END);

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
