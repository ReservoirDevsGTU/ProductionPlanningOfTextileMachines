<?php
include "query.php";

$requestTable = array("primary" => "RequestID",
                      "subTableJoinOn" => array("RequestID"),
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
);

$offerItemTable = array("primary" => "OfferItemID",
                        "subTableJoinOn" => array("OfferGroupID", "EvaluatedBy", "OfferStatus"),
                        "columns" => array("OfferItemID" => "poi.ItemID",
                                           "OfferID" => "poi.OfferID",
                                           "OfferStatus" => "po.OfferStatus",
                                           "OfferGroupID" => "po.OfferGroupID",
                                           "EvaluatedBy" => "pod.EvaluatedBy",
                                           "RequestItemID" => "poi.RequestItemID",
                                           "RequestID" => "pri.RequestID",
                                           "RequestedAmount" => "pri.RequestedAmount",
                                           "MaterialID" => "poi.MaterialID",
                                           "OfferRequestedAmount" => "poi.OfferRequestedAmount",
                                           "OfferedAmount" => "poi.OfferedAmount",
                                           "OfferedPrice" => "poi.OfferedPrice",
                                           "ItemStatus" => "poi.ItemStatus",
                                           "MaterialName" => "m.MaterialName",
                                           "Quantity" => "mi.Quantity",
                                           "UnitID" => "ms.UnitID",
                                           "MaterialNo" => "ms.MaterialNo",
                                           "SuckerNo" => "ms.SuckerNo"
                                          ),
                        "name" => "PurchaseOfferItems poi",
                        "joins" => "JOIN PurchaseOfferDetails pod
                                    ON pod.OfferID = poi.OfferID
                                    JOIN Materials m
                                    ON m.MaterialID = poi.MaterialID
                                    JOIN (SELECT le.MaterialID, SUM(le.Quantity) AS Quantity 
                                          FROM (SELECT MaterialID, WarehouseID, Quantity, LastUpdated,
                                                ROW_NUMBER() OVER (PARTITION BY MaterialID, WarehouseID ORDER BY LastUpdated DESC) AS rn
                                                FROM MaterialInventory) le
                                          WHERE le.rn = 1
                                          GROUP BY le.MaterialID) mi
                                    ON mi.MaterialID = m.MaterialID
                                    JOIN MaterialSpecs ms
                                    ON ms.MaterialID = poi.MaterialID
                                    JOIN PurchaseOffers po
                                    ON po.OfferID = poi.OfferID
                                    LEFT JOIN PurchaseRequestItems pri
                                    ON pri.ItemID = poi.RequestItemID",
                        "filters" => "poi.IsDeleted = 0
                                      AND ms.IsDeleted = 0",
                        "subTables" => array("Requests" => $requestTable)
);

$offerGroupTable = array("primary" => "OfferGroupID",
                         "columns" => array("OfferGroupID" => "pog.OfferGroupID",
                                            "EvaluatedBy" => "pog.EvaluatedBy",
                                            "EvaluatorName" => "pog.EvaluatorName",
                                            "OfferStatus" => "pog.OfferStatus"
                                           ),
                         "name" => "(SELECT DISTINCT
                                     po.OfferGroupID,
                                     pod.EvaluatedBy,
                                     u.UserName EvaluatorName,
                                     po.OfferStatus
                                     FROM PurchaseOffers po
                                     JOIN PurchaseOfferDetails pod
                                     ON pod.OfferID = po.OfferID
                                     LEFT JOIN Users u
                                     ON pod.EvaluatedBy = u.UserID
                                     WHERE po.IsDeleted = 0) pog",
                         "joins" => "",
                         "filters" => "1 = 1",
                         "subTables" => array("Materials" => $offerItemTable)
                        );

query($offerGroupTable);
?>
