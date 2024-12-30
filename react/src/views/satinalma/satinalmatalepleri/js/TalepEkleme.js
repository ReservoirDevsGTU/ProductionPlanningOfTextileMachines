import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CInput, CSelect, CButton } from "@coreui/react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import baseURL from "./baseURL";
import CustomTable from "../../CustomTable.js";
import { faTimes, faArrowLeft, faSave} from '@fortawesome/free-solid-svg-icons';
import { faFileExcel, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import CustomModal from '../../CustomModal.js';


const TalepEkleme = ({ editID }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedButton, setSelectedButton] = useState("secili");
  const [searchTerm, setSearchTerm] = useState("");
  const [templateModal, setTemplateModal] = useState(false);
  const [templateTable, setTemplateTable] = useState([]);
  const history = useHistory();

   const [isDirty, setIsDirty] = useState(false);
   const [modals, setModals] = useState({ warning: false, info: false });
   const [modalMessages, setModalMessages] = useState({ warning: '', info: '' });
   const [showExitWarning, setShowExitWarning] = useState(false);

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });
  
  const handleGoBack = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    history.push("/satinalma/talepler");
  };

const handleGoBackButton = () => {
 if (isDirty) {
   setModalMessages({...modalMessages, warning: 'Yaptığınız değişiklikler kaybolacak. Çıkmak istediğinize emin misiniz?'});
   setModals({...modals, warning: true});
   setShowExitWarning(true);
 } else {
   history.push("/satinalma/talepler");
 }
};

const handleModalClose = () => {
  if (showExitWarning) {
    setShowExitWarning(false);
    setModals({warning: false, info: false});
  } 
  else if (modals.info) {
    setModals({warning: false, info: false});
    history.push("/satinalma/talepler");
  }
  else {
    setModals({warning: false, info: false});
  }
};

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setSearchTerm("");
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      if (prev.find((item) => item.MaterialID === material.MaterialID)) return prev;
      setIsDirty(true);
      return [...prev, { ...material, RequestedAmount: 1 }];
    });
  };

  const handleRemoveMaterial = (id) => {
    setSelectedMaterials(selectedMaterials.filter((material) => material.MaterialID !== id));
    setIsDirty(true);
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) =>
        material.MaterialID === id ? { ...material, RequestedAmount: quantity } : material
      )
    );
    setIsDirty(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const getSubmitData = () => ({
    RequestDeadline: requestDetails.date,
    RequestedBy: requestDetails.requester,
    CreatedBy: requestDetails.requester,
    RequestDescription: requestDetails.description,
    ManufacturingUnitID: 1,
    IsDraft: true,
    Materials: selectedMaterials.map((m) => ({
      MaterialID: m.MaterialID,
      RequestedAmount: m.RequestedAmount,
    })),
  });

  const handleSubmit = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      setModalMessages({...modalMessages, warning: 'Lütfen tüm gerekli alanları doldurun!'});
      setModals({...modals, warning: true});
      return;
    }
    if (editID) {
      axios.post(baseURL + "/deleteRequest.php", new URLSearchParams({ request_id: editID }));
    }
    axios.post(baseURL + "/addRequest.php", { ...getSubmitData(), IsDraft: true });
    setModalMessages({...modalMessages, info: 'Talebiniz başarıyla kaydedildi.'});
    setModals({...modals, info: true});
    handleGoBack();
  };

  const handleOnayaGonder = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      setModalMessages({...modalMessages, warning: 'Lütfen tüm gerekli alanları doldurun!'});
      setModals({...modals, warning: true});
      return;
    }
    if (editID) {
      axios.post(baseURL + "/deleteRequest.php", new URLSearchParams({ request_id: editID }));
    }
    axios.post(baseURL + "/addRequest.php", { ...getSubmitData(), IsDraft: false });
    setModalMessages({...modalMessages, info: 'Talebiniz onaya gönderildi.'});
    setModals({...modals, info: true});
    handleGoBack();

  };

  useEffect(() => {
    if (editID) {
      axios
        .post(baseURL + "/queryRequests.php", { subTables: {Materials: {expand: false}}, filters: { RequestID: [editID] } })
        .then((response) => {
          const data = response.data[0];
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy,
            description: data.RequestDescription,
          });
          setSelectedMaterials(data.Materials || []);
        })
        .catch((error) => console.error("Error fetching request details:", error));
    }

    axios
      .post(baseURL + "/queryUsers.php")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, [editID]);

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const workbook = XLSX.read(reader.result);
      const table = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const response = await axios.post(baseURL + "/queryMaterials.php", {
        filters: { MaterialID: table.map((e) => e.MaterialID) },
      });
      setTemplateTable(
        response.data.map((e) => ({
          ...e,
          RequestedAmount: table.find((r) => r.MaterialID === e.MaterialID).Quantity,
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileInput = (event) => processFile(event.target.files[0]);

  const addTemplateData = () => {
    const template = templateTable;
    const selected = selectedMaterials;
    template.forEach((e) => {
      const exist = selected.findIndex((s) => s.MaterialID === e.MaterialID);
      if (exist !== -1) {
        selected[exist].RequestedAmount =
          Number(selected[exist].RequestedAmount) + Number(e.RequestedAmount);
      } else {
        selected.push(e);
      }
    });
    setSelectedMaterials(selected);
    setTemplateModal(false);
  };

  return (
    <div
      style={{
        width: "80%",
        margin: "2% auto 20%",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <CButton
          onClick={handleGoBackButton}
          color="dark"
          variant="outline"
          size="md"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{marginRight: '8px'}}/> Geri
        </CButton>
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <CButton
            color="primary"
            variant="outline"
            size="md"
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
               cursor: "pointer",
            }}
          >
           <FontAwesomeIcon icon={faSave} style={{marginRight: '8px'}} /> Kaydet
          </CButton>
          <CButton
            color="success"
            variant="outline"
            size="md"
            onClick={handleOnayaGonder}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faPaperPlane} style={{marginRight: '8px'}} /> Onaya Gönder
          </CButton>
        </div>
      </div>

      <h2>{editID ? "Talep Düzenle" : "Satın Alma Talebi"}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ width: "50%" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Termin Tarihi
          </label>
          <CInput
            type="date"
            name="date"
            value={requestDetails.date}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              margin: "5px 0 10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ width: "40%", paddingBottom: "8px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Talep Eden
          </label>
          <CSelect
            name="requester"
            value={requestDetails.requester}
            onChange={handleInputChange}
            required
            style={{
              height: "45px",
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">Seçiniz</option>
            {users.map((user) => (
              <option key={user.UserID} value={user.UserID}>
                {user.UserName}
              </option>
            ))}
          </CSelect>
        </div>
      </div>

      <textarea
        name="description"
        value={requestDetails.description}
        onChange={handleInputChange}
        style={{
          width: "100%",
          height: "100px",
          padding: "8px",
          margin: "5px 0 10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      ></textarea>

      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0",
        }}
      >
        <button
          onClick={() => handleButtonClick("secili")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedButton === "secili" ? "black" : "white",
            color: selectedButton === "secili" ? "white" : "black",
            border: selectedButton === "secili" ? "none" : "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Seçili Malzemeler
        </button>
        <button
          onClick={() => handleButtonClick("tum")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedButton === "tum" ? "black" : "white",
            color: selectedButton === "tum" ? "white" : "black",
            border: selectedButton === "tum" ? "none" : "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Tüm Malzemeler
        </button>
        <CButton
          color="success"
          variant="outline"
          size="md"
          onClick={() => setTemplateModal(true)}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
         <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '8px' }}/> Şablondan Aktar
        </CButton>
      </div>

      <CInput
        type="text"
        placeholder="Malzeme No veya Adı Giriniz..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "40%",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "20px",
          marginLeft: "auto",
        }}
      />

      <CustomTable
        data={selectedButton === "secili" ? selectedMaterials : false}
        update={!templateModal}
        fetchAddr="/queryMaterials.php"
        searchTerm={searchTerm}
        searchFields={["MaterialNo", "MaterialName"]}
        fields={[
          { label: "Malzeme No", key: "MaterialNo" },
          { label: "Malzeme Adı", key: "MaterialName" },
          { label: "Toplam Stok", key: "Quantity" },
          { label: selectedButton === "secili" ? "Miktar" : "", key: "miktar" },
          { label: "Birim", key: "UnitID" },
          { label: "İşlem", key: "islem" },
        ]}
        scopedSlots={{
          miktar: (item) => selectedButton === "secili" ? (
            <td>
              <input
                type="number"
                value={item.RequestedAmount || ""}
                onChange={(e) => handleQuantityChange(item.MaterialID, e.target.value)}
                min="1"
                style={{
                  width: "80px",
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </td>
          ) : (<td/>),
          islem: (item) => (
            <td>
              {selectedButton === "secili" ? (
                <button
                  onClick={() => handleRemoveMaterial(item.MaterialID)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Sil
                </button>
              ) : (
                <button
                  onClick={() => handleMaterialSelect(item)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Seç
                </button>
              )}
            </td>
          ),
        }}
      />

<CustomModal 
  show={modals.warning || modals.info}
  onClose={handleModalClose}
  message={modals.warning ? modalMessages.warning : modalMessages.info}
  type={modals.warning ? 'warning' : 'info'}
  showExitWarning={showExitWarning}
  onExit={() => {
    handleModalClose();
    history.push("/satinalma/talepler");
  }}
/>

      {templateModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Malzeme Ekleme Formu</h3>
              <CButton
                color="danger"
                variant='outline'
                onClick={() => setTemplateModal(false)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faTimes}/>
              </CButton>
            </div>

            {templateTable.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "20px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      Malzeme No
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      Malzeme Adı
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      Toplam Stok
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      Birim
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      Miktar
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                      }}
                    >
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templateTable.map((material) => (
                    <tr key={material.MaterialID}>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        {material.MaterialNo}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        {material.MaterialName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        {material.Quantity}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        {material.UnitID}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        <input
                          type="number"
                          value={material.RequestedAmount}
                          onChange={(e) =>
                            setTemplateTable(
                              templateTable.map((m) =>
                                m.MaterialID === material.MaterialID
                                  ? { ...m, RequestedAmount: e.target.value }
                                  : m
                              )
                            )
                          }
                          style={{
                            width: "80px",
                            padding: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                          min="1"
                        />
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                        <button
                          onClick={() =>
                            setTemplateTable(
                              templateTable.filter((m) => m.MaterialID !== material.MaterialID)
                            )
                          }
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <label
                style={{
                  display: "block",
                  border: "2px dashed #ccc",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Dosya Sürükle veya Tıkla
                <input
                  type="file"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {templateTable.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => setTemplateModal(false)}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    marginRight: "10px",
                    cursor: "pointer",
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={addTemplateData}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TalepEkleme;
