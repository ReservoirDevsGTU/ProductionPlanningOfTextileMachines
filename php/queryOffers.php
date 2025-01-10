<?php
include "query.php";

$requestTable = array("primary" => "RequestID",
                      "subTableJoinOn" => array("OfferID"),
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
                      "subTables" => [],
);

$offerItemTable = array("primary" => "OfferItemID",
                        "subTableJoinOn" => array("OfferID"),
                        "columns" => array("OfferItemID" => "poi.ItemID",
                                           "OfferID" => "poi.OfferID",
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
                        "joins" => "JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
                                    ON mi_max.MaterialID = poi.MaterialID
                                    JOIN MaterialInventory mi
                                    ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = poi.MaterialID
                                    JOIN Materials m
                                    ON m.MaterialID = poi.MaterialID
                                    JOIN MaterialSpecs ms
                                    ON ms.MaterialID = poi.MaterialID
                                    LEFT JOIN PurchaseRequestItems pri
                                    ON pri.ItemID = poi.RequestItemID",
                        "filters" => "poi.IsDeleted = 0
                                      AND ms.IsDeleted = 0",
                        "subTables" => array("Requests" => $requestTable)
);

$offerTable = array("primary" => "OfferID",
                    "columns" => array("OfferID" => "po.OfferID",
                                       "OfferGroupID" => "po.OfferGroupID",
                                       "CreatedBy" => "po.CreatedBy",
                                       "CreatorName" => "u.UserName",
                                       "CreationDate" => "po.CreationDate",
                                       "OfferStatus" => "po.OfferStatus",
                                       "OfferDate" => "pod.OfferDate",
                                       "OfferDeadline" => "pod.OfferDeadline",
                                       "RequestedBy" => "u1.UserID",
                                       "RequesterName" => "u1.UserName",
                                       "OfferDescription" => "pod.OfferDescription",
                                       "SupplierID" => "pod.SupplierID",
                                       "SupplierName" => "s.SupplierName",
                                       "DetailStatus" => "pod.DetailStatus",
                                       "DetailID" => "pod.DetailID",
                                      ),
                    "name" => "PurchaseOffers po",
                    "joins" => "JOIN Users u ON u.UserID = po.CreatedBy
                                JOIN PurchaseOfferDetails pod ON pod.OfferID = po.OfferID
                                JOIN Users u1 ON u1.UserID = pod.RequestedBy
                                JOIN Suppliers s ON s.SupplierID = pod.SupplierID",
                    "filters" => "po.IsDeleted = 0",
                    "subTables" => array("Materials" => $offerItemTable),
                    "postProcess" => array("CreationDate" => "dateToText",
                                           "OfferDate" => "dateToText",
                                           "OfferDeadline" => "dateToText"
                                          ),
);

query($offerTable);
?>
