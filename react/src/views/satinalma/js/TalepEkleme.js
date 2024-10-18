import React, { useState } from "react";
import '../css/TalepEkleme.css';
import { useHistory } from 'react-router-dom';

const TalepEkleme = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Seçilen malzemeleri tutar
  const [selectedButton, setSelectedButton] = useState('secili'); // Varsayılan olarak "Seçili Malzemeler" seçili
  const [allMaterials] = useState([ // Tüm malzemeler
    { id: 1, name: "XXX", stock: 10, unit: "Adet" },
    { id: 2, name: "XXY", stock: 100, unit: "Metre" },
    { id: 3, name: "XYY", stock: 55, unit: "Litre" },
  ]);
  
  const history = useHistory(); // Geçmişi kullanmak için hook

  // Geri butonuna basıldığında önceki sayfaya dön
  const handleGoBack = () => {
    history.goBack();
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
    console.log("Form Submitted: ", requestDetails, selectedMaterials);
  };

  // Talebi onaya gönder
  const handleOnayaGonder = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    console.log("Onaya Gönderildi: ", requestDetails, selectedMaterials);
    alert("Talebiniz onaya gönderildi.");
  };

  const users = [ // Kullanıcı listesi
    { id: 1, name: "Kullanıcı 1" },
    { id: 2, name: "Kullanıcı 2" },
    { id: 3, name: "Kullanıcı 3" },
  ];

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
              <option key={user.id} value={user.name}>
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
              <td>{material.stock}</td>
              <td>{material.unit}</td>
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
