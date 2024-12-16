<?php
// SMTP configuration
define('SMTP_HOST', 'smtp.gmail.com'); // SMTP server
define('SMTP_PORT', 587);               // SMTP port 587, 25, 465, or 2525. 587 is standard.
// Sender 
define('SMTP_USERNAME', ' batuhana@gmail.com'); // Email username
define('SMTP_PASSWORD', '16 digit app code required for gmail');// Email password
define('SMTP_FROM_EMAIL', 'sender@prosmh.com'); // Sender email
define('SMTP_FROM_NAME', 'Prosmh');                         // Sender name
// Attachment file path
define('FILE_PATH', 'C:\\Users\\90542\\Desktop\\C++\\file.txt'); // Default attachment path
define('FILE_NAME', 'file.txt'); // Default file name
// Email content configuration
define('EMAIL_SUBJECT', 'SUBJECT:OFFER'); // Default subject for emails
define('EMAIL_BODY', 'BODY Dear X,...'); // Default email body content
?>
