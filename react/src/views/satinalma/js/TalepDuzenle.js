import React, { useState, useEffect } from "react";
import '../css/TalepEkleme.css';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming Axios is used for API requests
import baseURL from "./baseURL.js"; //add this file yourself in this directory like following:

const TalepDuzenle = () => {
  const { id } = useParams(); // Düzenlenecek talebin ID'si
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Seçilen malzemeleri tutar
  const [selectedButton, setSelectedButton] = useState('secili'); // Varsayılan olarak "Seçili Malzemeler" seçili
  const [allMaterials, setAllMaterials] = useState([]); // Tüm malzemeler
  const [users, setUsers] = useState([]); // Kullanıcılar
  
  const history = useHistory(); // Yönlendirme işlemleri için hook

  // Geri butonuna basıldığında önceki sayfaya dön
  const handleGoBack = () => {
    history.goBack(); // Tarayıcıda bir önceki sayfaya yönlendir
  };

  // Buton seçimlerini ayarla
  const handleButtonClick = (button) => {
    setSelectedButton(button);
  };

  const [requestDetails, setRequestDetails] = useState({ // Talep detaylarını tutar
    date: "", // Backendden gelecek
    requester: "", // Backendden gelecek
    description: "", // Backendden gelecek
  });

  // Fetch the specific request data and materials
  useEffect(() => {
    if (id) {
      // Fetch request details from the backend
      axios.get(baseURL + '/getRequestByID.php?id=' + id)
        .then((response) => {
          const data = response.data;
          // Set request details like date, requester, and description
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy, // Backend'den gelen talep eden
            description: data.RequestDescription,
          });
          console.log('Fetched request details:', data);
        })
        .catch((error) => console.error('Error fetching request details:', error));
      
      // Fetch materials related to this request
      axios.get(baseURL + '/getRequestsMaterials.php?id=' + id)
        .then((response) => {
          const materials = response.data;
          // Set selected materials related to this request
          setSelectedMaterials(materials || []); // Ensure it sets an empty array if no materials
          console.log('Fetched request materials:', materials);
        })
        .catch((error) => console.error('Error fetching request materials:', error));
  
      // Fetch all materials for adding new materials if needed
      axios.get(baseURL + '/listAllMaterials.php')
        .then((response) => {
          setAllMaterials(response.data);
        })
        .catch((error) => console.error('Error fetching materials:', error));
  
      // Fetch users for the requester dropdown
      axios.get(baseURL + '/listUsers.php')
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => console.error('Error fetching users:', error));
    }
  }, [id]);
  

  // Girdi değişikliklerini ayarla
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  //TODO
  };

  const handleOnayaGonder = () => {
  //TODO
  };

  // Malzeme seçimi
  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      if (prev.find((item) => item.id === material.id)) return prev; // Malzeme zaten seçiliyse ekleme
      return [...prev, { ...material, quantity: "" }];
    });
  };

  // Seçilen malzemeyi kaldır
  const handleRemoveMaterial = (id) => {
    setSelectedMaterials(selectedMaterials.filter((material) => material.id !== id));
  };

  // Miktar değişimi
  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => material.id === id ? { ...material, quantity } : material)
    );
  };

  // Görüntülenecek malzeme listesini belirle
  const displayedMaterials = selectedButton === 'secili' ? selectedMaterials : allMaterials;

  return (
    <div className="talep-container">
      <div className="button-group-container">
        <button className="btn-back" onClick={handleGoBack}>
          &#8592; Geri
        </button>
        <div className="fixed-button-group">
          <button className="btn btn-kaydet" onClick={handleSubmit}>Güncelle</button>
          <button className="btn btn-onaya-gonder" onClick={handleOnayaGonder}>Onaya Gönder</button>
        </div>
      </div>

      <h2>Talep Düzenle</h2>
      <div className="termin-requester">
        <div className="form-group">
          <label>Termin Tarihi</label>
          <input
            type="date"
            name="date"
            value={requestDetails.date} // Backend'den gelen veriler
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group requester-container">
          <label>Talep Eden</label>
          <select 
  name="requester"
  value={requestDetails.requester} // Backend'den gelen veriler (username olmalı)
  onChange={handleInputChange}
  required
>
  {/* Kullanıcılar yüklendiğinde backend'den gelen kullanıcıyı seçili olarak gösteriyoruz */}
  {users.length > 0 && (
    <>
      {/* Seçili kullanıcıyı buluyoruz ve onu seçili gösteriyoruz */}
      <option value={requestDetails.requester} selected>
        {users.find(user => user.name === requestDetails.requester)?.name || "Yükleniyor..."}
      </option>

      {/* Diğer kullanıcıları listeliyoruz, fakat requestDetails.requester ile eşleşen kullanıcıyı listelemiyoruz */}
      {users
        .filter(user => user.name !== requestDetails.requester) // Aynı kullanıcıyı eklemiyoruz
        .map((user) => (
          <option key={user.name} value={user.name}>
            {user.name}
          </option>
        ))}
    </>
  )}
</select>
        </div>
      </div>

      <div className="form-group" style={{ width: '100%' }}>
        <label>Açıklama</label>
        <textarea
          name="description"
          value={requestDetails.description} // Backend'den gelen veriler
          onChange={handleInputChange}
        ></textarea>
      </div>

      <h3>Malzemeler</h3>
      <div className="button-group">
        <button
          className={`btn-secili-malzemeler ${selectedButton === 'secili' ? 'active' : ''}`}
          onClick={() => handleButtonClick('secili')}
        >
          Seçili Malzemeler
        </button>
        <button
          className={`btn-tum-malzemeler ${selectedButton === 'tum' ? 'active' : ''}`}
          onClick={() => handleButtonClick('tum')}
        >
          Tüm Malzemeler
        </button>
      </div>

      <table className="material-table">
        <thead>
          <tr>
            <th>Malzeme No</th>
            <th>Malzeme Adı</th>
            <th>Toplam Stok</th>
            <th>Birim</th>
            <th>Miktar</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {displayedMaterials.map((material) => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              <td>{material.stock}</td>
              <td>{material.unitID}</td>
              <td>
                {selectedButton === 'secili' && (
                  <input
                    type="number"
                    value={material.quantity || ''} // Backend'den gelen veriler
                    onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                    min="1"
                  />
                )}
              </td>
              <td>
                {selectedButton === 'secili' ? (
                  <button onClick={() => handleRemoveMaterial(material.id)}>Sil</button>
                ) : (
                  <button onClick={() => handleMaterialSelect(material)}>Seç</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TalepDuzenle;
