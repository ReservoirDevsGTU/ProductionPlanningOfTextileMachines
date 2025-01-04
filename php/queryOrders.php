<?php
include "query.php";

$requestTable = array("primary" => "RequestID",
                      "subTableJoinOn" => array("OfferItemID"),
                      "columns" => array("RequestID" => "pr.RequestID",
                                         "CreationDate" => "pr.CreationDate",
                                         "RequestDeadline" => "prd.RequestDeadline",
                                         "RequestDescription" => "prd.RequestDescription",
                                         "RequestedBy" => "prd.RequestedBy",
                                         "ManufacturingUnitID" => "prd.ManufacturingUnitID",
                                         "UserName" => "u.UserName",
                                         "RequestStatus" => "pr.RequestStatus",
                                         "OfferItemID" => "poi.RequestItemID",
                                         "RequestedAmount" => "pri.RequestedAmount"
                                        ),
                      "name" => "(SELECT ItemID OfferItemID, RequestItemID FROM PurchaseOfferItems) poi",
                      "joins" => "JOIN PurchaseRequestItems pri
                                  ON pri.ItemID = poi.RequestItemID
                                  JOIN PurchaseRequests pr
                                  ON pr.RequestID = pri.RequestID
                                  JOIN PurchaseRequestDetails prd
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

$orderItemTable = array("primary" => "OrderItemID",
                        "subTableJoinOn" => array("OrderID"),
                        "columns" => array("OrderItemID" => "poi.ItemID",
                                           "OrderID" => "poi.OrderID",
                                           "OfferItemID" => "poi.OfferItemID",
                                           "MaterialID" => "poi.MaterialID",
                                           "OrderedAmount" => "poi.OrderedAmount",
                                           "ProvidedAmount" => "poi.ProvidedAmount",
                                           "UnitPrice" => "poi.UnitPrice",
                                           "ItemStatus" => "poi.ItemStatus",
                                           "MaterialName" => "m.MaterialName",
                                           "Quantity" => "mi.Quantity",
                                           "UnitID" => "ms.UnitID",
                                           "MaterialNo" => "ms.MaterialNo",
                                           "SuckerNo" => "ms.SuckerNo"
                                          ),
                        "name" => "PurchaseOrderItems poi",
                        "joins" => "JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
                                    ON mi_max.MaterialID = poi.MaterialID
                                    JOIN MaterialInventory mi
                                    ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = poi.MaterialID
                                    JOIN Materials m
                                    ON m.MaterialID = poi.MaterialID
                                    JOIN MaterialSpecs ms
                                    ON ms.MaterialID = poi.MaterialID",
                        "filters" => "poi.IsDeleted = 0
                                      AND ms.IsDeleted = 0",
                        "subTables" => array("Requests" => $requestTable)
);

$orderTable = array("primary" => "OrderID",
                    "columns" => array("OrderID" => "po.OrderID",
                                       "CreatedBy" => "po.CreatedBy",
                                       "CreationDate" => "po.CreationDate",
                                       "OrderStatus" => "po.OrderStatus",
                                       "CreatorName" => "u.UserName",
                                       "OrderDate" => "pod.OrderDate",
                                       "ShippingDate" => "pod.ShippingDate",
                                       "OrderDeadline" => "pod.OrderDeadline",
                                       "OrderNotes" => "pod.OrderNotes",
                                       "SupplierID" => "pod.SupplierID",
                                       "SupplierName" => "s.SupplierName",
                                       "DetailStatus" => "pod.DetailStatus",
                                       "DetailID" => "pod.DetailID",
                                      ),
                    "name" => "PurchaseOrders po",
                    "joins" => "JOIN Users u ON u.UserID = po.CreatedBy
                                JOIN PurchaseOrderDetails pod ON pod.OrderID = po.OrderID
                                JOIN Suppliers s ON s.SupplierID = pod.SupplierID",
                    "filters" => "po.IsDeleted = 0",
                    "subTables" => array("Materials" => $orderItemTable),
                    "postProcess" => array("CreationDate" => "dateToText",
                                           "ShippingDate" => "dateToText",
                                           "OrderDate" => "dateToText",
                                           "OrderDeadline" => "dateToText"
                                          ),
);

query($orderTable);
?>
