import React, {useState} from "react";
import '../css/TeklifIsteme.css';


const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState('details'); // details = teklif bilgileri materials = malzemeler
  const [quoteDate, setQuoteDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [requester, setRequster] = useState('');
  const [quoteGroupNo, setQuoteGroupNo] = useState('');
  const [description, setDescription] = useState('');
  

  return (
    <div className="teklif-isteme-container">
      <h1>Teklif İsteme</h1>

      {/* Sekmeler */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Teklif Bilgileri
        </button>
        <button
          className={`tab-button ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          Malzemeler
        </button>
      </div>

      {/* Form Alanları */}
      {activeTab === "details" && (
        <div className="form-section">
          {/* Tarih Alanları */}
          <div className="form-row">
            <div className="form-group">
              <label>Teklif Tarihi</label>
              <input
                type="date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Termin Tarihi</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          </div>

          {/* Teklif İsteyen ve Grup No */}
          <div className="form-row">
            <div className="form-group">
              <label>Teklif İsteyen</label>
              <select
                value={requester}
                onChange={(e) => setRequster(e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
                <option value="user3">User 3</option>
              </select>
            </div>
            <div className="form-group">
              <label>Teklif Grup No</label>
              <input
                type="text"
                placeholder="XX"
                value={quoteGroupNo}
                onChange={(e) => setQuoteGroupNo(e.target.value)}
              />
            </div>
          </div>

          {/* Açıklama Alanı */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Açıklama</label>
              <textarea
                placeholder="Açıklama Giriniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeklifIsteme;