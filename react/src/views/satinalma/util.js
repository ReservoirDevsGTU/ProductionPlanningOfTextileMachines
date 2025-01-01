import * as XLSX from "xlsx";

function searchTables(wb, columnFilters) {
  var result = [];
  Object.values(wb.Sheets).forEach(s => {
    var grid = XLSX.utils.sheet_to_json(s, {header: 1});
	for(var i = 0; i < grid.length; i++) {
      for(var j = 0; j < grid[i].length; j++) {
        if(grid[i][j]) {
          var length = 0;
		  while(grid[i][j + length]) length++;
		  var tableArray = [];
		  var k = 0;
		  while(true) {
            const row = grid[i + k]?.slice(j, j + length);
			if(!row?.find(Boolean)) break;
			for(var l = 0; l < length; l++) grid[i + k][j + l] = undefined;
			tableArray[tableArray.length] = row;
			k++;
          }
		  if(columnFilters.find(cf => cf.reduce((acc, cur) => acc && tableArray[0].find(c => c === cur), true))) {
			result[result.length] = XLSX.utils.sheet_to_json(XLSX.utils.aoa_to_sheet(tableArray));
          }
        }
      }
    }
  });
  return result;
}

export default searchTables;
