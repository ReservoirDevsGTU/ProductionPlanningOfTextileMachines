import React, { useState, useEffect } from "react";
import '../css/TalepEkleme.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { CInput } from '@coreui/react';
import axios from 'axios';
import baseURL from './baseURL.js';

const TalepEkleme = ({ exitFunc }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Seçili malzemeler listesi
  const [allMaterials, setAllMaterials] = useState([]); // Tüm malzemeler listesi
  const [users, setUsers] = useState([]);
  const [selectedButton, setSelectedButton] = useState('secili'); // Varsayılan olarak "Seçili Malzemeler"
  const [searchTerm, setSearchTerm] = useState(''); // Arama çubuğu için

  const history = useHistory();

  const handleGoBack = () => {
    history.push('/satinalma/talepler');
  };

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setSearchTerm(''); // Düğme değişince arama terimini temizler
  };

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      if (prev.find((item) => item.id === material.id)) return prev;
      return [...prev, { ...material, quantity: "" }];
    });
  };

  const handleRemoveMaterial = (id) => {
    setSelectedMaterials(selectedMaterials.filter((material) => material.id !== id));
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => material.id === id ? { ...material, quantity } : material)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
  };

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
    alert("Talebiniz onaya gönderildi.");
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(baseURL + '/listAllMaterials.php');
      setAllMaterials(response.data);
      const response1 = await axios.get(baseURL + '/listUsers.php');
      setUsers(response1.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Arama çubuğuna göre filtrelenmiş malzeme listesi
  const filteredMaterials = (selectedButton === 'secili' ? selectedMaterials : allMaterials).filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.id.toString().includes(searchTerm)
  );

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
      {/* Seçili Malzemeler Butonu */}
      <button
        className={`btn-secili-malzemeler ${selectedButton === 'secili' ? 'active' : ''}`}
        onClick={() => handleButtonClick('secili')}
      >
        Seçili Malzemeler
      </button>

      {/* Tüm Malzemeler Butonu */}
      <button
        className={`btn-tum-malzemeler ${selectedButton === 'tum' ? 'active' : ''}`}
        onClick={() => handleButtonClick('tum')}
      >
        Tüm Malzemeler
      </button>

      {/* Arama Çubuğu */}
      <div className="arama-bari-container">
        <CInput
          type="text"
          placeholder="Malzeme No veya Adı Giriniz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

      {/* Malzeme Tablosu */}
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
          {filteredMaterials.map((material) => (
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
