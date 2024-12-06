import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // React Router v5 kullanımı
import '../css/TeklifSiparisListe.css';
import { CDataTable, CInput} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';



const TeklifSiparisListe = () => {
  const history = useHistory(); // useHistory() ile yönlendirme



const databasedata = [
  { id: 1, talepno: '123', taleptarihi: '01/01/2024', talepeden: 'Ali Veli', termintarihi: '05/01/2024', malzemeno: '456', malzemeadi: 'Malzeme A', miktar: 10, birim: 'Adet' },
  { id: 2, talepno: '124', taleptarihi: '02/01/2024', talepeden: 'Ayşe Yılmaz', termintarihi: '15/03/2024', malzemeno: '789', malzemeadi: 'Malzeme B', miktar: 5, birim: 'Metre' },
  { id: 3, talepno: '125', taleptarihi: '31/12/2024', talepeden: 'Batuhan Altun', termintarihi: '22/09/2024', malzemeno: '743', malzemeadi: 'Malzeme C', miktar: 12, birim: 'Metre' },
  { id: 4, talepno: '126', taleptarihi: '03/04/2024', talepeden: 'Mehmet Emin', termintarihi: '06/10/2024', malzemeno: '723', malzemeadi: 'Malzeme D', miktar: 25, birim: 'Metre' },
  { id: 5, talepno: '127', taleptarihi: '12/07/2024', talepeden: 'Çağrı Özcanlı', termintarihi: '01/01/2024', malzemeno: '567', malzemeadi: 'Malzeme E', miktar: 3, birim: 'Metre' },

];
  
const [data,setData] = useState(databasedata);
const [allSelected, setAllSelected] = useState(false);
const [searchTerm, setSearchTerm] = useState('');


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

// searchbar için filtreleme
const filteredData = data.filter((item) => {
  const search = searchTerm.toLowerCase();
  return (
    item.talepno.toString().toLowerCase().includes(search) ||
    item.taleptarihi.toLowerCase().includes(search) ||
    item.talepeden.toLowerCase().includes(search) ||
    item.termintarihi.toLowerCase().includes(search) ||
    item.malzemeno.toString().toLowerCase().includes(search) ||
    item.malzemeadi.toLowerCase().includes(search) ||
    item.miktar.toString().toLowerCase().includes(search) ||
    item.birim.toLowerCase().includes(search) 
  );
});



const fields = [
    {key: 'checkbox', label:<input type="checkbox" checked={allSelected} onChange={(e) => handleSelectedAll(e.target.checked)} />, sorter: false, filter: false},
    {key: 'talepno', label:'Talep No'},
    {key: 'taleptarihi', label:'Talep Tarihi'},
    {key: 'talepeden', label:'Talep Eden'},
    {key: 'termintarihi', label:'Termin Tarihi'},
    {key: 'malzemeno', label:'Malzeme No'},
    {key: 'malzemeadi', label:'Malzeme Adı'},
    {key: 'miktar', label:'Miktar'},
    {key: 'birim', label:'Birim'},
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
