import React, { useState } from "react";
import "../css/SiparisListesi.css";
import { CInput ,CButton } from "@coreui/react";
import {  faLongArrowAltDown, faPrint, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from "react-router-dom"; // useHistory import edildi
import CustomTable from '../../CustomTable.js';

const SiparisListesi = () => {

  const history = useHistory(); // useHistory hook'u kullanılıyor

  // Satırların genişleme durumları
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Sipariş satırını açma/kapama
  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Malzeme satırını açma/kapama
  const toggleMaterial = (siparisIndex, materialIndex) => {
    const key = `${siparisIndex}-${materialIndex}`;
    setExpandedMaterials((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Buton işlemleri
  const handleSiparisOlustur = () => {
    alert("Sipariş oluşturma işlemi başlatıldı!");
  };

  const handleSiparistenGiris = () => {
     //alert("Siparişten giriş işlemi başlatıldı!");
     // Yönlendirme işlemi
     history.push("/satinalma/giris-formu");
    
  };

  const handleYazdir = () => {
    alert("Tablo yazdırılıyor...");
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Sipariş Listesi</h1>
        <hr style={{ border: '1px solid #333' }} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton color="info" variant='outline' size='lg' onClick={handleSiparisOlustur}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
            Sipariş Oluştur
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={handleSiparistenGiris}>
            <FontAwesomeIcon icon={faLongArrowAltDown} style={{ marginRight: '8px' }} />
            Siparişten Giriş
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={handleYazdir} >
            <FontAwesomeIcon icon={faPrint} style={{ marginRight: '8px' }} />
            Yazdır
          </CButton>


        </div>

        <CInput
          type="text"
          placeholder="Arama Yapın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '30%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      </div>

      <CustomTable
        addTableClasses="siparis-listesi-table"
        fetchAddr="/queryOrders.php"
        fetchArgs={{subTables: {Materials: {expand: false, subTables: {Requests: {expand: false}}}}}}
        searchTerm={searchTerm}
        searchFields={["SupplierName", "OrderID"]}
        fields={[
		  {label:'', key: 'expand'},
		  {label:'Tedarikçi', key: 'SupplierName'},
		  {label:'Sipariş Tarihi', key: 'OrderDate'},
		  {label:'Sipariş NO', key: 'OrderID'},
		  {label:'Teslim Tarihi', key: 'ShippingDate'},
		  {label:'Talep NO', key: 'request_id'},
		  {label:'Durum', key: 'order_status'},
		  {label:'Seç', key: 'select'},
        ]}
        scopedSlots={{
          expand: (item) => (
            <td>
              <button
                className="expand-button"
                onClick={() => toggleRow(item.RowID)}
              >
                {expandedRows[item.RowID] ? "▼" : "►"}
              </button>
            </td>
          ),
          request_id: (item) => (
            <td>
              {(item.Materials?.length > 0 ? Object.keys(item.Materials.reduce((acc, cur) => {
                if(cur.Requests?.length > 0) {
                  cur.Requests.forEach(r => {
                    if(typeof r.RequestID === 'number') acc[r.RequestID] = 1;
                  });
                }
                return acc;
              }, {})).join(', ') : false) || '-'}
            </td>),
          order_status: (item) => (
            <td>{["Siparis Verildi", "Kismen Teslim Edildi", "Teslim Edildi"][item.OrderStatus]}</td>
          ),
          select: (item) => (
            <td>
              <CButton shape='square' variant='outline' color='primary' >
                Seç
              </CButton>
            </td>
          ),
          details: (item) => expandedRows[item.RowID] && (
            <CustomTable
              addTableClasses="malzeme-listesi-table"
              data={item.Materials.reduce((acc, cur) => {
                const exist = acc.find(m => m.MaterialID == cur.MaterialID);
                if(cur.Requests.length > 0) {
                  cur.Requests[0].RequestedAmount = cur.RequestedAmount;
                  cur.Requests[0].UnitID = cur.UnitID;
                }
                if(exist) {
                  exist.OrderedAmount -= -cur.OrderedAmount;
                  exist.ProvidedAmount -= -cur.ProvidedAmount;
                  if(cur.Requests) {
                    exist.Requests = exist.Requests.concat(cur.Requests);
                  }
                }
                else {
                  acc.push({...cur});
                }
                return acc;
              }, [])}
              fields={[
				{label:'', key: 'expand'},
				{label:'Malzeme No', key: 'MaterialNo'},
				{label:'Malzeme Adı', key: 'MaterialName'},
				{label:'Sipariş Miktarı', key: 'OrderedAmount'},
				{label:'Kalan Sipariş Miktarı', key: 'left_ordered_amount'},
				{label:'Birim', key: 'UnitID'},
              ]}
              scopedSlots={{
                expand: (material) => (
                  <td>
                    <button
                      className="expand-button"
                      onClick={() =>
                        toggleMaterial(item.RowID, material.OrderItemID)
                      }
                    >
                      {expandedMaterials[`${item.RowID}-${material.OrderItemID}`]
                        ? "▼"
                        : "►"}
                    </button>
                  </td>
                ),
                left_ordered_amount: (item) => (
                  <td>{item.OrderedAmount - item.ProvidedAmount}</td>
                ),
                details: (material) => expandedMaterials[`${item.RowID}-${material.OrderItemID}`] && (
                  <CustomTable
                    addTableClasses="talep-listesi-table"
                    data={material.Requests}
                    fields={[
					  {label:'Talep No', key: 'RequestID'},
					  {label:'Talep Tarihi', key: 'CreationDate'},
					  {label:'Talep Eden', key: 'UserName'},
					  {label:'Talep Miktarı', key: 'RequestedAmount'},
					  {label:'Birim', key: 'UnitID'},
					  {label:'Durum', key: 'RequestStatus'},
                    ]}
                  />
                ),
              }}
            />
          ),
        }}
      />
    </div>
  );
};

export default SiparisListesi;
