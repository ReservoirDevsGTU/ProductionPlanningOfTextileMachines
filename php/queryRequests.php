<?php
include 'query.php';

$requestItemTable = array("primary" => "RequestItemID",
                          "subTableJoinOn" => "pri.RequestID",
                          "columns" => array("RequestItemID" => "pri.ItemID",
                                             "RequestID" => "pri.RequestID",
                                             "MaterialID" => "pri.MaterialID",
                                             "RequestedAmount" => "pri.RequestedAmount",
                                             "OrderedAmount" => "pri.OrderedAmount",
                                             "ProvidedAmount" => "pri.ProvidedAmount",
                                             "ItemStatus" => "pri.ItemStatus",
                                             "MaterialName" => "m.MaterialName",
                                             "Quantity" => "mi.Quantity",
                                             "UnitID" => "ms.UnitID",
                                             "MaterialNo" => "ms.MaterialNo",
                                             "SuckerNo" => "ms.SuckerNo"
                                            ),
                          "name" => "PurchaseRequestItems pri",
                          "joins" => "JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
                                      ON mi_max.MaterialID = pri.MaterialID
                                      JOIN MaterialInventory mi
                                      ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = pri.MaterialID
                                      JOIN Materials m
                                      ON m.MaterialID = pri.MaterialID
                                      JOIN MaterialSpecs ms
                                      ON ms.MaterialID = pri.MaterialID",
                          "filters" => "pri.IsDeleted = 0
                                        AND ms.IsDeleted = 0",
);

function dateToText($date) {
    return $date->format("Y-m-d");
}

$requestTable = array("primary" => "RequestID",
                      "columns" => array("RequestID" => "pr.RequestID",
                                         "CreationDate" => "pr.CreationDate",
                                         "RequestDeadline" => "prd.RequestDeadline",
                                         "RequestDescription" => "prd.RequestDescription",
                                         "RequestedBy" => "prd.RequestedBy",
                                         "ManufacturingUnitID" => "prd.ManufacturingUnitID",
                                         "UserName" => "u.UserName",
                                         "RequestStatus" => "pr.RequestStatus"
                                        ),
                      "name" => "PurchaseRequests pr",
                      "joins" => "JOIN PurchaseRequestDetails prd
                                  ON pr.RequestID = prd.RequestID
                                  JOIN Users u
                                  ON prd.RequestedBy = u.UserID",
                      "filters" => "pr.IsDeleted = 0
                                    AND prd.IsDeleted = 0",
                      "postProcess" => array("CreationDate" => "dateToText",
                                             "RequestDeadline" => "dateToText",
                                            ),
                      "subTables" => array("Materials" => $requestItemTable),
);

query($requestTable);
?>
