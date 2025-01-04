<?php
include 'connect.php';
include 'headers.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$input = json_decode(file_get_contents("php://input"), true);

if($input) {

    $groupID = $input["OfferGroupID"];
    
    $approvedValues = "";

    foreach($input["Materials"] as $m) {
        $mid = $m["MaterialID"];
        foreach($m["Suppliers"] as $s) {
            $sid = $s["SupplierID"];
            $approvedValues .= ", ($sid, $mid)";
        }
    }

    $approvedValues = substr($approvedValues, 1);

    if(!$approvedValues) $approvedValues = "(-1, -1)";

    $sql =  <<<SQL

            DECLARE @offers TABLE (OfferID INT);
            DECLARE @approved TABLE (SupplierID INT, MaterialID INT);

            INSERT INTO @offers (OfferID)
            SELECT OfferID
            FROM PurchaseOffers po
            WHERE po.OfferGroupID = $groupID
            AND po.OfferStatus = 3
            AND po.IsDeleted = 0;

            INSERT INTO @approved VALUES $approvedValues;

            UPDATE poi
            SET poi.ItemStatus = CASE
                WHEN EXISTS (SELECT 1 FROM @approved
                             WHERE SupplierID = (SELECT pod.SupplierID
                                                 FROM PurchaseOfferDetails pod
                                                 WHERE pod.OfferID = poi.OfferID)
                             AND MaterialID = poi.MaterialID)
                    THEN 1
                ELSE 2 END
            FROM PurchaseOfferItems poi
            WHERE EXISTS (SELECT 1 FROM @offers WHERE OfferID = poi.OfferID)
            AND poi.IsDeleted = 0;

            UPDATE po
            SET po.OfferStatus = CASE
                WHEN NOT EXISTS (SELECT 1 FROM PurchaseOfferItems poi
                                 WHERE poi.OfferID = po.OfferID
                                 AND poi.ItemStatus = 2)
                    THEN 4
                WHEN NOT EXISTS (SELECT 1 FROM PurchaseOfferItems poi
                                 WHERE poi.OfferID = po.OfferID
                                 AND poi.ItemStatus = 1)
                    THEN 5
                ELSE 6 END
            FROM PurchaseOffers po
            WHERE EXISTS (SELECT 1 FROM @offers WHERE OfferID = po.OfferID);

            SQL;

    sqlsrv_begin_transaction($conn);

    $stmt = sqlsrv_query($conn, $sql, array(
        $input["CreatedBy"],
        $input["RequestStatus"],
        $input["RequestedBy"],
        $input["RequestDeadline"],
        $input["RequestDescription"],
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
