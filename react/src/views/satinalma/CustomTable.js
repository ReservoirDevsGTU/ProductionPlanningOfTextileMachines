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
    const startRow = (page - 1) * pageLength;
    try {
      const response = await axios.post(baseURL + fetchAddr, {...fetchArgs, offset: [startRow, pageLength]});
      if(onFetch) {
        const processed = onFetch(response.data);
        if(processed) {
          setDisplayData(processed);
          setMaxRows(processed[0].MaxRows);
        }
        else {
          setDisplayData(response.data);
          setMaxRows(response.data[0].MaxRows);
        }
      }
      else {
        setDisplayData(response.data);
        setMaxRows(response.data[0].MaxRows);
      }
    }
    catch (error) {
      console.error("error while fetching: " + error);
    }
    if(page === 0 && maxRows > 0) setPage(1);
    setLoading(false);
  };

  const changePage = () => {
    const startRow = (page - 1) * pageLength;
    if(data) {
      setDisplayData(data.slice(startRow, Math.min(page * pageLength, data.length)));
      setMaxRows(data.length);
      if(page === 0 && maxRows > 0) setPage(1);
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
