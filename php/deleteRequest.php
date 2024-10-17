<?php
/*
 * Marks a purchase request and all related details as deleted.
 * Usage: Call this script by passing a 'request_id' as a GET parameter.
 * Parameters:
 *   request_id => The ID of the purchase request to be marked as deleted.
 *   conn => The connection object to the database.
 * Process:
 *   Marks the related entries in PurchaseRequests, PurchaseRequestInfos, and PurchaseRequestDetails as deleted by setting IsDeleted = 1.
 * Return:
 *   JSON response indicating success or error.
 */

header('Content-Type: application/json');
# Allow cross-origin requests
//header('Access-Control-Allow-Origin: *'); 

include 'connect.php';

# Check if 'request_id' is provided in the GET parameters
if (isset($_GET['request_id'])) {
    # Convert 'request_id' to an integer for safety
    $requestId = intval($_GET['request_id']);
    sqlsrv_begin_transaction($conn);

    // Mark the PurchaseRequests record as deleted by setting IsDeleted = 1
    $sql = "UPDATE PurchaseRequests SET IsDeleted = 1 WHERE RequestID = ?";
    $params = array($requestId);
    sqlsrv_query($conn, $sql, $params); // No error handling here

    // Mark the related record in PurchaseRequestInfos as deleted
    $sql = "UPDATE PurchaseRequestInfos SET IsDeleted = 1 WHERE RequestID = ?";
    sqlsrv_query($conn, $sql, $params); // No error handling here

    // Mark the related record in PurchaseRequestDetails as deleted
    $sql = "UPDATE PurchaseRequestDetails SET IsDeleted = 1 WHERE RequestID = ?";
    sqlsrv_query($conn, $sql, $params); // No error handling here

    sqlsrv_commit($conn);

    echo json_encode(array("status" => "success", "message" => "Request ID $requestId has been marked as deleted in all related tables."));
    
} else {
    // If 'request_id' is not provided, return an error message in JSON format
    echo json_encode(array("status" => "error", "message" => "Request ID not provided."));
}

sqlsrv_close($conn);
?>
