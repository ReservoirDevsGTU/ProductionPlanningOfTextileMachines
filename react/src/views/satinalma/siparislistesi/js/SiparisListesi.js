import React, { useState } from "react";
import "../css/SiparisListesi.css";
import { CInput ,CButton } from "@coreui/react";
import {  faLongArrowAltDown, faPrint, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from "react-router-dom"; // useHistory import edildi
const SiparisListesi = () => {

  const history = useHistory(); // useHistory hook'u kullanılıyor
  
  // Sipariş ve malzeme listesi
  const siparisListesi = [
    {
      tedarikci: "XXX",
      siparisTarihi: "2024-12-25",
      siparisNo: "12345",
      teslimTarihi: "2024-12-30",
      talepNo: "54321",
      durum: "Sipariş Verildi",
      malzemeler: [
        {
          malzemeNo: "001",
          malzemeAdi: "Malzeme 1",
          siparisMiktari: 5,
          kalanSiparisMiktari: 5,
          birim: "Adet",
          talepler: [
            {
              talepNo: "T001",
              talepTarihi: "2024-12-01",
              talepEden: "Ali Veli",
              talepMiktari: 3,
              birim: "Adet",
              durum: "Sipariş Verildi",
            },
            {
              talepNo: "T002",
              talepTarihi: "2024-12-05",
              talepEden: "Ahmet Kaya",
              talepMiktari: 2,
              birim: "Adet",
              durum: "Sipariş Verildi",
            },
          ],
        },
        {
          malzemeNo: "002",
          malzemeAdi: "Malzeme 2",
          siparisMiktari: 10,
          kalanSiparisMiktari: 2,
          birim: "Kg",
          talepler: [
            {
              talepNo: "T003",
              talepTarihi: "2024-12-03",
              talepEden: "Mehmet Yılmaz",
              talepMiktari: 8,
              birim: "Kg",
              durum: "Kısmen Teslim Edildi",
            },
          ],
        },
      ],
    },
    {
        tedarikci: "XXY",
        siparisTarihi: "2024-12-22",
        siparisNo: "83900",
        teslimTarihi: "2024-12-29",
        talepNo: "51963",
        durum: "Sipariş Verildi",
        malzemeler: [
          {
            malzemeNo: "234",
            malzemeAdi: "Malzeme 99",
            siparisMiktari: 5,
            kalanSiparisMiktari: 5,
            birim: "Adet",
            talepler: [
              {
                talepNo: "T001",
                talepTarihi: "2024-12-14",
                talepEden: "Erkan",
                talepMiktari: 3,
                birim: "Adet",
                durum: "Sipariş Verildi",
              },
              {
                talepNo: "T078",
                talepTarihi: "2024-12-09",
                talepEden: "Ahmet Kaya",
                talepMiktari: 5,
                birim: "Adet",
                durum: "Sipariş Verildi",
              },
            ],
          },
          {
            malzemeNo: "340",
            malzemeAdi: "Malzeme 5",
            siparisMiktari: 18,
            kalanSiparisMiktari: 6,
            birim: "g",
            talepler: [
              {
                talepNo: "T783",
                talepTarihi: "2024-12-08",
                talepEden: "Mehmet Yılar",
                talepMiktari: 8,
                birim: "g",
                durum: "Teslim Edildi",
              },
            ],
          },
        ],
      }
  ];

  // Satırların genişleme durumları
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Sipariş satırını açma/kapama
  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Malzeme satırını açma/kapama
  const toggleMaterial = (siparisIndex, materialIndex) => {
    const key = `${siparisIndex}-${materialIndex}`;
    setExpandedMaterials((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Buton işlemleri
  const handleSiparisOlustur = () => {
    alert("Sipariş oluşturma işlemi başlatıldı!");
  };

  const handleSiparistenGiris = () => {
     //alert("Siparişten giriş işlemi başlatıldı!");
     // Yönlendirme işlemi
     history.push("/satinalma/giris-formu");
    
  };

  const handleYazdir = () => {
    alert("Tablo yazdırılıyor...");
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Sipariş Listesi</h1>
        <hr style={{ border: '1px solid #333' }} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton color="info" variant='outline' size='lg' onClick={handleSiparisOlustur}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
            Sipariş Oluştur
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={handleSiparistenGiris}>
            <FontAwesomeIcon icon={faLongArrowAltDown} style={{ marginRight: '8px' }} />
            Siparişten Giriş
          </CButton>
          <CButton color="info" variant='outline' size='lg' onClick={handleYazdir} >
            <FontAwesomeIcon icon={faPrint} style={{ marginRight: '8px' }} />
            Yazdır
          </CButton>


        </div>

        <CInput
          type="text"
          placeholder="Arama Yapın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '30%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      </div>


      <table className="siparis-listesi-table">
        <thead>
          <tr>
            <th></th>
            <th>Tedarikçi</th>
            <th>Sipariş Tarihi</th>
            <th>Sipariş NO</th>
            <th>Teslim Tarihi</th>
            <th>Talep NO</th>
            <th>Durum</th>
            <th>Seç</th>
          </tr>
        </thead>
        <tbody>
          {siparisListesi.map((siparis, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>
                  <button
                    className="expand-button"
                    onClick={() => toggleRow(index)}
                  >
                    {expandedRows[index] ? "▼" : "►"}
                  </button>
                </td>
                <td>{siparis.tedarikci}</td>
                <td>{siparis.siparisTarihi}</td>
                <td>{siparis.siparisNo}</td>
                <td>{siparis.teslimTarihi}</td>
                <td>{siparis.talepNo}</td>
                <td>{siparis.durum}</td>
                <td>
                <CButton shape='square' variant='outline' color='primary' >
                    Seç
                  </CButton>
                </td>
              </tr>
              {expandedRows[index] && (
                <tr>
                  <td colSpan="8" className="expanded-row">
                    <table className="malzeme-listesi-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Malzeme No</th>
                          <th>Malzeme Adı</th>
                          <th>Sipariş Miktarı</th>
                          <th>Kalan Sipariş Miktarı</th>
                          <th>Birim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siparis.malzemeler.map((malzeme, malzemeIndex) => (
                          <React.Fragment key={malzemeIndex}>
                            <tr>
                              <td>
                                <button
                                  className="expand-button"
                                  onClick={() =>
                                    toggleMaterial(index, malzemeIndex)
                                  }
                                >
                                  {expandedMaterials[`${index}-${malzemeIndex}`]
                                    ? "▼"
                                    : "►"}
                                </button>
                              </td>
                              <td>{malzeme.malzemeNo}</td>
                              <td>{malzeme.malzemeAdi}</td>
                              <td>{malzeme.siparisMiktari}</td>
                              <td>{malzeme.kalanSiparisMiktari}</td>
                              <td>{malzeme.birim}</td>
                            </tr>
                            {expandedMaterials[`${index}-${malzemeIndex}`] && (
                              <tr>
                                <td colSpan="6" className="expanded-row">
                                  <table className="talep-listesi-table">
                                    <thead>
                                      <tr>
                                        <th>Talep No</th>
                                        <th>Talep Tarihi</th>
                                        <th>Talep Eden</th>
                                        <th>Talep Miktarı</th>
                                        <th>Birim</th>
                                        <th>Durum</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {malzeme.talepler.map(
                                        (talep, talepIndex) => (
                                          <tr key={talepIndex}>
                                            <td>{talep.talepNo}</td>
                                            <td>{talep.talepTarihi}</td>
                                            <td>{talep.talepEden}</td>
                                            <td>{talep.talepMiktari}</td>
                                            <td>{talep.birim}</td>
                                            <td>{talep.durum}</td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SiparisListesi;
