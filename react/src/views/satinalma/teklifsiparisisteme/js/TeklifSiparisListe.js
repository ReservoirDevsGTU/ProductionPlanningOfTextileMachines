import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CButton, CInput } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import CustomTable from '../../CustomTable.js';
import '@coreui/coreui/dist/css/coreui.min.css';


const TeklifSiparisListe = () => {
  const history = useHistory();
  const [allSelected, setAllSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);

  const processData = (newData) => {
    setAllSelected(!newData.find((i) => !selected.find(j => j.RequestItemID === i.RequestItemID)));
    setData(newData);
  };

  const handleSelectedAll = (isChecked) => {
    data.forEach(i => handleRowSelect(i, isChecked));
  };

  const updateAllSelected = () => {
    setAllSelected(!data.find((i) => !selected.find(j => j.RequestItemID === i.RequestItemID)));
  };

  useEffect(updateAllSelected, [selected]);

  const handleRowSelect = (item, isChecked) => {
    setSelected((prev) => isChecked ? [ ...prev, item]
     : prev.filter(i => i.RequestItemID !== item.RequestItemID));
  };

  const fields = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => handleSelectedAll(e.target.checked)}
        />
      ),
      sorter: false,
      filter: false,
    },
    { key: 'RequestID', label: 'Talep No' },
    { key: 'CreationDate', label: 'Talep Tarihi' },
    { key: 'UserName', label: 'Talep Eden' },
    { key: 'RequestDeadline', label: 'Termin Tarihi' },
    { key: 'MaterialNo', label: 'Malzeme No' },
    { key: 'MaterialName', label: 'Malzeme Adı' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>
          Teklif Sipariş İsteme Listesi
        </h1>
        <hr style={{ border: '1px solid #333' }} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <CButton
          onClick={() => history.push('/satinalma/teklif-isteme')}
          color='info'
          variant='outline'
          size='lg'
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Yeni Teklif Oluştur
        </CButton>

        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton
            color='primary'
            variant='outline'
            size='lg'
            onClick={() => history.push({pathname: '/satinalma/teklif-isteme', editItems: selected})}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 15px',
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faList} style={{ marginRight: '8px' }} />
            Talepten Teklif Oluştur
          </CButton>

          <CButton
            color='primary'
            variant='outline'
            size='lg'
            onClick={() => alert('Talepten Sipariş')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 15px',
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
            Talepten Sipariş
          </CButton>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
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
            marginLeft: 'auto',
          }}
        />
      </div>

      <div>
        <CustomTable
          fetchAddr="/queryRequests.php"
          onFetch={processData}
          fetchArgs={{filters: [{RequestStatus: [2]}], subTables: {Materials: { expand: true }}}}
          searchTerm={searchTerm}
          searchFields={["UserName", "MaterialNo", "MaterialName"]}
          fields={fields}
          scopedSlots={{
            checkbox: (item) => (
              <td>
                <input
                  type="checkbox"
                  checked={selected.find(i => i.RequestItemID === item.RequestItemID)}
                  onChange={(e) =>
                    handleRowSelect(item, e.target.checked)
                  }
                />
              </td>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default TeklifSiparisListe;
