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
                       "joins" => "JOIN (SELECT MaterialID, MAX(LastUpdated) AS LastUpdated FROM MaterialInventory GROUP BY MaterialID) mi_max
                                   ON mi_max.MaterialID = m.MaterialID
                                   JOIN MaterialInventory mi
                                   ON mi.LastUpdated = mi_max.LastUpdated AND mi.MaterialID = m.MaterialID
                                   JOIN MaterialSpecs ms
                                   ON m.MaterialID = ms.MaterialID",
                       "filters" => "m.IsDeleted = 0 AND ms.IsDeleted = 0",
                       "subTables" => [],
);

query($materialTable);
?>
