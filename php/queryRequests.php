<?php
include 'query.php';

$requestItemTable = array("primary" => "RequestItemID",
                          "subTableJoinOn" => array("RequestID"),
                          "columns" => array("RequestItemID" => "pri.ItemID",
                                             "RequestID" => "pri.RequestID",
                                             "MaterialID" => "pri.MaterialID",
                                             "RequestedAmount" => "pri.RequestedAmount",
                                             "ProvidedAmount" => "pri.ProvidedAmount",
                                             "ItemStatus" => "pri.ItemStatus",
                                             "MaterialName" => "m.MaterialName",
                                             "Quantity" => "mi.Quantity",
                                             "UnitID" => "ms.UnitID",
                                             "MaterialNo" => "ms.MaterialNo",
                                             "SuckerNo" => "ms.SuckerNo"
                                            ),
                          "name" => "PurchaseRequestItems pri",
                          "joins" => "JOIN Materials m
                                      ON m.MaterialID = pri.MaterialID
                                      JOIN (SELECT le.MaterialID, SUM(le.Quantity) AS Quantity 
                                            FROM (SELECT MaterialID, WarehouseID, Quantity, LastUpdated,
                                                  ROW_NUMBER() OVER (PARTITION BY MaterialID, WarehouseID ORDER BY LastUpdated DESC) AS rn
                                                  FROM MaterialInventory) le
                                            WHERE le.rn = 1
                                            GROUP BY le.MaterialID) mi
                                      ON mi.MaterialID = m.MaterialID
                                      JOIN MaterialSpecs ms
                                      ON ms.MaterialID = pri.MaterialID",
                          "filters" => "pri.IsDeleted = 0
                                        AND ms.IsDeleted = 0",
);

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
