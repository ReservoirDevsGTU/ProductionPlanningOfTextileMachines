import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { CInput } from "@coreui/react";
import baseURL from "../../baseURL.js";

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

  const history = useHistory();

  const handleGoBack = () => {
    history.push("/satinalma/talepler");
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
        alert("Talep onaylandı");
        handleGoBack();
      })
      .catch((error) => {
        console.error("Error approving request:", error);
        alert("Talep onaylanamadı, tekrar deneyin.");
      });
  };

  const handleReject = () => {
    axios.post(`${baseURL}/approveRequest.php`, {
        RequestID: id,
        RequestStatus: 3,
      })
      .then(() => {
        alert("Talep reddedildi");
        handleGoBack();
      })
      .catch((error) => {
        console.error("Error rejecting request:", error);
        alert("Talep reddedilemedi, tekrar deneyin.");
      });
  };

  return (
    <div style={{ width: "80%", margin: "2% auto 20%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={handleGoBack}
          style={{
            fontSize: "10px",
            padding: "10px 20px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          &#8592; Geri
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleApprove}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Onayla
          </button>
          <button
            onClick={handleReject}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reddet
          </button>
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
    </div>
  );
};

export default TalepOnayla;
