import React, { useState, useEffect } from "react";
import '../css/TalepEkleme.css';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import baseURL from "./baseURL.js";
import { CInput } from '@coreui/react';


// şimdilik bir yere bağlantısı eklenmedi url üzerinden http://localhost:3000/#/satinalma/talep-onaylama/1 ile erişilebilir. 1 olan talep idsi

const TalepOnayla = () => {
  const { id } = useParams();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState('');

  const history = useHistory();

  const handleGoBack = () => {
    history.push('/satinalma/talepler');
  };

  useEffect(() => {
    if (id) {
      axios.get(`${baseURL}/getRequestByID.php?id=${id}`)
        .then((response) => {
          const data = response.data;
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy,
            description: data.RequestDescription,
          });
        })
        .catch((error) => console.error('Error fetching request details:', error));
      
      axios.get(`${baseURL}/getRequestsMaterials.php?id=${id}`)
        .then((response) => setSelectedMaterials(response.data || []))
        .catch((error) => console.error('Error fetching request materials:', error));
      
      axios.get(`${baseURL}/listUsers.php`)
        .then((response) => setUsers(response.data))
        .catch((error) => console.error('Error fetching users:', error));
    }
  }, [id]);

  const filteredMaterials = selectedMaterials.filter(material => 
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.id.toString().includes(searchTerm)
  );

  const handleApprove = () => {
    axios.post(`${baseURL}/approveRequest.php`, { 
        RequestID: id,
        Approve: true
      })
      .then(() => {
        alert("Talep onaylandı");
        handleGoBack();
      })
      .catch(error => {
        console.error("Error approving request:", error);
        alert("Talep onaylanamadı, tekrar deneyin.");
      });
  };

  const handleReject = () => {
    axios.post(`${baseURL}/approveRequest.php`, {
        RequestID: id,
        Approve: false
      })
      .then(() => {
        alert("Talep reddedildi");
        handleGoBack(); 
      })
      .catch(error => {
        console.error("Error rejecting request:", error);
        alert("Talep reddedilemedi, tekrar deneyin.");
      });
  };

  return (
    <div className="talep-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={handleGoBack} style={{
            fontSize: '10px',          
            padding: '10px 20px',      
            backgroundColor: 'black',
            color: 'white',            
            border: 'none',            
            borderRadius: '5px',       
            cursor: 'pointer'
        }}>
          &#8592; Geri
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleApprove} style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            Onayla
          </button>
          <button onClick={handleReject} style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            Reddet
          </button>
        </div>
      </div>

      {/* Form alanları */}
      <h2>Satınalma Talebi</h2>
      <div className="termin-requester">
        <div className="form-group">
          <label>Termin Tarihi</label>
          <input
            type="date"
            name="date"
            value={requestDetails.date}
            readOnly
          />
        </div>
        <div className="form-group requester-container">
          <label>Talep Eden</label>
          <select 
            name="requester"
            value={requestDetails.requester}
            disabled // Talep Eden alanını değiştirilmez hale getirir
          >
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ width: '100%' }}>
        <label>Açıklama</label>
        <textarea
          name="description"
          value={requestDetails.description}
          readOnly
        ></textarea>
      </div>

      <h3>Malzemeler</h3>
      <div className="button-group">
        <div className="arama-bari-container">
          <CInput
            type="text"
            placeholder="Malzeme No veya Adı Giriniz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="material-table">
        <thead>
          <tr>
            <th>Malzeme No</th>
            <th>Malzeme Adı</th>
            <th>Miktar</th>
            <th>Toplam Stok</th>
            <th>Birim</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaterials.map((material) => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              <td style={{ backgroundColor: '#ff4d4f', color: 'white' }}>{material.quantity}</td>
              <td>{material.stock}</td>
              <td>{material.unitID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TalepOnayla;
