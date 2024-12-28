import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import baseURL from "../../satinalmatalepleri/js/baseURL.js";
import axios from "axios";
import { CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTabs } from '@coreui/react';
import CustomTable from '../../CustomTable.js';


const TeklifIsteme = (props) => {
  const [quoteDate, setQuoteDate] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [requester, setRequester] = useState(-1);
  const [quoteGroupNo, setQuoteGroupNo] = useState("");
  const [description, setDescription] = useState("");
  const [supplierTab, setSupplierTab] = useState("selected");
  const [materialsTab, setMaterialsTab] = useState("selected");
  const [searchTerm, setSearchTerm] = useState("");

  const [supplierPage, setSupplierPage] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterialToDelete, setSelectedMaterialToDelete] = useState(null);

  const editItems = props.location.editItems;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.post(baseURL + "/queryUsers.php");
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSelectedMaterials(editItems ? editItems.reduce((acc, cur) => {
      let exist = acc.find(i => i.MaterialID === cur.MaterialID);
      if(exist) {
        exist.OfferRequestedAmount = Number(cur.OfferRequestedAmount) + Number(exist.OfferRequestedAmount);
        exist.OfferedAmount = Number(cur.RequestedAmount) + Number(exist.OfferedAmount);
      }
      else acc = acc.concat([{...cur, final: true, OfferedAmount: cur.OfferRequestedAmount}]);
      return acc;
    }, []) : []);}, [editItems]);

  useEffect(()=>console.log(setSelectedMaterials(prev => prev.sort((a, b) => a.MaterialID - b.MaterialID))), [selectedMaterials]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuoteDate(today);
  }, []);

  const handleSelectAllSuppliers = () => {
    if(!selectAllChecked) {
      setSelectedSuppliers((prev) =>
        supplierPage.reduce((acc, cur) => acc.find(s => s.SupplierID === cur.SupplierID) ? acc : [...acc, cur], prev));
    }
    setSelectAllChecked(!selectAllChecked);
  };

  const handleAddSelectedSuppliers = () => {
    setSelectedSuppliers((prev) => 
      prev.map(s => ({...s, final: true})));
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
      RequestedBy: requester,
      OfferDescription: description,
      OfferDate: quoteDate,
      OfferDeadline: deadlineDate,
      Suppliers: selectedSuppliers.map(s => ({SupplierID: s.SupplierID})),
      Materials: selectedMaterials.reduce((acc, cur) => {
        if(cur.RequestItemID === 0) {
          acc = acc.concat([{
            MaterialID: cur.MaterialID,
            RequestItemID: null,
            OfferRequestedAmount: cur.OfferRequestedAmount,
            OfferedAmount: cur.OfferedAmount
          }]);
        }
        else {
          const items = editItems.filter(i => i.MaterialID === cur.MaterialID);
          var remain = Number(cur.OfferedAmount);
          if(items) {
            const totalRequest = items.reduce((acc, cur) => acc + Number(cur.RequestedAmount), 0);
            items.forEach(i => {
              acc = acc.concat([{
                MaterialID: i.MaterialID,
                RequestItemID: i.RequestItemID,
                OfferRequestedAmount: i.OfferRequestedAmount,
                OfferedAmount: remain >= totalRequest ? i.OfferRequestedAmount : remain * Number(i.OfferRequestedAmount) / totalRequest
                }]);
            });
            remain = Math.max(0, remain - totalRequest);
          }
          if(remain > 0) {
            acc = acc.concat([{
              MaterialID: cur.MaterialID,
              RequestItemID: null,
              OfferRequestedAmount: remain,
              OfferedAmount: remain
            }]);
          }
        }
        return acc;
      }, [])
    };
    console.log("Saved Request Data:", requestData);
    axios.post(baseURL + "/createOffer.php", requestData);
    alert("Teklif bilgileri kaydedildi!");
  };

  const handleRemoveMaterial = () => {
    setSelectedMaterials((prev) =>
      prev.filter((m) => m.MaterialID !== selectedMaterialToDelete.MaterialID)
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
                <CustomTable style={{ marginTop:"20px", width: "100%", borderCollapse: "collapse" }}
                  data={selectedSuppliers.filter(s=>s?.final !== undefined)}
                  fields={[
                    {label: "Tedarikçi Kodu", key: "SupplierID"},
                    {label: "Tedarikçi Adı", key: "SupplierName"},
                    {label: "Telefon", key: "SupplierTelNo"},
                    {label: "E-Posta", key: "SupplierEmail"},
                    {label: "Adres", key: "SupplierAddress"},
                    {label: "Kaldır", key: "delete"},
                  ]}
                  scopedSlots={{
                    delete: (supplier) => (
                        <td>
                          <button
                            onClick={() => setSelectedSuppliers((prev) => prev.filter(s => s.SupplierID !== supplier.SupplierID))}
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
                    )
                  }}/>
              </CTabPane>

              {/* Tüm Tedarikçiler */}
              <CTabPane data-tab="all">
              <div>
                <CustomTable style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
                  fetchAddr="/querySuppliers.php"
                  onFetch={(data) => setSupplierPage(data)}
                  fields={[
                    {label: (
                        <input
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={handleSelectAllSuppliers}
                        />
                    ), key: "select"},
                    {label: "Tedarikçi Kodu", key: "SupplierID"},
                    {label: "Tedarikçi Adı", key: "SupplierName"},
                    {label: "Telefon", key: "SupplierTelNo"},
                    {label: "E-Posta", key: "SupplierEmail"},
                    {label: "Adres", key: "SupplierAddress"},
                  ]}
                  scopedSlots= {{
                    select: (supplier) => (
                        <td>
                          <input
                            type="checkbox"
                            disabled={selectedSuppliers.find(s => s.SupplierID === supplier.SupplierID)?.final !== undefined}
                            checked={selectedSuppliers.find(s => s.SupplierID === supplier.SupplierID) !== undefined}
                            onChange={(e) =>
                            setSelectedSuppliers((prev) =>
                              e.target.checked ? prev.concat([supplier])
                              : prev.filter(s => s.SupplierID !== supplier.SupplierID))}
                          />
                        </td>
                    ),
                  }}/>

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

        <CustomTable style={{ marginTop:"20px", width: "100%", borderCollapse: "collapse" }}
          data={selectedMaterials.filter(m=>m.final)}
          fields={[
            {label: "Sil", key: "delete"},
            {label: "Malzeme No", key: "MaterialNo"},
            {label: "Malzeme Adi", key: "MaterialName"},
            {label: "Teklif Miktari", key: "offeredAmount"},
            {label: "Talep Miktari", key: "OfferRequestedAmount"},
            {label: "Birim", key: "UnitID"},
          ]}
          scopedSlots={{
            delete: (material) => (
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
            ),
            offeredAmount: (material) => (
                      <td>
                        <input
                          type="number"
                          value={material.OfferedAmount}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              prev.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, OfferedAmount: Number(e.target.value), OfferRequestedAmount: m.RequestItemID === 0 ? Number(e.target.value) : m.OfferRequestedAmount}
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
            ),
          }}
        />
            </CTabPane>

            {/* Tüm Malzemeler */}
            <CTabPane data-tab="all">
            <div>
        <CustomTable style={{ width: "100%", borderCollapse: "collapse" }}
          fetchAddr="/queryMaterials.php"
          fetchArgs={{columns: ["MaterialID"]}}
          fields={[
            {label: "", key: "select"},
            {label: "Malzeme No", key: "MaterialNo"},
            {label: "Malzeme Adi", key: "MaterialName"},
            {label: "Miktar", key: "offeredAmount"},
            {label: "Toplam Stok", key: "Quantity"},
            {label: "Birim", key: "UnitID"},
          ]}
          scopedSlots={{
            select: (material) => (
                      <td>
                        <input
                          type="checkbox"
                          disabled={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.final !== undefined}
                          checked={selectedMaterials.find(m => m.MaterialID === material.MaterialID) !== undefined}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              e.target.checked ? prev.concat([{...material, OfferedAmount: 1, RequestItemID: 0}])
                              : prev.filter(m => m.MaterialID !== material.MaterialID))
                          }
                        />
                      </td>
            ),
            offeredAmount: (material) => (
                      <td>
                        <input
                          type="number"
                          disabled={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.final !== undefined}
                          value={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.OfferedAmount || ""}
                          onChange={(e) =>
                            setSelectedMaterials((prev) =>
                              prev.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, OfferedAmount: Number(e.target.value) }
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
            ),
          }}
        />

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <CButton
                  color="info"
                  variant="outline"
                  onClick={() => setSelectedMaterials((prev) => prev.map(m=>({...m, OfferRequestedAmount: m.OfferedAmount, final: true})))}
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
