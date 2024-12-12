import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput, CProgress, CCollapse, CCardBody } from '@coreui/react';
import '../css/SatinAlmaTalepleri.css';
import TalepEkleme from './TalepEkleme';
import axios from 'axios';
import baseURL from "./baseURL.js";
import CustomTable from '../../CustomTable.js';

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
    axios.post(baseURL + '/deleteRequest.php', new URLSearchParams({ request_id: selectedItem.RequestID }));
    setShowModal(false);
  };

  const handleEditClick = (item) => {
    history.push(`/satinalma/talep-duzenle/${item.RequestID}`);
  };

  return (
    <div className='satin-alma-talepleri-container'>
      {!showTalepEkleme && <h1 className='header-title'>Satın Alma Talepleri</h1>} 

      <hr className='hr'/>

      {!showTalepEkleme ? (
        <div>
          <div className="talep-ekle-container">
            <button onClick={handleTalepEkleClick} className="talep-ekle-buton-css">
              + Talep Ekle
            </button>

            <div className="search-bar-container">
              <CInput
                type="text"
                placeholder="Talep No, Talep Eden veya Açıklama Giriniz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
                style={{ width: "500px" }}
              />
            </div>
          </div>
          <CustomTable
            update={showModal === false}
            fetchAddr="/queryRequests.php"
            fields={[
              {label: '', key: 'show_materials'},
              {label: 'Duzenle', key: 'edit_buttons'},
              {label: 'Talep No', key: 'RequestID'},
              {label: 'TaleEden', key: 'UserName'},
              {label: 'Aciklama', key: 'RequestDescription'},
              {label: 'Durum', key: 'RequestStatus'},
              {label: 'Ilerleme', key: 'progress'}
            ]}
            scopedSlots={{
              'show_materials': (item) => (
                <td>
                  <button onClick={() => toggleRow(item.RequestID)}>
                    <FontAwesomeIcon icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />
                  </button>
                </td>
              ),
              'details': (item) => (
                <CCollapse show={expandedRows[item.RequestID]}><CCardBody>
                  <CustomTable
                    fields={[
                      {label: 'Malzeme No', key: 'MaterialNo'},
                      {label: 'Sucker No', key: 'SuckerNo'},
                      {label: 'Malzeme Adi', key: 'MaterialName'},
                      {label: 'Miktar', key: 'RequestedAmount'},
                      {label: 'Birim', key: 'UnitID'},
                    ]}
                    data={item.Materials}
                  />
                </CCardBody></CCollapse>),
              'edit_buttons': (item) => (
                <td>
                  <button
                    className="duzenle-butonlari duzenle-butonlari-duzenle"
                    onClick={() => handleEditClick(item)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="duzenle-butonlari duzenle-butonlari-sil"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                  <button className="duzenle-butonlari duzenle-butonlari-yazdir">
                    <FontAwesomeIcon icon={faPrint} />
                  </button>
                </td>
              ),
              'progress': (item) => (
                <td>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <CProgress value={item.progress || 50.5} style={{ backgroundColor: '#800000', border: '1px solid black' }} />
                    <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
                      {item.progress || 50.5}%
                    </span>
                  </div>
                </td>
              )
            }}
          />
        </div>
      ) : (
        <TalepEkleme/>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Silme Onayı</h2>
            <div className="modal-body">
              <p>'{selectedItem?.RequestID}' numaralı talebi silmek istediğinizden emin misiniz?</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={() => setShowModal(false)}>İptal</button>
              <button className="modal-button delete" onClick={confirmDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatinAlmaTalepleri;
