<?php
include 'connect.php';
include 'headers.php';

$input = json_decode(file_get_contents("php://input"), true);

$materialIDs = $input["MaterialIDs"];

if($input) {
    $placeholders = implode(',', array_fill(0, count($materialIDs), '?'));

    $sql = "SELECT
    m.MaterialID,
    m.MaterialName,
    i.Quantity,
    s.UnitID
    FROM Materials m
    JOIN MaterialInventory i ON m.MaterialID = i.MaterialID
    JOIN MaterialSpecs s ON m.MaterialID = s.MaterialID
    WHERE m.MaterialID IN ($placeholders) AND m.IsDeleted = 0";

    $params = $materialIDs; 
    $stmt = sqlsrv_query($conn, $sql, $params);

    $data = [];
    $dataArr = [];
    if ($stmt) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data[$row["MaterialID"]] = array(
                "MaterialID" => $row["MaterialID"],
                "MaterialName" => $row["MaterialName"],
                "Quantity" => $row["Quantity"],
                "UnitID" => $row["UnitID"]
            );
        }
        foreach($data as $i) {
            $dataArr[] = $i;
        }
        sqlsrv_free_stmt($stmt);
    }

    echo json_encode($dataArr);

    sqlsrv_close($conn);
}
?>
