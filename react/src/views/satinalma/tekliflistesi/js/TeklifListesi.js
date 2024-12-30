import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CInput, CButton, CCollapse, CModal, CCardBody, CModalHeader, CModalBody, CModalFooter } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileExcel,
  faPaperPlane,
  faPrint,
  faShoppingCart,
  faTasks,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import CustomTable from '../../CustomTable.js';
import axios from 'axios'; 
import baseURL from '../../satinalmatalepleri/js/baseURL.js';
import Dropzone from 'react-dropzone'
import * as XLSX from "xlsx";

const TeklifListesi = () => {
  const history = useHistory();
  const [selected, setSelected] = useState({});
  const [allSelected, setAllSelected] = useState(false);  
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedSuppliers, setExpandedSuppliers] = useState({});

  const [evaluationModal, setEvaluationModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [evaluator, setEvaluator] = useState('');
  const [explanation, setExplanation] = useState('');
  const [cancelOthers, setCancelOthers] = useState(false);  

  const [warningModal, setWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
        
  const [sheetModal, setSheetModal] = useState(false);


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
    },
    {
      name: 'XYY Tedarikçi',
      emails: [
        { address: 'support@xyy.com', selected: true },
        { address: 'info@xyy.com', selected: true },
      ],
    },
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
    },
    {
      name: 'XYY Tedarikçi',
      emails: [
        { address: 'support@xyy.com', selected: true },
        { address: 'info@xyy.com', selected: true },
      ],
    },
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
    },
    {
      name: 'XYY Tedarikçi',
      emails: [
        { address: 'support@xyy.com', selected: true },
        { address: 'info@xyy.com', selected: true },
      ],
    },
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
    },
    {
      name: 'XYY Tedarikçi',
      emails: [
        { address: 'support@xyy.com', selected: true },
        { address: 'info@xyy.com', selected: true },
      ],
    },
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
    },
    {
      name: 'XYY Tedarikçi',
      emails: [
        { address: 'support@xyy.com', selected: true },
        { address: 'info@xyy.com', selected: true },
      ],
    },
  ]);

  const isSingleSelected = Object.values(selected).filter(Boolean).length === 1;


  const openEvaluationModal = () => {
    const selectedOffers = data.filter(item => selected[item.OfferID]);
      
    if (selectedOffers.length === 0) {
      setWarningMessage('Lütfen değerlendirmeye almak için teklif seçiniz');
      setWarningModal(true);
      return;
    }
  
    // Tüm kullanıcıları bul ve unique olanları al
    const requester = [...new Set(selectedOffers.map(offer => offer.RequesterName))];
    setSelectedSuppliers(requester);
    setEvaluationModal(true);
  };

  const sendToEvaluation = () => {
    axios.post(baseURL + "/sendToEvaluation.php", {
        OfferID: Object.keys(selected).filter(id => selected[id]),
        cancelOthers: cancelOthers
    });
  }

  const toggleRow = (rowId) => {
    setExpandedRows((prevRows) => ({
      ...prevRows,
      [rowId]: !prevRows[rowId],
    }));
  };

  const setPaperPlaneButton = () => {
    setModal(true);
  };

  const processData = (newData) => {
    setAllSelected(!newData.find((i) => !selected[i.OfferID]));
    setData(newData);
  };

  const handleRowSelect = (itemId, isChecked) => {
    setSelected(prev => ({
      ...prev,
      [itemId]: isChecked
    }));
    setAllSelected(false);
  };
  
  const handleSelectedAll = (isChecked) => {
    const newSelected = {};
    data.forEach(item => {
      newSelected[item.OfferID] = isChecked;
    });
    setSelected(newSelected);
    setAllSelected(isChecked);
  };
  const filteredData = (data) =>
    selected.concat(
      data.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
          item.supplier.toLowerCase().includes(search) ||
          item.offergroupno.toString().toLowerCase().includes(search) ||
          item.offerno.toString().toLowerCase().includes(search) ||
          item.requestno.toString().toLowerCase().includes(search) ||
          item.offerrequester.toLowerCase().includes(search)
        );
      })
    );

  const resetModal = () => {
    setExpandedSuppliers({});
    setSupplierData((prevData) =>
      prevData.map((supplier) => ({
        ...supplier,
        emails: supplier.emails.map((email) => ({ ...email, selected: true })),
      }))
    );
  };

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

  const handleModalClose = () => {
    resetModal();
    setModal(false);
  };

  const fields = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => handleSelectedAll(e.target.checked)}
        />
      ),
      sorter: false,
      filter: false,
    },
    { key: 'show_materials', label: '' },
    { key: 'SupplierName', label: 'Tedarikçi' },
    { key: 'CreationDate', label: 'Teklif Tarihi' },
    { key: 'OfferGroupID', label: 'Teklif Grup No' },
    { key: 'OfferID', label: 'Teklif No' },
    { key: 'request_id', label: 'Talep No' },
    { key: 'RequesterName', label: 'Teklif İsteyen' },
    { key: 'OfferStatus', label: 'Durum' },
    { key: 'select', label:'Seç'}
  ];

  const checkAndCreateOrder = () => {
    const selectedOffers = data.filter(item => selected[item.OfferID]);
    
    if (selectedOffers.length === 0) {
      setWarningMessage('Lütfen sipariş oluşturmak için teklif seçiniz');
      setWarningModal(true);
      return;
    }
  
    const firstSupplier = selectedOffers[0].SupplierName;
    const hasDifferentSuppliers = selectedOffers.some(
      offer => offer.SupplierName !== firstSupplier
    );
  
    if (hasDifferentSuppliers) {
      setWarningMessage('Sadece aynı tedarikçiden alınan teklifler için sipariş oluşturulabilir!');
      setWarningModal(true);
      return;
    }
  
    const selectedOfferIds = selectedOffers.map(offer => offer.OfferID).join(',');
    
    history.push(`/satinalma/siparis-form/${selectedOfferIds}`);
  };

  const printSelectedOffer = async () => {
    const offerID = Object.keys(selected).find(k => selected[k]);
    axios.post(baseURL + "/queryOffers.php", {subTables:{Materials: {expand: false}, Details: {expand:true}}, filters: {OfferID: [offerID]}})
      .then(response => {
        const data = response.data[0];
        const printDetails = [{
          OfferID: data.OfferID,
          SupplierName: data.SupplierName,
          OfferDate: data.OfferDate,
          OfferDeadline: data.OfferDate,
          OfferGroupID: data.OfferGroupID,
          RequesterName: data.RequesterName,
          OfferStatus: data.OfferStatus
        }];
        const printItems = data.Materials.map(m => ({
          MaterialID: m.MaterialID,
          MaterialNo: m.MaterialNo,
          MaterialName: m.MaterialName,
          RequestID: m.RequestID,
          RequestedAmount: m.RequestedAmount,
          OfferRequestedAmount: m.OfferRequestedAmount,
          OfferedAmount: m.OfferedAmount,
          UnitID: m.UnitID,
          ItemStatus: m.ItemStatus
        }));
        var wb = XLSX.utils.book_new();
        const detailSheet = XLSX.utils.json_to_sheet(printDetails);
        const itemSheet = XLSX.utils.json_to_sheet(printItems);
        XLSX.utils.book_append_sheet(wb, detailSheet, "Details");
        XLSX.utils.book_append_sheet(wb, itemSheet, "Items");
        XLSX.writeFileXLSX(wb, "offer.xlsx");
    });
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Teklif Listesi</h1>
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
          <CButton color="info" variant='outline' size='lg' onClick={checkAndCreateOrder}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
            Sipariş Oluştur
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={openEvaluationModal}>
            <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
            Değerlendirmeye Al
          </CButton>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton color="info" variant='outline' size='lg' disabled={!isSingleSelected} onClick={setPaperPlaneButton}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </CButton>
          <CButton color="info" variant='outline' size='lg' disabled={!isSingleSelected} onClick={printSelectedOffer}>
            <FontAwesomeIcon icon={faPrint} />
          </CButton>
          <CButton color="success" variant='outline' size='lg' onClick={()=>setSheetModal(true)}>
            <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '8px' }} />
            Teklif Aktar
          </CButton>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
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

      <div>
        {filteredData.length > 0 ? (
          <CustomTable
            fetchAddr="/queryOffers.php"
            fetchArgs={{subTables:{Materials: {expand: false}, Details: {expand:true}}}}
            searchTerm={searchTerm}
            searchFields={["SupplierName", "OfferGroupID", "OfferID"]}
            onFetch={processData}
            fields={fields}
            scopedSlots={{
              'request_id': (item) => (
                <td>
                  {(item.Materials?.length > 0 ? Object.keys(item.Materials.reduce((acc, cur) => {
                      if(typeof cur.RequestID === 'number') acc = {...acc, [cur.RequestID]: 1}
                      return acc;
                    }, {})).join(', ') : false) || '-'}
                </td>),
              'show_materials': (item) => (
                <td>
                  <CButton
                    size='lg'
                    variant='outline'
                    color='secondary'
                    children={<FontAwesomeIcon style={{color: 'black'}} icon={expandedRows[item.RowID] ? faChevronUp : faChevronDown} />}
                    onClick={() => toggleRow(item.RowID)}
                  >
                  </CButton>
                </td>
              ),
              'details': (item) => (
                <CCollapse show={expandedRows[item.RowID]}>
                  <CCardBody>
                    <CustomTable
                      fields={[
                        { label: 'Malzeme No', key: 'MaterialNo' },
                        { label: 'Malzeme Adı', key: 'MaterialName' },
                        { label: 'İstenilen Miktar', key: 'OfferRequestedAmount' },
                        { label: 'Teklif Miktarı', key: 'OfferedAmount' },
                        { label: 'Birim', key: 'UnitID' },
                        { label: 'Birim Fiyatı', key: 'unit_price' },
                        { label: 'Kur', key: 'exchange_rate' },
                        { label: 'Durum', key: 'ItemStatus' },

                      ]}
                      data={item.Materials?.reduce((acc, cur) => {
                          const exist = acc.findIndex(e => e.MaterialID === cur.MaterialID);
                          if(exist !== -1) {
                            acc[exist].OfferedAmount = Number(cur.OfferedAmount)
                                                         + Number(acc[exist].OfferedAmount);
                            acc[exist].OfferRequestedAmount = Number(cur.OfferRequestedAmount)
                                                         + Number(acc[exist].OfferRequestedAmount);
                            acc[exist].OfferedPrice = Number(cur.OfferedPrice)
                                                      + Number(acc[exist].OfferedPrice);
                          }
                          else {
                            acc = acc.concat([{...cur}]);
                          }
                          return acc;
                        }, [])}
                      scopedSlots={{
                        'unit_price': (item) => (<td>{item.OfferedPrice ?
                              Math.round(Number.EPSILON + 100 * item.OfferedPrice / item.OfferedAmount) / 100
                              : '?'}</td>),
                        'exchange_rate': () => (<td>TRY (placeholder)</td>)
                      }}
                    />
                  </CCardBody>
                </CCollapse>
              ),
              checkbox: (item) => (
                <td>
                  <input
                    type="checkbox"
                    checked={!!selected[item.OfferID]}
                    onChange={(e) => handleRowSelect(item.OfferID, e.target.checked)}
                  />
                </td>
              ),
              'select' : (item) => (
                <td>
                  <CButton shape='square' variant='outline' color='primary' onClick={() => history.push(`/satinalma/teklif-form/${item.OfferID}`)}>
                    Seç
                  </CButton>
                </td>
              ),
            }}
          />
        ) : (
          <div>
            <p> </p>
          </div>
        )}
      </div>

      <CModal show={modal} onClose={handleModalClose} size="md" centered>
        <CModalHeader closeButton>
          <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>Teklif Gönderme Formu</h5>
        </CModalHeader>

        <CModalBody style={{maxHeight: '500px', overflowY: 'auto'}}>
          {supplierData.map((supplier, supplierIndex) => (
            <div key={supplierIndex} style={{ marginBottom: '15px' }}>
              <CButton
                color="light"
                className="w-100 d-flex justify-content-between align-items-center"
                onClick={() => toggleSupplier(supplierIndex)}
              >
              <span style={{  color: "", fontSize: "16px" }}>
                {supplier.name}
              </span>

                <FontAwesomeIcon
                  style={{color: 'black'}}
                  icon={expandedSuppliers[supplierIndex] ? faChevronUp : faChevronDown}
                />
              </CButton>

              <CCollapse show={expandedSuppliers[supplierIndex]}>
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
              </CCollapse>
            </div>
          ))}
        </CModalBody>

        <CModalFooter>
          <CButton color="danger"  onClick={handleModalClose}>
            Vazgeç
          </CButton>
          <CButton color="info" >Gönder</CButton>
        </CModalFooter>
      </CModal>



      <CModal show={evaluationModal} onClose={() => setEvaluationModal(false)} size="md" centered>
        <CModalHeader closeButton>
          <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>Değerlendirmeye Alma Formu</h5>
        </CModalHeader>

        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Değerlendiren:</label>
            <select className="form-select"
              style={{
                padding: '8px 12px',
                fontSize: '16px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                backgroundColor: '#fff',
                width: '100%',
              }}>
              {selectedSuppliers.map((supplier, index) => (
                <option key={index} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Açıklama:</label>
            <textarea
              className="form-control"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Açıklama..."
              rows={4}
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={cancelOthers}
              onChange={(e) => setCancelOthers(e.target.checked)}
              id="cancelOthers"
            />
            <label className="form-check-label" htmlFor="cancelOthers">
              Aynı Teklif Grubundaki Diğer Bekleyen Teklifleri İptal Et
            </label>
          </div>

          <div className="mt-2" style={{border: '1px dashed #ccc', padding: '10px', borderRadius: '5px'}}>
            <small className="text-muted">
              Bu seçenek seçildiğinde aynı teklif gruplarındaki işleme alınmayan diğer teklifler iptal edilecektir.
            </small>
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="danger" onClick={() => setEvaluationModal(false)}>
            Vazgeç
          </CButton>
          <CButton color="primary" onClick={sendToEvaluation}>Gönder</CButton>
        </CModalFooter>
      </CModal>



      <CModal 
  show={warningModal} 
  onClose={() => setWarningModal(false)} 
  size="md" 
  centered
>
  <CModalHeader closeButton>
    <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>Uyarı</h5>
  </CModalHeader>

  <CModalBody>
    <div className="d-flex align-items-center">
      <div style={{color: '#dc3545', marginRight: '15px'}}>
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x"/>
      </div>
      <div>
        {warningMessage}!
      </div>
    </div>
  </CModalBody>

  <CModalFooter>
    <CButton 
      color="secondary" 
      onClick={() => setWarningModal(false)}
    >
      Kapat
    </CButton>
  </CModalFooter>
</CModal>

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
              const offerData = XLSX.utils.sheet_to_json(wb.Sheets.Details);
              const itemData = XLSX.utils.sheet_to_json(wb.Sheets.Items);
              const supplierData = XLSX.utils.sheet_to_json(wb.Sheets.Suppliers);
              var data = offerData[0];
              if(!data.OfferDate) {
                const d = new Date();
                data.OfferDate = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + (d.getDay() + 1)).slice(-2);
              }
              if(!data.CreatedBy) {
                data.CreatedBy = data.RequestedBy;
              }
              data.Materials = itemData;
              data.Suppliers = supplierData;
              axios.post(baseURL + "/createOffer.php", data);
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
                  <h6 style={{fontSize: '16px'}}>Dosya Surukle veya Tikla</h6>
              </div>
            )}
          </Dropzone>
        </CModalBody>
        <CModalFooter>
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default TeklifListesi;
