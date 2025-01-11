import axios from 'axios'

// const baseURL = 'http://192.168.0.107:5000/'

const baseURL = 'https://us-central1-meta-plus-86284.cloudfunctions.net/api'
// 
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})




export const aiChatApi  = (data: any) => api.post('/chat', data)