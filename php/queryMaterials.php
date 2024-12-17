<?php
include 'headers.php';
include 'connect.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$columns = array(
    "MaterialID" => "m.MaterialID",
    "MaterialName" => "m.MaterialName",
    "Quantity" => "mi.Quantity",
    "MaterialNo" => "ms.MaterialNo",
    "SuckerNo" => "ms.SuckerNo",
    "UnitID" => "ms.UnitID",
);

$sqlStart = "WITH Result AS (SELECT";

$columnsSelected = "";

$sqlJoins = "FROM Materials m
             JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
             ON mi_max.MaterialID = m.MaterialID
             JOIN MaterialInventory mi
             ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = m.MaterialID
             JOIN MaterialSpecs ms
             ON m.MaterialID = ms.MaterialID";

$sqlFilters = "WHERE m.IsDeleted = 0
               AND ms.IsDeleted = 0";

$sqlOffset = ") SELECT * FROM Result";

$input = json_decode(file_get_contents("php://input"), true);

$data = [];

if(isset($input["columns"])) {
    foreach($input["columns"] as $colkey) {
        if(isset($columns[$colkey])) {
            $columnsSelected = $columnsSelected . ", " . $columns[$colkey];
        }
    }
}
else {
    foreach($columns as $col) {
        $columnsSelected = $columnsSelected . ", " . $col;
    }
}

$columnsSelected = substr($columnsSelected, 1);

if(isset($input["offset"], $input["fetch"])) {
    $offsetAmt = $input["offset"];
    $fetchAmt = $input["fetch"];
    $offset = "), 
               Count AS (SELECT COUNT(*) MaxRows FROM Result)
               SELECT * FROM Result, Count
               ORDER BY (SELECT NULL)
               OFFSET $offsetAmt ROWS
               FETCH NEXT $fetchAmt ROWS ONLY";
}

if(isset($input["filters"])) {
    foreach($input["filters"] as $f) {
        if($f["MaterialID"]) {
            $d = implode(',', $f["MaterialID"]);
            $sqlFilters = $sqlFilters . " AND m.MaterialID IN ($d)";
        }
        if($f["MaterialNo"]) {
            $d = implode('\', \'', $f["MaterialNo"]);
            $sqlFilters = $sqlFilters . " AND ms.MaterialNo IN ('$d')";
        }
        if($f["MaterialName"]) {
            $d = implode('\', \'', $f["MaterialName"]);
            $sqlFilters = $sqlFilters . " AND m.MaterialName IN ('$d')";
        }
    }
}

if(isset($input["search"]) and strlen($input["search"]["term"]) > 0) {
    $term = $input["search"]["term"];
    $search = "";
    foreach($input["search"]["fields"] as $f) {
        if(isset($columns[$f])) {
            $search .= " OR $columns[$f] LIKE '%$term%'";
        }
    }
    if(strlen($search) > 0) {
        $search = substr($search, 3);
        $sqlFilters .= " AND ($search)";
    }
}

$sql = $sqlStart . " " . $columnsSelected ." " . $sqlJoins ." " . $sqlFilters. " " . $offset;

$stmt = sqlsrv_query($conn, $sql);
if(!$stmt) {
    die(json_encode(sqlsrv_errors(), true));
}
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $data[] = $row;
}
sqlsrv_free_stmt($stmt);

sqlsrv_close($conn);

echo json_encode($data);
?>
