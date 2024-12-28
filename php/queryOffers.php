<?php
include "query.php";

$offerItemTable = array("primary" => "OfferItemID",
                        "subTableJoinOn" => "poi.OfferID",
                        "columns" => array("OfferItemID" => "poi.ItemID",
                                           "OfferID" => "poi.OfferID",
                                           "ConformationStatus" => "poi.ConformationStatus",
                                           "RequestItemID" => "poi.RequestItemID",
                                           "RequestID" => "pri.RequestID",
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
);

function dateToText($date) {
    return $date->format("Y-m-d");
}

$offerDetailTable = array("primary" => "DetailID",
                          "subTableJoinOn" => "pod.OfferID",
                          "columns" => array("DetailID" => "pod.DetailID",
                                             "OfferID" => "pod.OfferID",
                                             "OfferDate" => "pod.OfferDate",
                                             "OfferDeadline" => "pod.OfferDeadline",
                                             "RequestedBy" => "u1.UserID",
                                             "RequesterName" => "u1.UserName",
                                             "OfferDescription" => "pod.OfferDescription",
                                             "SupplierID" => "pod.SupplierID",
                                             "SupplierName" => "s.SupplierName",
                                             "DetailStatus" => "pod.DetailStatus",
                                            ),
                          "name" => "PurchaseOfferDetails pod",
                          "joins" => "JOIN Users u1 ON u1.UserID = pod.RequestedBy
                                      JOIN Suppliers s ON s.SupplierID = pod.SupplierID",
                          "filters" => "pod.IsDeleted = 0",
                          "postProcess" => array("OfferDate" => "dateToText",
                                                 "OfferDeadline" => "dateToText"
                                                ),
);

$offerTable = array("primary" => "OfferID",
                    "columns" => array("OfferID" => "po.OfferID",
                                       "OfferGroupID" => "po.OfferGroupID",
                                       "CreatedBy" => "po.CreatedBy",
                                       "CreatorName" => "u.UserName",
                                       "CreationDate" => "po.CreationDate",
                                       "OfferStatus" => "po.OfferStatus",
                                      ),
                    "name" => "PurchaseOffers po",
                    "joins" => "JOIN Users u ON u.UserID = po.CreatedBy",
                    "filters" => "po.IsDeleted = 0",
                    "subTables" => array("Materials" => $offerItemTable,
                                         "Details" => $offerDetailTable
                                        ),
                    "postProcess" => array("CreationDate" => "dateToText"),
);

query($offerTable);
?>
