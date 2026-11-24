import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from './auth.jsx';

/**
 * Enforces authenticated corporate profile access for RFQs and price discovery.
 * Public anonymous users are redirected to login/registration.
 * Authenticated buyers are directed to the institutional RFQ workspace.
 */
export function useRequestRfq() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const requestRfq = (chemicalName = '') => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/buyer/rfqs',
          message: 'Official chemical quotation requests and RFQs require an authenticated corporate account with a registered company profile. Please sign in or register your plant to proceed.',
          chemicalName: chemicalName || undefined,
        },
      });
      return;
    }

    if (user.role === 'BUYER') {
      if (!profile || profile.verification_status === 'REJECTED') {
        navigate('/buyer/profile', {
          state: {
            message: 'Your company profile requires completion or verification before issuing quotation requests.',
          },
        });
        return;
      }
      navigate('/buyer/rfqs', { state: { chemicalName: chemicalName || undefined } });
      return;
    }

    // For other logged-in staff / seller roles
    navigate(ROLE_HOME[user.role] || '/workspace');
  };

  return { requestRfq, user, profile };
}
