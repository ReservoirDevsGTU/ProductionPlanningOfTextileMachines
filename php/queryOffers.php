<?php
include 'headers.php';
include 'connect.php';

if($_SERVER['REQUEST_METHOD'] != 'POST') return;

$sql1 = "WITH Result AS (SELECT
        po.OfferID,
        po.OfferGroupID,
        po.CreationDate,
        pod.OfferDeadline,
        pod.OfferDescription,
        pod.RequestedBy,
        s.SupplierName,
        s.SupplierEmail,
        po.OfferStatus
        FROM PurchaseOffers po
        JOIN PurchaseOfferDetails pod
        ON po.OfferID = pod.OfferID
        JOIN Suppliers s
        ON pod.SupplierID = s.SupplierID
        WHERE po.IsDeleted = 0
        AND pod.IsDeleted = 0";
$sql2 = "SELECT
         poi.ItemID OfferItemID,
         poi.MaterialID,
         poi.RequestedAmount,
         poi.OfferedAmount,
         poi.OfferedPrice,
         poi.ConformationStatus,
         poi.ItemStatus,
         m.MaterialName
         FROM PurchaseOfferItems poi
         JOIN Materials m
         ON poi.MaterialID = m.MaterialID
         WHERE poi.IsDeleted = 0";

$input = json_decode(file_get_contents("php://input"), true);

$data = [];

$offset = "";

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

if($input["filters"]) {
    foreach($input["filters"] as $f) {
        $filteredQuery = $sql1;
        if($f["OfferID"]) {
            $d = implode(',', $f["OfferID"]);
            $filteredQuery = $filteredQuery . " AND po.OfferID IN ($d)";
        }
        if($f["RequestedBy"]) {
            $d = implode(',', $f["RequestedBy"]);
            $filteredQuery = $filteredQuery . " AND pod.RequestedBy IN ($d)";
        }
        if($f["SupplierName"]) {
            $d = implode('\', \'', $f["SupplierName"]);
            $filteredQuery = $filteredQuery . " AND s.SupplierName IN ('$d')";
        }
        $filteredQuery = $filteredQuery . $offset;
        $stmt = sqlsrv_query($conn, $filteredQuery);
        if(!$stmt) {
            die(json_encode(sqlsrv_errors(), true));
        }
        while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $row["OfferDeadline"] = $row["OfferDeadline"]->format("Y-m-d");
            $row["CreationDate"] = $row["CreationDate"]->format("Y-m-d");
            $data[$row["OfferID"]] = $row;
        }
        sqlsrv_free_stmt($stmt);
    }
} 
else {
    $stmt = sqlsrv_query($conn, $sql1 . $offset);
    if(!$stmt) {
        die(json_encode(sqlsrv_errors(), true));
    }
    while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $row["OfferDeadline"] = $row["OfferDeadline"]->format("Y-m-d");
        $row["CreationDate"] = $row["CreationDate"]->format("Y-m-d");
        $data[$row["OfferID"]] = $row;
    }
    sqlsrv_free_stmt($stmt);
}

$dataFinal = [];

foreach($data as $o) {
    $id = $o["OfferID"];
    $query = $sql2 . " AND poi.OfferID = $id";
    $stmt = sqlsrv_query($conn, $query);
    if(!$stmt) {
        die(json_encode(sqlsrv_errors(), true));
    }
    $mData =[];
    while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $mData[$row["MaterialID"]] = $row;
    }
    $mDataFinal = [];
    foreach($mData as $m) {
        $mDataFinal[] = $m;
    }
    $o["Materials"] = $mDataFinal;
    $dataFinal[] = $o;
}

sqlsrv_close($conn);

echo json_encode($dataFinal);
?>
