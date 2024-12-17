import React, { useState, useEffect } from "react";
import { CDataTable, CPagination } from '@coreui/react';
import axios from 'axios';
import baseURL from './satinalmatalepleri/js/baseURL.js';

const CustomTable = ({data, fields, fetchAddr, fetchArgs, onFetch, scopedSlots, update}) => {
  const [displayData, setDisplayData] = useState(["dummy"]);
  const [page, setPage] = useState(1);
  const [pageLength, setPageLength] = useState(5);
  const [maxRows, setMaxRows] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const startRow = Math.max((page - 1) * pageLength, 0);
    let mr = 0;
    try {
      let columns = fields.map(f=>f.key);
      if(fetchArgs && fetchArgs.columns) {
        fetchArgs.columns.forEach((c)=>{if(!columns.find(e => e === c)) columns = columns.concat([c]);});
      }
      const response = await axios.post(baseURL + fetchAddr, {...fetchArgs, offset: startRow, fetch: pageLength, columns: columns});
      let dd = response.data;
      mr = dd[0].MaxRows;
      if(onFetch) {
        const processed = onFetch(dd);
        if(processed) {
          dd = processed;
          mr = processed[0].MaxRows;
        }
      }
      setMaxRows(mr);
      setDisplayData(dd);
    }
    catch (error) {
      console.error("error while fetching: " + error);
    }
    if(page === 0 && mr > 0) setPage(1);
    setLoading(false);
  };

  const changePage = () => {
    const startRow = (page - 1) * pageLength;
    if(data) {
      setDisplayData(data.slice(startRow, Math.min(page * pageLength, data.length)));
      setMaxRows(data.length);
      if(page === 0 && data.length > 0) setPage(1);
    }
    else if(fetchAddr) {
      fetchData();
    }
  };

  useEffect(() => changePage(), [page, data]);
  useEffect(() => {if(update) changePage()}, [update]);

  return (<>
      <CDataTable
        fields={fields}
        items={displayData}
        itemsPerPage={pageLength}
        pagination={false}
        scopedSlots={scopedSlots}
        stripped
        hover
        bordered
        size="sm"
        loading={loading}
      />
      <CPagination
        pages={Math.ceil(Number(maxRows) / pageLength)}
        activePage={page}
        onActivePageChange={p => setPage(p)}
      />
    </>);
};

export default CustomTable;
