import React from 'react'
import { logoutUserAction } from '../../../features/auth/server/auth.actions'

const EmployerDashboard = () => {
  return (
    <>
    <div>Welcome, Employer</div>
    <button onClick={logoutUserAction}>Logout</button>
    </>
  )
}

export default EmployerDashboard