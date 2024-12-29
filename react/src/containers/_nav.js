import React from 'react'
import CIcon from '@coreui/icons-react'

const _nav = [
  {
    _tag: 'CSidebarNavTitle',
    style: { 
      fontSize: '1.3rem', 
      textAlign: 'center',
    },
    _children: ['Modüller']

  },
  {
    _tag: 'CSidebarNavDropdown',
    name: 'Satın Alma',
    route: '/satinalma',
    style: { 
      textAlign: 'center', 
      fontSize: '1.1rem', 
    },
    _children: [
      {
        _tag: 'CSidebarNavItem',
        name: 'Satın Alma Talepleri',
        to: '/satinalma/talepler',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },  
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif / Sipariş İsteme Listesi',
        to: '/satinalma/teklif-siparis-liste',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif Listesi',
        to: '/satinalma/teklif-listesi',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif Değerlendirme',
        to: '/satinalma/teklif-degerlendirme',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Sipariş Listesi',
        to: '/satinalma/siparis-listesi',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Satın Alma Parametreleri',
        to: '/satinalma/satinalma-parametreleri',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
    ]
  },
];

export default _nav;
