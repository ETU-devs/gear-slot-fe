export interface User {
  id: number
  email: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export type EquipmentStatus = 'available' | 'maintenance'

export interface Equipment {
  id: number
  name: string
  description: string
  status: EquipmentStatus
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  user_id: number
  equipment_id: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'Bearer'
  expires_at: string
}

export interface ApiError {
  error: string
}

export interface Credentials {
  email: string
  password: string
}
