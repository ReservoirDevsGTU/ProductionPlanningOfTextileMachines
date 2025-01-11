// components/CustomModal.js
import React from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const CustomModal = ({ show, onClose, message, type = 'warning', showExitWarning, onExit }) => {
  const modalTypes = {
    warning: {
      icon: faExclamationTriangle,
      color: '#dc3545',
      title: 'Uyarı'
    },
    info: {
      icon: faInfoCircle,
      color: '#0dcaf0',
      title: 'Bilgi'
    }
  };
 
  const currentType = modalTypes[type];
 
  const Footer = () => {
    if (showExitWarning) {
      return (
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} style={{marginRight: '10px'}}>
            Vazgeç
          </CButton>
          <CButton color="danger" onClick={onExit}>
            Çık
          </CButton>
        </CModalFooter>
      );
    }
    return (
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Kapat</CButton>
      </CModalFooter>
    );
  };
 
  return (
    <CModal show={show} onClose={onClose} size="md" centered>
      <CModalHeader closeButton>
        <h5 style={{fontWeight: 'bold', fontSize:'24px'}}>{currentType.title}</h5>
      </CModalHeader>
 
      <CModalBody>
        <div className="d-flex align-items-center">
          <div style={{color: currentType.color, marginRight: '15px'}}>
            <FontAwesomeIcon icon={currentType.icon} size="2x"/>
          </div>
          <div>{message}</div>
        </div>
      </CModalBody>
 
      <Footer />
    </CModal>
  );
 };
export default CustomModal;
