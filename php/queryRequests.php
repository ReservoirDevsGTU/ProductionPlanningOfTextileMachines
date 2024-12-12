<?php
include 'headers.php';
include 'connect.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$requestCols =  "pr.RequestID,
                 pr.CreationDate,
                 prd.RequestDeadline,
                 prd.RequestDescription,
                 prd.RequestedBy,
                 prd.ManufacturingUnitID,
                 u.UserName,
                 pr.RequestStatus";

$requestJoins = "JOIN PurchaseRequestDetails prd
                 ON pr.RequestID = prd.RequestID
                 JOIN Users u
                 ON prd.RequestedBy = u.UserID";

$materialCols = "pri.ItemID RequestItemID,
                 pri.MaterialID,
                 pri.RequestedAmount,
                 pri.OrderedAmount,
                 pri.ProvidedAmount,
                 pri.ItemStatus,
                 m.MaterialName,
                 mi.Quantity,
                 ms.UnitID,
                 ms.MaterialNo,
                 ms.SuckerNo";

$materialJoins = "JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
                  ON mi_max.MaterialID = pri.MaterialID
                  JOIN MaterialInventory mi
                  ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = pri.MaterialID
                  JOIN Materials m
                  ON m.MaterialID = pri.MaterialID
                  JOIN MaterialSpecs ms
                  ON ms.MaterialID = pri.MaterialID";

$sql1 = "WITH Result AS (SELECT
         $requestCols
         FROM PurchaseRequests pr
         $requestJoins
         WHERE pr.IsDeleted = 0
         AND prd.IsDeleted = 0
         ";

$sql2 = "SELECT
         $materialCols
         FROM PurchaseRequestItems pri
         $materialJoins
         WHERE pri.IsDeleted = 0
         AND ms.IsDeleted = 0
         ";

$input = json_decode(file_get_contents("php://input"), true);

if($input["expand"]) $sql1 = "WITH Result AS (SELECT
                              $requestCols,
                              $materialCols
                              FROM PurchaseRequests pr
                              $requestJoins
                              JOIN PurchaseRequestItems pri
                              ON pri.RequestID = pr.RequestID
                              $materialJoins
                              WHERE pr.IsDeleted = 0
                              AND prd.IsDeleted = 0
                              AND pri.IsDeleted = 0
                              AND ms.IsDeleted = 0
                              ";

$data = [];

$offset = ") SELECT * FROM Result";

if($input["offset"]) {
    $offsetAmt = $input["offset"][0];
    $fetchAmt = $input["offset"][1];
    $offset = "), 
               Count AS (SELECT COUNT(*) MaxRows FROM Result)
               SELECT * FROM Result, Count
               ORDER BY (SELECT NULL)
               OFFSET $offsetAmt ROWS
               FETCH NEXT $fetchAmt ROWS ONLY";
}

if($input["filters"]) {
    foreach($input["filters"] as $f) {
        $filteredQuery = $sql1;
        if($f["RequestID"]) {
            $d = implode(',', $f["RequestID"]);
            $filteredQuery = $filteredQuery . " AND pr.RequestID IN ($d)";
        }
        if($f["RequestedBy"]) {
            $d = implode(',', $f["RequestedBy"]);
            $filteredQuery = $filteredQuery . " AND prd.RequestedBy IN ($d)";
        }
        if($f["UserName"]) {
            $d = implode('\', \'', $f["UserName"]);
            $filteredQuery = $filteredQuery . " AND u.UserName IN ('$d')";
        }
        $filteredQuery = $filteredQuery . $offset;
        $stmt = sqlsrv_query($conn, $filteredQuery);
        if(!$stmt) {
            die(json_encode(sqlsrv_errors(), true));
        }
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $row["RequestDeadline"] = $row["RequestDeadline"]->format("Y-m-d");
            $row["CreationDate"] = $row["CreationDate"]->format("Y-m-d");
            $data[$row["RequestID"]] = $row;
        }
        sqlsrv_free_stmt($stmt);
    }
}
else {
    $stmt = sqlsrv_query($conn, $sql1 . $offset);
    if(!$stmt) {
        die(json_encode(sqlsrv_errors(), true));
    }
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $row["RequestDeadline"] = $row["RequestDeadline"]->format("Y-m-d");
        $row["CreationDate"] = $row["CreationDate"]->format("Y-m-d");
        $data[$row["RequestID"]] = $row;
    }
    sqlsrv_free_stmt($stmt);
}

$dataFinal = [];

foreach($data as $r) {
    $id = $r["RequestID"];
    if(!$input["expand"]) {
        $query = $sql2 . " AND pri.RequestID = $id";
        $stmt = sqlsrv_query($conn, $query);
        if(!$stmt) {
            die(json_encode(sqlsrv_errors(), true));
        }
        $mData =[];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $mData[] = $row;
        }
        $r["Materials"] = $mData;
    }
    $dataFinal[] = $r;
}

sqlsrv_close($conn);

echo json_encode($dataFinal);
?>
