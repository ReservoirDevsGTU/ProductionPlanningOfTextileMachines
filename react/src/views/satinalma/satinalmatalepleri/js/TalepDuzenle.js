import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { CInput, CSelect, CButton } from "@coreui/react";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faPaperPlane, faFileExcel, faTimes } from "@fortawesome/free-solid-svg-icons";
import baseURL from "./baseURL.js";

const TalepDuzenle = () => {
  const { id } = useParams(); // Düzenlenecek talebin ID'si
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [templateModal, setTemplateModal] = useState(false);
  const [templateTable, setTemplateTable] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedButton, setSelectedButton] = useState("secili");
  const [searchTerm, setSearchTerm] = useState("");
  const history = useHistory();

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      // Talep detaylarını getir
      axios
        .get(baseURL + "/getRequestByID.php?id=" + id)
        .then((response) => {
          const data = response.data;
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy,
            description: data.RequestDescription,
          });
        })
        .catch((error) => console.error("Error fetching request details:", error));

      // Seçili malzemeleri getir
      axios
        .get(baseURL + "/getRequestsMaterials.php?id=" + id)
        .then((response) => setSelectedMaterials(response.data || []))
        .catch((error) => console.error("Error fetching request materials:", error));

      // Tüm malzemeleri getir
      axios
        .get(baseURL + "/listAllMaterials.php")
        .then((response) => setAllMaterials(response.data))
        .catch((error) => console.error("Error fetching all materials:", error));

      // Kullanıcı listesini getir
      axios
        .get(baseURL + "/listUsers.php")
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [id]);

  const handleGoBack = () => {
    history.push("/satinalma/talepler");
  };

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setSearchTerm("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      if (prev.find((item) => item.MaterialID === material.MaterialID)) return prev;
      return [...prev, { ...material, RequestedAmount: 1 }];
    });
  };

  const handleRemoveMaterial = (id) => {
    setSelectedMaterials((prev) =>
      prev.filter((material) => material.MaterialID !== id)
    );
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) =>
        material.MaterialID === id ? { ...material, RequestedAmount: quantity } : material
      )
    );
  };

  const handleSubmit = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    axios.post(baseURL + "/updateRequest.php", {
      RequestID: id,
      ...requestDetails,
      Materials: selectedMaterials.map((m) => ({
        MaterialID: m.MaterialID,
        RequestedAmount: m.RequestedAmount,
      })),
    });
    handleGoBack();
  };

  const handleOnayaGonder = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    axios.post(baseURL + "/sendRequestForApproval.php", { RequestID: id });
    alert("Talep onaya gönderildi.");
    handleGoBack();
  };

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

  const displayedMaterials =
    selectedButton === "secili"
      ? selectedMaterials.filter((material) =>
          material.MaterialName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allMaterials.filter((material) =>
          material.MaterialName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div style={{ width: "80%", margin: "2% auto 20%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",  padding: "10px"}}>
        <CButton onClick={handleGoBack} color="dark" variant="outline" size="md"
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}>
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "8px" }} />
          Geri
        </CButton>
        <div style={{ display: "flex", gap: "10px" }}>
          <CButton onClick={handleSubmit} color="primary" variant="outline" size="md"
                      style={{
                        padding: "10px 20px",
                         cursor: "pointer",
                      }}>
            <FontAwesomeIcon icon={faSave} style={{ marginRight: "8px" }} />
            Güncelle
          </CButton>
          <CButton onClick={handleOnayaGonder} color="success" variant="outline" size="md"
                      style={{
                        padding: "10px 20px",
                         cursor: "pointer",
                      }}>
            <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: "8px" }} />
            Onaya Gönder
          </CButton>
        </div>
      </div>

      <h2>Talep Düzenle</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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

      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
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
        >
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "8px" }} />
          Şablondan Aktar
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

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme No</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme Adı</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Toplam Stok</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Birim</th>
            {selectedButton === "secili" && (
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Miktar</th>
            )}
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {displayedMaterials.map((material) => (
            <tr key={material.MaterialID}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialID}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialName}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.Quantity}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.UnitID}</td>
              {selectedButton === "secili" && (
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <input
                    type="number"
                    value={material.RequestedAmount || ""}
                    onChange={(e) =>
                      handleQuantityChange(material.MaterialID, e.target.value)
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
              )}
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {selectedButton === "secili" ? (
                  <button
                    onClick={() => handleRemoveMaterial(material.MaterialID)}
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
                    onClick={() => handleMaterialSelect(material)}
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
            </tr>
          ))}
        </tbody>
      </table>

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
                variant="outline"
                onClick={() => setTemplateModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </CButton>
            </div>

            {templateTable.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme No</th>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme Adı</th>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>Toplam Stok</th>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>Birim</th>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>Miktar</th>
                    <th style={{ border: "1px solid #ccc", padding: "10px" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {templateTable.map((material) => (
                    <tr key={material.MaterialID}>
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialNo}</td>
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialName}</td>
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.Quantity}</td>
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.UnitID}</td>
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                        <input
                          type="number"
                          value={material.RequestedAmount || ""}
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
                      <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                        <button
                          onClick={() =>
                            setTemplateTable((prev) =>
                              prev.filter((m) => m.MaterialID !== material.MaterialID)
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
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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

export default TalepDuzenle;
