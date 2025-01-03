import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint, faChevronDown, faChevronUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput, CProgress, CCollapse, CCardBody, CButton } from '@coreui/react';
import TalepEkleme from './TalepEkleme';
import axios from 'axios';
import baseURL from "../../baseURL.js";
import CustomTable from '../../CustomTable.js';
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
    axios.post(baseURL + '/deleteRequest.php', {RequestID: selectedItem.RequestID});
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
        }}>
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
            fetchArgs={{subTables:{Materials: {expand:false}}}}
            searchTerm={searchTerm}
            searchFields={["RequestID", "UserName", "PurchaseDescription"]}
            fields={[
              { label: '', key: 'show_materials' },
              { label: 'Duzenle', key: 'edit_buttons' },
              { label: 'Talep No', key: 'RequestID' },
              { label: 'Talep Eden', key: 'UserName' },
              { label: 'Aciklama', key: 'RequestDescription' },
              { label: 'Durum', key: 'request_status' },
              { label: 'Ilerleme', key: 'progress' },
            ]}
            scopedSlots={{
              'request_status': (item) => (
                <td>{["Taslak",
                      "Onay Bekliyor",
                      "Onaylandi",
                      "Reddedildi",
                      "Kismi Onaylandi"
                     ][item.RequestStatus]}
                </td>
              ),
              'show_materials': (item) => (
                <td>
                  <CButton
                    size='lg'
                    variant='outline'
                    color='secondary'
                    children={<FontAwesomeIcon style={{color: 'black'}} icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />}
                    onClick={() => toggleRow(item.RequestID)}
                  >
                  </CButton>
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
                    disabled={item.RequestStatus != 0}
                    onClick={() => handleEditClick(item)}
                    children={<FontAwesomeIcon style={{color:'white'}} icon={faEdit} />}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      marginRight: '5px',

                    }}
                  >
                    
                  </CButton>
                  <CButton
                    size='lg'
                    color='danger'
                    disabled={item.RequestStatus != 0}
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

      {showModal && (
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
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '5px',
              width: '400px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>Silme Onayı</h2>
            <div style={{ marginBottom: '20px' }}>
              <p>
                '{selectedItem?.RequestID}' numaralı talebi silmek istediğinizden emin misiniz?
              </p>
            </div>
            <div>
              <CButton
                color='dark'
                variant='outline'
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                }}
              >
                İptal
              </CButton>
              <CButton
                color='danger'
                variant='outline'
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                Sil
              </CButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatinAlmaTalepleri;
