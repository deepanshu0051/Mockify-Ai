'use client';
import { createContext, useContext, useState } from 'react';

const FileContext = createContext(null);

export function FileProvider({ children }) {
  const [globalFile, setGlobalFile] = useState(null);
  
  return (
    <FileContext.Provider value={{ globalFile, setGlobalFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useGlobalFile() {
  return useContext(FileContext);
}
