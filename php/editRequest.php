<?php
/*
 * This script updates the RequestDeadline in the PurchaseRequests table 
 * and the RequestDescription in the PurchaseRequestInfos table for a 
 * given purchase request.
 * 
 * Usage: Call this script by passing 'RequestID', 'RequestDeadline', and 
 * 'RequestDescription' as POST parameters.
 * 
 * Parameters:
 *   RequestID => The ID of the purchase request to update.
 *   RequestDeadline => The new deadline for the purchase request.
 *   RequestDescription => The new description for the purchase request.
 *   conn => The connection object to the database (from connect.php).
 * 
 * Process:
 *   1. Begins a transaction.
 *   2. Updates the RequestDeadline in PurchaseRequests.
 *   3. Updates the RequestDescription in PurchaseRequestInfos.
 *   4. Commits the transaction if successful, or rolls back on error.
 * 
 * Return:
 *   JSON response indicating success or an error message.
 */

# Set the content type for JSON output
header('Content-Type: application/json');

# Allow cross-origin requests (uncomment if needed)
// header('Access-Control-Allow-Origin: *');

# Include the database connection file
include 'connect.php';

#  debugging purposes
// file_put_contents('request_log.txt', print_r($_POST, true), FILE_APPEND);

# Retrieve the 'RequestID', 'RequestDeadline', and 'RequestDescription' from the POST request
$request_id = intval($_POST['RequestID']); 
$request_deadline = $_POST['RequestDeadline'];
$request_description = $_POST['RequestDescription'];

if (sqlsrv_begin_transaction($conn) === false) {
    echo json_encode(["error" => "Could not begin transaction: " . print_r(sqlsrv_errors(), true)]);
    exit;
}

# Update the PurchaseRequests table to set the new RequestDeadline
$sql_update_deadline = "UPDATE PurchaseRequests SET RequestDeadline = ? WHERE RequestID = ?";
$stmt_deadline = sqlsrv_prepare($conn, $sql_update_deadline, array($request_deadline, $request_id));

if ($stmt_deadline === false || sqlsrv_execute($stmt_deadline) === false) {
    echo json_encode(["error" => "Error updating RequestDeadline: " . print_r(sqlsrv_errors(), true)]);
    sqlsrv_rollback($conn);  # Rollback the transaction
    exit;
}

# Update the PurchaseRequestInfos table to set the new RequestDescription
$sql_update_description = "UPDATE PurchaseRequestInfos SET RequestDescription = ? WHERE RequestID = ?";
$stmt_description = sqlsrv_prepare($conn, $sql_update_description, array($request_description, $request_id));

if ($stmt_description === false || sqlsrv_execute($stmt_description) === false) {
    echo json_encode(["error" => "Error updating RequestDescription: " . print_r(sqlsrv_errors(), true)]);
    sqlsrv_rollback($conn);  # Rollback the transaction
    exit;
}

if (sqlsrv_commit($conn) === false) {
    sqlsrv_rollback($conn);  # Rollback the transaction on failure
    echo json_encode(["error" => "Transaction failed during commit: " . print_r(sqlsrv_errors(), true)]);
    exit;
}

echo json_encode(["success" => "Request updated successfully."]);

sqlsrv_free_stmt($stmt_deadline);
sqlsrv_free_stmt($stmt_description);

sqlsrv_close($conn);
?>
