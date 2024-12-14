import React from "react";
import { useNavigate, useParams ,useHistory } from "react-router-dom";
import "../css/TeklifDegerlendirmeForm.css";
import TeklifDegerlendirme from "./TeklifDegerlendirme";


const TeklifDegerlendirmeForm = () => {
  const history = useHistory();
  const { grupNo } = useParams();

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Teklif Değerlendirme Formu {/* {grupNo} */}</h1>
        <div className="form-actions">
          <button className="print-button">Yazdır</button>
          <button className="save-button">Kaydet</button>
          <button className="cancel-button" onClick={() => history.goBack()}>
            Vazgeç
          </button>
        </div>
      </div>
      <div className="form-content">
        {/* Form içeriği buraya eklenecek */}
      </div>
    </div>
  );
};

export default TeklifDegerlendirmeForm;
