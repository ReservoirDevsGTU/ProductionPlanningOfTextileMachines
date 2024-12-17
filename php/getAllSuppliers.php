<?php
/*
 * Usage is by calling getAllSuppliers
 * Parameters:
 *   conn => connection object to the database
 *   offset => the number of rows to skip
 *   fetch => the number of rows to fetch
 * Return:
 *   A nested array that includes suppliers' details for the specified range
 *   Every item of that array is a discrete supplier
 */

include 'connect.php';
include 'headers.php';

function getAllSuppliers($conn, $offset, $fetch) {
  # Fetching suppliers with offset and fetch
  $query = "SELECT * FROM Suppliers WHERE IsDeleted = 0
            ORDER BY SupplierID
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
  $params = array($offset, $fetch);
  $stmt = sqlsrv_query($conn, $query, $params);

  if ($stmt === false) {
    die(json_encode(sqlsrv_errors(), true));
  }

  $suppliers = array();
  while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $suppliers[] = $row;
  }

  return $suppliers;
}

# Read input from JSON
$input = json_decode(file_get_contents("php://input"), true);

# Extract offset and fetch from the input
$offset = isset($input['offset']) ? (int)$input['offset'] : 0;   // Default to 0 if not provided
$fetch  = isset($input['fetch']) ? (int)$input['fetch'] : 10;   // Default fetch size is 10 if not provided

$suppliers = getAllSuppliers($conn, $offset, $fetch);

echo json_encode($suppliers);
?>