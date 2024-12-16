import React, { useState, useEffect } from "react";
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming Axios is used for API requests
import baseURL from "./baseURL.js"; //add this file yourself in this directory like following:
import TalepEkleme from './TalepEkleme.js'
import { CInput } from '@coreui/react'; // CInput importu eklendi

const TalepDuzenle = () => {
  const { id } = useParams(); // Düzenlenecek talebin ID'si
  if (id)
    return TalepEkleme({editID: id});
}

export default TalepDuzenle;
