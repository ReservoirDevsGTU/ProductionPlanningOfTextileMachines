import React, { useState } from "react";
import "../css/TeklifDegerlendirme.css";

const TeklifDegerlendirme = () => {
  // Örnek veri
  const teklifData = [
    {
      grupNo: "XXX",
      tarih: "01.12.2024",
      gonderen: "Kullanıcı A",
      durum: "Onay Bekliyor",
      malzemeler: [
        { 
          no: "001", 
          adi: "Malzeme 1", 
          talepMiktari: 5, 
          teklifMiktari: 5, 
          stok: 1, 
          birim: "Adet", 
          talepler: [
            { talepNo: "T001", talepTarihi: "01.11.2024", talepEden: "Kullanıcı X", talepMiktari: 5, birim: "Adet", durum: "Beklemede" },
            { talepNo: "T002", talepTarihi: "02.11.2024", talepEden: "Kullanıcı Y", talepMiktari: 10, birim: "Adet", durum: "Onaylandı" }
          ]
        },
        { 
          no: "002", 
          adi: "Malzeme 2", 
          talepMiktari: 10, 
          teklifMiktari: 8, 
          stok: 4, 
          birim: "Metre", 
          talepler: [
            { talepNo: "T003", talepTarihi: "01.12.2024", talepEden: "Kullanıcı Z", talepMiktari: 8, birim: "Metre", durum: "Beklemede" }
          ]
        },
      ],
    },
    {
      grupNo: "YYY",
      tarih: "02.12.2024",
      gonderen: "Kullanıcı B",
      durum: "Onaylandı",
      malzemeler: [],
    },
  ];

  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedMalzeme, setExpandedMalzeme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const toggleMalzemeRow = (malzemeIndex) => {
    setExpandedMalzeme(expandedMalzeme === malzemeIndex ? null : malzemeIndex);
  };

  const filteredData = teklifData.filter((teklif) =>
    teklif.grupNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teklif-degerlendirme-container">

      <div className="header-title">
        <h1>Teklif Değerlenirme</h1>
        <hr />
      </div>
      {/* Yazdırma Butonu */}
      <div className="header">
        <button className="print-button">
          <i className="fas fa-print"></i> Yazdır
        </button>
        <input
          type="text"
          className="search-bar"
          placeholder="Arama Yapın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Ana Tablo */}
      <table className="main-table">
        <thead>
          <tr>
            <th></th>
            <th>Teklif Grup NO</th>
            <th>Değerlendirmeye Alınma Tarihi</th>
            <th>Değerlendirmeye Gönderen</th>
            <th>Durum</th>
            <th></th> {/* Seç butonu için yeni sütun */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((teklif, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>
                  <button
                    className="expand-button"
                    onClick={() => toggleRow(index)}
                  >
                    {expandedRow === index ? "▼" : "▶"}
                  </button>
                </td>
                <td>{teklif.grupNo}</td>
                <td>{teklif.tarih}</td>
                <td>{teklif.gonderen}</td>
                <td>{teklif.durum}</td>
                <td>
                  <button className="select-button">
                    Seç
                  </button>
                </td>
              </tr>
              {expandedRow === index && teklif.malzemeler.length > 0 && (
                <tr>
                  <td colSpan="6">
                    <table className="sub-table">
                      <thead>
                        <tr>
                          <th>Malzeme No</th>
                          <th>Malzeme Adı</th>
                          <th>Talep Miktarı</th>
                          <th>Teklif Miktarı</th>
                          <th>Stok</th>
                          <th>Birim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teklif.malzemeler.map((malzeme, i) => (
                          <React.Fragment key={i}>
                            <tr>
                              <td>
                                <button
                                  className="expand-button"
                                  onClick={() => toggleMalzemeRow(i)}
                                >
                                  {expandedMalzeme === i ? "▼" : "▶"}
                                </button>
                              </td>
                              <td>{malzeme.no}</td>
                              <td>{malzeme.adi}</td>
                              <td>{malzeme.talepMiktari}</td>
                              <td>{malzeme.teklifMiktari}</td>
                              <td>{malzeme.stok}</td>
                              <td>{malzeme.birim}</td>
                            </tr>
                            {expandedMalzeme === i && malzeme.talepler.length > 0 && (
                              <tr>
                                <td colSpan="7">
                                  <table className="talep-table">
                                    <thead>
                                      <tr>
                                        <th>Talep NO</th>
                                        <th>Talep Tarihi</th>
                                        <th>Talep Eden</th>
                                        <th>Talep Miktarı</th>
                                        <th>Birim</th>
                                        <th>Durum</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {malzeme.talepler.map((talep, j) => (
                                        <tr key={j}>
                                          <td>{talep.talepNo}</td>
                                          <td>{talep.talepTarihi}</td>
                                          <td>{talep.talepEden}</td>
                                          <td>{talep.talepMiktari}</td>
                                          <td>{talep.birim}</td>
                                          <td>{talep.durum}</td>
                                        </tr>
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

export default TeklifDegerlendirme;
