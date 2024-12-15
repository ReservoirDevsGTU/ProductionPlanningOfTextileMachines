import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import baseURL from "../../satinalmatalepleri/js/baseURL.js";
import axios from "axios";

const TeklifIsteme = () => {
  const [activeTab, setActiveTab] = useState("details");
  const [quoteDate, setQuoteDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [requester, setRequester] = useState(-1);
  const [quoteGroupNo, setQuoteGroupNo] = useState("");
  const [description, setDescription] = useState("");
  const [supplierTab, setSupplierTab] = useState("selected");
  const [materialsTab, setMaterialsTab] = useState("selected");
  const [searchTerm, setSearchTerm] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterialToDelete, setSelectedMaterialToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResponse = await axios.get(baseURL + "/getAllSuppliers.php");
        setSuppliers(suppliersResponse.data);

        const materialsResponse = await axios.post(baseURL + "/queryRequests.php", {
          offset: [100, 10],
        });
        const materialsData = materialsResponse.data.reduce(
          (acc, cur) => acc.concat(cur.Materials),
          []
        );
        setAllMaterials(materialsData);

        const usersResponse = await axios.get(baseURL + "/listUsers.php");
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuoteDate(today);
  }, []);

  const handleCheckboxChangeSupplier = (supplierId) => {
    setSelectedCheckboxes((prevSelected) =>
      prevSelected.includes(supplierId)
        ? prevSelected.filter((id) => id !== supplierId)
        : [...prevSelected, supplierId]
    );
  };

  const handleSelectAllSuppliers = () => {
    setSelectAllChecked(!selectAllChecked);
    setSelectedCheckboxes(!selectAllChecked ? suppliers.map((s) => s.SupplierID) : []);
  };

  const handleAddSelectedSuppliers = () => {
    const selected = suppliers.filter((s) => selectedCheckboxes.includes(s.SupplierID));
    setSelectedSuppliers((prevSelected) => [...prevSelected, ...selected]);
    setSelectedCheckboxes([]);
  };

  const handleRemoveSupplier = (supplierId) => {
    setSelectedSuppliers((prevSelected) =>
      prevSelected.filter((s) => s.SupplierID !== supplierId)
    );
  };

  const handleSaveButton = () => {
    const requestData = {
      OfferGroupID: quoteGroupNo,
      CreatedBy: requester,
      Description: description,
      Suppliers: selectedSuppliers,
      Materials: selectedMaterials,
    };
    console.log("Saved Request Data:", requestData);
    alert("Teklif bilgileri kaydedildi!");
  };

  const handleAddMaterial = () => {
    const toAdd = allMaterials.filter((material) => material.isChecked);
    const hasErrors = toAdd.some((material) => !material.OfferedAmount || material.OfferedAmount <= 0);

    if (hasErrors) {
      alert("Lütfen seçilen malzemeler için geçerli bir teklif miktarı giriniz.");
    } else if (toAdd.length === 0) {
      alert("Hiç malzeme seçmediniz.");
    } else {
      setSelectedMaterials((prev) => [
        ...prev,
        ...toAdd.filter((m) => !prev.some((prevMaterial) => prevMaterial.id === m.id)),
      ]);
      alert("Malzemeler seçili listeye eklendi.");
    }
  };

  const handleCheckboxChangeMaterial = (id, checked) => {
    setAllMaterials((prev) =>
      prev.map((material) =>
        material.RequestItemID === id ? { ...material, isChecked: checked } : material
      )
    );
  };

  const handleRemoveMaterial = () => {
    setSelectedMaterials((prev) =>
      prev.filter((m) => m.RequestItemID !== selectedMaterialToDelete.RequestItemID)
    );
    setShowModal(false);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1>Teklif İsteme</h1>

      {/* Sekmeler */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "details" ? "#007bff" : "#fff",
            color: activeTab === "details" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Teklif Bilgileri
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "materials" ? "#007bff" : "#fff",
            color: activeTab === "materials" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          Malzemeler
        </button>
      </div>

      {/* Teklif Bilgileri */}
      {activeTab === "details" && (
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px" }}>
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Teklif Tarihi</label>
              <input
                type="date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Termin Tarihi</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Teklif İsteyen</label>
              <select
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value={-1}>Seçiniz</option>
                {users.map((user) => (
                  <option key={user.UserID} value={user.UserID}>
                    {user.UserName}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Teklif Grup No</label>
              <input
                type="text"
                value={quoteGroupNo}
                onChange={(e) => setQuoteGroupNo(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                padding: "10px",
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "none",
                height: "80px",
              }}
            />
          </div>

          {/* Tedarikçiler */}
          <h3>Tedarikçiler</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setSupplierTab("selected")}
              style={{
                padding: "10px",
                backgroundColor: supplierTab === "selected" ? "#007bff" : "#fff",
                color: supplierTab === "selected" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              Seçili Tedarikçiler
            </button>
            <button
              onClick={() => setSupplierTab("all")}
              style={{
                padding: "10px",
                backgroundColor: supplierTab === "all" ? "#007bff" : "#fff",
                color: supplierTab === "all" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              Tüm Tedarikçiler
            </button>
          </div>

          {supplierTab === "selected" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Tedarikçi Kodu</th>
                  <th>Tedarikçi Adı</th>
                  <th>Telefon</th>
                  <th>E-Posta</th>
                  <th>Adres</th>
                  <th>Kaldır</th>
                </tr>
              </thead>
              <tbody>
                {selectedSuppliers.map((supplier) => (
                  <tr key={supplier.SupplierID}>
                    <td>{supplier.SupplierID}</td>
                    <td>{supplier.SupplierName}</td>
                    <td>{supplier.SupplierTelNo}</td>
                    <td>{supplier.SupplierEmail}</td>
                    <td>{supplier.SupplierAddress}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveSupplier(supplier.SupplierID)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={handleSelectAllSuppliers}
                      />
                    </th>
                    <th>Tedarikçi Kodu</th>
                    <th>Tedarikçi Adı</th>
                    <th>Telefon</th>
                    <th>E-Posta</th>
                    <th>Adres</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.SupplierID}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCheckboxes.includes(supplier.SupplierID)}
                          onChange={() => handleCheckboxChangeSupplier(supplier.SupplierID)}
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
              <button
                onClick={handleAddSelectedSuppliers}
                style={{
                  padding: "10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Listeye Ekle
              </button>
            </div>
          )}
        </div>
      )}


{activeTab === "materials" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setMaterialsTab("selected")}
              style={{
                padding: "10px 20px",
                backgroundColor: materialsTab === "selected" ? "#007bff" : "#fff",
                color: materialsTab === "selected" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              Seçili Malzemeler
            </button>
            <button
              onClick={() => setMaterialsTab("all")}
              style={{
                padding: "10px 20px",
                backgroundColor: materialsTab === "all" ? "#007bff" : "#fff",
                color: materialsTab === "all" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              Tüm Malzemeler
            </button>
          </div>

          {materialsTab === "selected" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                      <button
                        onClick={() => setShowModal(true) && setSelectedMaterialToDelete(material)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
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
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  {allMaterials.map((material) => (
                    <tr key={material.RequestItemID}>
                      <td>
                        <input
                          type="checkbox"
                          checked={material.isChecked || false}
                          onChange={(e) =>
                            handleCheckboxChangeMaterial(material.RequestItemID, e.target.checked)
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
                          style={{
                            padding: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "100px",
                          }}
                        />
                      </td>
                      <td>{material.RequestedAmount}</td>
                      <td>{material.UnitID}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleAddMaterial}
                style={{
                  padding: "10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Listeye Ekle
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSaveButton}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Kaydet
      </button>



    </div>
  );
};

export default TeklifIsteme;
