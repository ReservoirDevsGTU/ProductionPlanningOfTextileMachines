import React, { useState, useEffect } from "react";
import '../css/TalepEkleme.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';
import { CInput, CSelect } from '@coreui/react';
import axios from 'axios';
import baseURL from './baseURL.js';
import * as XLSX from "xlsx";
import CustomTable from '../../CustomTable.js';

const TalepEkleme = ({ editID }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]); // Seçili malzemeler listesi
  const [users, setUsers] = useState([]);
  const [selectedButton, setSelectedButton] = useState('secili'); // Varsayılan olarak "Seçili Malzemeler"
  const [searchTerm, setSearchTerm] = useState(''); // Arama çubuğu için
  const [templateModal, setTemplateModal] = useState(false);
  const [templateTable, setTemplateTable] = useState(false);
  const history = useHistory();

  const handleGoBack = () => {
    history.push('/satinalma/talepler');
  };

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setSearchTerm(''); // Düğme değişince arama terimini temizler
  };

  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });

  const handleMaterialSelect = (material) => {
    setSelectedMaterials((prev) => {
      if (prev.find((item) => item.MaterialID === material.MaterialID)) return prev;
      return [...prev, { ...material, RequestedAmount: 1 }];
    });
  };

  const handleRemoveMaterial = (id) => {
    setSelectedMaterials(selectedMaterials.filter((material) => material.MaterialID !== id));
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((material) => material.MaterialID === id ? { ...material, RequestedAmount: quantity } : material)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const getSubmitData = () => {
    return {
      RequestDeadline: requestDetails.date,
      RequestedBy: requestDetails.requester,
      CreatedBy: requestDetails.requester,
      RequestDescription: requestDetails.description,
      ManufacturingUnitID: 1,
      IsDraft: true,
      Materials: selectedMaterials.map((m) => ({
        MaterialID: m.MaterialID,
        RequestedAmount: m.RequestedAmount
      }))
    };
  }

  const handleSubmit = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    if(editID) {
      axios.post(baseURL + '/deleteRequest.php', new URLSearchParams({ request_id: editID }));
    }
    axios.post(baseURL + '/addRequest.php', {...getSubmitData(), IsDraft: true});
    handleGoBack();
    console.log("Form Submitted: ", requestDetails, selectedMaterials);
  };

  const handleOnayaGonder = () => {
    if (!requestDetails.date || !requestDetails.requester) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }
    if(editID) {
      axios.post(baseURL + '/deleteRequest.php', new URLSearchParams({ request_id: editID }));
    }
    axios.post(baseURL + '/addRequest.php', {...getSubmitData(), IsDraft: false});
    handleGoBack();
    alert("Talebiniz onaya gönderildi.");
  };

  // Fetch the specific request data and materials
  useEffect(() => {
    if (editID) {
      // Fetch request details from the backend
      axios.post(baseURL + '/queryRequests.php', {filters: [{RequestID: [editID]}]})
        .then((response) => {
          const data = response.data[0];
          // Set request details like date, requester, and description
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy, // Backend'den gelen talep eden
            description: data.RequestDescription,
          });
          const materials = data.Materials;
          // Set selected materials related to this request
          setSelectedMaterials(materials || []); // Ensure it sets an empty array if no materials
          console.log('Fetched request details:', data);
        })
        .catch((error) => console.error('Error fetching request details:', error));
    }
  
    // Fetch users for the requester dropdown
    axios.get(baseURL + '/listUsers.php')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => console.error('Error fetching users:', error));
  }, [editID]);

  const showTemplateModal = () => {
    setTemplateModal(true);
  };

  const hideTemplateModal = () => {
    setTemplateModal(false);
    setTemplateTable(false);
  }

  const hideTemplateModalFromBackground = (event) => {
    if(event.target.className === "modal") hideTemplateModal();
  };

  const processFile = (file) => {
      const reader = new FileReader();
      reader.onload = async (data) => {
          const workbook = XLSX.read(reader.result);
          const table = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          const response = await axios.post(baseURL + "/queryMaterials.php", {filters: [{MaterialID: table.map((e)=>e.MaterialID)}]});
          setTemplateTable(response.data.map((e) => ({
            ...e, 
            RequestedAmount: table.find(r => r.MaterialID === e.MaterialID).Quantity
          })));
      }
      reader.readAsArrayBuffer(file);
  }

  const handleFileInput = (event) => {
    processFile(event.target.files[0]);
  }

  const handleFileDrop = (event) => {
    event.preventDefault();
    processFile(event.dataTransfer.files[0]);
  }

  const handleFileDragOver = (event) => {
    var t = event.target;
    while(!t.classList.contains("file-drop-zone")) t = t.parentElement;
    event.preventDefault();
    t.classList.add("file-drag");
  }

  const handleFileDragLeave = (event) => {
    var t = event.target;
    while(!t.classList.contains("file-drop-zone")) t = t.parentElement;
    event.preventDefault();
    t.classList.remove("file-drag");
  }

  const addTemplateData = () => {
    var template = templateTable;
    var selected = selectedMaterials;
    if(selected) {
      template.forEach(e=>{
        var exist = selected.findIndex(s=>s.MaterialID === e.MaterialID);
        if(exist !== -1) selected[exist].RequestedAmount = Number(selected[exist].RequestedAmount) + Number(e.RequestedAmount);
        else selected.push(e);});
      setSelectedMaterials(selected);
    }
    else setSelectedMaterials(template);
    hideTemplateModal();
  }

  return (
    <div className="talep-container">
      <div className="button-group-container">
        <button className="btn-back" onClick={handleGoBack}>
          &#8592; Geri
        </button>
        <div className="fixed-button-group">
          <button className="btn btn-kaydet" onClick={handleSubmit}>Kaydet</button>
          <button className="btn btn-onaya-gonder" onClick={handleOnayaGonder}>Onaya Gönder</button>
        </div>
      </div>

      {templateModal && (
        <div className="modal" onClick={hideTemplateModalFromBackground}>
          <div className="template-modal-content">
            <div className="modal-header">
              <h3>Malzeme Ekleme Formu</h3>
              <button className="template-modal-btn-close" onClick={hideTemplateModal}>
                X
              </button>
            </div>
            <div className="template-modal-body">
              {!templateTable ? (<label className="file-drop-zone"
                onDrop={handleFileDrop}
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
              >
                <h4>Dosya Surukle veya Tikla</h4>
                <input type="file"
                  style={{display: "none"}}
                  onChange={handleFileInput}/>
              </label>) : (<table className="material-table">
                <thead>
                  <tr>
                    <th>Malzeme No</th>
                    <th>Malzeme Adı</th>
                    <th>Toplam Stok</th>
                    <th>Birim</th>
                    <th>Miktar</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {templateTable.map((material) => (
                    <tr key={material.MaterialID}>
                      <td>{material.MaterialNo}</td>
                      <td>{material.MaterialName}</td>
                      <td>{material.Quantity}</td>
                      <td>{material.UnitID}</td>
                      <td>
                        <input
                          type="number"
                          value={material.RequestedAmount}
                          min="1"
                          onChange={e=>setTemplateTable(templateTable.map(m=>
                            material.MaterialID === m.MaterialID ?
                            {...m, RequestedAmount: e.target.value} : m))}
                        /></td>
                      <td>
                        <button onClick={()=>
                          setTemplateTable(templateTable.filter(m=>
                            material.MaterialID !== m.MaterialID))}>Sil</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
              )}
            </div>
            <div className="modal-footer">
            {templateTable && (
              <div>
                <button
                  className="template-modal-btn-cancel"
                  onClick={hideTemplateModal}
                >Iptal</button>
                <button
                  className="template-modal-btn-add"
                  onClick={addTemplateData}
                >Ekle</button>
              </div>)}
            </div>
          </div>
        </div>
      )}

      {editID ? (<h2>Talep Duzenle</h2>) : (<h2>Satın Alma Talebi</h2>)}
      <div className="termin-requester">
        <div className="form-group">
          <label>Termin Tarihi</label>
          <CInput
            type="date"
            name="date"
            value={requestDetails.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group requester-container">
          <label>Talep Eden</label>
          <CSelect
            name="requester"
            value={requestDetails.requester}
            onChange={handleInputChange}
            required
          >
            <option value="">Seçiniz</option>
            {users.map((user) => (
              <option key={user.UserID} value={user.UserID}>
                {user.UserName}
              </option>
            ))}
          </CSelect>
        </div>
      </div>

      <div className="form-group" style={{ width: '100%' }}>
        <label>Açıklama</label>
        <textarea
          name="description"
          value={requestDetails.description}
          onChange={handleInputChange}
        ></textarea>
      </div>

      <h3>Malzemeler</h3>
      <div className="button-group">

      {/* Seçili Malzemeler Butonu */}
      <button
        className={`btn-secili-malzemeler ${selectedButton === 'secili' ? 'active' : ''}`}
        onClick={() => handleButtonClick('secili')}
      >
        Seçili Malzemeler
      </button>

      {/* Tüm Malzemeler Butonu */}
      <button
        className={`btn-tum-malzemeler ${selectedButton === 'tum' ? 'active' : ''}`}
        onClick={() => handleButtonClick('tum')}
      >
        Tüm Malzemeler
      </button>

      {/* Sablondan Aktarma Butonu */}
      <button
        className={`btn-sablondan-aktar`}
        onClick={showTemplateModal}
      >
        Sablondan Aktar
      </button>

      {/* Arama Çubuğu */}
      <div className="arama-bari-container">
        <CInput
          type="text"
          placeholder="Malzeme No veya Adı Giriniz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

      <CustomTable
        data={selectedButton === 'secili' ? selectedMaterials : false}
        fetchAddr="/queryMaterials.php"
        fields={[
          {label: 'Malzeme No', key: 'MaterialNo'},
          {label: 'Malzeme Adi', key: 'MaterialName'},
          {label: 'Toplam Stok', key: 'Quantity'},
          (selectedButton === 'secili' ? {label: 'Miktar', key: 'miktar'} : {label:'', key: 'empty', width: '0%'}),
          {label: 'Birim', key: 'UnitID'},
          {label: 'Islem', key: 'islem'},
        ]}
        scopedSlots={{
          'empty': () => (<td/>),
          'miktar': (item) => (
            <td>
              <input
                type="number"
                value={item.RequestedAmount || ''}
                onChange={(e) => handleQuantityChange(item.MaterialID, e.target.value)}
                min="1"
              />
            </td>
          ),
          'islem': (item) => (
            <td>
              {selectedButton === 'secili' ? (
                <button onClick={() => handleRemoveMaterial(item.MaterialID)}>Sil</button>
                  ) : (
                <button onClick={() => handleMaterialSelect(item)}>Seç</button>
              )}
            </td>
          )
        }}
      />
    </div>
  );
};

export default TalepEkleme;
