import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // React Router v5 kullanımı
import '../css/TeklifSiparisListe.css';
import { CDataTable, CInput} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';



const TeklifSiparisListe = () => {
  const history = useHistory(); // useHistory() ile yönlendirme
  const [data, setData] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.post(baseURL + '/queryOffers.php');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
// tüm checkboxları seçme temizleme
const handleSelectedAll = (isChecked) => {
  setAllSelected(isChecked);
  setData((prevData) =>
  prevData.map((item) => ({
    ...item,
    selected: isChecked,
  }))
  );
};

// tek bi checkbox ı temizleme seçme
const handleRowSelect = (id, isChecked) => {
  setData((prevData) =>
    prevData.map((item) => 
      item.id === id ? {...item, selected: isChecked} : item
      )
    );
    if(!isChecked) setAllSelected(false);
};

useEffect(() => {
  fetchData();
}, []);

// searchbar için filtreleme
const filteredData = data.filter((item) => {
  const search = searchTerm.toLowerCase();
  return (
    item.OfferID.toString().toLowerCase().includes(search) ||
    item.CreationDate.toLowerCase().includes(search) ||
    item.RequestedBy.toLowerCase().includes(search) ||
    item.OfferDeadline.toLowerCase().includes(search) ||
    item.MaterialID.toString().toLowerCase().includes(search) ||
    item.MaterialName.toLowerCase().includes(search)
  );
});

const fields = [
  {key: 'checkbox', label:<input type="checkbox" checked={allSelected} onChange={(e) => handleSelectedAll(e.target.checked)} />, sorter: false, filter: false},
  {key: 'OfferID', label:'Talep No'},  
  {key: 'CreationDate', label:'Talep Tarihi'},  
  {key: 'RequestedBy', label:'Talep Eden'}, 
  {key: 'OfferDeadline', label:'Termin Tarihi'},  
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
        <button className='left-button-css' onClick={() => alert('Yeni Teklif Oluştur')}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px'}} />
          Yeni Teklif Oluştur </button>
      </div>

      <div className='right-section'>
        <button className='middle-button-css' onClick={() => history.push('/satinalma/teklif-isteme')}>
        <FontAwesomeIcon icon={faList} style={{ marginRight: '8px'}} />
          Talepten Teklif Oluştur </button>      
        <button className='right-button-css' onClick={() => alert('Talepten Sipariş')}>
        <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px'}} />
          Talepten Sipariş </button>
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
    {filteredData.length > 0 ? (
      <CDataTable 
        items={filteredData}
        fields={fields}
        stripped
        hover
        bordered
        size="sm"
        scopedSlots={{
          checkbox: (item) => (
            <td>
              <input type="checkbox" checked={item.selected} onChange={(e) => handleRowSelect(item.id, e.target.checked)}  />
            </td>
          ),
        }}
        /> ) :  ( <div> <p>  </p> </div> )} {/* aramada bir şey bulamazsa hiçbir şey bastırılmasın. */}
        </div>
    </div>
  );
};

export default TeklifSiparisListe;
