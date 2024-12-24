<?php
include "query.php";

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
                       "subTables" => [],
);

query($supplierTable);
?>
