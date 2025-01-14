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
                                           "SuckerNo" => "ms.SuckerNo",
                                           "RequestID" => "pri.RequestID",
                                           "RequestedAmount" => "pri.RequestedAmount",
                                          ),
                        "name" => "PurchaseOrderItems poi",
                        "joins" => "JOIN Materials m
                                    ON m.MaterialID = poi.MaterialID
                                    JOIN (SELECT le.MaterialID, SUM(le.Quantity) AS Quantity 
                                          FROM (SELECT MaterialID, WarehouseID, Quantity, LastUpdated,
                                                ROW_NUMBER() OVER (PARTITION BY MaterialID, WarehouseID ORDER BY LastUpdated DESC) AS rn
                                                FROM MaterialInventory) le
                                          WHERE le.rn = 1
                                          GROUP BY le.MaterialID) mi
                                    ON mi.MaterialID = m.MaterialID
                                    LEFT JOIN PurchaseRequestItems pri
                                    ON (poi.RequestItemID IS NOT NULL AND pri.ItemID = poi.RequestItemID)
                                    OR (poi.OfferItemID IS NOT NULL AND EXISTS (SELECT 1 FROM PurchaseOfferItems poi1 WHERE poi1.ItemID = poi.OfferItemID AND poi1.RequestItemID = pri.ItemID))
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
                    "joins" => "LEFT JOIN Users u ON u.UserID = po.CreatedBy
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
