<?php   
include 'headers.php';
include 'connect.php';
require 'config.php';
require 'vendor/autoload.php'; /*DO NOT FORGET TO MODIFY THIS PART*/

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PHPMailer\PHPMailer\PHPMailer;

$input = json_decode(file_get_contents("php://input"), true);
if (empty($input['OfferID']) || !is_array($input['ContactID']) || empty($input['ContactID'])) {
    exit(json_encode(['error' => 'Invalid input']));
}

$offerID = intval($input['OfferID']);
$contactIDs = implode(',', array_map('intval', $input['ContactID']));

// Fetch materials
$query = "
    SELECT 
        p.OfferRequestedAmount,
        p.OfferedAmount,
        m.MaterialID AS MaterialNo,
        m.MaterialName
    FROM PurchaseOfferItems p
    JOIN Materials m ON p.MaterialID = m.MaterialID
    WHERE p.OfferID = $offerID AND p.IsDeleted = 0;
";
$stmt = sqlsrv_query($conn, $query);
if (!$stmt) {
    throw new Exception(print_r(sqlsrv_errors(), true));
}

$materials = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $materials[] = $row;
}
sqlsrv_free_stmt($stmt);

$query = "
    SELECT ContactName, ContactEmail
    FROM SupplierContactDetails
    WHERE ContactDetailID IN ($contactIDs) AND IsDeleted = 0;
";
$stmt = sqlsrv_query($conn, $query);
if (!$stmt) {
    throw new Exception(print_r(sqlsrv_errors(), true));
}

$contacts = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $contacts[] = $row;
}
sqlsrv_free_stmt($stmt);

$query = "
    SELECT OfferDeadline
    FROM PurchaseOfferDetails
    WHERE OfferID = $offerID AND IsDeleted = 0;
";
$stmt = sqlsrv_query($conn, $query);
if (!$stmt) {
    throw new Exception(print_r(sqlsrv_errors(), true));
}

$offerDeadline = null;
if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $offerDeadline = $row['OfferDeadline'];
}
sqlsrv_free_stmt($stmt);

sqlsrv_close($conn);

// Generate Excel file
function generateXlsxFile($materials) {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // Headers
    $sheet->setCellValue('A1', 'Material No')
          ->setCellValue('B1', 'Material Adı')
          ->setCellValue('C1', 'İstenilen Miktar')
          ->setCellValue('D1', 'Teklif Miktarı')
          ->setCellValue('E1', 'Birim')
          ->setCellValue('F1', 'Birim Fiyatı')
          ->setCellValue('G1', 'Kur');    
    // Set material data
    $row = 2; 
    foreach ($materials as $material) {
        $sheet->setCellValue('A' . $row, $material['MaterialNo'] ?? '')
              ->setCellValue('B' . $row, $material['MaterialName'])
              ->setCellValue('C' . $row, $material['OfferRequestedAmount'])
              ->setCellValue('D' . $row, $material['OfferedAmount']);
        $row++;
    }
    $writer = new Xlsx($spreadsheet);
    ob_start();
    $writer->save('php://output');
    $content = ob_get_contents();
    ob_end_clean();
    return $content;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    $fileContent = generateXlsxFile($materials);
    $mail->addStringAttachment($fileContent, 'TeklifDetayi.xlsx'); 

    foreach ($contacts as $contact) {
        $mail->clearAddresses(); // Clear previous 
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->Subject = EMAIL_SUBJECT;

        $body = "Sayın {$contact['ContactName']},<br><br>";
        $body .= "Prosmh Şirketi olarak, aşağıda yer alan teklif detaylarını ekte sunuyoruz.<br><br>";
        $body .= "Teklif Geçerlilik Tarihi: (GG,AA,YYYY) " . ($offerDeadline ? $offerDeadline->format('d.m.Y') : 'Bilinmiyor') . "<br><br>";
        $body .= "Saygılarımızla,<br>";
        $body .= "PRO-SMH Şirketi";

        $mail->Body = $body;
        $mail->isHTML(true);       
        $mail->addAddress($contact['ContactEmail'], $contact['ContactName']);
        $mail->send();
    }

    echo json_encode(['success' => 'Emails sent successfully']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Email could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
}
?>
