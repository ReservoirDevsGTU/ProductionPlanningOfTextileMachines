import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput } from '@coreui/react';
import '../css/SatinAlmaTalepleri.css'; 
import TalepEkleme from './TalepEkleme';
import axios from 'axios';
import baseURL from "./baseURL.js";

const SatinAlmaTalepleri = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTalepEkleme, setShowTalepEkleme] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const history = useHistory();

  const handleTalepEkleClick = () => {
    history.push('/satinalma/talep-ekleme');
  };

  const exitTalepEkleme = () => {
    setShowTalepEkleme(false);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(baseURL + '/requestListing.php');
      setTableData(response.data);
    } catch (e) {}
  };

  const confirmDelete = () => {
    axios.post(baseURL + '/deleteRequest.php', new URLSearchParams({ request_id: selectedItem.RequestID }));
    setShowModal(false);
    fetchData();
  };

  const handleEditClick = (item) => {
    history.push(`/satinalma/talep-duzenle/${item.RequestID}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = tableData.filter((item) =>
    item.RequestID.toString().includes(searchTerm) ||
    item.RequestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.RequestDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {!showTalepEkleme && <h1>Satın Alma Talepleri</h1>}
      
      {!showTalepEkleme ? (
        <div>
          <div className="talep-ekle-container">
            <button onClick={handleTalepEkleClick} className="talep-ekle-buton-css">
              + Talep Ekle
            </button>
            
            {/* Arama çubuğu */}
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

          <table className="tablo">
            <thead>
              <tr>
                <th>Düzenle</th>
                <th>Talep No</th>
                <th>Termin Tarihi</th>
                <th>Talep Eden</th>
                <th>Açıklama</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
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
                  <td>{item.RequestID}</td>
                  <td>{item.RequestDeadline}</td>
                  <td>{item.RequestedBy}</td>
                  <td>{item.RequestDescription}</td>
                  <td>{item.RequestStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <TalepEkleme exitFunc={exitTalepEkleme} />
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
