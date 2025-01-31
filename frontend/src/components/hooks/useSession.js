import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSession = (userPool) => {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = userPool?.getCurrentUser();
      if (currentUser) {
        try {
          const session = await new Promise((resolve, reject) => {
            currentUser.getSession((err, session) => {
              if (err) reject(err);
              else resolve(session);
            });
          });

          if (!session.isValid()) {
            setIsSessionValid(false);
            navigate("/");
            return;
          }

          setUser(currentUser);
          setSub(session.getIdToken().payload.sub);
        } catch (err) {
          console.error("Session error:", err);
          setIsSessionValid(false);
          navigate("/");
        }
      } else {
        setIsSessionValid(false);
        navigate("/");
      }
    };

    checkSession();
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [userPool, navigate]);

  return { isSessionValid, user, sub };
};
