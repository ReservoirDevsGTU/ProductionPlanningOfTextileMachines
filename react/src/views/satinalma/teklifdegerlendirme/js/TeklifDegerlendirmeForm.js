import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import "../css/TeklifDegerlendirmeForm.css";
import axios from 'axios'; 
import {CButton} from '@coreui/react';
import baseURL from '../../baseURL.js';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TeklifDegerlendirmeForm = (props) => {
  const history = useHistory();
  const { grupNo } = useParams();

  // Seçili tedarikçileri ve toplam fiyatı tutan state
  const [selectedTedarikci, setSelectedTedarikci] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [offerItems, setOfferItems] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);

  const OfferGroupID = props.location.OfferGroupID;

  const getOffers = async () => {
    axios.post(baseURL + "/queryOffers.php", {
        filters: [{OfferGroupID: [OfferGroupID], OfferStatus: [3]}],
        subTables: {Materials: {expand: false}}
    }).then(response => {
      const data = response.data;
      setAllSuppliers(data.reduce((acc, cur) => {
        if(!acc.find(s => cur.SupplierID == s.SupplierID)) {
          acc.push({SupplierName: cur.SupplierName, SupplierID: cur.SupplierID});
        }
        return acc;
      }, []));
      setOfferItems(data.reduce((acc, cur) => {
          cur.Materials.forEach(m => {
            const exist = acc.findIndex(e => e.MaterialID === m.MaterialID);
            const supplierData = {
                SupplierName: cur.SupplierName,
                SupplierID: cur.SupplierID,
                OfferRequestedAmount: Number(m.OfferRequestedAmount),
                OfferedAmount: Number(m.OfferedAmount),
                OfferedPrice: Number(m.OfferedPrice),
                UnitPrice: Math.round(Number.EPSILON + 100 * Number(m.OfferedPrice) / Number(m.OfferedAmount)) / 100,
                Currency: "TRY (placeholder)",
                OfferDeadline: cur.OfferDeadline,
                ValidityDate: "TO DO",
                selected: false
            };
            if(exist !== -1) {
              const supplierExist = acc[exist].Suppliers.findIndex(s => s.SupplierID === supplierData.SupplierID);
              if(supplierExist !== -1) {
                acc[exist].Suppliers[supplierExist].OfferRequestedAmount += supplierData.OfferRequestedAmount;
                acc[exist].Suppliers[supplierExist].OfferedAmount += supplierData.OfferedAmount;
                acc[exist].Suppliers[supplierExist].OfferedPrice += supplierData.OfferedPrice;
                acc[exist].Suppliers[supplierExist].UnitPrice = Math.round(Number.EPSILON + 100 * Number(acc[exist].Suppliers[supplierExist].OfferedPrice) / Number(acc[exist].Suppliers[supplierExist].OfferedAmount)) / 100;
              }
              else {
                acc[exist].Suppliers.push(supplierData);
              }
            }
            else {
              acc.push({
                  MaterialID: m.MaterialID,
                  MaterialNo: m.MaterialNo,
                  MaterialName: m.MaterialName,
                  Quantity: m.Quantity,
                  UnitID: m.UnitID,
                  Suppliers: [supplierData],
              });
            }
          });
          return acc;
        }, []).map(mt => {
          var m = {...mt};
          m.Suppliers.forEach(s => {
            if(!m.bestOfferDeadline) {
              m.bestUnitPrice = s.UnitPrice;
              m.bestOfferDeadline = s.OfferDeadline;
            }
            else {
              if(s.UnitPrice < m.bestUnitPrice) {
                m.bestUnitPrice = s.UnitPrice;
              }
              if(s.OfferDeadline < m.bestOfferDeadline) {
                m.bestOfferDeadline = s.OfferDeadline;
              }
            }
          });
          return m;
        }));
    });
  }

  useEffect(() => {
    if(!OfferGroupID) history.goBack();
    else getOffers();
  }, []);

  const submit = async () => {
    const data = {
        OfferGroupID: OfferGroupID,
        Materials: offerItems.map(i => ({
            MaterialID: i.MaterialID,
            Suppliers: i.Suppliers.reduce((acc, cur) =>
                cur.selected ? acc.concat([{SupplierID: cur.SupplierID}]) : acc, [])
        }))
    };
    axios.post(baseURL + "/evaluateOffer.php", data);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Teklif Değerlendirme Formu {grupNo && `- Grup No: ${grupNo}`}</h1>
        <div className="form-actions">
        <CButton color="info" variant='outline' size='lg'>
            <FontAwesomeIcon icon={faPrint} />
          </CButton>
          <CButton color="info" variant="outline" size="lg" onClick={submit}>Kaydet</CButton>
          <CButton color="danger" variant="outline" size="lg" onClick={() => history.goBack()}>
            Vazgeç
          </CButton>
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
              {allSuppliers.map((supplier, index) => (
                <th key={index} colSpan="7">{supplier.SupplierName}</th>
              ))}
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              {allSuppliers.map((_, index) => (
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
            {offerItems.map((material, index) => {
              return (
                <tr key={index}>
                  <td>{material.MaterialNo}</td>
                  <td>{material.MaterialName}</td>
                  <td>{material.Quantity}</td>
                  <td>{material.UnitID}</td>
                  {allSuppliers.map(s => {
                    const supplier = material.Suppliers.find(i => i.SupplierID == s.SupplierID);
                    return !supplier ? (<td colSpan="7"></td>) : (<>
                      <td>{supplier.OfferRequestedAmount}</td>
                      <td>{supplier.OfferedAmount}</td>
                      <td style={{ backgroundColor: supplier.UnitPrice === material.bestUnitPrice ? "yellow" : "inherit" }}>
                        {supplier.UnitPrice}
                      </td>
                      <td>{supplier.Currency}</td>
                      <td style={{ backgroundColor: supplier.OfferDeadline === material.bestOfferDeadline ? "lightgreen" : "inherit" }}>
                        {supplier.OfferDeadline}
                      </td>
                      <td>{supplier.ValidityDate}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={supplier.selected}
                          onChange={(e) =>
                            setOfferItems(prev => {
                              const idx = prev.findIndex(m => m.MaterialID === material.MaterialID);
                              const sidx = prev[idx].Suppliers.findIndex(s => s.SupplierID === supplier.SupplierID);
                              prev[idx].Suppliers[sidx].selected = e.target.checked;
                              return [...prev];
                            })
                          }
                        />
                      </td>
                  </>)})}
                </tr>
              );
            })}
            {(() => {
                const sums = allSuppliers.map(s => {
                  var sum = 0;
                  offerItems.forEach(m => {
                    m.Suppliers.forEach(ms => {
                      if(ms.SupplierID == s.SupplierID && ms.selected) {
                        sum += Number(ms.OfferedPrice);
                      }
                    });
                  });
                  return sum;
                });
                return (
                    <tr>
                      <td colSpan="4">{"Onaylanan Toplam Tutar: " + sums.reduce((a, c) => a + Number(c), 0)}</td>
                      {sums.map(s => (<>
                                        <td colSpan="2">{"Toplam Tutar:"}</td>
                                        <td>{s}</td>
                                        <td colSpan="4"/>
                                      </>
                      ))}
                    </tr>
                );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeklifDegerlendirmeForm;
