import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // React Router v5 kullanımı
import '../css/TeklifSiparisListe.css';
import { CButton, CDataTable, CInput, CPagination} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import CustomTable from '../../CustomTable.js'

const TeklifSiparisListe = () => {
  const history = useHistory(); // useHistory() ile yönlendirme
  const [allSelected, setAllSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);

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
    item.RequestID.toString().toLowerCase().includes(search) ||
    item.CreationDate.toLowerCase().includes(search) ||
    item.UserName.toLowerCase().includes(search) ||
    item.RequestDeadline.toLowerCase().includes(search) ||
    item.MaterialID.toString().toLowerCase().includes(search) ||
    item.MaterialName.toLowerCase().includes(search)
  );
}));

const fields = [
  {key: 'checkbox', label:<input type="checkbox" checked={allSelected} onChange={(e) => handleSelectedAll(e.target.checked)} />, sorter: false, filter: false},
  {key: 'RequestID', label:'Talep No'},  
  {key: 'CreationDate', label:'Talep Tarihi'},  
  {key: 'UserName', label:'Talep Eden'}, 
  {key: 'RequestDeadline', label:'Termin Tarihi'},  
  {key: 'MaterialID', label:'Malzeme No'},  
  {key: 'MaterialName', label:'Malzeme Adı'},  
];


  return (

    <div className='teklif-siparis-container'> {/* en üstteki div sayfanın divi */}

    <div className='header-title'>
      <h1>Teklif Sipariş İsteme Listesi</h1>
      <hr />
    </div>

      <div className='header-section'> {/* butonlar ve searchbar divi */}

      <div className='left-button'>
        <CButton className='left-button-css' onClick={() => alert('Yeni Teklif Oluştur')}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px'}} />
          Yeni Teklif Oluştur </CButton>
      </div>

      <div className='right-section'>
        <CButton className='middle-button-css' onClick={() => history.push('/satinalma/teklif-isteme')}>
        <FontAwesomeIcon icon={faList} style={{ marginRight: '8px'}} />
          Talepten Teklif Oluştur </CButton>      
        <CButton className='right-button-css' onClick={() => alert('Talepten Sipariş')}>
        <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px'}} />
          Talepten Sipariş </CButton>
      </div>

      </div> 
      <div className='search-bar-section'>
      {/* searchbar */}
      <CInput
      type='text'
      placeholder='Arama Yapın...'
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-bar"
      />
</div>
      
      
    
    <div className='tablo'>
    {/* tablo*/}
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
        </>) :  ( <div> <p>  </p> </div> )} {/* aramada bir şey bulamazsa hiçbir şey bastırılmasın. */}
        </div>
    </div>
  );
};

export default TeklifSiparisListe;
