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
        to: '/satinalma/teklif-siparis',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif Listesi / Alınan Tekliflerin Girişi',
        to: '/satinalma/teklif-listesi',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif Değerlendirme İsteği ve Sipariş Verme',
        to: '/satinalma/teklif-degerlendirme-ve-siparis',
        style: { paddingLeft: '10px', fontSize: '0.79rem' },
      },
      {
        _tag: 'CSidebarNavItem',
        name: 'Teklif Değerlendirme Listesi',
        to: '/satinalma/teklif-degerlendirme-listesi',
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
        name: 'Teslim Tesellüm ve Giriş İşlemleri',
        to: '/satinalma/teslim-tesellum',
        style: { paddingLeft: '10px', fontSize: '0.8rem' },
      },
    ]
  },
];

export default _nav;
