import React, { createContext, useContext, useState } from 'react';

const OnboardContext = createContext({});

export const OnboardProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(null);
  const [jdData, setJdData] = useState(null);
  const [simulationTasks, setSimulationTasks] = useState([]);
  const [pathway, setPathway] = useState(null);

  // Persist sessionId to localStorage so it survives navigation
  const [sessionId, setSessionIdState] = useState(() => {
    return localStorage.getItem('onboardiq_session_id') || null;
  });

  const setSessionId = (id) => {
    setSessionIdState(id);
    if (id) {
      localStorage.setItem('onboardiq_session_id', id);
    } else {
      localStorage.removeItem('onboardiq_session_id');
    }
  };

  // Persist roleTitle
  const [roleTitle, setRoleTitleState] = useState(() => {
    return localStorage.getItem('onboardiq_role_title') || 'Software Engineer';
  });

  const setRoleTitle = (title) => {
    setRoleTitleState(title);
    if (title) localStorage.setItem('onboardiq_role_title', title);
  };

  // Persist roleCategory
  const [roleCategory, setRoleCategoryState] = useState(() => {
    return localStorage.getItem('onboardiq_role_category') || 'technical';
  });

  const setRoleCategory = (cat) => {
    setRoleCategoryState(cat);
    if (cat) localStorage.setItem('onboardiq_role_category', cat);
  };

  const clearSession = () => {
    setSessionId(null);
    setPathway(null);
    setSimulationTasks([]);
    setResumeData(null);
    setJdData(null);
  };

  return (
    <OnboardContext.Provider value={{
      resumeData, setResumeData,
      jdData, setJdData,
      simulationTasks, setSimulationTasks,
      pathway, setPathway,
      sessionId, setSessionId,
      roleTitle, setRoleTitle,
      roleCategory, setRoleCategory,
      clearSession
    }}>
      {children}
    </OnboardContext.Provider>
  );
};

export const useOnboard = () => useContext(OnboardContext);
