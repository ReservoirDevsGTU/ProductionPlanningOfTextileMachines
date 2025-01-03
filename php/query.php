<?php
include 'connect.php';
include 'headers.php';

$input = json_decode(file_get_contents("php://input"), true);

function genQuery($input, $table, &$selectedColumns, &$selectedJoins, &$selectedFilters, &$subTablesNoExpand, &$postProcessList) {
    $primary = $table["primary"];
    $columns = $table["columns"];
    $tableName = $table["name"];
    $joins = $table["joins"];
    $filters = $table["filters"];
    $subTables = $table["subTables"];

    $selectedJoins .= " " . $joins;
    $selectedFilters .= " AND " . $filters;
    
    if(isset($table["postProcess"])) {
        foreach(array_keys($table["postProcess"]) as $pp) {
            $postProcessList[$pp] = $table["postProcess"][$pp];
        }
    }

    foreach(array_keys($columns) as $colName) {
        if(!isset($table["alias"]) and isset($table["parentPrimary"]) and $colName == $table["parentPrimary"]) {
            continue;
        }
        $selectedColumns .= ", " . $columns[$colName] . " " . $colName;
    }
    
    if(isset($input["filters"])) {
        foreach(array_keys($input["filters"]) as $colName) {
            if(isset($columns[$colName])) {
                $values = "";
                foreach($input["filters"][$colName] as $value) {
                    if(gettype($value) == "string") {
                        $values .= ", '" . $value . "'";
                    }
                    else {
                        $values .= ", " . $value;
                    }
                }
                $values = substr($values, 2);
                $selectedFilters .= " AND " . $columns[$colName] . " IN (" . $values . ")";
            }
        }
    }

    if(isset($input["search"]) and strlen($input["search"]["term"]) > 0) {
        $term = $input["search"]["term"];
        $search = "";
        foreach($input["search"]["fields"] as $f) {
            if(isset($columns[$f])) {
                $search .= " OR $columns[$f] LIKE '%$term%'";
            }
        }
        if(strlen($search) > 0) {
            $search = substr($search, 3);
            $selectedFilters .= " AND ($search)";
        }
    }

    if(isset($input["subTables"])) {
        foreach(array_keys($input["subTables"]) as $subTableName) {
            if(isset($subTables[$subTableName])) {
                $subTable = $subTables[$subTableName];
                $subTable["parentPrimary"] = $primary;
                if($input["subTables"][$subTableName]["expand"]) {
                    $selectedJoins .= " JOIN  " . $subTable["name"] .
                                       " ON " . $subTable["subTableJoinOn"] . " = " . $columns[$primary];
                    genQuery($input["subTables"][$subTableName], $subTable, $selectedColumns, $selectedJoins, $selectedFilters, $subTablesNoExpand, $postProcessList);
                }
                else {
                    $subTable["alias"] = $subTableName;
                    $subTablesNoExpand[] = $subTable;
                }
            }
        }
    }
}

function getTableData($conn, $input, $table) {
    $head = "WITH Result AS (SELECT";
    $selectedColumns = "";
    $from = "FROM " . $table["name"];
    $selectedJoins = "";
    $selectedFilters = "";
    $tail = "), Count AS (SELECT COUNT(*) MaxRows FROM Result)
             SELECT * FROM Result, Count
             ORDER BY Result." . $table["primary"];

    $subTablesNoExpand = [];
    $postProcessList = [];

    if(isset($input["distinct"])) {
        $from = "FROM (SELECT MIN(" . $table["primary"] . ") AS " . $table["primary"];
        $distinctGroups = "";
        $tableFullName = strstr($table["name"], " ", true);
        $tableAlias = substr(strstr($table["name"], " "), 1);
        foreach($input["distinct"] as $colName) {
            $distinctGroups .= ", " . $colName;
        }
        $from .= $distinctGroups;
        $from .= " FROM " . $tableFullName;
        $from .= " WHERE " . str_replace($tableAlias, $tableFullName, $table["filters"]);
        $from .= " GROUP BY" . substr($distinctGroups, 1) . ") distinctRows";
        $selectedJoins .= " JOIN " . $table["name"] .
                          " ON " . $table["columns"][$table["primary"]] . " =" .
                          " distinctRows." . $table["primary"];
    }

    genQuery($input, $table, $selectedColumns, $selectedJoins, $selectedFilters, $subTablesNoExpand, $postProcessList);
    
    $selectedColumns = substr($selectedColumns, 2);
    $selectedFilters = substr($selectedFilters, 4);

    if(isset($input["offset"])) {
        $tail .= " OFFSET " . $input["offset"] . " ROWS";
    }

    if(isset($input["fetch"])) {
        $tail .= " FETCH NEXT " . $input["fetch"] . " ROWS ONLY";
    }

    $sql = $head . " " . $selectedColumns . " " . $from . " " . $selectedJoins . " WHERE " . $selectedFilters . " " . $tail;

    //echo $sql;

    $stmt = sqlsrv_query($conn, $sql);
    
    $data = [];

    if($stmt) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $data[] = $row;
        }
    }
    else {
        die(json_encode(sqlsrv_errors(), true));
    }

    if($subTablesNoExpand) {
        foreach($subTablesNoExpand as $subTable) {
            $parentPrimary = $subTable["parentPrimary"];

            $ids = [];

            foreach($data as $row) {
                if($row[$parentPrimary] !== null)
                    $ids[] = $row[$parentPrimary];
            }

            $subInput = $input["subTables"][$subTable["alias"]];
            $subInput["filters"][$parentPrimary] = $ids;
            $subInput["columns"][] = $parentPrimary;

            $subData = getTableData($conn, $subInput, $subTable);

            for($i = 0; $i < count($data); $i++) {
                $data[$i][$subTable["alias"]] = array_values(array_filter($subData, function($r) use ($parentPrimary, $data, $i) {
                    return $r[$parentPrimary] == $data[$i][$parentPrimary];
                }));
            }
        }
    }
    
    if($postProcessList) {
        foreach(array_keys($postProcessList) as $pp) {
            for($i = 0; $i < count($data); $i++) {
                $data[$i][$pp] = $postProcessList[$pp]($data[$i][$pp]);
            }
        }
    }
    
    return $data;
}

function query($table) {
    global $conn, $input;
    
    if($_SERVER['REQUEST_METHOD'] != 'POST') return;

    echo json_encode(getTableData($conn, $input, $table));
}
?>
