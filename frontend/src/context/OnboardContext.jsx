import React, { createContext, useContext, useState } from 'react';

const OnboardContext = createContext({});

export const OnboardProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(null);
  const [jdData, setJdData] = useState(null);
  const [simulationTasks, setSimulationTasks] = useState([]);
  const [pathway, setPathway] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Newly added for end-to-end tracking
  
  return (
    <OnboardContext.Provider value={{
      resumeData, setResumeData,
      jdData, setJdData,
      simulationTasks, setSimulationTasks,
      pathway, setPathway,
      sessionId, setSessionId
    }}>
      {children}
    </OnboardContext.Provider>
  );
};

export const useOnboard = () => useContext(OnboardContext);
