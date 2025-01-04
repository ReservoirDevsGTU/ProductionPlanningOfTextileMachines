import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  CButton,
  CInput,
  CSelect,
  CTextarea,
  CForm,
  CFormGroup,
  CLabel,
} from "@coreui/react";

const GirisFormu = () => {

  const history = useHistory(); // useHistory hook'u

  const [activeTab, setActiveTab] = useState("siparisBilgileri");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleKaydet = () => {
    alert("Kaydetme işlemi tamamlandı!");
  };

  const handleIptal = () => {
    //alert("İptal edildi!");
    history.push("/satinalma/siparis-listesi"); // Yönlendirme yapılacak rota
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Giriş Formu</h1>
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <button
          onClick={() => handleTabClick("siparisBilgileri")}
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
          onClick={() => handleTabClick("malzemeler")}
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

      {activeTab === "siparisBilgileri" && (
        <CForm>
          <CFormGroup
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <CLabel>İrsaliye Numarası</CLabel>
              <CInput placeholder="İrsaliye Numarası" />
            </div>
            <div>
              <CLabel>Teslim Alma Tarihi</CLabel>
              <CInput type="date" placeholder="dd-mm-yyyy" />
            </div>
            <div>
              <CLabel>Tedarikçi Firma</CLabel>
              <CSelect>
                <option>XXX Tedarikçi</option>
                <option>YYY Tedarikçi</option>
                <option>ZZZ Tedarikçi</option>
              </CSelect>
            </div>
            <div>
              <CLabel>Teslim Eden</CLabel>
              <CInput placeholder="Teslim Eden" />
            </div>
            <div>
              <CLabel>Teslim Alan</CLabel>
              <CSelect>
                <option>XX Kullanıcı</option>
                <option>YY Kullanıcı</option>
                <option>ZZ Kullanıcı</option>
              </CSelect>
            </div>
            <div>
              <CLabel>Teslim Ambarı</CLabel>
              <CSelect>
                <option>X Ambarı</option>
                <option>Y Ambarı</option>
                <option>Z Ambarı</option>
              </CSelect>
            </div>
          </CFormGroup>
          <CFormGroup style={{ marginTop: "20px" }}>
            <CLabel>Notlar</CLabel>
            <CTextarea placeholder="Not giriniz ..." rows="4" />
          </CFormGroup>
          {/* Kaydet ve İptal butonları yalnızca Sipariş Bilgileri sekmesinde */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            <CButton
              color="danger"
              onClick={handleIptal}
              style={{ padding: "10px 20px" }}
            >
              İptal
            </CButton>
            <CButton
              color="success"
              onClick={handleKaydet}
              style={{ padding: "10px 20px" }}
            >
              Kaydet
            </CButton>
          </div>
        </CForm>
      )}

      {activeTab === "malzemeler" && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h3>Malzemeler sekmesi henüz uygulanmadı.</h3>
        </div>
      )}
    </div>
  );
};

export default GirisFormu;
