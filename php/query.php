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
        $selectedColumns .= ", " . $columns[$colName] . " " . $colName;
    }
    
    if(isset($input["filters"])) {
        $allFilters = "";
        foreach($input["filters"] as $filter) {
            $filterGroup = "";
            foreach(array_keys($filter) as $colName) {
                if(isset($columns[$colName])) {
                    $values = "";
                    foreach($filter[$colName] as $value) {
                        if(gettype($value) == "string") {
                            $values .= ", '" . $value . "'";
                        }
                        else {
                            $values .= ", " . $value;
                        }
                    }
                    $filterGroup .= " AND " . $columns[$colName] . " IN (" . substr($values, 2) . ")";
                }
            }
            $allFilters .= " OR (" . substr($filterGroup, 4) . ")";
        }
        $selectedFilters .= " AND (" . substr($allFilters, 3) . ")";
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
                $subTable["alias"] = $subTableName;
                if($input["subTables"][$subTableName]["expand"]) {
                    $joinConditions = "";
                    foreach($subTable["subTableJoinOn"] as $colName) {
                        $joinConditions .= " AND " . $columns[$colName] . " = " .
                                           $subTable["columns"][$colName];
                        $subTable["columns"] = array_filter($subTable["columns"],
                            function($key) use($colName) {
                                return $key != $colName;
                            },
                            ARRAY_FILTER_USE_KEY);
                    }
                    $selectedJoins .= " JOIN  " . $subTable["name"] .
                                       " ON " . substr($joinConditions, 4);
                    genQuery($input["subTables"][$subTableName], $subTable, $selectedColumns, $selectedJoins, $selectedFilters, $subTablesNoExpand, $postProcessList);
                }
                else {
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
            $joinOn = $subTable["subTableJoinOn"];

            $subFilters = [];

            foreach($data as $row) {
                $result = array();
                foreach($joinOn as $colName) {
                    if($row[$colName] != null) {
                        $result[$colName] = array($row[$colName]);
                    }
                }
                if($result) $subFilters[] = $result;
            }

            //print_r($subFilters);

            $subInput = $input["subTables"][$subTable["alias"]];
            $subInput["filters"] = $subFilters;

            $subData = getTableData($conn, $subInput, $subTable);

            for($i = 0; $i < count($data); $i++) {
                $data[$i][$subTable["alias"]] = array_values(array_filter($subData, function($r) use ($joinOn, $data, $i) {
                    $result = true;
                    foreach($joinOn as $colName) {
                        $result = $result && $r[$colName] == $data[$i][$colName];
                    }
                    return $result;
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

    header('Content-Encoding: gzip'); 
    echo gzencode(json_encode(getTableData($conn, $input, $table)));
}

function dateToText($date) {
    return $date->format("Y-m-d");
}
?>
