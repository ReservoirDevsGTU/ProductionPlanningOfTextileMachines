import React, { useState, useEffect } from "react";
import "../css/TeklifIsteme.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../../satinalmatalepleri/js/baseURL.js';
import axios from 'axios';

const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState("details"); // "details" = teklif bilgileri, "materials" = malzemeler
  const [quoteDate, setQuoteDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [requester, setRequester] = useState(-1);
  const [quoteGroupNo, setQuoteGroupNo] = useState("");
  const [description, setDescription] = useState("");
  const [supplierTab, setSupplierTab] = useState("selected"); // "selected" or "all"
  const [materialsTab, setMaterialsTab] = useState("selected"); // Sub-tabs for materials

  const [searchTerm, setSearchTerm] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false); // Tüm tedarikçileri seçme durumu

  const [showModal, setShowModal] = useState(false); // Modal görünürlüğü
  const [selectedMaterialToDelete, setSelectedMaterialToDelete] = useState(null); // Silinecek malzeme
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Start with an empty array
  const [allMaterials, setAllMaterials] = useState([]);
  const [users, setUsers] = useState([]);

  const handleRemoveMaterial = () => {
    setSelectedMaterials((prev) => prev.filter((m) => m.RequestItemID !== selectedMaterialToDelete.RequestItemID));
    setShowModal(false); // Popup'u kapat
  };

  const handleDeleteClick = (material) => {
    setSelectedMaterialToDelete(material); // Silinecek malzemeyi belirle
    setShowModal(true); // Popup'u aç
  };



  // Tedarikçi verilerini çekmek için useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(baseURL + "/getAllSuppliers.php");
        setSuppliers(response.data); // Veritabanından gelen verileri state'e atıyoruz
      } catch (error) {
        console.error("Tedarikçiler alınırken bir hata oluştu:", error);
      }

      try {
        const response = await axios.post(baseURL + "/queryRequests.php", {offset: [100, 10]});
        const data = response.data.reduce((acc, cur) => acc = acc.concat(cur.Materials), []);
        setAllMaterials(data);
      }
      catch (error) {
        console.error("Materyaller alınırken bir hata oluştu:", error);
      }
      axios.get(baseURL + "/listUsers.php")
        .then(response => setUsers(response.data))
        .catch(error => console.error(error));
    };

    fetchData();
  }, []);


  // Sayfa yüklendiğinde bugünün tarihini atama
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD" formatında
    setQuoteDate(formattedDate);
  }, []);




  const filteredMaterials = (materials) =>
    materials.filter((material) =>
      material.MaterialName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredSuppliers = searchTerm
    ? suppliers.filter((supplier) =>
      supplier.SupplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : suppliers;





  const handleAddMaterial = () => {
    // Tüm seçilen malzemeleri filtrele
    const toAdd = allMaterials.filter((material) => material.isChecked);

    // Geçersiz teklif miktarlarını kontrol et
    const hasErrors = toAdd.some(
      (material) => !material.OfferedAmount || material.OfferedAmount <= 0
    );

    if (hasErrors) {
      // Eğer geçersiz miktar varsa, kullanıcıyı uyar
      alert("Lütfen seçilen malzemeler için geçerli bir teklif miktarı giriniz.");
    } else if (toAdd.length === 0) {
      // Eğer hiçbir malzeme seçilmemişse, kullanıcıyı uyar
      alert("Hiç malzeme seçmediniz.");
    } else {
      // Geçerli malzemeleri seçili listeye ekle
      setSelectedMaterials((prev) => [
        ...prev,
        ...toAdd.filter((m) => !prev.some((prevMaterial) => prevMaterial.id === m.id)),
      ]);
      alert("Malzemeler seçili listeye eklendi.");
    }
  };


  // Checkbox seçimlerini yönetme supplier için
  const handleCheckboxChangesupplier = (supplierId) => {
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
      const allSupplierIds = suppliers.map((supplier) => supplier.SupplierID);
      setSelectedCheckboxes(allSupplierIds);
    } else {
      // Tüm tedarikçileri seçme
      setSelectedCheckboxes([]);
    }
  };




  const handleCheckboxChange = (id, checked) => {
    setAllMaterials((prev) =>
      prev.map((material) =>
        material.RequestItemID === id ? { ...material, isChecked: checked } : material
      )
    );
  };

  // Seçilen tedarikçileri Seçili Tedarikçiler sekmesine ekleme
  const handleAddSelectedSuppliers = () => {
    const selected = suppliers.filter((supplier) =>
      selectedCheckboxes.includes(supplier.SupplierID)
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
      prevSelected.filter(supplier => supplier.SupplierID !== supplierId)
    );
  };

  const handleSaveButton = () => {
    //TODO
    const data = {
      OfferGroupID: quoteGroupNo,
      CreatedBy: requester,
    };
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
                <option value={-1}>Seciniz</option>
                {users && users.map(u=>
                  (<option key={u.UserID} value={u.UserID}>{u.UserName}</option>)
                    )}
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

          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Arama Yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <td>{supplier.SupplierID}</td>
            <td>{supplier.SupplierName}</td>
            <td>{supplier.SupplierTelNo}</td>
            <td>{supplier.SupplierEmail}</td>
            <td>{supplier.SupplierAddress}</td>
            <td>
              <button onClick={() => handleRemoveSupplier(supplier.SupplierID)}>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }} />
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
              <div className="button-container" style={{
                display: "flex",
                justifyContent: "flex-start", // Butonu sola hizalar
                marginTop: "10px",
                marginBottom: "20px"
              }}>
                <button
                  className="add-supplier-button"
                  onClick={() => {
                    // Tedarikçi ekleme işlemi için bir işlev çağırabilirsiniz
                    console.log("Tedarikçi ekleme işlemi.");
                  }}
                >
                  Tedarikçi Ekle
                </button>
              </div>
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
                  {filteredSuppliers.map((supplier, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCheckboxes.includes(supplier.SupplierID)}
                          onChange={() => handleCheckboxChangesupplier(supplier.SupplierID)}
                        />
                      </td>
                      <td>{supplier.SupplierID}</td>
                      <td>{supplier.SupplierName}</td>
                      <td>{supplier.SupplierTelNo}</td>
                      <td>{supplier.SupplierEmail}</td>
                      <td>{supplier.SupplierAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {supplierTab === "all" && (
            <div className="button-container" style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                className="listeye-ekle-button"
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
          <button className="save-button" onClick={handleSaveButton}>Kaydet</button>
          <button className="cancel-button">İptal</button>
        </div>
      )}







      {activeTab === "materials" && (
        <div>
          <div className="tabs-container">
            <button
              className={`tab-button ${materialsTab === "selected" ? "active" : ""}`}
              onClick={() => setMaterialsTab("selected")}
            >
              Seçili Malzemeler
            </button>

            <button
              className={`tab-button ${materialsTab === "all" ? "active" : ""}`}
              onClick={() => setMaterialsTab("all")}
            >
              Tüm Malzemeler
            </button>
          </div>

          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Arama Yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {materialsTab === "selected" ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Sil</th>
                  <th>Malzeme No</th>
                  <th>Malzeme Adı</th>
                  <th>Teklif Miktarı</th>
                  <th>Talep Miktarı</th>
                  <th>Birim</th>
                </tr>
              </thead>
              <tbody>
                {selectedMaterials.map((material) => (
                  <tr key={material.RequestItemID}>
                    <td>
                      <button onClick={() => handleDeleteClick(material)}>
                        <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }} />
                      </button>
                    </td>
                    <td>{material.MaterialNo}</td>
                    <td>{material.MaterialName}</td>
                    <td>{material.OfferedAmount}</td>
                    <td>{material.RequestedAmount}</td>
                    <td>{material.UnitID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Malzeme No</th>
                  <th>Malzeme Adı</th>
                  <th>Teklif Miktarı</th>
                  <th>Talep Miktarı</th>
                  <th>Birim</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials(allMaterials).map((material) => (
                  <tr key={material.RequestItemID}>
                    <td>
                      <input
                        type="checkbox"
                        checked={material.isChecked || false}
                        onChange={(e) =>
                          handleCheckboxChange(material.RequestItemID, e.target.checked)
                        }
                      />
                    </td>
                    <td>{material.MaterialNo}</td>
                    <td>{material.MaterialName}</td>
                    <td>
                      <input
                        type="number"
                        value={material.OfferedAmount}
                        onChange={(e) =>
                          setAllMaterials((prev) =>
                            prev.map((m) =>
                              m.RequestItemID === material.RequestItemID
                                ? { ...m, OfferedAmount: e.target.value }
                                : m
                            )
                          )
                        }
                      />
                    </td>
                    <td>{material.RequestedAmount}</td>
                    <td>{material.UnitID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {materialsTab === "all" && (
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                className="listeye-ekle-button"
                onClick={handleAddMaterial}>Listeye Ekle
              </button>

            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Silme Onayı</h2>
                <div className="modal-body">
                  <p>
                    '{selectedMaterialToDelete?.MaterialName}' malzemesini silmek istediğinizden emin misiniz?
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="modal-button cancel" onClick={() => setShowModal(false)}>
                    İptal
                  </button>
                  <button className="modal-button delete" onClick={handleRemoveMaterial}>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeklifIsteme;
