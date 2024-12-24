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

const TeklifForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('teklifBilgileri');
  const [materialData, setMaterialData] = useState([]);
  const [formData, setFormData] = useState({
    teklifNumarasi: '',
    tedarikci: '',
    teklifTarihi: '',
    teklifGecerlilikTarihi: '',
    terminTarihi: '',
    teklifGrupNo: '',
    firmaSorumlusu: '',
    teklifDurumu: 'Teklif Gönderildi',
    aciklama: ''
  });



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
                      name="teklifNumarasi"
                      value={formData.teklifNumarasi}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="teklifTarihi"
                      value={formData.teklifTarihi}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Termin Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="terminTarihi"
                      value={formData.terminTarihi}
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
                    <CSelect
                      name="tedarikci"
                      value={formData.tedarikci}
                      onChange={handleInputChange}
                    >
                      <option value="">Seçiniz...</option>
                      <option value="XXY Tedarikçi">XXY Tedarikçi</option>
                    </CSelect>
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
                      name="teklifGrupNo"
                      value={formData.teklifGrupNo}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Teklif Durumu</CLabel>
                    <CSelect
                      name="teklifDurumu"
                      value={formData.teklifDurumu}
                      onChange={handleInputChange}
                    >
                      <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                      <option value="Değerlendiriliyor">Değerlendiriliyor</option>
                      <option value="Onaylandı">Onaylandı</option>
                      <option value="Reddedildi">Reddedildi</option>
                    </CSelect>
                  </CFormGroup>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <CFormGroup>
                    <CLabel>Açıklama</CLabel>
                    <CTextarea
                      name="aciklama"
                      rows="4"
                      value={formData.aciklama}
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
                <CButton color="success" type="submit">
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
                        <td style={{ padding: '12px' }}>{item.RequestedAmount}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="text"
                            value={item.OfferAmount}
                            onChange={e => handleMaterialChange(index, 'OfferAmount', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>{item.UnitID}</td>
                        <td style={{ padding: '12px' }}>
                          <CInput
                            type="number"
                            value={item.UnitPrice}
                            onChange={e => handleMaterialChange(index, 'UnitPrice', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <CSelect
                            value={item.Currency}
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