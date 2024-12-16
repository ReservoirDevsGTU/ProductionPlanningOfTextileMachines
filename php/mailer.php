<?php
include 'headers.php';
include 'connect.php';
require 'mailConfig.php';
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] != 'POST') return;

$input = json_decode(file_get_contents("php://input"), true);
$supplierIDs = implode(',', array_map('intval', $input['supplierIDs']));

$query = "
    SELECT SupplierName, SupplierEmail 
    FROM Suppliers 
    WHERE SupplierID IN ($supplierIDs) AND IsDeleted = 0
";

$stmt = sqlsrv_query($conn, $query);
$suppliers = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $suppliers[] = $row;
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

/*
if (file_exists(FILE_PATH)) {          DEBUG PURPOSES
    echo "File exists!";            
} else {
    echo "File does not exist!";
}
*/

$mail = new PHPMailer(true);

try {

    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    $mail->Subject = EMAIL_SUBJECT;
    $mail->Body = EMAIL_BODY;
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    
    foreach ($suppliers as $supplier) {
        $mail->addAddress($supplier['SupplierEmail'], $supplier['SupplierName']);  
    }
    $mail->addAttachment(FILE_PATH, FILE_NAME);

    $mail->isHTML(true);
    $mail->send();
    echo json_encode(['success' => 'Emails sent successfully']);
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>
