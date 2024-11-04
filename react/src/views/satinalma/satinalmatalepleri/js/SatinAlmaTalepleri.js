import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput, CProgress } from '@coreui/react';
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
  const [expandedRows, setExpandedRows] = useState({});
  const [materialsData, setMaterialsData] = useState({});
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
      const updatedData = response.data.map(item => ({
        ...item,
        progress: item.progress || 50.5
      }));
      setTableData(updatedData);
    } catch (e) {
      console.error("Veri çekilirken hata oluştu:", e);
    }
  };

  // MALZEMELERİ ÇEK
  const fetchMaterials = async (requestId) => {
    try {
      const response = await axios.get(`${baseURL}/getRequestsMaterials.php`, {
        params: { request_id: requestId },
      });
      setMaterialsData((prevData) => ({
        ...prevData,
        [requestId]: response.data,
      }));
    } catch (e) {
      console.error("Malzeme verisi alınırken hata oluştu:", e);
    }
  };

  const toggleRow = (requestId) => {
    setExpandedRows((prevRows) => ({
      ...prevRows,
      [requestId]: !prevRows[requestId],
    }));

    if (!materialsData[requestId]) {
      fetchMaterials(requestId);
    }
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
                <th></th>
                <th>Düzenle</th>
                <th>Talep No</th>
                <th>Termin Tarihi</th>
                <th>Talep Eden</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>İlerleme</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <React.Fragment key={item.RequestID}>
                  <tr>
                    <td>
                      <button onClick={() => toggleRow(item.RequestID)}>
                        <FontAwesomeIcon icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />
                      </button>
                    </td>
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
                    <td>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <CProgress value={item.progress || 0} style={{ backgroundColor: '#800000', border: '1px solid black' }} />
                        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
                          {item.progress || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[item.RequestID] && (
                    <tr>
                      <td colSpan="8">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h3>Malzemeler</h3>
                          <CInput
                            type="text"
                            placeholder="Malzeme Ara..."
                            // Burada malzeme arama terimini state'e ekleyip kullanabilirsiniz
                            onChange={(e) => {/* Malzeme arama işlemi */ }}
                            style={{ width: "300px" }} // Genişlik ayarlarını ihtiyacınıza göre düzenleyin
                          />
                        </div>
                        <table className="malzemeler-tablo" style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th>Malzeme No</th>
                              <th>Sucker No</th>
                              <th>Malzeme Adı</th>
                              <th>Miktar</th>
                              <th>Birim</th>
                            </tr>
                          </thead>
                          <tbody>
                            
                            {materialsData[item.RequestID]?.map((material) => (
                              <tr key={material.MaterialID}>
                                <td>{material.MaterialID}</td>
                                <td>{material.SuckerNo}</td>
                                <td>{material.MaterialName}</td>
                                <td>{material.Quantity}</td>
                                <td>{material.Unit}</td>
                              </tr>
                            )) || (
                                <tr>
                                  <td colSpan="5">Yükleniyor...</td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
