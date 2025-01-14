import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import baseURL from './baseURL.js';

const SearchBox = ({fetchAddr, label, value, initialValue, onSelect}) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [previousCancel, setCancel] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectionValid, setSelectionValid] = useState(false);

  const inputRef = useRef(null);

  useEffect(async () => {
    if(initialValue) {
      axios.post(baseURL + fetchAddr, {filters: [{[value]: [initialValue]}]})
      .then(r => {
        setQuery(r.data[0]?.[label]);
      });
    }
  }, [initialValue]);

  useEffect(async () => {
    if(previousCancel) {
      previousCancel.cancel();
    } 
    const source = axios.CancelToken.source();
    setCancel(source);
    axios({
        method: 'post',
        url:baseURL + fetchAddr, 
        cancelToken: source.token,
        data: {offset: 0, fetch: 10, search: {term: query, fields: [label]}}
    })
      .then(r => {
        r.data.forEach(row => {
          if(query === row[label]) {
            handleSelect(row);
          }
        });
        setOptions(r.data);
      })
      .catch(e => {
        console.error("error while fetching: " + e);
      });
  }, [query]);

  const toggle = (e) => {
    setShowList(e && e.target === inputRef.current);
  };

  useEffect(() => {
      document.addEventListener("click", toggle);
      return () => document.removeEventListener("clicl", toggle);
  }, []);

  const handleSelect = (o) => {
    onSelect(value ? o?.[value] : o);
    setSelectionValid(o);
  };

  return (
    <div style={{width:"100%", position: "relative"}}>
      <input ref={inputRef}
             style={{
               height: "100%",
               width: "100%",
               padding: "8px",
               border: "1px solid #ccc",
               borderColor: selectionValid ? "lime" : "red",
               borderRadius: "4px",
             }}
             value={query}
             onClick={() => setShowList(true)}
             onChange={(e) => {setQuery(e.target.value); handleSelect(null)}}/>
      <table style={{position: "absolute", background: "white", width: "inherit"}}>
        <tbody>
          {showList && options.map(o => (<tr
                              onMouseEnter={(e)=>e.target.style["background"] = "#f0f0f0"}
                              onMouseLeave={(e)=>e.target.style["background"] = "white"}
                              onClick={() => {handleSelect(o); setQuery(o[label])}}>
                              <td>
                                {o[label]}
                              </td>
                            </tr>))}
        </tbody>
      </table>
    </div>
  );
};

export default SearchBox;
