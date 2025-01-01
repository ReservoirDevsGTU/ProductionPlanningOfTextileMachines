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
  CTabPane
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import SearchBox from '../../SearchBox.js';
import baseURL from '../../baseURL.js';

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

  if(!OfferID) history.goBack();

  useEffect(() => {
    axios.post(baseURL + "/queryOffers.php", {filters: {OfferID: [OfferID]}, subTables: {Materials: {expand: false}, Details: {expand: true}}})
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

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Teklif Formu</h3>
        <CButton color="success" size='lg' variant="outline">
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
                  onClick={() => history.push('/satinalma/teklif-listesi')}
                >
                  İptal
                </CButton>
                <CButton color="success" type="button" onClick={submitForm}>
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
                    placeholder="Arama Yapın..."
                    style={{ width: '200px' }}
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
                    {materialData.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{item.MaterialNo}</td>
                        <td style={{ padding: '12px' }}>{item.MaterialName}</td>
                        <td style={{ padding: '12px' }}>{item.OfferRequestedAmount}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="number"
                            value={item.OfferedAmount}
                            disabled={formData.OfferStatus !== 2}
                            onChange={e => handleMaterialChange(index, 'OfferedAmount', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>{item.UnitID}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="number"
                            value={item.UnitPrice}
                            disabled={formData.OfferStatus !== 2}
                            onChange={e => handleMaterialChange(index, 'UnitPrice', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <CSelect
                            value={item.Currency}
                            disabled={formData.OfferStatus !== 2}
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
    </div>
  );
};

export default TeklifForm;
