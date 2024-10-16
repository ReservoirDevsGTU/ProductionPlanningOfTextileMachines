import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPrint } from '@fortawesome/free-solid-svg-icons';
import '../css/SatinAlmaTalepleri.css'; 

const SatinAlmaTalepleri = () => {
  const [showModal, setShowModal] = useState(false); // Modal için state
  const [selectedItem, setSelectedItem] = useState(null); // Silinecek öğe için state

  // Backend'den gelecek veri
  const data = [
    {
      id: 1,
      talepNo: '3131',
      terminTarihi: '11/11/2024',
      talepEden: 'Mehmet Emin',
      aciklama: 'evet',
      durum: 'Onay Bekliyor',
    },
    {
      id: 2,
      talepNo: '3132',
      terminTarihi: '12/12/2024',
      talepEden: 'Batuhan',
      aciklama: 'tamam',
      durum: 'Onaylandı',
    },
    {
      id: 3,
      talepNo: '3133',
      terminTarihi: '10/10/2024',
      talepEden: 'Çağrı',
      aciklama: 'olmadı',
      durum: 'Ret',
    },
  ];

  const handleDeleteClick = (item) => {
    setSelectedItem(item); // Silinecek öğeyi belirle
    setShowModal(true); // Modalı aç
  };

  const confirmDelete = () => {
    // Burada silme işlemi yapılır
    console.log(`Silinecek ID: ${selectedItem.id}`);
    setShowModal(false); // Modalı kapat
  };

  return (
    <div>
      <h1>Satın Alma Talepleri</h1>
      <button className="talep-ekle-buton-css">+ Talep Ekle</button>

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
          {data.map((item) => (
            <tr key={item.id}>
              <td>
                <button className="duzenle-butonlari duzenle-butonlari-duzenle">
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
              <td>{item.talepNo}</td>
              <td>{item.terminTarihi}</td>
              <td>{item.talepEden}</td>
              <td>{item.aciklama}</td>
              <td>{item.durum}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
