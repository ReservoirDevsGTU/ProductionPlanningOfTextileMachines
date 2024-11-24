import React, { useState } from "react";
import "../css/TeklifIsteme.css";

const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState("teklifBilgileri"); // Başlangıçta teklif bilgileri sekmesi açık
  const [tedarikciTab, setTedarikciTab] = useState("seciliTedarikciler");  // Tedarikçi sekmesi için yeni bir state

  const [formData, setFormData] = useState({
    teklifTarihi: "",
    terminTarihi: "",
    teklifIsteyen: "",
    teklifGrupNo: "",
    aciklama: "",
  });

  const [tedarikciler, setTedarikciler] = useState([
    { id: 1, code: "XXX", name: "XXX XXX", phone: "XXX XXX", email: "xxx@xxx.com", address: "Adres 1" },
    { id: 2, code: "XXY", name: "XXY XXY", phone: "XXX XXX", email: "xxy@xxy.com", address: "Adres 2" },
    { id: 3, code: "YYZ", name: "YYZ YYZ", phone: "XXX XXX", email: "yyz@yyz.com", address: "Adres 3" },
    // Diğer tedarikçiler burada olacak
  ]);

  const [selectedTedarikciler, setSelectedTedarikciler] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTedarikciSelect = (id) => {
    const selectedTedarikci = tedarikciler.find((tedarikci) => tedarikci.id === id);
    if (!selectedTedarikciler.includes(selectedTedarikci)) {
      setSelectedTedarikciler([...selectedTedarikciler, selectedTedarikci]);
    }
  };

  const handleTedarikciDeselect = (id) => {
    setSelectedTedarikciler(selectedTedarikciler.filter((tedarikci) => tedarikci.id !== id));
  };

  return (
    <div className="teklif-isteme-container">
      {/* Sekme Geçişi */}
      <div className="tabs">
        <button
          className={activeTab === "teklifBilgileri" ? "active" : ""}
          onClick={() => setActiveTab("teklifBilgileri")}
        >
          Teklif Bilgileri
        </button>
        <button
          className={activeTab === "malzemeler" ? "active" : ""}
          onClick={() => setActiveTab("malzemeler")}
        >
          Malzemeler
        </button>
      </div>

      {/* Teklif Bilgileri Formu */}
      {activeTab === "teklifBilgileri" && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Teklif Tarihi</label>
              <input
                type="date"
                name="teklifTarihi"
                value={formData.teklifTarihi}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Termin Tarihi</label>
              <input
                type="date"
                name="terminTarihi"
                value={formData.terminTarihi}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teklif İsteyen</label>
              <select
                name="teklifIsteyen"
                value={formData.teklifIsteyen}
                onChange={handleInputChange}
              >
                <option value="">Seçiniz</option>
                <option value="Kişi 1">Kişi 1</option>
                <option value="Kişi 2">Kişi 2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Teklif Grup NO</label>
              <input
                type="text"
                name="teklifGrupNo"
                value={formData.teklifGrupNo}
                onChange={handleInputChange}
                placeholder="xx"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Açıklama</label>
              <textarea
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                placeholder="Açıklama giriniz..."
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* Malzemeler Tab */}
      {activeTab === "malzemeler" && (
        <div className="form-section">
          <p>Malzeme tablosu burada olacak...</p>
        </div>
      )}

      {/* Tedarikçi Seçimi - Teklif Bilgileri Tabında Görünmeli */}
      {activeTab === "teklifBilgileri" && (
        <div className="tedarikci-section">
          <div className="tedarikci-tabs">
            <button
              className={tedarikciTab === "seciliTedarikciler" ? "active" : ""}
              onClick={() => setTedarikciTab("seciliTedarikciler")}
            >
              Seçili Tedarikçiler
            </button>
            <button
              className={tedarikciTab === "tumTedarikciler" ? "active" : ""}
              onClick={() => setTedarikciTab("tumTedarikciler")}
            >
              Tüm Tedarikçiler
            </button>
          </div>

          {/* Seçili Tedarikçiler */}
          {tedarikciTab === "seciliTedarikciler" && (
            <div className="tedarikci-list">
              <ul>
                {selectedTedarikciler.map((tedarikci) => (
                  <li key={tedarikci.id}>
                    {tedarikci.name} <button onClick={() => handleTedarikciDeselect(tedarikci.id)}>Sil</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tüm Tedarikçiler */}
          {tedarikciTab === "tumTedarikciler" && (
            <div className="tedarikci-list">
              <ul>
                {tedarikciler.map((tedarikci) => (
                  <li key={tedarikci.id}>
                    {tedarikci.name} <button onClick={() => handleTedarikciSelect(tedarikci.id)}>Ekle</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeklifIsteme;
