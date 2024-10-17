<?php
/*
 * Usage is by calling getPurchaseRequestDetails
 * Parameters:
 *   purchaseRequestID => id of request
 *   conn => connection object to database
 * Return:
 *   A nested array that includes all materials' details
 *   Every item of that array is a discrete materail
 */

# Comments with double slashes are for testing purposes

//include 'connect.php';

function getPurchaseRequestDetails($purchaseRequestID, $conn) {
  $query = "SELECT * FROM PurchaseRequestDetails WHERE RequestID = ?";
  $stmt = sqlsrv_prepare($conn, $query, array($purchaseRequestID));

  if (!sqlsrv_execute($stmt)) {
    die(print_r(sqlsrv_errors(), true));
  }

  $items = array();
  while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $items[] = $row;
  }

  $data = array();
  foreach ($items as $i) {
    $m = getMaterialDetails($i['MaterialID'], $conn);
    $data[] = $m;
  }

  return $data;
}

function getMaterialDetails($materialID, $conn) {
  # Fetching Materials table
  $query = "SELECT * FROM Materials WHERE MaterialID = ?";
  $stmt = sqlsrv_prepare($conn, $query, array($materialID));

  if (!sqlsrv_execute($stmt)) {
    die(print_r(sqlsrv_errors(), true));
  }

  $material = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

  # Fetching MaterialSpecs table
  $query = "SELECT * FROM MaterialSpecs WHERE MaterialID = ?";
  $stmt = sqlsrv_prepare($conn, $query, array($materialID));

  if (!sqlsrv_execute($stmt)) {
    die(print_r(sqlsrv_errors(), true));
  }

  $materialSpec = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

  if (!is_array($materialSpec)) {
    $materialSpec = array();
  }

  $material = array_merge($material, $materialSpec);

  # Fetching MaterialInventory table
  $query = "SELECT * FROM MaterialInventory WHERE MaterialID = ?";
  $stmt = sqlsrv_prepare($conn, $query, array($materialID));

  if (!sqlsrv_execute($stmt)) {
    die(print_r(sqlsrv_errors(), true));
  }

  $materialInventory= sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

  if (!is_array($materialInventory)) {
    $materialInventory= array();
  }

  $material = array_merge($material, $materialInventory);

  return $material;
}

//$items = getPurchaseRequestDetails(1, $conn);

//print_r($items);
?>
