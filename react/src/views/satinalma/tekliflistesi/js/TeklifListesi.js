import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CInput, CButton, CCollapse } from '@coreui/react';
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

  const setPaperPlaneButton = () => {
    setModal(true);
  };

  const processData = (newData) => {
    setAllSelected(!newData.find((i) => !selected[i.RequestItemID]));
    setData(newData);
  };

  const handleSelectedAll = (isChecked) => {
    const updatedSelected = data.reduce((acc, cur) => {
      return { ...acc, [cur.RequestItemID]: isChecked };
    }, {});
    setSelected(updatedSelected);
    setAllSelected(isChecked);
  };

  const handleRowSelect = (item, isChecked) => {
    setSelected((prevSelected) => ({
      ...prevSelected,
      [item]: isChecked,
    }));
    setAllSelected(!data.find((i) => !selected[i.RequestItemID]));
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
    { key: 'supplier', label: 'Tedarikçi' },
    { key: 'offerDate', label: 'Teklif Tarihi' },
    { key: 'offergroupno', label: 'Teklif Grup No' },
    { key: 'offerno', label: 'Teklif No' },
    { key: 'requestno', label: 'Talep No' },
    { key: 'offerrequester', label: 'Teklif İsteyen' },
    { key: 'status', label: 'Durum' },
    { key: 'button', label: <CButton>Seç</CButton> },
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
          <CButton color="info" variant='outline' size='lg'>
            <FontAwesomeIcon icon={faTasks} style={{ marginRight: '8px' }} />
            Değerlendirmeye Al
          </CButton>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton color="info" variant='outline' size='lg' onClick={setPaperPlaneButton}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </CButton>
          <CButton color="info" variant='outline' size='lg'>
            <FontAwesomeIcon icon={faPrint} />
          </CButton>
          <CButton color="success" variant='outline' size='lg'>
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
            fetchAddr="/queryRequests.php"
            onFetch={processData}
            fetchArgs={{ expand: true }}
            fields={fields}
            scopedSlots={{
              checkbox: (item) => (
                <td>
                  <input
                    type="checkbox"
                    checked={selected[item.RequestItemID]}
                    onChange={(e) => handleRowSelect(item.RequestItemID, e.target.checked)}
                  />
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

      {modal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '5px',
              width: '400px',
              maxHeight: '90vh',
              overflowY: 'auto',
              textAlign: 'center',
            }}
          >
            <h1 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              Teklif Gönderme Formu
            </h1>
            <div style={{ marginBottom: '20px' }}>
              {supplierData.map((supplier, supplierIndex) => (
                <div key={supplierIndex} style={{ marginBottom: '15px' }}>
                  <button
                    onClick={() => toggleSupplier(supplierIndex)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {supplier.name}
                    <FontAwesomeIcon
                      icon={expandedSuppliers[supplierIndex] ? faChevronUp : faChevronDown}
                    />
                  </button>
                  {expandedSuppliers[supplierIndex] && (
                    <div
                      style={{
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        marginTop: '10px',
                      }}
                    >
                      {supplier.emails.map((email, emailIndex) => (
                        <div
                          key={emailIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={email.selected}
                            onChange={() =>
                              toggleEmailSelection(supplierIndex, emailIndex)
                            }
                            style={{ marginRight: '10px' }}
                          />
                          {email.address}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <button
                onClick={handleModalClose}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Vazgeç
              </button>
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeklifListesi;
