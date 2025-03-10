import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CInput, CSelect, CButton } from "@coreui/react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import baseURL from "../../baseURL";
import CustomTable from "../../CustomTable.js";
import { faTimes, faArrowLeft, faSave, faTrash} from '@fortawesome/free-solid-svg-icons';
import { faFileExcel, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import CustomModal from '../../CustomModal.js';
import SearchBox from '../../SearchBox.js';


const TalepEkleme = ({ editID }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedButton, setSelectedButton] = useState("secili");
  const [searchTerm, setSearchTerm] = useState("");
  const [templateModal, setTemplateModal] = useState(false);
  const [templateTable, setTemplateTable] = useState([]);
  const history = useHistory();

   const [isDirty, setIsDirty] = useState(false);
   const [modals, setModals] = useState({ warning: false, info: false, delete: false, select: false, template: false, fileWarning: false, templateCancel: false});
   const [modalMessages, setModalMessages] = useState({ warning: '', info: '', delete:'', select: '', template: '', fileWarning: '', templateCancel: ''});  
   
   const [showExitWarning, setShowExitWarning] = useState(false);

   const [materialToDelete,setMaterialToDelete] = useState(null);

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    initialRequester: null,
    description: "",
  });
  
  useEffect(() => {
    const unblock = history.block((location, action) => {
      if (action === 'POP' && isDirty) {
        handleGoBackButton();
        return false;
      }
    });

    return () => {
      unblock();
    };
  }, [history, isDirty]);

  const handleGoBack = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
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

const closeTemplateModal = () => {
  setTemplateModal(false);
  setTemplateTable([]);
};

const handleModalClose = () => {
  if (showExitWarning) {
    setShowExitWarning(false);
    setModals({...modals, warning: false});
  } 
  else if (modals.info) {
    setModals({...modals, info: false});
    history.push("/satinalma/talepler");
  }
  else if (modals.templateCancel) {
    setModals({...modals, templateCancel: false});
  }
  else {
    setModals({warning: false, info: false, templateCancel: false});
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
      setModalMessages({
        ...modalMessages, 
        select: `'${material.MaterialName}' malzemesi başarıyla seçili malzemelere eklendi.`
      });
      setModals({...modals, select: true});
      return [...prev, { ...material, RequestedAmount: 1 }];
    });
};

  const handleRemoveMaterial = (material) => {
    setMaterialToDelete(material);
    setModalMessages({
      ...modalMessages, 
      delete: `'${material.MaterialName}' malzemesini silmek istediğinize emin misiniz?`
    });
    setModals({...modals, delete: true});
  };

  const confirmDelete = (type) => {
    // Template içinden silme
    if (type === 'template') {
      setTemplateTable(prev =>
        prev.filter(material => material.MaterialID !== materialToDelete.MaterialID)
      );
      setModals({...modals, template: false});
    } 
    // Ana listeden silme
    else {
      setSelectedMaterials(prev => 
        prev.filter(material => material.MaterialID !== materialToDelete.MaterialID)
      );
      setIsDirty(true);
      setModals({...modals, delete: false});
    }
    setMaterialToDelete(null);
  };

  const handleQuantityChange = (id, quantity) => {
    const value = quantity === '' ? '' : Number(quantity);
    // Sadece sayı girildiğinde ve 0 veya negatif olduğunda kontrol et
    if (value !== '' && value <= 0) {
      setModalMessages({
        ...modalMessages,
        warning: 'Lütfen miktarı sıfırdan büyük bir sayı giriniz!'
      });
      setModals({...modals, warning: true});
      return;
    }
    setSelectedMaterials((prev) =>
      prev.map((material) =>
        material.MaterialID === id ? { ...material, RequestedAmount: value } : material
      )
    );
    setIsDirty(true);
  };

  const validateMaterials = () => {
    const invalidMaterials = selectedMaterials.filter(m => 
      m.RequestedAmount === '' || 
      m.RequestedAmount === undefined || 
      (typeof m.RequestedAmount === 'number' && m.RequestedAmount <= 0)
    );
    
    if (invalidMaterials.length > 0) {
      setModalMessages({
        ...modalMessages,
        warning: 'Tüm malzemeler için geçerli bir miktar girilmelidir!'
      });
      setModals({...modals, warning: true});
      return false;
    }
    return true;
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
  
    if (!validateMaterials()) {
      return;
    }
  
    axios.post(baseURL + (!editID ? "/addRequest.php" : "/editRequest.php"), { ...getSubmitData(), RequestStatus: 0, RequestID: editID});
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
  
    if (!validateMaterials()) {
      return;
    }
  
    axios.post(baseURL + (!editID ? "/addRequest.php" : "/editRequest.php"), { ...getSubmitData(), RequestStatus: 1, RequestID: editID});
    setModalMessages({...modalMessages, info: 'Talebiniz onaya gönderildi.'});
    setModals({...modals, info: true});
    handleGoBack();
  };

  useEffect(() => {
    if (editID) {
      axios
        .post(baseURL + "/queryRequests.php", { subTables: {Materials: {expand: false}}, filters: [{ RequestID: [editID] }] })
        .then((response) => {
          const data = response.data[0];
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy,
            initialRequester: data.RequestedBy,
            description: data.RequestDescription,
          });
          setSelectedMaterials(data.Materials || []);
        })
        .catch((error) => console.error("Error fetching request details:", error));
    }
  }, [editID]);


  
  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const workbook = XLSX.read(reader.result);
      const table = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const response = await axios.post(baseURL + "/queryMaterials.php", {
        filters: [{ MaterialID: table.map((e) => e.MaterialID) }],
      });
      setTemplateTable(
        response.data.map((e) => ({
          ...e,
          RequestedAmount: table.find((r) => r.MaterialID === e.MaterialID).RequestedAmount,
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    // Dosya uzantısını kontrol et
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['xlsx', 'xls'];
  
    // Eğer dosya Excel değilse uyarı göster
    if (!validExtensions.includes(fileExtension)) {
      setModalMessages({
        ...modalMessages,
        fileWarning: 'Lütfen sadece Excel formatında (.xlsx veya .xls) dosya yükleyiniz.'
      });
      setModals({...modals, fileWarning: true});
      event.target.value = ''; // Input'u temizle
      return;
    }
  
    processFile(file);
  };
  const addTemplateData = () => {
    // Miktar kontrolü
    const invalidMaterials = templateTable.filter(m => 
      m.RequestedAmount === '' || 
      m.RequestedAmount === undefined || 
      (typeof m.RequestedAmount === 'number' && m.RequestedAmount <= 0)
    );
    
    if (invalidMaterials.length > 0) {
      setModalMessages({
        ...modalMessages,
        warning: 'Tüm malzemeler için geçerli bir miktar girilmelidir!'
      });
      setModals({...modals, warning: true});
      return;
    }
  
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
    closeTemplateModal();
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
          <SearchBox fetchAddr="/queryUsers.php" value="UserID" initialValue={requestDetails.initialRequester} label="UserName" onSelect={v=>setRequestDetails(prev => ({...prev, requester: v}))}/>
          {/*
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
          */}
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
                onClick={() => handleRemoveMaterial(item)}
                style={{
                    backgroundColor: "transparent",
                    color: "#dc3545",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
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
  show={modals.warning || modals.info || modals.delete || modals.select || modals.template || modals.fileWarning || modals.templateCancel}
  onClose={handleModalClose}
  message={
    modals.delete ? modalMessages.delete : 
    modals.warning ? modalMessages.warning : 
    modals.select ? modalMessages.select :
    modals.template ? modalMessages.template :
    modals.fileWarning ? modalMessages.fileWarning :
    modals.templateCancel ? modalMessages.templateCancel :
    modalMessages.info
  }
  type={modals.warning || modals.delete || modals.template || modals.templateCancel || modals.fileWarning ? 'warning' : 'info'}
  showExitWarning={showExitWarning || modals.delete || modals.template || modals.templateCancel}
  onExit={() => {
    if (showExitWarning) {
      handleModalClose();
      history.push("/satinalma/talepler");
    } else if (modals.delete) {
      confirmDelete('main');
    } else if (modals.template) {
      confirmDelete('template');
    } else if (modals.templateCancel) {
      closeTemplateModal();
      setModals({...modals, templateCancel: false});
    }
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
                onClick={() => {
                  if (templateTable.length > 0) {
                    setModalMessages({
                      ...modalMessages,
                      templateCancel: 'Şablondan aktarma işlemini iptal etmek istediğinize emin misiniz? Yaptığınız değişiklikler kaybolacaktır.'
                    });
                    setModals({...modals, templateCancel: true});
                  } else {
                    closeTemplateModal();
                  }
                }}  
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
  min="1"
  value={material.RequestedAmount}
  onChange={(e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    // Sadece sayı girildiğinde ve 0 veya negatif olduğunda kontrol et
    if (value !== '' && value <= 0) {
      setModalMessages({
        ...modalMessages,
        warning: 'Lütfen miktarı sıfırdan büyük bir sayı giriniz!'
      });
      setModals({...modals, warning: true});
      return;
    }
    setTemplateTable(
      templateTable.map((m) =>
        m.MaterialID === material.MaterialID
          ? { ...m, RequestedAmount: value }
          : m
      )
    );
  }}
  style={{
    width: "80px",
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  }}
/>
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                        }}
                      >
                      <button
                        onClick={() => {
                          setModalMessages({
                            ...modalMessages,
                            template: `'${material.MaterialName}' malzemesini listeden çıkarmak istediğinize emin misiniz?`
                          });
                          setModals({...modals, template: true});
                          setMaterialToDelete(material);
                        }}
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
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
  <button
    onClick={() => {
      if (templateTable.length > 0) {
        setModalMessages({
          ...modalMessages,
          templateCancel: 'Şablondan aktarma işlemini iptal etmek istediğinize emin misiniz? Yaptığınız değişiklikler kaybolacaktır.'
        });
        setModals({...modals, templateCancel: true});
      } else {
        closeTemplateModal();
      }
    }}
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TalepEkleme;
