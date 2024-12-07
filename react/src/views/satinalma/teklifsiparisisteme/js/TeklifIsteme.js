import React, { useState } from "react";
import "../css/TeklifIsteme.css";

const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState("details"); // "details" = teklif bilgileri, "materials" = malzemeler
  const [quoteDate, setQuoteDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [requester, setRequester] = useState("");
  const [quoteGroupNo, setQuoteGroupNo] = useState("");
  const [description, setDescription] = useState("");
  const [supplierTab, setSupplierTab] = useState("selected"); // "selected" or "all"

  const suppliers = [
    { code: "101", name: "Supplier 1", phone: "123456789", email: "email1@example.com", address: "Address 1" },
    { code: "102", name: "Supplier 2", phone: "987654321", email: "email2@example.com", address: "Address 2" },
  ];

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

          <div className="form-row">
            <div className="form-group">
              <label>Teklif İsteyen</label>
              <select
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
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

      {/* Tedarikçi Alanları - Sadece "Teklif Bilgileri" seçildiğinde göster */}
      {activeTab === "details" && (
        <div className="supplier-section">
          <div className="tabs-container">
            <button
              className={`tab-button ${supplierTab === "selected" ? "active" : ""}`}
              onClick={() => setSupplierTab("selected")}
            >
              Seçili Tedarikçiler
            </button>
            <button
              className={`tab-button ${supplierTab === "all" ? "active" : ""}`}
              onClick={() => setSupplierTab("all")}
            >
              Tüm Tedarikçiler
            </button>
          </div>

          {/* Tedarikçi Tablosu */}
          <div className="supplier-table">
            <table>
              <thead>
                <tr>
                  <th>Tedarikçi Kodu</th>
                  <th>Tedarikçi Adı</th>
                  <th>Tel. NO</th>
                  <th>E-Posta</th>
                  <th>Adres</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={index}>
                    <td>{supplier.code}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Butonlar */}
          <div className="button-container">
            <button className="save-button">Kaydet</button>
            <button className="cancel-button">İptal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeklifIsteme;
