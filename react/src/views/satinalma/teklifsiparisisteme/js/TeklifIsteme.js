import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import baseURL from "../../satinalmatalepleri/js/baseURL.js";
import axios from "axios";
import { CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTabs } from '@coreui/react';


const TeklifIsteme = () => {
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
    <div style={{ padding: "20px" }}>
      <h1>Teklif İsteme</h1>

      <hr style={{ border: '1px solid #333', marginBottom: '20px' }} />

      <CTabs size="lg" activeTab="details">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="details">Teklif Bilgileri</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="materials">Malzemeler</CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent fade>
          <CTabPane data-tab="details">
          <div style={{padding: "20px", borderRadius: "8px" }}>
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
          <div style={{padding: "20px", borderRadius: "8px"}}>
            
          <h3 style={{marginBottom: '20px'}}>Tedarikçiler</h3>

          <CTabs activeTab="selected">
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink data-tab="selected">Seçili Tedarikçiler</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="all">Tüm Tedarikçiler</CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              {/* Seçili Tedarikçiler */}
              <CTabPane data-tab="selected">
                <table style={{ marginTop:"20px", width: "100%", borderCollapse: "collapse" }}>
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
              </CTabPane>

              {/* Tüm Tedarikçiler */}
              <CTabPane data-tab="all">
              <div>
                <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
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

                {/* Buton Sağ Alt Köşede ve Hafif Sola Kaydırılmış */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                  <CButton
                    color="info"
                    variant="outline"
                    onClick={handleAddSelectedSuppliers}
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                      marginRight: "120px", // Butonu hafif sola kaydırır
                    }}
                  >
                    Listeye Ekle
                  </CButton>
                </div>
              </div>
            </CTabPane>

            </CTabContent>
          </CTabs>
          </div>
             
        </div>
        </CTabPane>
        </CTabContent>
                    
        <CTabContent>
          <CTabPane data-tab="materials">        
          <div>
                    {/* Malzemeler */}
                    <h3 style={{marginTop:"20px", marginBottom:"20px"}}>Malzemeler</h3>

        <CTabs activeTab="selected">
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink data-tab="selected">Seçili Malzemeler</CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink data-tab="all">Tüm Malzemeler</CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            {/* Seçili Malzemeler */}
            <CTabPane data-tab="selected">
              <table style={{ marginTop:"20px", width: "100%", borderCollapse: "collapse" }}>
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
                          onClick={() => {
                            setShowModal(true);
                            setSelectedMaterialToDelete(material);
                          }}
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
            </CTabPane>

            {/* Tüm Malzemeler */}
            <CTabPane data-tab="all">
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
                          value={material.OfferedAmount || ""}
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

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <CButton
                  color="info"
                  variant="outline"
                  onClick={handleAddMaterial}
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                    marginRight: "100px",
                  }}
                >
                  Listeye Ekle
                </CButton>
              </div>
            </div>
          </CTabPane>
          </CTabContent>
        </CTabs>

        </div>
        </CTabPane>
        </CTabContent>
  
      </CTabs>

        
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <CButton
        color="success"
        variant="outline"
        onClick={handleSaveButton}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          marginTop: "20px",
          marginRight: "20px",
        }}
      >
        Kaydet
      </CButton>

      <CButton
      color="danger"
      variant="outline"
      style={{
        padding: "10px 20px",
        cursor: "pointer",
        marginTop: "20px",
      }}
      >
        İptal
      </CButton>
      </div>

      {/* Modal */}
{showModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "400px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Silme Onayı</h2>
      <div
        style={{
          backgroundColor: "#f8d7da",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <p>
          '{selectedMaterialToDelete?.MaterialName}' malzemesini silmek
          istediğinizden emin misiniz?
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          İptal
        </button>
        <button
          onClick={handleRemoveMaterial}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sil
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default TeklifIsteme;
