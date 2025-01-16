import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import baseURL from "../../baseURL.js";
import axios from "axios";
import { CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTabs } from '@coreui/react';
import CustomTable from '../../CustomTable.js';
import SearchBox from '../../SearchBox.js';
import { useHistory } from 'react-router-dom';
import CustomModal from '../../CustomModal.js';


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

  const history = useHistory();

  const editItems = props.location.editItems;

   const [modals, setModals] = useState({ warning: false, info: false,   materialDelete: false, supplierDelete: false, select: false, cancel: false, save: false});
   const [modalMessages, setModalMessages] = useState({ warning: '', info: '', materialDelete:'',supplierDelete: '', select: '', cancel: '', save: ''});    
   const [materialToDelete, setMaterialToDelete] = useState(null);
   const [supplierToDelete, setSupplierToDelete] = useState(null);



  

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
      if (exist) {
        exist.OfferRequestedAmount = Number(cur.RequestedAmount) + Number(exist.OfferRequestedAmount);
        exist.RequestedAmount = Number(cur.RequestedAmount) + Number(exist.RequestedAmount);
      }
      else acc = acc.concat([{ ...cur, final: true, OfferRequestedAmount: cur.RequestedAmount }]);
      return acc;
    }, []) : []);
  }, [editItems]);

  useEffect(() => console.log(setSelectedMaterials(prev => prev.sort((a, b) => a.MaterialID - b.MaterialID))), [selectedMaterials]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuoteDate(today);
  }, []);

  const handleSelectAllSuppliers = () => {
    if (!selectAllChecked) {
      setSelectedSuppliers((prev) =>
        supplierPage.reduce((acc, cur) => acc.find(s => s.SupplierID === cur.SupplierID) ? acc : [...acc, cur], prev));
    }
    setSelectAllChecked(!selectAllChecked);
  };

  const handleAddSelectedSuppliers = () => {
    setSelectedSuppliers((prev) =>
      prev.map(s => ({ ...s, final: true })));
  };

  const handleRemoveSupplier = () => {
    setSelectedSuppliers((prev) =>
      prev.filter((s) => s.SupplierID !== supplierToDelete.SupplierID)
    );
    setModals({...modals, supplierDelete: false});
    setSupplierToDelete(null);
  };

  const handleSaveButton = () => {

    if (!quoteDate || !deadlineDate || requester === -1) {
      setModalMessages({
        ...modalMessages,
        warning: 'Lütfen tüm zorunlu alanları doldurun!'
      });
      setModals({...modals, warning: true});
      return;
    }

    const requestData = {
      OfferGroupID: quoteGroupNo,
      CreatedBy: requester,
      OfferStatus: 0,
      RequestedBy: requester,
      OfferDescription: description,
      OfferDate: quoteDate,
      OfferDeadline: deadlineDate,
      Suppliers: selectedSuppliers.map(s => ({ SupplierID: s.SupplierID })),
      Materials: selectedMaterials.reduce((acc, cur) => {
        if (!cur.final) return acc;
        if (cur.RequestItemID === 0) {
          acc = acc.concat([{
            MaterialID: cur.MaterialID,
            RequestItemID: null,
            OfferRequestedAmount: cur.OfferRequestedAmount,
          }]);
        }
        else {
          const items = editItems.filter(i => i.MaterialID === cur.MaterialID);
          var remain = Number(cur.OfferRequestedAmount);
          if (items) {
            const totalRequest = items.reduce((acc, cur) => acc + Number(cur.RequestedAmount), 0);
            items.forEach(i => {
              acc = acc.concat([{
                MaterialID: i.MaterialID,
                RequestItemID: i.RequestItemID,
                OfferRequestedAmount: remain >= totalRequest ? i.RequestedAmount : remain * Number(i.RequestedAmount) / totalRequest
              }]);
            });
            remain = Math.max(0, remain - totalRequest);
          }
          if (remain > 0) {
            acc = acc.concat([{
              MaterialID: cur.MaterialID,
              RequestItemID: null,
              OfferRequestedAmount: remain,
            }]);
          }
        }
        return acc;
      }, [])
    };
    axios.post(baseURL + "/createOffer.php", requestData);
    setModalMessages({...modalMessages, save: 'Teklif bilgileri başarıyla kaydedildi.'});
    setModals({...modals, save: true});
    setTimeout(() => {
      history.push("/satinalma/teklif-siparis-liste");
    }, 1500);

  };

  const handleCancel = () => {
    setModalMessages({
      ...modalMessages,
      cancel: 'Yaptığınız değişiklikler kaybolacak. Çıkmak istediğinize emin misiniz?'
    });
    setModals({...modals, cancel: true});
  };

  const handleRemoveMaterial = () => {
    setSelectedMaterials((prev) =>
      prev.filter((m) => m.MaterialID !== materialToDelete.MaterialID)
    );
    setModals({...modals, materialDelete: false});
    setMaterialToDelete(null);
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
            <div style={{ padding: "20px", borderRadius: "8px" }}>
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
                  <SearchBox fetchAddr="/queryUsers.php" label="UserName" value="UserID" onSelect={v => setRequester(v)} />
                  {/*
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
          */}
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
              <div style={{ padding: "20px", borderRadius: "8px" }}>

                <h3 style={{ marginBottom: '20px' }}>Tedarikçiler</h3>

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
                      <CustomTable style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
                        data={selectedSuppliers.filter(s => s?.final !== undefined)}
                        fields={[
                          { label: "Tedarikçi Kodu", key: "SupplierID" },
                          { label: "Tedarikçi Adı", key: "SupplierName" },
                          { label: "Telefon", key: "SupplierTelNo" },
                          { label: "E-Posta", key: "SupplierEmail" },
                          { label: "Adres", key: "SupplierAddress" },
                          { label: "Kaldır", key: "delete" },
                        ]}
                        scopedSlots={{
                          delete: (supplier) => (
                            <td>
                              <button
                                onClick={() => {
                                  setSupplierToDelete(supplier);
                                  setModalMessages({
                                    ...modalMessages,
                                    supplierDelete: `'${supplier.SupplierName}' tedarikçisini silmek istediğinizden emin misiniz?`
                                  });
                                  setModals({...modals, supplierDelete: true});
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
                          )
                        }} />
                    </CTabPane>

                    {/* Tüm Tedarikçiler */}
                    <CTabPane data-tab="all">
                      <div>
                        <CustomTable style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
                          fetchAddr="/querySuppliers.php"
                          onFetch={(data) => setSupplierPage(data)}
                          fields={[
                            {
                              label: (
                                <input
                                  type="checkbox"
                                  checked={selectAllChecked}
                                  onChange={handleSelectAllSuppliers}
                                />
                              ), key: "select"
                            },
                            { label: "Tedarikçi Kodu", key: "SupplierID" },
                            { label: "Tedarikçi Adı", key: "SupplierName" },
                            { label: "Telefon", key: "SupplierTelNo" },
                            { label: "E-Posta", key: "SupplierEmail" },
                            { label: "Adres", key: "SupplierAddress" },
                          ]}
                          scopedSlots={{
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
                          }} />

                        {/* Buton Sağ Alt Köşede ve Hafif Sola Kaydırılmış */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                        <CButton
  color="info"
  variant="outline"
  onClick={() => {
    const selectedCount = selectedSuppliers.filter(s => !s.final).length;
    if (selectedCount === 0) {
      setModalMessages({...modalMessages, warning: 'Lütfen önce tedarikçi seçiniz.'});
      setModals({...modals, warning: true});
      return;
    }
    handleAddSelectedSuppliers();
    setModalMessages({...modalMessages, info: 'Tedarikçiler başarıyla listeye eklendi.'});
    setModals({...modals, info: true});
  }}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
    marginRight: "120px",
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
              <h3 style={{ marginTop: "20px", marginBottom: "20px" }}>Malzemeler</h3>

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

                    <CustomTable style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
                      data={selectedMaterials.filter(m => m.final)}
                      fields={[
                        { label: "Sil", key: "delete" },
                        { label: "Malzeme No", key: "MaterialNo" },
                        { label: "Malzeme Adi", key: "MaterialName" },
                        { label: "Teklif Miktari", key: "offerRequestedAmount" },
                        { label: "Talep Miktari", key: "RequestedAmount" },
                        { label: "Birim", key: "UnitID" },
                      ]}
                      scopedSlots={{
                        delete: (material) => (
                          <td>
                            <button
                              onClick={() => {
                                setMaterialToDelete(material);
                                setModalMessages({
                                  ...modalMessages,
                                  materialDelete: `'${material.MaterialName}' malzemesini silmek istediğinizden emin misiniz?`
                                });
                                setModals({...modals, materialDelete: true});
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
                        offerRequestedAmount: (material) => (
                          <td>
                            <input
                              type="number"
                              value={material.OfferRequestedAmount}
                              onChange={(e) =>
                                setSelectedMaterials((prev) =>
                                  prev.map((m) =>
                                    m.MaterialID === material.MaterialID
                                      ? { ...m, OfferRequestedAmount: Number(e.target.value), RequestedAmount: m.RequestItemID === 0 ? Number(e.target.value) : m.RequestedAmount }
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
                        fetchArgs={{ columns: ["MaterialID"] }}
                        fields={[
                          { label: "", key: "select" },
                          { label: "Malzeme No", key: "MaterialNo" },
                          { label: "Malzeme Adi", key: "MaterialName" },
                          { label: "Miktar", key: "offerRequestedAmount" },
                          { label: "Toplam Stok", key: "Quantity" },
                          { label: "Birim", key: "UnitID" },
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
                                    e.target.checked ? prev.concat([{ ...material, OfferRequestedAmount: 1, RequestItemID: 0 }])
                                      : prev.filter(m => m.MaterialID !== material.MaterialID))
                                }
                              />
                            </td>
                          ),
                          offerRequestedAmount: (material) => (
                            <td>
                              <input
                                type="number"
                                disabled={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.final !== undefined}
                                value={selectedMaterials.find(m => m.MaterialID === material.MaterialID)?.OfferRequestedAmount || ""}
                                onChange={(e) =>
                                  setSelectedMaterials((prev) =>
                                    prev.map((m) =>
                                      m.MaterialID === material.MaterialID
                                        ? { ...m, OfferRequestedAmount: Number(e.target.value) }
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
  onClick={() => {
    const selectedCount = selectedMaterials.filter(m => !m.final).length;
    if (selectedCount === 0) {
      setModalMessages({...modalMessages, warning: 'Lütfen önce malzeme seçiniz.'});
      setModals({...modals, warning: true});
      return;
    }
    setSelectedMaterials((prev) => prev.map(m => ({ ...m, RequestedAmount: m.OfferRequestedAmount, final: true })));
    setModalMessages({...modalMessages, info: 'Malzemeler başarıyla listeye eklendi.'});
    setModals({...modals, info: true});
  }}
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
          onClick={handleCancel}
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
      <CustomModal 
  show={modals.warning || modals.info || modals.materialDelete || modals.supplierDelete || modals.select || modals.cancel || modals.save}
  onClose={() => {
      if (modals.save) {
    history.push("/satinalma/teklif-siparis-liste");
  }
    setModals({
      warning: false, 
      info: false, 
      materialDelete: false, 
      supplierDelete: false, 
      select: false,
      cancel: false,
      save: false
    });
    setMaterialToDelete(null);
    setSupplierToDelete(null);
  }}
  message={
    modals.materialDelete ? modalMessages.materialDelete : 
    modals.supplierDelete ? modalMessages.supplierDelete :
    modals.warning ? modalMessages.warning : 
    modals.select ? modalMessages.select :
    modals.cancel ? modalMessages.cancel :
    modals.save ? modalMessages.save :
    modalMessages.info
  }
  type={modals.warning || modals.materialDelete || modals.supplierDelete || modals.cancel ? 'warning' : 'info'}
  showExitWarning={modals.materialDelete || modals.supplierDelete || modals.cancel}
  onExit={() => {
    if (modals.materialDelete) {
      handleRemoveMaterial();
    } else if (modals.supplierDelete) {
      handleRemoveSupplier();
    } else if (modals.cancel) {
      history.push("/satinalma/teklif-siparis-liste");
    }
  }}
/>




    </div>
  );
};

export default TeklifIsteme;
