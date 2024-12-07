import React, { useState, useEffect } from "react";
import "../css/TeklifIsteme.css";

const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState("details"); // "details" = teklif bilgileri, "materials" = malzemeler
  const [quoteDate, setQuoteDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [requester, setRequester] = useState("");
  const [quoteGroupNo, setQuoteGroupNo] = useState("");
  const [description, setDescription] = useState("");
  const [supplierTab, setSupplierTab] = useState("selected"); // "selected" or "all"

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false); // Tüm tedarikçileri seçme durumu

  // Tedarikçi verilerini çekmek için useEffect
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost/path_to_php/getAllSuppliers.php");
        const data = await response.json();
        setSuppliers(data); // Veritabanından gelen verileri state'e atıyoruz
      } catch (error) {
        console.error("Tedarikçiler alınırken bir hata oluştu:", error);
      }
    };
    
    fetchSuppliers();
  }, []);

  // Sayfa yüklendiğinde bugünün tarihini atama
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD" formatında
    setQuoteDate(formattedDate);
  }, []);

  // Checkbox seçimlerini yönetme
  const handleCheckboxChange = (supplierId) => {
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(supplierId)) {
        return prevSelected.filter((id) => id !== supplierId);
      } else {
        return [...prevSelected, supplierId];
      }
    });
  };

  // Tüm tedarikçileri seçme
  const handleSelectAllChange = () => {
    setSelectAllChecked(!selectAllChecked);
    if (!selectAllChecked) {
      // Tüm tedarikçileri seç
      const allSupplierIds = suppliers.map((supplier) => supplier.id);
      setSelectedCheckboxes(allSupplierIds);
    } else {
      // Tüm tedarikçileri seçme
      setSelectedCheckboxes([]);
    }
  };

  // Seçilen tedarikçileri Seçili Tedarikçiler sekmesine ekleme
  const handleAddSelectedSuppliers = () => {
    const selected = suppliers.filter((supplier) =>
      selectedCheckboxes.includes(supplier.id)
    );
    setSelectedSuppliers((prevSelected) => [
      ...prevSelected,
      ...selected,
    ]);
    setSelectedCheckboxes([]); // Seçimleri temizle
  };

  // Seçili tedarikçiyi listeden kaldırma
  const handleRemoveSupplier = (supplierId) => {
    setSelectedSuppliers((prevSelected) => 
      prevSelected.filter(supplier => supplier.id !== supplierId)
    );
  };

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

      {/* Teklif Bilgileri Formu */}
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

      {/* Tedarikçi Alanları */}
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

          {/* Seçili Tedarikçiler Tablosu */}
          {supplierTab === "selected" && (
            <div className="supplier-table">
              <table>
                <thead>
                  <tr>
                    <th>Tedarikçi Kodu</th>
                    <th>Tedarikçi Adı</th>
                    <th>Tel. NO</th>
                    <th>E-Posta</th>
                    <th>Adres</th>
                    <th>Kaldır</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSuppliers.map((supplier, index) => (
                    <tr key={index}>
                      <td>{supplier.code}</td>
                      <td>{supplier.name}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.address}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveSupplier(supplier.id)}
                        >
                          Kaldır
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tüm Tedarikçiler Tablosu */}
          {supplierTab === "all" && (
            <div className="supplier-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={handleSelectAllChange}
                      />
                    </th>
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
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCheckboxes.includes(supplier.id)}
                          onChange={() => handleCheckboxChange(supplier.id)}
                        />
                      </td>
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
          )}

          {supplierTab === "all" && (
            <div className="button-container">
              <button
                className="save-button"
                onClick={handleAddSelectedSuppliers}
              >
                Listeye Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kaydet ve İptal Butonları yalnızca Teklif Bilgileri ve Seçili Tedarikçiler sekmesi açıkken görünecek */}
      {activeTab === "details" && supplierTab === "selected" && (
        <div className="button-container">
          <button className="save-button">Kaydet</button>
          <button className="cancel-button">İptal</button>
        </div>
      )}
    </div>
  );
};

export default TeklifIsteme;
