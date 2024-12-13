import CustomTable from '../../CustomTable.js'
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CInput, CButton } from '@coreui/react';
import '../css/TeklifListesi.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faPaperPlane, faPrint, faShoppingCart, faTasks } from '@fortawesome/free-solid-svg-icons';



const TeklifListesi = () => {

    const history = useHistory(); // useHistory() ile yönlendirme
    const [allSelected, setAllSelected] = useState(false);
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    const processData = (newData) => {
        setAllSelected(!newData.find(i => !selected[i.RequestItemID]));
        setData(newData);
      };


    // tüm checkboxları seçme temizleme
    const handleSelectedAll = (isChecked) => {
        const updatedSelected = data.reduce((acc, cur) => {
          return { ...acc, [cur.RequestItemID]: isChecked };
        }, {});
        setSelected(updatedSelected);
        setAllSelected(isChecked);
      };


    // tek bi checkbox ı temizleme seçme
    const handleRowSelect = (item, isChecked) => {
        setSelected((prevSelected) => ({
          ...prevSelected,
          [item]: isChecked,
        }));
        setAllSelected(!data.find((i) => !selected[i.RequestItemID]));
      };


    // searchbar için filtreleme
    const filteredData = (data) => selected.concat(data.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
        item.supplier.toLowerCase().includes(search) ||
        item.offergroupno.toString().toLowerCase().includes(search) ||
        item.offerno.toString().toLowerCase().includes(search) ||
        item.requestno.toString().toLowerCase().includes(search) ||
        item.offerrequester.toLowerCase().includes(search)
        );
    }));

    const fields = [
        {key: 'checkbox', label:<input type="checkbox" checked={allSelected} onChange={(e) => handleSelectedAll(e.target.checked)} />, sorter: false, filter: false},
        {key: 'supplier', label:'Tedarikçi'},  
        {key: 'offerDate', label:'Teklif Tarihi'},  
        {key: 'offergroupno', label:'Teklif Grup No'}, 
        {key: 'offerno', label:'Teklif No'},  
        {key: 'requestno', label:'Talep No'},  
        {key: 'offerrequester', label:'Teklif İsteyen'},
        {key: 'status', label:'Durum'},  
        {key: 'button', label:<CButton>Seç</CButton>},  

        ];

      

    return (

        <div className='teklif-listesi-container'>

            <div className='header-title'>
                <h1>Teklif Listesi</h1>
                <hr />
            </div>
            
            <div className="button-toolbar">
              
            
              <div className="button-group-left">
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
                  Sipariş Oluştur
                </CButton>
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
                  Değerlendirmeye Al
                </CButton>
              </div>

              <div className="button-group-right">
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </CButton>
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faPrint} />
                </CButton>
                <CButton className="green-button">
                  <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '8px' }} />
                  Teklif Aktar
                </CButton>
              </div>
            </div>


            <div className='search-bar-section'>
                <CInput
                type='text'
                placeholder='Arama Yapın...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="seach-bar"
                />
            </div>

            <div className='tablo'>
                {filteredData.length > 0 ? (<>
                <CustomTable
                fetchAddr="/queryRequests.php"
                onFetch={processData}
                fetchArgs={{expand:true}}
                fields={fields}
                scopedSlots={{
                    checkbox: (item) => (
                        <td>
                        <input type="checkbox" checked={selected[item.RequestItemID]} onChange={(e) => handleRowSelect(item.RequestItemID, e.target.checked)}  />
                      </td>
                    ),
                }}/>
                </>) : (<div> <p> </p> </div>)
                };
            </div>

            
        </div>

    );
};


export default TeklifListesi;