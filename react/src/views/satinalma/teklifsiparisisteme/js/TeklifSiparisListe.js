import React from 'react';
import { useHistory } from 'react-router-dom'; // React Router v5 kullanımı
import '../css/TeklifSiparisListe.css';

const TeklifSiparisListe = () => {
  const history = useHistory(); // useHistory() ile yönlendirme

  const handleButtonClick = () => {
    history.push('/satinalma/teklif-isteme'); // TeklifIsteme.js sayfasına yönlendirme
  };

  return (
    <div className="container">
      <button className="button" onClick={handleButtonClick}>
        Teklif İsteme Sayfasına Git
      </button>
    </div>
  );
};

export default TeklifSiparisListe;
