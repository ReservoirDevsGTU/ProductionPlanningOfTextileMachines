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
} from '@fortawesome/free-solid-svg-icons';
import CustomTable from '../../CustomTable.js';

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
    const selectedOffers = data.filter(item => selected[item.RowID]);
    
    if (selectedOffers.length === 0) {
      alert('Lütfen değerlendirmeye almak için teklif seçiniz');
      return;
    }
  
    const suppliers = [...new Set(selectedOffers.map(offer => offer.SupplierName))];
    setSelectedSuppliers(suppliers);
    setEvaluationModal(true);
  };

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
    setAllSelected(!newData.find((i) => !selected[i.RequestItemID]));
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
      newSelected[item.RowID] = isChecked;
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
    //{ key: 'RequestID', label: 'Talep No' },
    { key: 'RequesterName', label: 'Teklif İsteyen' },
    { key: 'OfferStatus', label: 'Durum' },
    { key: 'select', label:'Seç'}
  ];

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
          <CButton color="info" variant='outline' size='lg'>
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
            Sipariş Oluştur
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={openEvaluationModal}>
            <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
            Değerlendirmeye Al
          </CButton>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton color="info" variant='outline' size='lg' onClick={setPaperPlaneButton}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </CButton>
          <CButton color="info" variant='outline' size='lg' disabled={!isSingleSelected}>
            <FontAwesomeIcon icon={faPrint} />
          </CButton>
          <CButton color="success" variant='outline' size='lg' disabled={!isSingleSelected}>
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
                        { label: 'İstenilen Miktar', key: 'RequestedAmount' },
                        { label: 'Teklif Miktarı', key: 'OfferedAmount' },
                        { label: 'Birim', key: 'UnitID' },
                        { label: 'Birim Fiyatı', key: 'UnitPrice' },
                        { label: 'Kur', key: 'exchangerate' },
                        { label: 'Durum', key: 'status' },

                      ]}
                      data={item.Materials}
                    />
                  </CCardBody>
                </CCollapse>
              ),
              checkbox: (item) => (
                <td>
                  <input
                    type="checkbox"
                    checked={!!selected[item.RowID]}
                    onChange={(e) => handleRowSelect(item.RowID, e.target.checked)}
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
          <CButton color="primary">Gönder</CButton>
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default TeklifListesi;
