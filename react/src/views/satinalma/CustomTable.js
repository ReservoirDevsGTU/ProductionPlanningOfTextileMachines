import React, { useState, useEffect } from "react";
import { CDataTable, CPagination, CSelect } from '@coreui/react';
import axios from 'axios';
import baseURL from './baseURL.js';

const CustomTable = ({addTableClasses, data, fields, fetchAddr, fetchArgs, onFetch, scopedSlots, update, searchTerm, searchFields}) => {
  const [displayData, setDisplayData] = useState(["dummy"]);
  const [page, setPage] = useState(1);
  const [pageLength, setPageLength] = useState(5);
  const [maxRows, setMaxRows] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previousCancel, setCancel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const startRow = Math.max((page - 1) * pageLength, 0);
    let mr = 0;
    try {
      if(previousCancel) {
        previousCancel.cancel();
      } 
      const source = axios.CancelToken.source();
      setCancel(source);
      const response = await axios({method: 'post', cancelToken : source.token, url: baseURL + fetchAddr, data: {...fetchArgs, offset: startRow, fetch: pageLength, search: {term: searchTerm, fields: searchFields}}});
      let dd = response.data.map((c, i) => ({...c, RowID: i + startRow}));
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
      if(page === 0 && mr > 0) setPage(1);
      setLoading(false);
    }
    catch (error) {
      console.error("error while fetching: " + error);
    }
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

  const handlePageChange = e => {
    const val = e.target.value;
    setPageLength(val);
  };

  useEffect(() => changePage(), [page, data, searchTerm, pageLength]);
  useEffect(() => setPage(1), [searchTerm, pageLength]);
  useEffect(() => {if(update) changePage()}, [update]);

  return (<>
      <div>
        <CDataTable
          addTableClasses={addTableClasses}
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
        <style>
          {`
            .table tbody {
              display: block;
              max-height: 400px;
              overflow-y: auto;
            }
            .table thead, .table tbody tr {
              display: table;
              width: 100%;
              table-layout: fixed;
            }
          `}
        </style>
      </div>
      <div style={{display: "flex"}}>
      <CPagination
        pages={Math.ceil(Number(maxRows) / pageLength)}
        activePage={page}
        onActivePageChange={p => setPage(p)}
      />
      <CSelect
        style={{width: "5%", gap: "25px"}}
        value={pageLength}
        onChange={e => setPageLength(e.target.value)}
      >
        {[5, 10, 20].map(v => (<option value={v}>{v}</option>))}
      </CSelect>
      </div>
    </>);
};

export default CustomTable;
