import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // history import et
import "../css/TeklifDegerlendirme.css";
import {CButton, CInput } from '@coreui/react';
import {faChevronDown, faChevronUp, faPrint } from '@fortawesome/free-solid-svg-icons';
import CustomTable from '../../CustomTable.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TeklifDegerlendirme = () => {
  const history = useHistory(); // history kullanımı
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedMalzeme, setExpandedMalzeme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});


  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const toggleMalzemeRow = (malzemeIndex) => {
    setExpandedMalzeme(expandedMalzeme === malzemeIndex ? null : malzemeIndex);
  };

  const handleSelect = (offerGroup) => {
    // TeklifDegerlendirmeForm sayfasına yönlendirme yap
    history.push({pathname: './teklif-degerlendirme-form', OfferGroupID: offerGroup.OfferGroupID});
  };

  return (
    <div className="teklif-degerlendirme-container">
      <div className="header-title">
        <h1>Teklif Değerlendirme</h1>
        <hr />
      </div>
      {/* Yazdırma Butonu */}
      <div className="header">
      <CButton color="info" variant='outline' size='lg'>
            <FontAwesomeIcon icon={faPrint} />
          </CButton>
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

      {/* Ana Tablo */}
      <CustomTable 
        addTableClasses = "main-table"
        fetchAddr="/queryOffers.php"
        fetchArgs={{distinct: ["OfferGroupID"], subTables: {Materials: {expand: false, subTables: {Requests: {expand: false}}}}}}
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
                          const requests = cur.Requests.map(r => ({...r, RequestedAmount: cur.RequestedAmount, UnitID: cur.UnitID}));
                          if(exist !== -1) {
                            acc[exist].RequestedAmount = Number(cur.RequestedAmount)
                                                         + Number(acc[exist].RequestedAmount);
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
                    {key: "RequestedAmount", label: "Talep Miktari"},
                    {key: "OfferRequestedAmount", label: "Teklif Miktari"},
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
                      <CButton
                        size='lg'
                        variant='outline'
                        color='secondary'
                        children={<FontAwesomeIcon style={{color: 'black'}} icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />}
                        onClick={() => toggleMalzemeRow(item.MaterialID)}
                        >
                      </CButton>

                    </td>
                  )
                }}
               />
              ) : (<div/>)
          ),
          expand: (item) => (
                <td>

                  <CButton
                      size='lg'
                      variant='outline'
                      color='secondary'
                      children={<FontAwesomeIcon style={{color: 'black'}} icon={expandedRows[item.RequestID] ? faChevronUp : faChevronDown} />}
                      onClick={() => toggleRow(item.RowID)}
                      >
                  </CButton>
                  
              </td>
          ),
          select: (item) => (
                <td>
                  <CButton shape='square' variant='outline' color='primary'  onClick={() => handleSelect(item)}>
                    Seç
                  </CButton>
                </td>
          ),
          TODO: () => (<td>TO DO</td>)
        }}
      />
    </div>
  );
};

export default TeklifDegerlendirme;
