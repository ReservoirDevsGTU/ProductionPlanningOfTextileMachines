import React, { useState } from "react";
import '../css/TalepEkleme.css';  // CSS dosyasını dahil ediyoruz
import { useHistory } from 'react-router-dom';  // useHistory'yi ekledik

const TalepEkleme = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedButtonTop, setSelectedButtonTop] = useState('secili'); // Üst grup için varsayılan
  const [selectedButtonBottom, setSelectedButtonBottom] = useState('secili'); // Alt grup için varsayılan
  const [allMaterials] = useState([
    //DATABASE
    { id: 1, name: "XXX", stock: 10, unit: "Adet" },
    { id: 2, name: "XXY", stock: 100, unit: "Metre" },
    { id: 3, name: "XYY", stock: 55, unit: "Litre" },
  ]);

  const history = useHistory(); // Geri yönlendirme hook'u

  const handleGoBack = () => {
    history.goBack(); // Önceki sayfaya dön
  };

  const handleButtonClickTop = (button) => {
    setSelectedButtonTop(button); // Üst grup butonunu ayarla
  };

  const handleButtonClickBottom = (button) => {
    setSelectedButtonBottom(button); // Alt grup butonunu ayarla
  };

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) =>
      prev.find((item) => item.id === material.id)
        ? prev
        : [...prev, { ...material, quantity: "" }]
    );
  };

  const handleRemoveMaterial = (id) => {
    setSelectedMaterials(selectedMaterials.filter((material) => material.id !== id));
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) =>
        material.id === id ? { ...material, quantity } : material
      )
    );
  };

  const handleInputChange = (e) => {
    setRequestDetails({
      ...requestDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Form doğrulama
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    console.log("Form Submitted: ", requestDetails, selectedMaterials);
  };

  return (
    <div className="talep-container">
      {/* Geri dön butonu */}
      <button className="btn-back" onClick={handleGoBack}>
        &#8592; Geri
      </button>

      <h2>Satın Alma Talebi</h2>
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
      <div className="form-group">
        <label>Talep Eden</label>
        <input
          type="text"
          name="requester"
          value={requestDetails.requester}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
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
          className={`btn-secili-malzemeler ${selectedButtonTop === 'secili' ? 'active' : ''}`}
          onClick={() => handleButtonClickTop('secili')}
        >
          Seçili Malzemeler
        </button>
        <button
          className={`btn-tum-malzemeler ${selectedButtonTop === 'tum' ? 'active' : ''}`}
          onClick={() => handleButtonClickTop('tum')}
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
            <th>Seç</th>
          </tr>
        </thead>
        <tbody>
          {allMaterials.map((material) => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              <td>{material.stock}</td>
              <td>{material.unit}</td>
              <td>
                <button onClick={() => handleMaterialSelect(material)}>Seç</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Seçili Malzemeler</h3>
      <div className="button-group">
        <button
          className={`btn-secili-malzemeler ${selectedButtonBottom === 'secili' ? 'active' : ''}`}
          onClick={() => handleButtonClickBottom('secili')}
        >
          Seçili Malzemeler
        </button>
        <button
          className={`btn-tum-malzemeler ${selectedButtonBottom === 'tum' ? 'active' : ''}`}
          onClick={() => handleButtonClickBottom('tum')}
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
          {selectedMaterials.map((material) => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              <td>{material.stock}</td>
              <td>{material.unit}</td>
              <td>
                <input
                  type="number"
                  value={material.quantity}
                  onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                  min="1"
                />
              </td>
              <td>
                <button onClick={() => handleRemoveMaterial(material.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="fixed-button-group">
        <button className="btn btn-kaydet" onClick={handleSubmit}>Kaydet</button>
        <button className="btn btn-onaya-gonder">Onaya Gönder</button>
      </div>
    </div>
  );
};

export default TalepEkleme;
