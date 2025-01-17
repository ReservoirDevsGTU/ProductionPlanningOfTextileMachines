import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from 'axios';
import baseURL from "../../baseURL.js";
import SearchBox from "../../SearchBox.js";
import {
  CButton,
  CInput,
  CForm,
  CFormGroup,
  CLabel,
  CSelect,
  CTextarea,
} from "@coreui/react";
import CustomModal from "../../CustomModal.js";

const GirisFormu = () => {
  const history = useHistory();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("siparisBilgileri");
  
  // Ana state'ler
  const [orderData, setOrderData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state'leri
  const [formData, setFormData] = useState({
    irsaliyeNo: "",
    teslimEden: "",
    teslimAlan: "",
    notlar: ""
  });

  const [modals, setModals] = useState({
    exit: false,      // İptal / Vazgeç
    fillError: false, // Gerekli alanlar boşsa
    success: false,   // Kaydet sonrası başarı
    warning: false,   // 0 veya negatif değer girme
  });
  const [modalMessages, setModalMessages] = useState({
    exit: "",
    fillError: "",
    success: "",
    warning: "",
  });

  // Veri çekme - Sipariş detayları
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        console.log("Veri çekme başladı, OrderID:", id);
        
        const response = await axios.post(baseURL + "/queryOrders.php", {  // baseURL eklendi
          filters: [ { 
            OrderID: [id]
          } ],
          subTables: {
            Materials: {
              expand: false,
            }
          }
        });
  
      console.log("API Yanıtı:", response.data);

      if (response.data && response.data.length > 0) {
        const order = response.data[0];
        console.log("Sipariş Verisi:", order);
        console.log("Materials Verisi:", order.Materials);
        
        setOrderData(order);
        
        if (order.Materials && order.Materials.length > 0) {
          console.log("Materials Array'i mevcut ve dolu");
          const combinedMaterials = combineMaterials(order.Materials);
          console.log("Birleştirilmiş Materials:", combinedMaterials);
          setMaterials(combinedMaterials);
        } else {
          console.log("Materials Array'i yok veya boş");
        }
      } else {
        console.log("API yanıtı boş veya yanlış formatta");
      }
      setLoading(false);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setLoading(false);
    }
  };

  if (id) {
    fetchOrderData();
  }
}, [id]);

  // Aynı MaterialID'ye sahip malzemeleri birleştir
  const combineMaterials = (materialsList) => {
    console.log("Birleştirme Öncesi Gelen Liste:", materialsList);
    
    const combined = materialsList.reduce((acc, current) => {
      const existingMaterial = acc.find(m => m.MaterialID === current.MaterialID);
      
      if (existingMaterial) {
        existingMaterial.OrderedAmount += Number(current.OrderedAmount);
        existingMaterial.originalItems.push({
          OrderItemID: current.OrderItemID,
          OrderedAmount: current.OrderedAmount,
          MaterialID: current.MaterialID,
          MaterialName: current.MaterialName,
          UnitPrice: current.UnitPrice
        });
      } else {
        acc.push({
          ...current,
          OrderedAmount: Number(current.OrderedAmount),
          ProvidedAmount: 0,
          UnitPrice: current.UnitPrice || 0,
          originalItems: [{
            OrderItemID: current.OrderItemID,
            OrderedAmount: current.OrderedAmount,
            MaterialID: current.MaterialID,
            MaterialName: current.MaterialName,
            UnitPrice: current.UnitPrice
          }]
        });
      }
      return acc;
    }, []);
  
    console.log("Birleştirme Sonrası Liste:", combined);
    return combined;
  };

  // Malzeme input değişikliklerini handle et
  const handleInputChange = (materialId, field, value) => {
    const val = value === "" ? "" : Number(value);

    if (val !== "" && val <= 0) {
      setModalMessages({
        ...modalMessages,
        warning: "Lütfen 0'dan büyük bir değer giriniz!"
      });
      setModals({
        ...modals,
        warning: true
      });
      return;
    }

    setMaterials(prevMaterials => 
      prevMaterials.map(m => 
        m.MaterialID === materialId
          ? { ...m, [field]: val }
          : m
      )
    );
  };

  // Form alanları değişikliklerini handle et
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Kaydet - Form submit
  const handleSubmit = async () => {

    if (!formData.TransactionDate || !formData.WarehouseID || !formData.teslimEden || !formData.irsaliyeNo || !formData.notlar  ) { 
      setModalMessages({
        ...modalMessages,
        fillError: "Lütfen gerekli alanları doldurunuz!"
      });
      setModals({
        ...modals,
        fillError: true
      });
      return;
    }


    try {
      console.log("Gönderim Öncesi Malzeme Durumu:", materials);
  
      // Malzemeleri orijinal kayıtlarına böl
      const splitMaterials = materials.flatMap(material => {
        const totalOrdered = material.OrderedAmount;
        console.log(`${material.MaterialName} için Orijinal Kayıtlar:`, material.originalItems);
        
        return material.originalItems.map(item => {
          const ratio = item.OrderedAmount / totalOrdered;
          const providedForThis = material.ProvidedAmount * ratio;
          
          console.log(`${material.MaterialName} - ${item.OrderItemID} için hesaplama:`, {
            OrderedAmount: item.OrderedAmount,
            TotalOrdered: totalOrdered,
            Ratio: ratio,
            ProvidedAmount: providedForThis,
            OriginalUnitPrice: item.UnitPrice,
            NewUnitPrice: material.UnitPrice
          });
  
          return {
            OrderItemID: item.OrderItemID,
            ProvidedAmount: providedForThis,
            UnitPrice: material.UnitPrice
          };
        });
      });
  
      const submitData = {
      OrderID: orderData.OrderID,
      SupplierID: orderData.SupplierID,
      WarehouseID: formData.WarehouseID,
      TransactionDate: formData.TransactionDate,
      Materials: splitMaterials
    };

    console.log("Backend'e Gönderilecek Veri:", submitData);
    
    await axios.post(baseURL + "/orderEntry.php", submitData);  // baseURL eklendi
    setModalMessages({
      ...modalMessages,
      success: "Giriş işlemi başarıyla kaydedildi."
    });
    setModals({
      ...modals,
      success: true
    });
    setTimeout(() => {
      setModals(prev => ({ ...prev, success: false }));
      history.push("/satinalma/siparis-listesi");
    }, 1500);
  } catch (error) {
    console.error("Gönderme hatası:", error);
  }
  };

  const handleCancel = () => {
    setModalMessages({
      ...modalMessages,
      exit: "Yaptığınız değişiklikler kaybolacak. Çıkmak istediğinize emin misiniz?"
    });
    setModals({
      ...modals,
      exit: true
    });
  };

/*  if (loading) {
    return <div>Yükleniyor...</div>;
  }
*/

  return (
    <div style={{ padding: "20px" }}>
      <h1>Siparişten Giriş Formu</h1>

      <hr style={{ border: '1px solid #333', marginBottom: '20px' }} />      

      {/* Tab Butonları */}
      <div style={{
        display: "flex",
        marginBottom: "20px",
        gap: "10px",
      }}>
        <button
          onClick={() => setActiveTab("siparisBilgileri")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "siparisBilgileri" ? "#000" : "#ccc",
            color: activeTab === "siparisBilgileri" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Sipariş Bilgileri
        </button>
        <button
          onClick={() => setActiveTab("malzemeler")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeTab === "malzemeler" ? "#000" : "#ccc",
            color: activeTab === "malzemeler" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Malzemeler
        </button>
      </div>

      {/* Sipariş Bilgileri Tab */}
      {activeTab === "siparisBilgileri" && (
        <CForm>
          <CFormGroup style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}>
            <div>
              <CLabel>İrsaliye Numarası</CLabel>
              <CInput 
                value={formData.irsaliyeNo}
                onChange={(e) => handleFormChange("irsaliyeNo", e.target.value)}
              />
            </div>
            
            <div>
              <CLabel>Teslim Alma Tarihi</CLabel>
              <CInput 
                type="date"
                value={formData.TransactionDate}
                onChange={(e) => handleFormChange("TransactionDate", e.target.value)}
              />
            </div>

            <div>
              <CLabel>Tedarikçi Firma</CLabel>
              <CInput 
                value={orderData?.SupplierName || ""}
                disabled
              />
            </div>

            <div>
              <CLabel>Teslim Eden</CLabel>
              <CInput 
                value={formData.teslimEden}
                onChange={(e) => handleFormChange("teslimEden", e.target.value)}
              />
            </div>

            <div>
              <CLabel>Teslim Alan</CLabel>
              <CSelect
                value={formData.teslimAlan}
                onChange={(e) => handleFormChange("teslimAlan", e.target.value)}
              >
                <option value="">Seçiniz</option>
                {orderData?.Users?.map(user => (
                  <option key={user.UserID} value={user.UserID}>
                    {user.UserName}
                  </option>
                ))}
              </CSelect>
            </div>

            <div>
              <CLabel>Teslim Ambarı</CLabel>
              <SearchBox fetchAddr="/queryWarehouses.php" label="WarehouseName" value="WarehouseID" onSelect={(v) => handleFormChange("WarehouseID", v)}/>
            </div>
          </CFormGroup>

          <CFormGroup style={{ marginTop: "20px" }}>
            <CLabel>Notlar</CLabel>
            <CTextarea 
              value={formData.notlar}
              onChange={(e) => handleFormChange("notlar", e.target.value)}
              rows="4"
            />
          </CFormGroup>
        </CForm>
      )}

      {/* Malzemeler Tab */}
      {activeTab === "malzemeler" && (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Malzeme No</th>
                <th>Malzeme Adı</th>
                <th>Sipariş Miktarı</th>
                <th>Teslim Alınan Miktar</th>
                <th>Birim Fiyat</th>
                <th>Birim</th>
                <th>Toplam Tutar</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.MaterialID}>
                  <td>{material.MaterialNo}</td>
                  <td>{material.MaterialName}</td>
                  <td>{material.OrderedAmount}</td>
                  <td>
                    <CInput
                      type="number"
                      value={material.ProvidedAmount || ""}
                      onChange={(e) => handleInputChange(material.MaterialID, "ProvidedAmount", e.target.value)}
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>
                    <CInput
                      type="number"
                      value={material.UnitPrice || ""}
                      onChange={(e) => handleInputChange(material.MaterialID, "UnitPrice", e.target.value)}
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>{material.UnitID}</td>
                  <td>{((material.ProvidedAmount || 0) * (material.UnitPrice || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alt Butonlar */}
      <div style={{
        marginTop: "20px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
      }}>
        <CButton
          color="danger"
          variant="outline"
          onClick={handleCancel}
        >
          İptal
        </CButton>
        <CButton
          color="success"
          onClick={handleSubmit}
        >
          Kaydet
        </CButton>
      </div>

      <CustomModal
        show={modals.exit || modals.fillError || modals.success || modals.warning}
        onClose={() => {
          if (modals.success) {
            history.push("/satinalma/siparis-listesi");
          }
          setModals({
            exit: false,
            fillError: false,
            success: false,
            warning: false,
          });
        }}
        message={
          modals.exit
            ? modalMessages.exit
            : modals.fillError
            ? modalMessages.fillError
            : modals.warning
            ? modalMessages.warning
            : modals.success
            ? modalMessages.success
            : ""
        }
        type={
          modals.exit || modals.fillError || modals.warning
            ? "warning"
            : "info"
        }
        showExitWarning={modals.exit}
        onExit={() => {
          if (modals.exit) {
            history.push("/satinalma/siparis-listesi");
          }
        }}
      />

    </div>
  );
};

export default GirisFormu;
