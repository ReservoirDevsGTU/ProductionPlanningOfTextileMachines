import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import "../css/TeklifDegerlendirmeForm.css";

const TeklifDegerlendirmeForm = () => {
  const history = useHistory();
  const { grupNo } = useParams();

  // Seçili tedarikçileri tutan state
  const [selectedTedarikci, setSelectedTedarikci] = useState({});

  const teklifMalzemeleri = [
    {
      no: "001",
      adi: "Malzeme 1",
      stok: 1,
      birim: "Adet",
      tedarikciler: [
        {
          ad: "XXX Tedarikçi",
          istenilenMiktar: 5,
          teklifMiktar: 5,
          birimFiyat: 15,
          kur: "TL",
          terminTarihi: "01.12.2024",
          gecerlilikTarihi: "26.11.2024",
        },
        {
          ad: "XXY Tedarikçi",
          istenilenMiktar: 10,
          teklifMiktar: 10,
          birimFiyat: 20,
          kur: "TL",
          terminTarihi: "04.12.2024",
          gecerlilikTarihi: "25.11.2024",
        },
      ],
    },
  ];

  // Checkbox seçim fonksiyonu
  const handleCheckboxChange = (malzemeNo, tedarikciAd) => {
    setSelectedTedarikci((prev) => ({
      ...prev,
      [malzemeNo]: tedarikciAd,
    }));
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Teklif Değerlendirme Formu {grupNo && `- Grup No: ${grupNo}`}</h1>
        <div className="form-actions">
          <button className="print-button">Yazdır</button>
          <button className="save-button">Kaydet</button>
          <button className="cancel-button" onClick={() => history.goBack()}>
            Vazgeç
          </button>
        </div>
      </div>
      <div className="table-container">
        <table className="malzeme-table">
          <thead>
            <tr>
              <th>Malzeme NO</th>
              <th style={{ width: "200px" }}>Malzeme Adı</th>
              <th>Stok</th>
              <th>Birim</th>
              {teklifMalzemeleri[0]?.tedarikciler.map((tedarikci, index) => (
                <th key={index} colSpan="7">{tedarikci.ad}</th>
              ))}
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              {teklifMalzemeleri[0]?.tedarikciler.map((_, index) => (
                <React.Fragment key={index}>
                  <th>İstenilen Miktar</th>
                  <th>Teklif Miktarı</th>
                  <th>Birim Fiyat</th>
                  <th>Kur</th>
                  <th style={{ width: "150px" }}>Termin Tarihi</th>
                  <th style={{ width: "150px" }}>Geçerlilik Tarihi</th>
                  <th>Seç</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {teklifMalzemeleri.map((malzeme, index) => (
              <tr key={index}>
                <td>{malzeme.no}</td>
                <td style={{ width: "200px", whiteSpace: "nowrap", overflow: "hidden" }}>
                  {malzeme.adi}
                </td>
                <td>{malzeme.stok}</td>
                <td>{malzeme.birim}</td>
                {malzeme.tedarikciler.map((tedarikci, i) => (
                  <React.Fragment key={i}>
                    <td>{tedarikci.istenilenMiktar}</td>
                    <td>{tedarikci.teklifMiktar}</td>
                    <td>{tedarikci.birimFiyat}</td>
                    <td>{tedarikci.kur}</td>
                    <td style={{ width: "150px", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {tedarikci.terminTarihi}
                    </td>
                    <td style={{ width: "150px", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {tedarikci.gecerlilikTarihi}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={
                          selectedTedarikci[malzeme.no] === tedarikci.ad
                        }
                        onChange={() =>
                          handleCheckboxChange(malzeme.no, tedarikci.ad)
                        }
                      />
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeklifDegerlendirmeForm;
