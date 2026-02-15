import { createContext, useContext, useState, type ReactNode } from "react";

export type EnergyState = "peak" | "normal" | "tired" | "exhausted";

interface EnergyContextType {
  energy: EnergyState;
  setEnergy: (e: EnergyState) => void;
  moodChecked: boolean;
  setMoodChecked: (v: boolean) => void;
}

const EnergyContext = createContext<EnergyContextType>({
  energy: "normal",
  setEnergy: () => {},
  moodChecked: false,
  setMoodChecked: () => {},
});

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [energy, setEnergy] = useState<EnergyState>("normal");
  const [moodChecked, setMoodChecked] = useState(false);

  return (
    <EnergyContext.Provider value={{ energy, setEnergy, moodChecked, setMoodChecked }}>
      {children}
    </EnergyContext.Provider>
  );
}

export const useEnergy = () => useContext(EnergyContext);
