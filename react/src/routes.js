import React from 'react';

// satın alma talepleri
const SatinAlmaTalepleri = React.lazy(() => import('./views/satinalma/satinalmatalepleri/js/SatinAlmaTalepleri'));

// satın alma talepleri düzenleme
const TalepDuzenle = React.lazy(() => import('./views/satinalma/satinalmatalepleri/js/TalepDuzenle'));

// talep ekleme
const TalepEkleme = React.lazy(() => import('./views/satinalma/satinalmatalepleri/js/TalepEkleme'));

// talep onaylama
const TalepOnaylama = React.lazy(() => import('./views/satinalma/satinalmatalepleri/js/TalepOnaylama'));

// teklif isteme
const TeklifIsteme = React.lazy(() => import('./views/satinalma/teklifsiparisisteme/js/TeklifIsteme'));

// teklif sipariş liste
const TeklifSiparisListe = React.lazy(() => import('./views/satinalma/teklifsiparisisteme/js/TeklifSiparisListe'));

// teklif listesi
const TeklifListesi = React.lazy(() => import('./views/satinalma/tekliflistesi/js/TeklifListesi'));

// teklif form
const TeklifForm = React.lazy(() => import('./views/satinalma/tekliflistesi/js/TeklifForm'));

// sipariş form
const SiparisForm = React.lazy(() => import('./views/satinalma/tekliflistesi/js/SiparisForm'));

// teklif degerlendirme
const TeklifDegerlendirme = React.lazy(() => import('./views/satinalma/teklifdegerlendirme/js/TeklifDegerlendirme'));

// teklif değerlendirme formu
const TeklifDegerlendirmeForm = React.lazy(() => import('./views/satinalma/teklifdegerlendirme/js/TeklifDegerlendirmeForm'));

// sipariş listesi
const SiparisListesi = React.lazy(() => import('./views/satinalma/siparislistesi/js/SiparisListesi'));

// giris form
const GirisFormu = React.lazy(() => import('./views/satinalma/siparislistesi/js/GirisFormu'));

// satin alma parametreleri
const SatinAlmaParametreleri = React.lazy(() => import('./views/satinalma/satinalmaparametreleri/js/SatinAlmaParametreleri'));


const routes = [
  { path: '/', exact: true, name: 'Home' },
  // satın alma talepleri
  { path: '/satinalma/talepler', name: 'Satın Alma Talepleri', component: SatinAlmaTalepleri},

  // satın alma talepleri düzenleme
  { path: '/satinalma/talep-duzenle/:id', name: 'Talep Düzenle', component: TalepDuzenle},

  // satın alma talep ekleme
  {path: '/satinalma/talep-ekleme', name: 'Talep Ekleme', component: TalepEkleme},

  // satin alma talep onaylama
  { path: '/satinalma/talep-onaylama/:id', name: 'Talep Onaylama', component: TalepOnaylama },

    // teklif sipariş liste
  { path: '/satinalma/teklif-siparis-liste', name: 'Teklif Sipariş Liste', component: TeklifSiparisListe },

    // teklif isteme
  { path: '/satinalma/teklif-isteme', name: 'Teklif İsteme', component: TeklifIsteme },
 
    // teklif listesi
  { path: '/satinalma/teklif-listesi', name: 'Teklif Listesi', component: TeklifListesi },

  // teklif form
  { path: '/satinalma/teklif-form/:id', name: 'Teklif Form', component: TeklifForm },

  // siparis form
  { path: '/satinalma/siparis-form/:id', name: 'Siparis Form', component: SiparisForm },

  // teklif degerlendirme
  { path: '/satinalma/teklif-degerlendirme', name: 'Teklif Değerlendirme', component: TeklifDegerlendirme },
   
  // teklif değerlendirme formu
  { path: '/satinalma/teklif-degerlendirme-form', name: 'Teklif Değerlendirme Formu', component: TeklifDegerlendirmeForm },

  // siparis listesi
  { path: '/satinalma/siparis-listesi', name: 'Siparis Listesi', component: SiparisListesi },

  // giris formu
  { path: '/satinalma/giris-formu/:id', name: 'Giris Formu', component: GirisFormu },
  
  
  // Satin alma parametreleri
  { path: '/satinalma/satinalma-parametreleri', name: 'Satin Alma Parametreleri', component : SatinAlmaParametreleri},
];

export default routes;
