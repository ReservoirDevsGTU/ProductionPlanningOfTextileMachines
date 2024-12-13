import CustomTable from '../../CustomTable.js'
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CInput, CButton, CModal, CModalHeader, CModalBody, CModalFooter, CCollapse } from '@coreui/react';
import '../css/TeklifListesi.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faPaperPlane, faPrint, faShoppingCart, faTasks, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';



const TeklifListesi = () => {

    const history = useHistory(); // useHistory() ile yönlendirme
    const [allSelected, setAllSelected] = useState(false);
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [modal, setModal] = useState(false);
    const [expandedSuppliers, setExpandedSuppliers] = useState({});
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
          { address: 'sales@xxy.com', selected: false },
        ],
      },
      {
        name: 'XYY Tedarikçi',
        emails: [
          { address: 'support@xyy.com', selected: true },
          { address: 'info@xyy.com', selected: false },
        ],
      },
    ]);


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
        item.supplier.toLowerCase().includes(search) ||
        item.offergroupno.toString().toLowerCase().includes(search) ||
        item.offerno.toString().toLowerCase().includes(search) ||
        item.requestno.toString().toLowerCase().includes(search) ||
        item.offerrequester.toLowerCase().includes(search)
        );
    }));


    const resetModal = () => {
      // Modal'ı kapattığımızda tüm durumları sıfırlıyoruz
      setExpandedSuppliers({});
      setSupplierData((prevData) =>
        prevData.map((supplier) => ({
          ...supplier,
          emails: supplier.emails.map((email) => ({ ...email, selected: true })), // Tüm mailleri tekrar seçili yap
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
      resetModal(); // Modal kapanırken resetle
      setModal(false);
    };


    const fields = [
        {key: 'checkbox', label:<input type="checkbox" checked={allSelected} onChange={(e) => handleSelectedAll(e.target.checked)} />, sorter: false, filter: false},
        {key: 'supplier', label:'Tedarikçi'},  
        {key: 'offerDate', label:'Teklif Tarihi'},  
        {key: 'offergroupno', label:'Teklif Grup No'}, 
        {key: 'offerno', label:'Teklif No'},  
        {key: 'requestno', label:'Talep No'},  
        {key: 'offerrequester', label:'Teklif İsteyen'},
        {key: 'status', label:'Durum'},  
        {key: 'button', label:<CButton>Seç</CButton>},  

        ];

      

    return (

        <div className='teklif-listesi-container'>

            <div className='header-title'>
                <h1>Teklif Listesi</h1>
                <hr />
            </div>
            
            <div className="button-toolbar">
              
            
              <div className="button-group-left">
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
                  Sipariş Oluştur
                </CButton>
                <CButton className="blue-button">
                  <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
                  Değerlendirmeye Al
                </CButton>
              </div>

              <div className="button-group-right">
                <CButton className="blue-button" onClick={() => setModal(true)}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </CButton>
                <CButton className="blue-button" >
                  <FontAwesomeIcon icon={faPrint} />
                </CButton>
                <CButton className="green-button">
                  <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '8px' }} />
                  Teklif Aktar
                </CButton>
              </div>
            </div>



            {/* MODAL */}
            <CModal show={modal} onClose={handleModalClose}>

              <CModalHeader closeButton>
                <h1 className="modal-header-title">Teklif Gönderme Formu</h1>
              </CModalHeader>
              <CModalBody className="c-modal-body-scrollable">
                {supplierData.map((supplier, supplierIndex) => (
                  <div key={supplierIndex} className="supplier-container">
                    <CButton
                      onClick={() => toggleSupplier(supplierIndex)}
                      className="supplier-button"
                    >
                      {supplier.name}
                      <FontAwesomeIcon
                        icon={
                          expandedSuppliers[supplierIndex]
                            ? faChevronUp
                            : faChevronDown
                        }
                        className="chevron-icon"
                      />
                    </CButton>
                    <CCollapse show={expandedSuppliers[supplierIndex]}>
                      <div className="email-container">
                        {supplier.emails.map((email, emailIndex) => (
                          <div key={emailIndex} className="email-item">
                            <label>
                              <input
                                type="checkbox"
                                checked={email.selected}
                                onChange={() =>
                                  toggleEmailSelection(supplierIndex, emailIndex)
                                }
                                className="email-checkbox"
                              />
                              {email.address}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CCollapse>
                  </div>
                ))}
              </CModalBody>
              <CModalFooter>
                <CButton color='danger' onClick={handleModalClose}>
                  Vazgeç
                </CButton>
                
                <CButton color='primary'>
                  Gönder
                </CButton>

              </CModalFooter>
            </CModal>





            <div className='search-bar-section'>
                <CInput
                type='text'
                placeholder='Arama Yapın...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="seach-bar"
                />
            </div>

            <div className='tablo'>
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
                </>) : (<div> <p> </p> </div>)
                };
            </div>

            
        </div>

    );
};


export default TeklifListesi;