import axios from 'axios'

const baseURL = 'http://192.168.0.115:5000/'


// 
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})




export const aiChatApi  = (data: any) => api.post('/chat', data)