import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import '../css/SatinAlmaTalepleri.css'; 
import TalepEkleme from './TalepEkleme'; // Talep ekleme bileşeni
import axios from 'axios';

const SatinAlmaTalepleri = () => {
  const [showModal, setShowModal] = useState(false); // Modalın görünürlüğünü kontrol eden state
  const [showTalepEkleme, setShowTalepEkleme] = useState(false); // Talep ekleme görünürlüğü
  const [selectedItem, setSelectedItem] = useState(null); // Silinecek item'in id'si
  const [tableData, setTableData] = useState([]);
  const history = useHistory(); // Yönlendirme için kullanılan hook

  // Talep ekleme formunu açma
  const handleTalepEkleClick = () => {
    setShowTalepEkleme(true); // Talep ekleme sayfasını göster
  };

  // Silme işlemini başlatmak için modalı aç
  const handleDeleteClick = (item) => {
    setSelectedItem(item); // Silinecek öğeyi belirle
    setShowModal(true); // Modalı aç
  };

  // Silme işlemini onayla
  const confirmDelete = () => {
    console.log(`Silinecek ID: ${selectedItem.id}`);
    setShowModal(false); // Modalı kapat
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/requestListing.php');
        setTableData(response.data);
      }
      catch(e) {}
    }
    fetchData();
  }, []);

  return (
    <div>
      {!showTalepEkleme && <h1>Satın Alma Talepleri</h1>} {/* Başlık, talep ekleme açık değilse gösterilecek */}
      
      {!showTalepEkleme ? (
        <div>
          {/* Talep Ekle butonu */}
          <button onClick={handleTalepEkleClick} className="talep-ekle-buton-css">
            + Talep Ekle
          </button>

          {/* Satın Alma Talebi içeriği */}
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
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button className="duzenle-butonlari duzenle-butonlari-duzenle">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="duzenle-butonlari duzenle-butonlari-sil"
                      onClick={() => handleDeleteClick(item)} // Silme işlemi başlatılıyor
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
        <TalepEkleme /> // Talep ekleme formu gösteriliyor
      )}

      {/* Silme Onay Modalı */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Silme Onayı</h2>
            <div className="modal-body">
              <p>'{selectedItem?.talepNo}' numaralı talebi silmek istediğinizden emin misiniz?</p>
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
