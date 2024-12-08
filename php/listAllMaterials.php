<?php
include 'headers.php';
include 'connect.php';

$sql = "SELECT
        Materials.MaterialID,
        Materials.MaterialName,
        MaterialInventory.Quantity,
        MaterialSpecs.MaterialNo,
        MaterialSpecs.SuckerNo,
        MaterialSpecs.UnitID
        FROM Materials
        JOIN MaterialInventory
        ON Materials.MaterialID = MaterialInventory.MaterialID
        JOIN MaterialSpecs
        ON Materials.MaterialID = MaterialSpecs.MaterialID
        WHERE Materials.IsDeleted = 0
        ";
$stmt = sqlsrv_query($conn, $sql);

$data = [];
$dataArr = [];
if ($stmt !== false) {
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[$row["MaterialID"]] = $row;
    }
    foreach($data as $i) {
        $dataArr[] = $i;
    }
    sqlsrv_free_stmt($stmt);
}

sqlsrv_close($conn);

echo json_encode($dataArr);
?>
