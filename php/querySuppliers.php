<?php
include "query.php";

$contactDetails = array("primary" => "ContactDetailID",
                        "subTableJoinOn" => array("SupplierID"),
                        "columns" => array("ContactDetailID" => "scd.ContactDetailID",
                                           "SupplierID" => "scd.SupplierID",
                                           "ContactName" => "scd.ContactName",
                                           "ContactSurname" => "scd.ContactSurname",
                                           "ContactTitle" => "scd.ContactTitle",
                                           "ContactPhoneNo" => "scd.ContactPhoneNo",
                                           "ContactEmail" => "scd.ContactEmail",
                                          ),
                        "name" => "SupplierContactDetails scd",
                        "joins" => "",
                        "filters" => "scd.IsDeleted = 0",
                        "subTables" => []
);

$supplierTable = array("primary" => "SupplierID",
                       "columns" => array("SupplierID" => "s.SupplierID",
                                          "SupplierName" => "s.SupplierName",
                                          "SupplierTaxCode" => "s.SupplierTaxCode",
                                          "SupplierTelNo" => "s.SupplierTelNo",
                                          "SupplierEmail" => "s.SupplierEmail",
                                          "SupplierAddress" => "s.SupplierAddress",
                                          "SupplierNotes" => "s.SupplierNotes",
                                          "SupplierStatus" => "s.SupplierStatus",
                                         ),
                       "name" => "Suppliers s",
                       "joins" => "",
                       "filters" => "s.IsDeleted = 0",
                       "subTables" => array("ContactDetails" => $contactDetails),
);

query($supplierTable);
?>
