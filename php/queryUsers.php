<?php
include "query.php";

$userTable = array("primary" => "UserID",
                   "columns"  => array("UserID" => "u.UserID",
                                       "UserName" => "u.UserName",
                                       "Name" => "u.Name",
                                       "Surname" => "u.Surname",
                                       "UserEmail" => "u.UserEmail",
                                       "UserStatus" => "u.UserStatus",
                                      ),
                   "name" => "Users u",
                   "joins" => "",
                   "filters" => "1 = 1",
                   "subTables" => [],
);

query($userTable);
?>
