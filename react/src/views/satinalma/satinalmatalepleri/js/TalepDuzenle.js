import React, { useState, useEffect } from "react";
import { useHistory, useParams } from 'react-router-dom';
import TalepEkleme from './TalepEkleme.js'

const TalepDuzenle = () => {
  const { id } = useParams(); // Düzenlenecek talebin ID'si
  if (id)
    return TalepEkleme({editID: id});
}

export default TalepDuzenle;
