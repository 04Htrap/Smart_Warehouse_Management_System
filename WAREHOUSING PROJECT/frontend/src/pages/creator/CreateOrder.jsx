// This component is kept for backward compatibility
// The create order functionality is now integrated into OrderCreatorDashboard
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/creator/dashboard', { replace: true });
  }, [navigate]);

  return null;
}

export default CreateOrder;
