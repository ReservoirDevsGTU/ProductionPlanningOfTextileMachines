import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint, faChevronDown, faChevronUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput, CProgress, CCollapse, CCardBody, CButton } from '@coreui/react';
import TalepEkleme from './TalepEkleme';
import axios from 'axios';
import baseURL from "../../baseURL.js";
import CustomTable from '../../CustomTable.js';
import CustomModal from '../../CustomModal.js'; 
import '@coreui/coreui/dist/css/coreui.min.css';

const SatinAlmaTalepleri = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTalepEkleme, setShowTalepEkleme] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const history = useHistory();

  const handleTalepEkleClick = () => {
    history.push('/satinalma/talep-ekleme');
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const toggleRow = (requestId) => {
    setExpandedRows((prevRows) => ({
      ...prevRows,
      [requestId]: !prevRows[requestId],
    }));
  };

  const confirmDelete = () => {
    axios.post(baseURL + '/deleteRequest.php', { RequestID: selectedItem.RequestID });
    setShowModal(false);
  };

  const handleEditClick = (item) => {
    history.push(`/satinalma/talep-duzenle/${item.RequestID}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      {!showTalepEkleme && (
        <h1>Satın Alma Talepleri</h1>
      )}

      <hr style={{ border: '1px solid #333', marginBottom: '20px' }} />

      {!showTalepEkleme ? (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <CButton
              onClick={handleTalepEkleClick}
              color='primary'
              variant='outline'
              size='lg'
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
              Talep Ekle
            </CButton>

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
            update={showModal === false}
            fetchAddr="/queryRequests.php"
            fetchArgs={{ subTables: { Materials: { expand: false } } }}
            searchTerm={searchTerm}
            searchFields={["RequestID", "UserName", "PurchaseDescription"]}
            fields={[
              { label: '', key: 'show_materials' },
              { label: 'Düzenle', key: 'edit_buttons' },
              { label: 'Talep No', key: 'RequestID' },
              { label: 'Talep Eden', key: 'UserName' },
              { label: 'Açıklama', key: 'RequestDescription' },
              { label: 'Durum', key: 'request_status' },
              { label: 'İlerleme', key: 'progress' },
            ]}
            scopedSlots={{
              'request_status': (item) => (
                <td>{["Taslak", "Onay Bekliyor", "Onaylandı", "Reddedildi", "Kısmi Onaylandı"][item.RequestStatus]}</td>
              ),
              'show_materials': (item) => (
                <td>
                  <CButton
                    size='lg'
                    variant='outline'
                    color='secondary'
                    children={<FontAwesomeIcon style={{ color: 'black' }} icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />}
                    onClick={() => toggleRow(item.RequestID)}
                  />
                </td>
              ),
              'details': (item) => (
                <CCollapse show={expandedRows[item.RequestID]}>
                  <CCardBody>
                    <CustomTable
                      fields={[
                        { label: 'Malzeme No', key: 'MaterialNo' },
                        { label: 'Sucker No', key: 'SuckerNo' },
                        { label: 'Malzeme Adi', key: 'MaterialName' },
                        { label: 'Miktar', key: 'RequestedAmount' },
                        { label: 'Birim', key: 'UnitID' },
                      ]}
                      data={item.Materials}
                    />
                  </CCardBody>
                </CCollapse>
              ),
              'edit_buttons': (item) => (
                <td>
                  <CButton
                    size='lg'
                    color='info'
                    disabled={item.RequestStatus !== 0}
                    onClick={() => handleEditClick(item)}
                    children={<FontAwesomeIcon style={{ color: 'white' }} icon={faEdit} />}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      marginRight: '5px',
                    }}
                  />
                  <CButton
                    size='lg'
                    color='danger'
                    disabled={item.RequestStatus !== 0}
                    onClick={() => handleDeleteClick(item)}
                    style={{
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      marginRight: '5px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </CButton>
                  <CButton
                    size='lg'
                    color='warning'
                    style={{
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <FontAwesomeIcon icon={faPrint} />
                  </CButton>
                </td>
              ),
              'progress': (item) => (
                <td>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <CProgress
                      value={item.progress || 50.5}
                      style={{
                        backgroundColor: '#800000',
                        border: '1px solid black',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                      }}
                    >
                      {item.progress || 50.5}%
                    </span>
                  </div>
                </td>
              ),
            }}
          />
        </div>
      ) : (
        <TalepEkleme />
      )}

      {/* CustomModal ile onaylama işlemi */}
      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={`'${selectedItem?.RequestID}' numaralı talebi silmek istediğinizden emin misiniz?`}
        type="warning"
        showExitWarning
        onExit={confirmDelete}
        title="Silme Onayı"
      />
    </div>
  );
};

export default SatinAlmaTalepleri;
