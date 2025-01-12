<?php   
include 'headers.php';
include 'connect.php';
require 'config.php';
require 'vendor/autoload.php'; /*DO NOT FORGET TO MODIFY THIS PART*/

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PHPMailer\PHPMailer\PHPMailer;

function sendEmailsBasedOnInput($input) {
    global $conn; 

    if (empty($input['OfferID']) && empty($input['OrderID']) || !is_array($input['ContactID']) || empty($input['ContactID'])) {
        exit(json_encode(['error' => 'Invalid input']));
    }

    $contactIDs = implode(',', array_map('intval', $input['ContactID']));
    $materials = [];
    $Deadline = null;
    $isOrder;

    // Determine whether to use OfferID or OrderID
    if (!empty($input['OfferID'])) {
        $offerID = intval($input['OfferID']);
        $isOrder = false;
        // Fetch materials for OfferID
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
       

        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $materials[] = $row;
        }
        sqlsrv_free_stmt($stmt);

        $query = "
            SELECT OfferDeadline
            FROM PurchaseOfferDetails
            WHERE OfferID = $offerID AND IsDeleted = 0;
        ";
        $stmt = sqlsrv_query($conn, $query);
      

        if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $Deadline = $row['OfferDeadline'];
        }
        sqlsrv_free_stmt($stmt);
    } 
    else if (!empty($input['OrderID'])) {
        $orderID = intval($input['OrderID']);
        $isOrder = true;

        $query = "
            SELECT 
                p.OrderedAmount,
                p.ProvidedAmount,
                m.MaterialID AS MaterialNo,
                m.MaterialName
            FROM PurchaseOrderItems p
            JOIN Materials m ON p.MaterialID = m.MaterialID
            WHERE p.OrderID = $orderID AND p.IsDeleted = 0;
        ";
        $stmt = sqlsrv_query($conn, $query);
       

        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $materials[] = $row;
        }
        sqlsrv_free_stmt($stmt);

        $query = "
            SELECT OrderDeadline
            FROM PurchaseOrderDetails
            WHERE OrderID = $orderID AND IsDeleted = 0;
        ";
        $stmt = sqlsrv_query($conn, $query);
       
        if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $Deadline = $row['OrderDeadline']; // Assuming 'OrderDeadline' is available for orders as well
        }
        sqlsrv_free_stmt($stmt);
    }

    $query = "
        SELECT ContactName, ContactEmail
        FROM SupplierContactDetails
        WHERE ContactDetailID IN ($contactIDs) AND IsDeleted = 0;
    ";
    $stmt = sqlsrv_query($conn, $query);
    

    $contacts = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $contacts[] = $row;
    }
    sqlsrv_free_stmt($stmt);

    sqlsrv_close($conn);

    $fileContent = generateXlsxFile($materials, $isOrder);

    sendEmails($contacts, $fileContent, $Deadline, $isOrder);
}

function generateXlsxFile($materials, $isOrder = false) {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    //Set Table Data
    if ($isOrder) {
        $sheet->setCellValue('A1', 'Material No')
              ->setCellValue('B1', 'Material Adı')
              ->setCellValue('C1', 'Sipariş Edilen Miktar')  // Ordered Amount
              ->setCellValue('D1', 'Gönderilen Miktar')    // Provided Amount
              ->setCellValue('E1', 'Birim')
              ->setCellValue('F1', 'Birim Fiyatı')
              ->setCellValue('G1', 'Kur');
    } else {
        $sheet->setCellValue('A1', 'Material No')
              ->setCellValue('B1', 'Material Adı')
              ->setCellValue('C1', 'İstenilen Miktar')   // Requested Amount
              ->setCellValue('D1', 'Teklif Miktarı')    // Offered Amount
              ->setCellValue('E1', 'Birim')
              ->setCellValue('F1', 'Birim Fiyatı')
              ->setCellValue('G1', 'Kur');
    }

    // Set material data
    $row = 2; 
    foreach ($materials as $material) {
        $sheet->setCellValue('A' . $row, $material['MaterialNo'] ?? '')
              ->setCellValue('B' . $row, $material['MaterialName']);
        
        if ($isOrder) {
            // For orders
            $sheet->setCellValue('C' . $row, $material['OrderedAmount'] ?? '')
                  ->setCellValue('D' . $row, $material['ProvidedAmount'] ?? '');
        } else {
            // For offers
            $sheet->setCellValue('C' . $row, $material['OfferRequestedAmount'] ?? '')
                  ->setCellValue('D' . $row, $material['OfferedAmount'] ?? '');
        }

        $row++;
    }

    $writer = new Xlsx($spreadsheet);
    ob_start();
    $writer->save('php://output');
    $content = ob_get_contents();
    ob_end_clean();

    return $content;
}


function sendEmails($contacts, $fileContent, $Deadline, $isOrder) {

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        if(!$isOrder){
            $mail->addStringAttachment($fileContent, 'TeklifDetayi.xlsx'); 
        }
        else {
            $mail->addStringAttachment($fileContent, 'SiparisDetayi.xlsx');            
        }
        foreach ($contacts as $contact) {
            $mail->clearAddresses(); // Clear previous 
            $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
            

            $body = "Sayın {$contact['ContactName']},<br><br>";
 
        if  (!$isOrder) {
            $mail->Subject = "PRO-SMH Teklifi";
            $body .= "Prosmh Şirketi olarak, aşağıda yer alan teklif detaylarını ekte sunuyoruz.<br><br>";
            $body .= "Teklif Geçerlilik Tarihi: (GG,AA,YYYY) " . ($Deadline ? $Deadline->format('d.m.Y') : 'Bilinmiyor') . "<br><br>";
            } 

        else {
            $mail->Subject = "PROSMH Siparisi";
            $body .= "Prosmh Şirketi olarak, aşağıda yer alan sipariş detaylarını ekte sunuyoruz.<br><br>";
            $body .= "Sipariş Tarihi: (GG,AA,YYYY) " . ($Deadline ? $Deadline->format('d.m.Y') : 'Bilinmiyor') . "<br><br>";
        }         
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
}
/*Test
$input = json_decode(file_get_contents("php://input"), true);
sendEmailsBasedOnInput($input);
*/
?>
