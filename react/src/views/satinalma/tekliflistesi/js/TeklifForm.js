import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CForm,
  CFormGroup,
  CLabel,
  CInput,
  CTextarea,
  CButton,
  CSelect,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import SearchBox from '../../SearchBox.js';
import baseURL from '../../baseURL.js';
import * as XLSX from 'xlsx';
import Dropzone from 'react-dropzone';
import searchTables from '../../util.js';
import CustomModal from '../../CustomModal.js';  


const TeklifForm = () => {
  const OfferID = useParams().id;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('teklifBilgileri');
  const [materialData, setMaterialData] = useState([]);
  const [formData, setFormData] = useState({
    SupplierID: '',
    OfferDate: '',
    teklifGecerlilikTarihi: '',
    OfferDeadline: '',
    OfferGroupID: '',
    firmaSorumlusu: '',
    OfferStatus: '',
    OfferDescription: ''
  });
  const [sheetModal, setSheetModal] = useState(false);
  const [modals, setModals] = useState({
    exit: false, fillError: false,success: false, warning: false   
  });

  const [modalMessages, setModalMessages] = useState({
    exit: '',
    fillError: '',
    success: '',
    warning: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterialData, setFilteredMaterialData] = useState([]);

  useEffect(() => {
    const unblock = history.block((location, action) => {
      if (action === 'POP') {
        handleCancel();
        return false;
      }
    });

    return () => {
      unblock();
    };
  }, [history]);


  useEffect(() => {
    // Arama sorgusuna göre malzemeleri filtrele  
    const filtered = materialData.filter(item => {
      const query = searchQuery.toLowerCase();
      return item.MaterialNo.toLowerCase().includes(query) ||
             item.MaterialName.toLowerCase().includes(query);
    });
    setFilteredMaterialData(filtered);
  }, [searchQuery, materialData]);


  if(!OfferID) history.goBack();

  useEffect(() => {
    axios.post(baseURL + "/queryOffers.php", {filters: [{OfferID: [OfferID]}], subTables: {Materials: {expand: false}}})
      .then(r => {
        const data = r.data[0];
        data.OfferStatus = data.OfferStatus === 0 ? 1 : data.OfferStatus;
        data.initialSupplier = data.SupplierID;
        setFormData(data);
        setMaterialData(data.Materials.reduce((acc, cur) => {
          const exist = acc.find(m => m.MaterialID === cur.MaterialID);
          if(exist) {
            exist.OfferRequestedAmount = Number(exist.OfferRequestedAmount) + Number(cur.OfferRequestedAmount);
            exist.OfferedAmount = Number(exist.OfferedAmount) + Number(cur.OfferedAmount);
            exist.OfferedPrice = Number(exist.OfferedPrice) + Number(cur.OfferedPrice);
          }
          else {
            acc.push({...cur});
          }
          return acc;
        }, []).map(m => ({...m, OfferedAmount: m.OfferedAmount || 1, UnitPrice: m.OfferedPrice ? Math.round(Number.EPSILON + 100 * m.OfferedPrice / m.OfferedAmount) / 100 : 1})));
      });
  }, [OfferID]);

  const submitForm = () => {
    axios.post(baseURL + "/editOffer.php", {
      OfferID: OfferID,
      ...formData,
      Materials: formData.Materials.map(m => {
        const total = materialData.find(md => md.MaterialID === m.MaterialID);
        const OfferedAmount = total.OfferedAmount * m.OfferRequestedAmount / total.OfferRequestedAmount;
        return {
          OfferItemID: m.OfferItemID,
          OfferedAmount: OfferedAmount,
          OfferedPrice: OfferedAmount * total.UnitPrice
        };
      })
    });
  };

  const handleInputChange = (e) => {
    console.log(formData);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setMaterialData(prev => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };


  const handleSave = () => {
    // Hangi alanlar zorunlu? (dilediğiniz gibi genişletebilirsiniz)
    const requiredFields = [
      "SupplierID",
      "OfferDate",
      "teklifGecerlilikTarihi",
      "OfferDeadline",
      "OfferGroupID",
      "firmaSorumlusu",
      "OfferStatus",
      "OfferDescription"
    ];

    // Boş alan var mı?
    const hasEmptyField = requiredFields.some(field =>
      !formData[field] || formData[field].toString().trim() === ''
    );

    // 1) Eksik alan varsa fillError modal'ı göster
    if (hasEmptyField) {
      setModalMessages({
        ...modalMessages,
        fillError: "Lütfen bütün alanları doldurun!"
      });
      setModals({
        ...modals,
        fillError: true
      });


      
      return;
    }

    // 2) Her şey doluysa formu gönder
    submitForm();

    // Başarılı mesaj
    setModalMessages({
      ...modalMessages,
      success: "Başarıyla kaydedildi!"
    });
    setModals({
      ...modals,
      success: true
    });

    // 1.5 saniye sonra otomatik kapat + sayfadan çık
    setTimeout(() => {
      setModals(prev => ({ ...prev, success: false }));
      history.push('/satinalma/teklif-listesi');
    }, 1500);
  };

  const handleCancel = () => {
    setModalMessages({
      ...modalMessages,
      exit: 'Yaptığınız değişiklikler kaybolacak. Çıkmak istediğinize emin misiniz?'
    });
    setModals({
      ...modals,
      exit: true
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h1>Teklif Formu</h1>
      <hr style={{ border: '1px solid #333' }} />
        <CButton color="success" size='lg' variant="outline" onClick={()=>setSheetModal(true)}>
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '8px' }} />
          Teklif Aktar
        </CButton>
      </div>

      <CTabs activeTab={activeTab} onActiveTabChange={idx => setActiveTab(idx)}>
        <CNav variant="tabs" style={{ marginBottom: '1rem' }}>
          <CNavItem>
            <CNavLink data-tab="teklifBilgileri">
              Teklif Bilgileri
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="malzemeler">
              Malzemeler
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane data-tab="teklifBilgileri" style={{ backgroundColor: 'white', padding: '20px' }}>
            <CForm >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <CFormGroup>
                    <CLabel>Teklif Numarası</CLabel>
                    <CInput
                      type="text"
                      disabled
                      value={OfferID}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="OfferDate"
                      value={formData.OfferDate}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Termin Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="OfferDeadline"
                      value={formData.OfferDeadline}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Firma Sorumlusu</CLabel>
                    <CInput
                      type="text"
                      name="firmaSorumlusu"
                      value={formData.firmaSorumlusu}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                </div>
                <div>
                  <CFormGroup>
                    <CLabel>Tedarikçi Firma</CLabel>
                    <SearchBox fetchAddr="/querySuppliers.php" value="SupplierID" initialValue={formData.initialSupplier} label="SupplierName" onSelect={v=>setFormData(p=>({...p, SupplierID: v}))}/>
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Geçerlilik Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="teklifGecerlilikTarihi"
                      value={formData.teklifGecerlilikTarihi}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Grup NO</CLabel>
                    <CInput
                      type="text"
                      name="OfferGroupID"
                      value={formData.OfferGroupID}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Durumu</CLabel>
                    <CSelect
                      name="OfferStatus"
                      value={formData.OfferStatus}
                      onChange={handleInputChange}
                    >
                      <option value="1">Teklif Gönderildi</option>
                      <option value="2">Teklif Alindi</option>
                    </CSelect>
                  </CFormGroup>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <CFormGroup>
                    <CLabel>Açıklama</CLabel>
                    <CTextarea
                      name="OfferDescription"
                      rows="4"
                      value={formData.OfferDescription}
                      onChange={handleInputChange}
                      placeholder="Açıklama giriniz..."
                      style={{ resize: 'none' }}
                    />
                  </CFormGroup>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <CButton 
                  color="danger" 
                  variant="outline"
                  onClick={handleCancel}
                >
                  İptal
                </CButton>
                <CButton color="success" type="button" onClick={handleSave}>
                  Kaydet
                </CButton>
              </div>
            </CForm>
          </CTabPane>

          <CTabPane data-tab="malzemeler">
            <CCard>
              <CCardBody>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <CInput
  type="text"
  placeholder="Malzeme No veya Adı ile Arama Yapın..."
  style={{ width: '300px' }}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Malzeme No</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Malzeme Adı</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>İstenilen Miktar</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Teklif Miktarı</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Birim</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Birim Fiyatı</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Kur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterialData.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{item.MaterialNo}</td>
                        <td style={{ padding: '12px' }}>{item.MaterialName}</td>
                        <td style={{ padding: '12px' }}>{item.OfferRequestedAmount}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="number"
                            value={item.OfferedAmount}
                            disabled={formData.OfferStatus != 2}
                            onChange={e => {
                                   const val = e.target.value === '' ? '' : Number(e.target.value);
                                   // Eğer val boş değilse ve 0'dan küçük veya eşitse uyarı ver
                                   if (val !== '' && val <= 0) {
                                     setModalMessages({
                                       ...modalMessages,
                                       warning: 'Lütfen miktarı sıfırdan büyük bir sayı giriniz!'
                                     });
                                     setModals({
                                       ...modals,
                                       warning: true
                                     });
                                     return; // Değer değiştirilmesini engelle
                                  }
                                   // Aksi halde normal şekilde kaydet
                                   handleMaterialChange(index, 'OfferedAmount', val);
                                 }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>{item.UnitID}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="number"
                            value={item.UnitPrice}
                            disabled={formData.OfferStatus != 2}
                            onChange={e => {
                                   const val = e.target.value === '' ? '' : Number(e.target.value);
                                   if (val !== '' && val <= 0) {
                                     setModalMessages({
                                       ...modalMessages,
                                       warning: 'Lütfen birim fiyatı sıfırdan büyük bir sayı giriniz!'
                                     });
                                     setModals({
                                       ...modals,
                                       warning: true
                                     });
                                     return;
                                   }
                                   handleMaterialChange(index, 'UnitPrice', val);
                                 }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <CSelect
                            value={item.Currency}
                            disabled={formData.OfferStatus != 2}
                            onChange={e => handleMaterialChange(index, 'Currency', e.target.value)}
                          >
                            <option value="TL">TL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </CSelect>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </CTabs>
      <CModal centered show={sheetModal} onClose={()=>setSheetModal(false)}>
        <CModalHeader closeButton>
          <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>Teklif Aktar</h5>
        </CModalHeader>
        <CModalBody>
          <Dropzone 
            accept={{"application/*": [".xlsx"]}} 
            multiple={false}
            onDropAccepted={async file=>{
              const wb = XLSX.read(await file[0].bytes(), {type: "array"});
              const tables = searchTables(wb, [["OfferDescription", "OfferDeadline", "OfferGroupID"], 
                                               ["MaterialID"],
                                               ["SupplierID"]]);
              const offerData = tables.find(t => t.find(r => r.OfferGroupID));
              const itemData = tables.find(t => t.find(r => r.MaterialID));
              const supplierData = tables.find(t => t.find(r => r.SupplierID));
              if(!(offerData && itemData && supplierData)) {
                console.error('Invalid sheet.');
                return;
              }
              var data = offerData[0];
              setFormData(prev => ({
                ...prev,
                OfferGroupID: data?.OfferGroupID || prev.OfferGroupID,
                OfferDeadline: data?.OfferDeadline || prev.OfferDeadline,
                OfferDate: data?.OfferDate || prev.OfferDeadline,
                OfferDescription: data?.OfferDescription || prev.OfferDescription,
                OfferStatus: [1, 2].find(s => s === data?.OfferStatus) || prev.OfferStatus,
                SupplierID: supplierData?.[0].SupplierID || prev.SupplierID,
                initialSupplier: supplierData?.[0].SupplierID || prev.SupplierID,
              }));
              setMaterialData(prev => prev.map(m => {
                const totalPrice = itemData.reduce((acc, cur) => cur.MaterialID === m.MaterialID ? acc + Number(cur.OfferedPrice) : acc, 0);
                const totalAmount = itemData.reduce((acc, cur) => cur.MaterialID === m.MaterialID ? acc + Number(cur.OfferedAmount) : acc, 0);
                return {
                  ...m,
                  OfferedPrice: totalPrice || m.OfferedPrice,
                  OfferedAmount: totalAmount || m.OfferedAmount,
                  UnitPrice: totalPrice && totalAmount ? Math.round(Number.EPSILON + 100 * totalPrice / totalAmount) / 100 : m.UnitPrice
                };
              }));
              setSheetModal(false);
            }}
          >
            {({getRootProps, getInputProps, isDragActive}) => (
              <div {...getRootProps()}
                style={{
                  display: "block",
                  border: "2px dashed #ccc",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: "4px",
                  backgroundColor: isDragActive ? "#f1f1f1" : "#ffffff",
                  transition: "background 0.1s"
                }}
                onMouseEnter={(e)=>e.target.style["background"] = "#f1f1f1"}
                onMouseLeave={(e)=>e.target.style["background"] = "#ffffff"}
                >
                  <input {...getInputProps()}/>
                  {/*
                     Bunu okuyan front-end'ciye,

                     Tam yazinin ustune sag tiklayinca falan rengi sabit kaliyo,
                     suna baksana sana zahmet, cozemedim.

                     Saygilar, mehme
                  */}
                  <h6 style={{fontSize: '16px'}}>Dosya Sürükle veya Tıkla</h6>
              </div>
            )}
          </Dropzone>
        </CModalBody>
        <CModalFooter>
        </CModalFooter>
      </CModal>

      <CustomModal
       show={modals.exit || modals.fillError || modals.success || modals.warning}

        onClose={() => {
          if (modals.success) {
            history.push('/satinalma/teklif-listesi');
          }
          setModals({ exit: false, fillError: false, success: false,warning: false });
        }}

        message={
             modals.warning 
     ? modalMessages.warning
          :modals.exit
            ? modalMessages.exit
            : modals.fillError
            ? modalMessages.fillError
            : modals.success
            ? modalMessages.success
            : ''
        }

         type={
             modals.warning || modals.exit || modals.fillError
               ? 'warning'
               : 'info'
           }

        showExitWarning={modals.exit}

        onExit={() => {
          if (modals.exit) {
            history.push('/satinalma/teklif-listesi');
          }
        }}
      />

    </div>



  );
};

export default TeklifForm;
