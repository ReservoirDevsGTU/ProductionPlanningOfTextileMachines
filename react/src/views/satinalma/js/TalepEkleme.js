import React, { useState, useEffect } from "react";
import '../css/TalepEkleme.css';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import baseURL from './baseURL.js';

const TalepEkleme = ({exitFunc}) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Seçilen malzemeleri tutar
  const [selectedButton, setSelectedButton] = useState('secili'); // Varsayılan olarak "Seçili Malzemeler" seçili
  const [allMaterials, setAllMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  
  const history = useHistory(); // Geçmişi kullanmak için hook

  // Geri butonuna basıldığında önceki sayfaya dön
  const handleGoBack = () => {
    history.push('/satinalma/talepler');
    //exitFunc();
  };

  // Buton seçimlerini ayarla
  const handleButtonClick = (button) => {
    setSelectedButton(button);
  };

  const [requestDetails, setRequestDetails] = useState({ // Talep detaylarını tutar
    date: "",
    requester: "",
    description: "",
  });

  // Malzeme seçimi
  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      // Malzeme zaten seçilmişse tekrar eklemez
      if (prev.find((item) => item.id === material.id)) return prev;
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

  // Girdi değişikliklerini ayarla
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Formu gönder
  const handleSubmit = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    axios.post(baseURL + '/addRequest.php', {
        RequestDeadline: requestDetails.date,
        RequestedBy: requestDetails.requester,
        CreatedBy: requestDetails.requester,
        RequestDescription: requestDetails.description,
        ManufacturingUnitID: 1,
        IsDraft: true,
        Materials: selectedMaterials.map((m) => ({
            MaterialID: m.id,
            RequestedAmount: m.quantity
        }))
    });
    console.log("Form Submitted: ", requestDetails, selectedMaterials);
  };

  // Talebi onaya gönder
  const handleOnayaGonder = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    axios.post(baseURL + '/addRequest.php', {
        RequestDeadline: requestDetails.date,
        RequestedBy: requestDetails.requester,
        CreatedBy: requestDetails.requester,
        RequestDescription: requestDetails.description,
        ManufacturingUnitID: 1,
        IsDraft: false,
        Materials: selectedMaterials.map((m) => ({
            MaterialID: m.id,
            RequestedAmount: m.quantity
        }))
    });
    console.log("Onaya Gönderildi: ", requestDetails, selectedMaterials);
    alert("Talebiniz onaya gönderildi.");
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(baseURL + '/listAllMaterials.php');
      setAllMaterials(response.data);
      const response1 = await axios.get(baseURL + '/listUsers.php');
      setUsers(response1.data);
    }
    catch(e) {}
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Görüntülenecek malzeme listesini belirle
  const displayedMaterials = selectedButton === 'secili' ? selectedMaterials : allMaterials;

  return (
    <div className="talep-container">
      <div className="button-group-container">
        <button className="btn-back" onClick={handleGoBack}>
          &#8592; Geri
        </button>
        <div className="fixed-button-group">
          <button className="btn btn-kaydet" onClick={handleSubmit}>Kaydet</button>
          <button className="btn btn-onaya-gonder" onClick={handleOnayaGonder}>Onaya Gönder</button>
        </div>
      </div>

      <h2>Satın Alma Talebi</h2>
      <div className="termin-requester">
        <div className="form-group">
          <label>Termin Tarihi</label>
          <input
            type="date"
            name="date"
            value={requestDetails.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group requester-container">
          <label>Talep Eden</label>
          <select 
            name="requester"
            value={requestDetails.requester}
            onChange={handleInputChange}
            required
          >
            <option value="">Seçiniz</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ width: '100%' }}>
        <label>Açıklama</label>
        <textarea
          name="description"
          value={requestDetails.description}
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
              <td>{material.quantity}</td>
              <td>{material.unitID}</td>
              <td>
                {selectedButton === 'secili' && (
                  <input
                    type="number"
                    value={material.quantity || ''}
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

export default TalepEkleme;
