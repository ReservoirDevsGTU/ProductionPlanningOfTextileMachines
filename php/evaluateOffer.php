<?php
include 'connect.php';
include 'headers.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$input = json_decode(file_get_contents("php://input"), true);

if($input) {
    $groupID = $input["OfferGroupID"];
    $stmt = sqlsrv_query($conn, "SELECT po.OfferID, pod.SupplierID
                                 FROM PurchaseOffers po
                                 JOIN PurchaseOfferDetails pod
                                 ON pod.OfferID = po.OfferID
                                 WHERE po.OfferGroupID = $groupID
                                       AND po.IsDeleted = 0
                                       AND pod.IsDeleted = 0");
    if($stmt) {
        $offers = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $offers[] = $row;
        }
        sqlsrv_free_stmt($stmt);
        $conditions = "";
        $offerIDs = "";
        foreach($offers as $o) {
            $offerIDs .= ", " . $o["OfferID"];
            $approvedMaterials = "";
            foreach($input["Materials"] as $m) {
                foreach($m["Suppliers"] as $s) {
                    if($s["SupplierID"] == $o["SupplierID"]) {
                        $approvedMaterials .= ", " . $m["MaterialID"];
                    }
                }
            }
            $approvedMaterials = substr($approvedMaterials, 1);
            if(strlen($approvedMaterials) < 1) continue;
            $conditions .= "OR (OfferID = " . $o["OfferID"] . " AND MaterialID IN ($approvedMaterials))";
        }
        $conditions = substr($conditions, 2);
        $offerIDs = "(" . substr($offerIDs, 1) . ")";
        if(strlen($conditions) == 0) $conditions = "ItemID = -1";
        $sql = "UPDATE PurchaseOfferItems
                SET ItemStatus = 1
                WHERE $conditions AND IsDeleted = 0;
                UPDATE PurchaseOfferItems
                SET ItemStatus = 2
                WHERE OfferID IN $offerIDs
                      AND ItemStatus != 1
                      AND IsDeleted = 0;
                UPDATE po
                SET OfferStatus = CASE
                    WHEN 2 NOT IN (SELECT ItemStatus
                                   FROM PurchaseOfferItems poi
                                   WHERE poi.OfferID = po.OfferID
                                         AND poi.IsDeleted = 0)
                         THEN 2
                    WHEN 1 NOT IN (SELECT ItemStatus
                                   FROM PurchaseOfferItems poi
                                   WHERE poi.OfferID = po.OfferID
                                         AND poi.IsDeleted = 0)
                         THEN 3
                    ELSE 4 END
                FROM PurchaseOffers po
                WHERE OfferID IN $offerIDs
                      AND IsDeleted = 0;";
        $stmt = sqlsrv_query($conn, $sql);
        if(!$stmt) {
            die(json_encode(sqlsrv_errors(), true));
        }
    }
    else {
        die(json_encode(sqlsrv_errors(), true));
    }
}

sqlsrv_close($conn);
?>
