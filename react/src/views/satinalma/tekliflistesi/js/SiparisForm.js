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
import CustomTable from '../../CustomTable.js';
import SearchBox from '../../SearchBox.js';
import baseURL from '../../baseURL.js';
import { faTrash, faChevronDown, faChevronUp  } from "@fortawesome/free-solid-svg-icons";


const SiparisForm = (props) => {
  const { id } = useParams();
  const requestItems = props.location.requestItems;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('siparisBilgileri');
  const [materialData, setMaterialData] = useState([]);
  const [formData, setFormData] = useState({});

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterialToDelete, setSelectedMaterialToDelete] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [expandedSuppliers, setExpandedSuppliers] = useState({});

  useEffect(() => {
    id && axios.post(baseURL + "/queryOffers.php", {subTables: {Materials: {expand: false}}, filters: [{OfferID: [id]}]})
      .then(response => {
        const data = response.data[0];
        setFormData(prev => ({...prev, initialSupplier: data.SupplierID}));
        setSelectedMaterials(data.Materials.reduce((acc, cur) => {
          const exist = acc.find(m => m.MaterialID == cur.MaterialID);
          const amount = Number(cur.OfferedAmount) || Number(cur.RequestedAmount) || 0;
          const references = {OfferItemID: cur.OfferItemID, OfferedAmount: cur.OfferedAmount, RequestItemID: cur.RequestItemID, RequestedAmount: cur.RequestedAmount};
          if(!exist) {
            acc.push({...cur, OrderedAmount: amount, UnitPrice: 1, references: [references], final: true});
          }
          else {
            exist.OrderedAmount += amount;
            exist.references.push(references);
          }
          return acc;
        }, []));
      })
    || requestItems && setSelectedMaterials(requestItems.reduce((acc, cur) => {
          const exist = acc.find(m => m.MaterialID == cur.MaterialID);
          const amount = Number(cur.RequestedAmount) || 0;
          const references = {RequestItemID: cur.RequestItemID, RequestedAmount: cur.RequestedAmount};
          if(!exist) {
            acc.push({...cur, OrderedAmount: amount, UnitPrice: 1, references: [references], final: true});
          }
          else {
            exist.OrderedAmount += amount;
            exist.references.push(references);
          }
          return acc;
        }, []));

  }, [id]);

  const [supplierData, setSupplierData] = useState([
    {
      name: 'XXX Tedarikçi',
      emails: [
        { address: 'info@xxx.com', selected: true },
        { address: 'sales.person1@xxx.com', selected: true },
        { address: 'sales.person2@xxx.com', selected: true },
      ],
    },
    {
      name: 'XXY Tedarikçi',
      emails: [
        { address: 'contact@xxy.com', selected: true },
        { address: 'sales@xxy.com', selected: true },
      ],
    }
  ]);



  const toggleSupplier = (index) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleEmailSelection = (supplierIndex, emailIndex) => {
    setSupplierData((prevData) =>
      prevData.map((supplier, sIndex) =>
        sIndex === supplierIndex
          ? {
              ...supplier,
              emails: supplier.emails.map((email, eIndex) =>
                eIndex === emailIndex
                  ? { ...email, selected: !email.selected }
                  : email
              ),
            }
          : supplier
      )
    );
  };

  const handleSubmit = () => {
    if (formData.mailgonder) {
      setShowEmailModal(true);
    }
    const data = {
      ...formData,
      Materials: selectedMaterials.filter(m => m.final).reduce((acc, cur) => {
        if(cur.references) {
          const sum = cur.OrderedAmount;
          var remain = sum;
          const totalRequest = cur.references.reduce((acc, cur) => acc + (Number(cur.OfferedAmount) || Number(cur.RequestedAmount) || 0), 0);
          cur.references.forEach(r => {
            const request = Number(r.OfferedAmount) || Number(r.RequestedAmount);
            if(request) {
              const amt = Math.min(request, sum * request / totalRequest);
              acc.push({...cur, ...r, OrderedAmount: amt});
              remain -= amt;
            }
          });
          if(remain) {
            acc.push({...cur, OrderedAmount: remain, OfferItemID: null, RequestItemID: null});
          }
        }
        else {
          acc.push(cur);
        }
        return acc;
      }, [])
    };
    axios.post(baseURL + "/createOrder.php", data);
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setMaterialData(prev => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };

  const handleRemoveMaterial = () => {
    setSelectedMaterials((prev) =>
      prev.filter((m) => m.MaterialID !== selectedMaterialToDelete.MaterialID)
    );
    setShowModal(false);
  };

  return (
    <div style={{ padding: '20px' }}>
   
    <h1>Sipariş Formu</h1>

    <hr style={{ border: '1px solid #333', marginBottom: '20px' }} />


      <CTabs activeTab={activeTab} onActiveTabChange={idx => setActiveTab(idx)}>
        <CNav variant="tabs" style={{ marginBottom: '1rem' }}>
          <CNavItem>
            <CNavLink data-tab="siparisBilgileri">
              Sipariş Bilgileri
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="malzemeler">
              Malzemeler
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane data-tab="siparisBilgileri" style={{ backgroundColor: 'white', padding: '20px' }}>
            <CForm >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <CFormGroup>
                    <CLabel>Sipariş Numarası</CLabel>
                    <CInput
                      type="text"
                      name="siparisNumarasi"
                      value={formData.siparisNumarasi}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Sipariş Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="OrderDate"
                      value={formData.OrderDate}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Termin Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="OrderDeadline"
                      value={formData.OrderDeadline}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  
                </div>
                <div>
                  <CFormGroup>
                    <CLabel>Tedarikci Firma</CLabel>
                    <SearchBox fetchAddr="/querySuppliers.php" value="SupplierID" initialValue={formData.initialSupplier} label="SupplierName" onSelect={v=>setFormData(p=>({...p, SupplierID: v}))}/>
                  </CFormGroup>
                  <CFormGroup>
                    <CLabel>Sevk Tarihi</CLabel>
                    <CInput
                      type="date"
                      name="ShippingDate"
                      value={formData.ShippingDate}
                      onChange={handleInputChange}
                    />
                  </CFormGroup>
                  <CFormGroup 
                    style={{
                        paddingTop: '30px',  
                        paddingLeft: '50px', 
                        marginTop: '10px'    
                        }}>
                        <input
                            type="checkbox"
                            name="mailgonder"
                            defaultChecked={true}
                            value={formData.mailgonder}
                            onChange={handleInputChange}
                            style={{
                            width: '20px',
                            height: '20px',
                            verticalAlign: 'middle',
                            marginRight: '8px',
                            cursor: 'pointer'
                            }}
                        />
                    <CLabel style={{ 
                            verticalAlign: 'middle',
                            display: 'inline-block',
                            marginTop: '2px'
                        }}>E-Posta Gönderilsin</CLabel>
                    </CFormGroup>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <CFormGroup>
                    <CLabel>Notlar</CLabel>
                    <CTextarea
                      name="OrderNotes"
                      rows="4"
                      value={formData.OrderNotes}
                      onChange={handleInputChange}
                      placeholder="Not giriniz..."
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
                <CButton color="success" onClick={handleSubmit}>
                  Kaydet
                </CButton>
              </div>
            </CForm>
          </CTabPane>

          <CTabPane data-tab="malzemeler">        
          <div>
                    {/* Malzemeler */}
                    <h3 style={{marginTop:"20px", marginBottom:"20px"}}>Malzemeler</h3>

        <CTabs activeTab="selected">
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink data-tab="selected">Seçili Malzemeler</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink data-tab="all">Tüm Malzemeler</CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            {/* Seçili Malzemeler */}
            <CTabPane data-tab="selected">

        <CustomTable style={{ marginTop:"20px", width: "100%", borderCollapse: "collapse" }}
          data={selectedMaterials.filter(m=>m.final)}
          fields={[
            {label: "Sil", key: "delete"},
            {label: "Malzeme No", key: "MaterialNo"},
            {label: "Malzeme Adi", key: "MaterialName"},
            {label: "Sipariş Miktarı", key: "orderedAmount"},
            {label: "Birim", key: "UnitID"},
            {label: "Birim Fiyatı", key: "UnitPrice"},
            {label: "Kur", key: "currency"},
          ]}
          scopedSlots={{
            currency: () => (<td>TRY (placeholder)</td>),
            delete: (material) => (
                      <td>
                        <button
                          onClick={() => {
                            setShowModal(true);
                            setSelectedMaterialToDelete(material);
                          }}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
            ),
            orderedAmount: (material) => (
                      <td>
                        <input
                          type="number"
                          value={material.OrderedAmount}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              prev.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, OrderedAmount: Number(e.target.value)}
                                  : m
                              )
                            )
                          }
                          style={{
                            padding: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "100px",
                          }}
                        />
                      </td>
            ),
            UnitPrice: (material) => (
                <td>
                  <input
                    type="number"
                    value={material.UnitPrice}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              prev.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, UnitPrice: Number(e.target.value)}
                                  : m
                              )
                            )
                          }
                    style={{
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      width: "100px",
                    }}
                  />
                </td>
      ),
          }}
        />
            </CTabPane>

            {/* Tüm Malzemeler */}
            <CTabPane data-tab="all">
            <div>
        <CustomTable style={{ width: "100%", borderCollapse: "collapse" }}
          fetchAddr="/queryMaterials.php"
          fetchArgs={{columns: ["MaterialID"]}}
          fields={[
            {label: "", key: "select"},
            {label: "Malzeme No", key: "MaterialNo"},
            {label: "Malzeme Adi", key: "MaterialName"},
            {label: "Miktar", key: "offeredAmount"},
            {label: "Toplam Stok", key: "Quantity"},
            {label: "Birim", key: "UnitID"},
          ]}
          scopedSlots={{
            select: (material) => (
                      <td>
                        <input
                          type="checkbox"
                          disabled={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.final !== undefined}
                          checked={selectedMaterials.find(m => m.MaterialID === material.MaterialID) !== undefined}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              e.target.checked ? prev.concat([{...material, OfferedAmount: 1, RequestItemID: 0}])
                              : prev.filter(m => m.MaterialID !== material.MaterialID))
                          }
                        />
                      </td>
            ),
            offeredAmount: (material) => (
                      <td>
                        <input
                          type="number"
                          disabled={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.final !== undefined}
                          value={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.OfferedAmount || ""}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              prev.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, OfferedAmount: Number(e.target.value) }
                                  : m
                              )
                            )
                          }
                          style={{
                            padding: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "100px",
                          }}
                        />
                      </td>
            ),
          }}
        />

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <CButton
                  color="info"
                  variant="outline"
                  onClick={() => setSelectedMaterials((prev) => prev.map(m=>({...m, RequestedAmount: m.OfferedAmount, final: true})))}
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                    marginRight: "100px",
                  }}
                >
                  Listeye Ekle
                </CButton>
              </div>
            </div>
          </CTabPane>
          </CTabContent>
        </CTabs>

        </div>
        </CTabPane>
        </CTabContent>
      </CTabs>
      {showModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "400px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Silme Onayı</h2>
      <div
        style={{
          backgroundColor: "#f8d7da",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <p>
          '{selectedMaterialToDelete?.MaterialName}' malzemesini silmek
          istediğinizden emin misiniz?
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          İptal
        </button>
        <button
          onClick={handleRemoveMaterial}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sil
        </button>
      </div>
    </div>
  </div>
)}


<CModal show={showEmailModal} onClose={() => setShowEmailModal(false)} size="md" centered>
        <CModalHeader closeButton>
          <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>Sipariş Gönderme Formu</h5>
        </CModalHeader>

        <CModalBody style={{maxHeight: '500px', overflowY: 'auto'}}>
          {supplierData.map((supplier, supplierIndex) => (
            <div key={supplierIndex} style={{ marginBottom: '15px' }}>
              <CButton
                color="light"
                className="w-100 d-flex justify-content-between align-items-center"
                onClick={() => toggleSupplier(supplierIndex)}
              >
                <span style={{ fontSize: "16px" }}>
                  {supplier.name}
                </span>
                <FontAwesomeIcon
                  style={{color: 'black'}}
                  icon={expandedSuppliers[supplierIndex] ? faChevronUp : faChevronDown}
                />
              </CButton>

              {expandedSuppliers[supplierIndex] && (
                <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  {supplier.emails.map((email, emailIndex) => (
                    <div key={emailIndex} className="d-flex align-items-center mb-2">
                      <input
                        type="checkbox"
                        checked={email.selected}
                        onChange={() => toggleEmailSelection(supplierIndex, emailIndex)}
                        style={{ marginRight: '10px' }}
                      />
                      {email.address}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CModalBody>

        <CModalFooter>
          <CButton color="danger" onClick={() => setShowEmailModal(false)}>
            Vazgeç
          </CButton>
          <CButton color="info">Gönder</CButton>
        </CModalFooter>
      </CModal>


    </div>



  );
};

export default SiparisForm;
