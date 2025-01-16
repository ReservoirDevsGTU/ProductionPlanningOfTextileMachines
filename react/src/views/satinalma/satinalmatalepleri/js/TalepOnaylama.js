import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { CButton, CInput } from "@coreui/react";
import baseURL from "../../baseURL.js";
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomModal from '../../CustomModal.js';


const TalepOnayla = () => {
  const { id } = useParams();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [users, setUsers] = useState([]);
  const [requestDetails, setRequestDetails] = useState({
    date: "",
    requester: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [modals, setModals] = useState({
    warning: false,
    info: false,
    approve: false,
    reject: false
  });
  
  const [modalMessages, setModalMessages] = useState({
    warning: '',
    info: '',
    approve: '',
    reject: ''
  });
  
  const [showExitWarning, setShowExitWarning] = useState(false);


  const history = useHistory();

  const handleGoBack = () => {
    setModalMessages({
      ...modalMessages,
      warning: 'Sayfadan çıkmak istediğinize emin misiniz?'
    });
    setModals({...modals, warning: true});
    setShowExitWarning(true);
  };

  const handleApproveClick = () => {
    setModalMessages({
      ...modalMessages,
      approve: 'Talebi onaylamak istediğinize emin misiniz?'
    });
    setModals({...modals, approve: true});
  };
  
  const handleRejectClick = () => {
    setModalMessages({
      ...modalMessages,
      reject: 'Talebi reddetmek istediğinize emin misiniz?'
    });
    setModals({...modals, reject: true});
  };

  const handleModalClose = () => {
    if (showExitWarning) {
      setShowExitWarning(false);
    }
    setModals({
      warning: false,
      info: false,
      approve: false,
      reject: false
    });
    
    if (modals.info) {
      history.push("/satinalma/talepler");
    }
  };
  
  useEffect(() => {
    if (id) {
      axios.post(`${baseURL}/queryRequests.php`, {filters: [{RequestID: [id]}], subTables: {Materials: {expand: false}}})
        .then((response) => {
          const data = response.data[0];
          setRequestDetails({
            date: data.RequestDeadline,
            requester: data.RequestedBy,
            description: data.RequestDescription,
          });
          setSelectedMaterials(data.Materials);
        })
        .catch((error) => console.error("Error fetching request details:", error));
    }
  }, [id]);

  useEffect(() => {
    if(requestDetails.requester) {
      axios.post(`${baseURL}/queryUsers.php`, {filters: [{UserID: [requestDetails.requester]}]})
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [requestDetails.requester]);

  const filteredMaterials = selectedMaterials.filter((material) =>
    material.MaterialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.MaterialID.toString().includes(searchTerm)
  );

  const handleApprove = () => {
    axios.post(`${baseURL}/approveRequest.php`, {
      RequestID: id,
      RequestStatus: 2,
    })
    .then(() => {
      setModalMessages({ ...modalMessages, info: 'Talep başarıyla onaylandı.' });
      setModals({ ...modals, approve: false, info: true });
      // 2 saniye sonra yönlendirme
      setTimeout(() => {
        history.push("/satinalma/talepler");
      }, 2000);
    })
    .catch((error) => {
      console.error("Error approving request:", error);
      setModalMessages({ ...modalMessages, warning: 'Talep onaylanırken bir hata oluştu!' });
      setModals({ ...modals, approve: false, warning: true });
    });
  };

const handleReject = () => {
  axios.post(`${baseURL}/approveRequest.php`, {
    RequestID: id,
    RequestStatus: 3,
  })
  .then(() => {
    setModalMessages({ ...modalMessages, info: 'Talep başarıyla reddedildi.' });
    setModals({ ...modals, reject: false, info: true });
    // 2 saniye sonra yönlendirme
    setTimeout(() => {
      history.push("/satinalma/talepler");
    }, 2000);
  })
  .catch((error) => {
    console.error("Error rejecting request:", error);
    setModalMessages({ ...modalMessages, warning: 'Talep reddedilirken bir hata oluştu!' });
    setModals({ ...modals, reject: false, warning: true });
  });
};

  return (
    <div style={{ width: "80%", margin: "2% auto 20%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <CButton
          onClick={handleGoBack}
          color="dark"
          variant="outline"
          size="md"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{marginRight: '8px'}}/> Geri
        </CButton>
        <div style={{ display: "flex", gap: "10px" }}>
          <CButton
            onClick={handleApproveClick}
            color="success"
            size="md"
            variant="outline"
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Onayla
          </CButton>
          <CButton
            onClick={handleRejectClick}
            color="danger"
            size="md"
            variant="outline"
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Reddet
          </CButton>
        </div>
      </div>

      <h2>Satınalma Talebi</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ width: "50%" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Termin Tarihi
          </label>
          <input
            type="date"
            name="date"
            value={requestDetails.date}
            readOnly
            style={{
              width: "100%",
              padding: "8px",
              margin: "5px 0 10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ width: "40%", paddingBottom: "8px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Talep Eden
          </label>
          <select
            name="requester"
            value={requestDetails.requester}
            disabled
            style={{
              height: "45px",
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {users.map((user) => (
              <option key={user.UserID} value={user.UserName}>
                {user.UserName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Açıklama
        </label>
        <textarea
          name="description"
          value={requestDetails.description}
          readOnly
          style={{
            width: "100%",
            height: "100px",
            padding: "8px",
            margin: "5px 0 10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        ></textarea>
      </div>

      <h3>Malzemeler</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <CInput
          type="text"
          placeholder="Malzeme No veya Adı Giriniz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "40%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme No</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Malzeme Adı</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Miktar</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Toplam Stok</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Birim</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaterials.map((material) => (
            <tr key={material.MaterialID}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialID}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.MaterialName}</td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                }}
              >
                {material.RequestedAmount}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.Quantity}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{material.UnitID}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <CustomModal 
      show={modals.approve}
      onClose={handleModalClose}
      message={modalMessages.approve}
      type="warning"
      showExitWarning={true}
      onExit={handleApprove}
    />

    <CustomModal 
      show={modals.reject}
      onClose={handleModalClose}
      message={modalMessages.reject}
      type="warning"
      showExitWarning={true}
      onExit={handleReject}
    />

    {/* Bilgi/Uyarı Modalı */}
    <CustomModal 
      show={modals.warning || modals.info}
      onClose={handleModalClose}
      message={modals.warning ? modalMessages.warning : modalMessages.info}
      type={modals.warning ? 'warning' : 'info'}
      showExitWarning={showExitWarning}
      onExit={() => {
        if (showExitWarning) {
          history.push("/satinalma/talepler");
        }
      }}
    />
    </div>
  );
};

export default TalepOnayla;
