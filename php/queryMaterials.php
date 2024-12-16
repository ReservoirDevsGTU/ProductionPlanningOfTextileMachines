<?php
include 'headers.php';
include 'connect.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$sql = "WITH Result AS (SELECT
        m.MaterialID,
        m.MaterialName,
        mi.Quantity,
        ms.MaterialNo,
        ms.SuckerNo,
        ms.UnitID
        FROM Materials m
        JOIN MaterialInventory mi
        ON m.MaterialID = mi.MaterialID
        JOIN MaterialSpecs ms
        ON m.MaterialID = ms.MaterialID
        WHERE m.IsDeleted = 0
        AND ms.IsDeleted = 0
        ";

$input = json_decode(file_get_contents("php://input"), true);

$data = [];

$offset = ") SELECT * FROM Result";

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
        $filteredQuery = $sql;
        if($f["MaterialID"]) {
            $d = implode(',', $f["MaterialID"]);
            $filteredQuery = $filteredQuery . " AND m.MaterialID IN ($d)";
        }
        if($f["MaterialNo"]) {
            $d = implode('\', \'', $f["MaterialNo"]);
            $filteredQuery = $filteredQuery . " AND ms.MaterialNo IN ('$d')";
        }
        if($f["MaterialName"]) {
            $d = implode('\', \'', $f["MaterialName"]);
            $filteredQuery = $filteredQuery . " AND m.MaterialName IN ('$d')";
        }
        $stmt = sqlsrv_query($conn, $filteredQuery . $offset);
        if(!$stmt) {
            die(json_encode(sqlsrv_errors(), true));
        }
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data[$row["MaterialID"]] = $row;
        }
        sqlsrv_free_stmt($stmt);
    }
}
else {
    $stmt = sqlsrv_query($conn, $sql . $offset);
    if(!$stmt) {
        die(json_encode(sqlsrv_errors(), true));
    }
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[$row["MaterialID"]] = $row;
    }
    sqlsrv_free_stmt($stmt);
}

$dataFinal = [];

foreach($data as $m) {
    $dataFinal[] = $m;
}

sqlsrv_close($conn);

echo json_encode($dataFinal);
?>
