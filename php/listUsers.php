<?php
include 'headers.php';
include 'connect.php';

$sql = "SELECT UserID, UserName FROM Users";
$stmt = sqlsrv_query($conn, $sql);

$data = [];
if ($stmt !== false) {
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[] = array(
            "UserID" => $row["UserID"],
            "UserName" => $row["UserName"],
            );
    }
    sqlsrv_free_stmt($stmt);
}

sqlsrv_close($conn);

echo json_encode($data);
?>
