<?php
include "query.php";

$materialTable = array("primary" => "MaterialID",
                       "columns" => array("MaterialID" => "m.MaterialID",
                                          "MaterialName" => "m.MaterialName",
                                          "Quantity" => "mi.Quantity",
                                          "MaterialNo" => "ms.MaterialNo",
                                          "SuckerNo" => "ms.SuckerNo",
                                          "UnitID" => "ms.UnitID",
                                         ),
                       "name" => "Materials m",
                       "joins" => "JOIN (SELECT le.MaterialID, SUM(le.Quantity) AS Quantity 
                                         FROM (SELECT MaterialID, WarehouseID, Quantity, LastUpdated,
                                               ROW_NUMBER() OVER (PARTITION BY MaterialID, WarehouseID ORDER BY LastUpdated DESC) AS rn
                                               FROM MaterialInventory) le
                                         WHERE le.rn = 1
                                         GROUP BY le.MaterialID) mi
                                   ON mi.MaterialID = m.MaterialID
                                   JOIN MaterialSpecs ms
                                   ON m.MaterialID = ms.MaterialID",
                       "filters" => "m.IsDeleted = 0 AND ms.IsDeleted = 0",
                       "subTables" => [],
);

query($materialTable);
?>
