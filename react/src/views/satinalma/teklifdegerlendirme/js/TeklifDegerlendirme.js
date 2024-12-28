import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // history import et
import "../css/TeklifDegerlendirme.css";
import CustomTable from '../../CustomTable.js';

const TeklifDegerlendirme = () => {
  const history = useHistory(); // history kullanımı
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedMalzeme, setExpandedMalzeme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const toggleMalzemeRow = (malzemeIndex) => {
    setExpandedMalzeme(expandedMalzeme === malzemeIndex ? null : malzemeIndex);
  };

  const handleSelect = (grupNo) => {
    // TeklifDegerlendirmeForm sayfasına yönlendirme yap
    history.push('./teklif-degerlendirme-form'); //  teklif-degerlendirme-form/${grupNo}
  };

  return (
    <div className="teklif-degerlendirme-container">
      <div className="header-title">
        <h1>Teklif Değerlendirme</h1>
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
      <CustomTable 
        addTableClasses = "main-table"
        fetchAddr="/queryOffers.php"
        fetchArgs={{subTables: {Materials: {expand: false, subTables: {Requests: {expand: false}}}}}}
        searchTerm={searchTerm}
        searchFields={["OfferGroupID"]}
        fields={[
            {key: "expand", label: ""},
            {key: "OfferGroupID", label: "Teklif Grup NO"},
            {key: "TODO", label: "Degerlendirmeye Alma Tarihi"},
            {key: "TODO", label: "Degerlendirmeye Gonderen"},
            {key: "OfferStatus", label: "Durum"},
            {key: "select", label: ""}
        ]}
        scopedSlots={{
          details: (item) => (
            expandedRow === item.RowID ?
              (<CustomTable
                addTableClasses = "sub-table"
                data={item.Materials.reduce((acc, cur) => {
                          const exist = acc.findIndex(e => e.MaterialID === cur.MaterialID);
                          const requests = cur.Requests.map(r => ({...r, RequestedAmount: cur.OfferRequestedAmount, UnitID: cur.UnitID}));
                          if(exist !== -1) {
                            acc[exist].OfferedAmount = Number(cur.OfferedAmount)
                                                         + Number(acc[exist].OfferedAmount);
                            acc[exist].OfferRequestedAmount = Number(cur.OfferRequestedAmount)
                                                         + Number(acc[exist].OfferRequestedAmount);
                            acc[exist].OfferedPrice = Number(cur.OfferedPrice)
                                                      + Number(acc[exist].OfferedPrice);
                            acc[exist].Requests = acc[exist].Requests.concat(requests);
                          }
                          else {
                            acc = acc.concat([{...cur, Requests: requests}]);
                          }
                          return acc;
                        }, [])}
                fields={[
                    {key: "expand", label: ""},
                    {key: "MaterialNo", label: "Malzeme No"},
                    {key: "MaterialName", label: "Malzeme Adi"},
                    {key: "OfferRequestedAmount", label: "Talep Miktari"},
                    {key: "OfferedAmount", label: "Teklif Miktari"},
                    {key: "Quantity", label: "Stok"},
                    {key: "UnitID", label: "Birim"}
                ]}
                scopedSlots={{
                  details: (item) => (
                      expandedMalzeme === item.MaterialID ?
                        (<CustomTable
                            addTableClasses="talep-table"
                            data={item.Requests}
                            fields={[
                              {key: "RequestID", label: "Talep No"},
                              {key: "CreationDate", label: "Talep Tarihi"},
                              {key: "UserName", label: "Talep Eden"},
                              {key: "RequestedAmount", label: "Talep Miktari"},
                              {key: "UnitID", label: "Birim"},
                              {key: "RequestStatus", label: "Durum"},
                            ]}
                         />) : (<div/>)
                  ),
                  expand: (item) => (
                    <td>
                      <button
                        className="expand-button"
                        onClick={() => toggleMalzemeRow(item.MaterialID)}
                      >
                        {expandedMalzeme === item.MaterialID ? "▼" : "▶"}
                      </button>
                    </td>
                  )
                }}
               />
              ) : (<div/>)
          ),
          expand: (item) => (
                <td>
                  <button
                    className="expand-button"
                    onClick={() => toggleRow(item.RowID)}
                  >
                    {expandedRow === item.RowID ? "▼" : "▶"}
                  </button>
                </td>
          ),
          select: (item) => (
                <td>
                  <button
                    className="select-button"
                    onClick={handleSelect} // Seç butonuna tıklandığında yönlendirme yapılacak ( onClick={handleSelect(teklif.grupNo)} )
                  >
                    Seç
                  </button>
                </td>
          ),
          TODO: () => (<td>TO DO</td>)
        }}
      />
    </div>
  );
};

export default TeklifDegerlendirme;
