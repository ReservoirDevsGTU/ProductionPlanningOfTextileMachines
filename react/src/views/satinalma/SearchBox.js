import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import baseURL from './satinalmatalepleri/js/baseURL.js';

const SearchBox = ({fetchAddr, label, value, onSelect}) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [previousCancel, setCancel] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectionValid, setSelectionValid] = useState(false);

  const inputRef = useRef(null);

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
        if(query === r.data[0][label]) {
          handleSelect(r.data[0][value]);
        }
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

  const handleSelect = (val) => {
    onSelect(val);
    setSelectionValid(val);
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
                              onClick={() => {handleSelect(o[value]); setQuery(o[label])}}>
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
