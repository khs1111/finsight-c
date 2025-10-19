import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModifyProfile from '../components/profile/modifyProfile';

export default function ProfileModify() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/profile');
  };

  // Optionally pass profile data via location state or re-fetch inside ModifyProfile
  return <ModifyProfile profile={{}} onClose={handleClose} />;
}
