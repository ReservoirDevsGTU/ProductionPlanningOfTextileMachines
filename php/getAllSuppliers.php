<?php
/*
 * Usage is by calling getAllSuppliers
 * Parameters:
 *   conn => connection object to the database
 * Return:
 *   A nested array that includes all suppliers' details
 *   Every item of that array is a discrete supplier
 */
include 'connect.php';
include 'headers.php';

function getAllSuppliers($conn) {
  # Fetching all suppliers from the Suppliers table
  $query = "SELECT * FROM Suppliers WHERE IsDeleted = 0";
  $stmt = sqlsrv_query($conn, $query);

  if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
  }

  $suppliers = array();
  while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    # Fetch additional details for each supplier if needed
    //$supplierDetails = getSupplierDetails($row['SupplierID'], $conn);
    //$suppliers[] = array_merge($row, $supplierDetails);
    $suppliers[] = $row;
  }

  return $suppliers;
}

function getSupplierDetails($supplierID, $conn) {
  # Fetching additional supplier details from SupplierDetails table
  $query = "SELECT * FROM SupplierDetails WHERE SupplierID = ?";
  $stmt = sqlsrv_prepare($conn, $query, array($supplierID));

  if (!sqlsrv_execute($stmt)) {
    die(print_r(sqlsrv_errors(), true));
  }

  $details = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

  if (!is_array($details)) {
    $details = array();
  }

  return $details;
}

$suppliers = getAllSuppliers($conn);
echo json_encode($suppliers);
?>
