<?php
/*
 * Usage is by calling getAllSuppliers
 * Parameters:
 *   conn => connection object to the database
 *   page => the page number (1-based)
 *   pageSize => the number of items per page
 * Return:
 *   A nested array that includes suppliers' details for the specified page
 *   Every item of that array is a discrete supplier
 */
include 'connect.php';
include 'headers.php';

function getAllSuppliers($conn, $page, $pageSize) {
  # Calculate offset based on the current page and page size
  $offset = ($page - 1) * $pageSize;

  # Fetching suppliers with paging
  $query = "SELECT * FROM Suppliers WHERE IsDeleted = 0 
            ORDER BY SupplierID 
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
  $params = array($offset, $pageSize);
  $stmt = sqlsrv_query($conn, $query, $params);

  if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
  }

  $suppliers = array();
  while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $suppliers[] = $row;
  }

  return $suppliers;
}

# Example usage: Fetching page 1 with 10 items per page
$page = isset($_GET['page']) ? intval($_GET['page']) : 1; // Default to page 1
$pageSize = isset($_GET['pageSize']) ? intval($_GET['pageSize']) : 10; // Default page size 10

$suppliers = getAllSuppliers($conn, $page, $pageSize);
echo json_encode($suppliers);
?>