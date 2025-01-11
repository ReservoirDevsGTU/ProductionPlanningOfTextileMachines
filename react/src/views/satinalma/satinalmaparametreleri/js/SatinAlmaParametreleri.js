import React, { useState } from "react";
import { CButton } from "@coreui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';  // FontAwesome çöp kutusu ikonu
import CustomTable from '../../CustomTable.js';

const SatinAlmaParametreleri = () => {
  const [activeMainTab, setActiveMainTab] = useState("talepteOnay");
  const [activeSubTab, setActiveSubTab] = useState("kullanicilar");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Kullanıcılar tablosu sütunları
  const kullaniciFields = [
    { key: "delete", label: "Sil", _style: { minWidth: "60px" }, render: (value, row) => (
        <span 
          style={{ cursor: "pointer", color: "red" }} 
          onClick={() => handleDelete(row, "kullanici")}
        >
          <FontAwesomeIcon icon={faTrashAlt} />  {/* FontAwesome çöp kutusu ikonu */}
        </span>
      ) 
    },
    { key: "Adi", label: "Adı", _style: { minWidth: "100px" } },
    { key: "Soyadi", label: "Soyadı", _style: { minWidth: "100px" } },
    { key: "Sirket", label: "Şirket", _style: { minWidth: "100px" } },
    { key: "Unvan", label: "Unvan", _style: { minWidth: "100px" } },
  ];

  // Gruplar tablosu sütunları
  const grupFields = [
    { key: "delete", label: "Sil", _style: { minWidth: "60px" }, render: (value, row) => (
        <span 
          style={{ cursor: "pointer", color: "red" }} 
          onClick={() => handleDelete(row, "grup")}
        >
          <FontAwesomeIcon icon={faTrashAlt} />  {/* FontAwesome çöp kutusu ikonu */}
        </span>
      )
    },
    { key: "GrupIsmi", label: "Grup İsmi", _style: { minWidth: "120px" } },
    { key: "PersonelSayisi", label: "Personel Sayısı", _style: { minWidth: "100px" } },
    { key: "AksiyonDurumu", label: "Aksiyon Durumu", _style: { minWidth: "120px" } },
  ];

  // Dummy data
  const [kullaniciData, setKullaniciData] = useState([
    { Adi: "XXX", Soyadi: "XXX", Sirket: "XXX", Unvan: "XXX" },
    { Adi: "XXY", Soyadi: "XXY", Sirket: "...", Unvan: "..." },
    { Adi: "XYY", Soyadi: "XYY", Sirket: "...", Unvan: "..." },
  ]);

  const [grupData, setGrupData] = useState([
    { GrupIsmi: "XXX", PersonelSayisi: "XX", AksiyonDurumu: "Aksiyoner" },
    { GrupIsmi: "XXY", PersonelSayisi: "Y", AksiyonDurumu: "Aksiyoner Değil" },
    { GrupIsmi: "XYY", PersonelSayisi: "...", AksiyonDurumu: "..." },
  ]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDelete = (row, type) => {
    const confirmation = window.confirm("Silmek istediğinizden emin misiniz?");
    if (confirmation) {
      if (type === "kullanici") {
        setKullaniciData(kullaniciData.filter((item) => item !== row));
      } else if (type === "grup") {
        setGrupData(grupData.filter((item) => item !== row));
      }
    }
  };

  const filteredKullaniciData = kullaniciData.filter((user) => 
    Object.values(user).some(value => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredGrupData = grupData.filter((group) => 
    Object.values(group).some(value => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Satınalma Parametreleri</h1>

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <CButton
          onClick={() => setActiveMainTab("talepteOnay")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeMainTab === "talepteOnay" ? "#000" : "#ccc",
            color: activeMainTab === "talepteOnay" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Talepte Onay
        </CButton>
        <CButton
          onClick={() => setActiveMainTab("teklifteOnay")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: activeMainTab === "teklifteOnay" ? "#000" : "#ccc",
            color: activeMainTab === "teklifteOnay" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Teklifte Onay
        </CButton>
      </div>

      {/* Talepte Onay Content */}
      {activeMainTab === "talepteOnay" && (
        <>
          <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>
            Satınalma Talebinde Onaya Tabii Kullanıcılar
          </h3>

          {/* Sub Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <CButton
              onClick={() => setActiveSubTab("kullanicilar")}
              style={{
                padding: "10px 20px",
                border: "none",
                background: activeSubTab === "kullanicilar" ? "#000" : "#ccc",
                color: activeSubTab === "kullanicilar" ? "#fff" : "#000",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Kullanıcılar
            </CButton>
            <CButton
              onClick={() => setActiveSubTab("gruplar")}
              style={{
                padding: "10px 20px",
                border: "none",
                background: activeSubTab === "gruplar" ? "#000" : "#ccc",
                color: activeSubTab === "gruplar" ? "#fff" : "#000",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Gruplar
            </CButton>
          </div>

          {/* Arama Kutu */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                maxWidth: "200px",
              }}
            />
          </div>

          {/* Kullanıcılar Tablosu */}
          {activeSubTab === "kullanicilar" && (
            <>
              <CustomTable
                data={filteredKullaniciData}
                fields={kullaniciFields}
                addTableClasses="table-striped table-hover"
                tableStyle={{
                  tableLayout: "auto",  // Sütunlar esnek olmalı
                  width: "100%",
                  borderCollapse: "collapse", // Kenarları birleştirir
                }}
              />
            </>
          )}

          {/* Gruplar Tablosu */}
          {activeSubTab === "gruplar" && (
            <>
              <CustomTable
                data={filteredGrupData}
                fields={grupFields}
                addTableClasses="table-striped table-hover"
                tableStyle={{
                  tableLayout: "auto",  // Sütunlar esnek olmalı
                  width: "100%",
                  borderCollapse: "collapse", // Kenarları birleştirir
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SatinAlmaParametreleri;
