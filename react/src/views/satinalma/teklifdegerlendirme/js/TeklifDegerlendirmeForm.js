import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import "../css/TeklifDegerlendirmeForm.css";

const TeklifDegerlendirmeForm = () => {
  const history = useHistory();
  const { grupNo } = useParams();

  // Seçili tedarikçileri ve toplam fiyatı tutan state
  const [selectedTedarikci, setSelectedTedarikci] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

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
          terminTarihi: "2025-02-01",
          gecerlilikTarihi: "2024-11-26",
        },
        {
          ad: "XXY Tedarikçi",
          istenilenMiktar: 10,
          teklifMiktar: 10,
          birimFiyat: 20,
          kur: "TL",
          terminTarihi: "2025-02-03",
          gecerlilikTarihi: "2024-11-25",
        },
      ],
    },
    {
      no: "002",
      adi: "Malzeme 2",
      stok: 15,
      birim: "Kg",
      tedarikciler: [
        {
          ad: "AAA Tedarikçi",
          istenilenMiktar: 20,
          teklifMiktar: 20,
          birimFiyat: 45,
          kur: "TL",
          terminTarihi: "2025-02-02",
          gecerlilikTarihi: "2024-11-28",
        },
        {
          ad: "BBB Tedarikçi",
          istenilenMiktar: 25,
          teklifMiktar: 25,
          birimFiyat: 40,
          kur: "TL",
          terminTarihi: "2025-01-03",
          gecerlilikTarihi: "2024-11-30",
        },
      ],
    },
  ];

  const handleCheckboxChange = (malzemeNo, tedarikciAd, birimFiyat) => {
    setSelectedTedarikci((prev) => {
      const updatedSelection = { ...prev };

      if (prev[malzemeNo] === tedarikciAd) {
        // Seçim kaldırılırsa toplam fiyattan düş
        delete updatedSelection[malzemeNo];
        setTotalPrice((prevTotal) => prevTotal - birimFiyat);
      } else {
        // Yeni seçim yapılırsa toplam fiyata ekle
        if (prev[malzemeNo]) {
          setTotalPrice(
            (prevTotal) =>
              prevTotal - teklifMalzemeleri
                .find((malzeme) => malzeme.no === malzemeNo)
                .tedarikciler.find(
                  (tedarikci) => tedarikci.ad === prev[malzemeNo]
                ).birimFiyat
          );
        }
        updatedSelection[malzemeNo] = tedarikciAd;
        setTotalPrice((prevTotal) => prevTotal + birimFiyat);
      }

      return updatedSelection;
    });
  };

  const getHighlightIndices = (tedarikciler) => {
    let minFiyat = Math.min(...tedarikciler.map((t) => t.birimFiyat));
    let enUcuzlar = tedarikciler.filter((t) => t.birimFiyat === minFiyat);

    let fiyatIndex = tedarikciler.indexOf(enUcuzlar[0]);

    let today = new Date();
    let terminIndex = tedarikciler.reduce((closestIndex, tedarikci, index) => {
      const currentDateDiff = Math.abs(new Date(tedarikci.terminTarihi) - today);
      const closestDateDiff = Math.abs(
        new Date(tedarikciler[closestIndex].terminTarihi) - today
      );
      return currentDateDiff < closestDateDiff ? index : closestIndex;
    }, 0);

    return { fiyatIndex, terminIndex };
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
      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
        <table className="malzeme-table" style={{ minWidth: "1000px", tableLayout: "auto" }}>
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
                  <th>Termin Tarihi</th>
                  <th>Geçerlilik Tarihi</th>
                  <th>Seç</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {teklifMalzemeleri.map((malzeme, index) => {
              const { fiyatIndex, terminIndex } = getHighlightIndices(malzeme.tedarikciler);
              return (
                <tr key={index}>
                  <td>{malzeme.no}</td>
                  <td>{malzeme.adi}</td>
                  <td>{malzeme.stok}</td>
                  <td>{malzeme.birim}</td>
                  {malzeme.tedarikciler.map((tedarikci, i) => (
                    <React.Fragment key={i}>
                      <td>{tedarikci.istenilenMiktar}</td>
                      <td>{tedarikci.teklifMiktar}</td>
                      <td style={{ backgroundColor: i === fiyatIndex ? "yellow" : "inherit" }}>
                        {tedarikci.birimFiyat}
                      </td>
                      <td>{tedarikci.kur}</td>
                      <td style={{ backgroundColor: i === terminIndex ? "lightgreen" : "inherit" }}>
                        {tedarikci.terminTarihi}
                      </td>
                      <td>{tedarikci.gecerlilikTarihi}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTedarikci[malzeme.no] === tedarikci.ad}
                          onChange={() =>
                            handleCheckboxChange(malzeme.no, tedarikci.ad, tedarikci.birimFiyat)
                          }
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="total-price">
        <h3>Onaylanan Toplam Fiyat: {totalPrice} TL</h3>
      </div>
    </div>
  );
};

export default TeklifDegerlendirmeForm;
