<?php
include "query.php";

$warehouseTable = array("primary" => "WarehouseID",
                        "columns"  => array("WarehouseID" => "w.WarehouseID",
											"WarehouseName" => "w.WarehouseName",
											"WarehouseAddress" => "w.WarehouseAddress",
											"WarehouseSupervisorID" => "w.WarehouseSupervisorID",
											"SupervisorName" => "u.UserName",
											"WarehouseStatus" => "w.WarehouseStatus",
                                           ),
                   "name" => "Warehouses w",
                   "joins" => "JOIN Users u
                               ON u.UserID = w.WarehouseID",
                   "filters" => "w.IsDeleted = 0",
                   "subTables" => [],
);

query($warehouseTable);
?>
