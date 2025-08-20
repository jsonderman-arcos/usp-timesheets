import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UtilityContract, Crew, TimeEntry, Exception, User } from '../types';
import { contractService, crewService, timeEntryService, exceptionService, userService } from '../services/supabaseService';

interface AppState {
  selectedContract: UtilityContract | null;
  utilityContracts: UtilityContract[];
  crews: Crew[];
  timeEntries: TimeEntry[];
  exceptions: Exception[];
  users: User[];
  loading: boolean;
}

interface AppContextType extends AppState {
  setSelectedContract: (contract: UtilityContract | null) => void;
  addCrew: (crew: Crew) => void;
  updateCrew: (crew: Crew) => void;
  deleteCrew: (crewId: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addTimeEntry: (timeEntry: TimeEntry) => void;
  updateTimeEntry: (timeEntry: TimeEntry) => void;
  addException: (exception: Exception) => void;
  updateException: (exception: Exception) => void;
  getCrewsByContract: (contractId: string) => Crew[];
  getTimeEntriesByCrew: (crewId: string) => TimeEntry[];
}

type AppAction = 
  | { type: 'SET_SELECTED_CONTRACT'; payload: UtilityContract | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_CREW'; payload: Crew }
  | { type: 'UPDATE_CREW'; payload: Crew }
  | { type: 'DELETE_CREW'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'ADD_EXCEPTION'; payload: Exception }
  | { type: 'UPDATE_EXCEPTION'; payload: Exception }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SELECTED_CONTRACT':
      return { ...state, selectedContract: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_CREW':
      return { ...state, crews: [...state.crews, action.payload] };
    case 'UPDATE_CREW':
      return { 
        ...state, 
        crews: state.crews.map(crew => crew.id === action.payload.id ? action.payload : crew)
      };
    case 'DELETE_CREW':
      return { 
        ...state, 
        crews: state.crews.filter(crew => crew.id !== action.payload)
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { 
        ...state, 
        users: state.users.map(user => user.id === action.payload.id ? action.payload : user)
      };
    case 'DELETE_USER':
      return { 
        ...state, 
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_TIME_ENTRY':
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };
    case 'UPDATE_TIME_ENTRY':
      return { 
        ...state, 
        timeEntries: state.timeEntries.map(entry => entry.id === action.payload.id ? action.payload : entry)
      };
    case 'ADD_EXCEPTION':
      return { ...state, exceptions: [...state.exceptions, action.payload] };
    case 'UPDATE_EXCEPTION':
      return { 
        ...state, 
        exceptions: state.exceptions.map(exc => exc.id === action.payload.id ? action.payload : exc)
      };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    selectedContract: null,
    utilityContracts: [],
    crews: [],
    timeEntries: [],
    exceptions: [],
    users: [],
    loading: true
  });

  useEffect(() => {
    // Load data from Supabase
    const loadData = async () => {
      try {
        const [contracts, crews, timeEntries, exceptions, users] = await Promise.all([
          contractService.getContracts(),
          crewService.getCrews(),
          timeEntryService.getTimeEntries(),
          exceptionService.getExceptions(),
          userService.getUsers()
        ]);

        dispatch({ 
          type: 'LOAD_DATA', 
          payload: {
            utilityContracts: contracts,
            crews,
            timeEntries,
            exceptions,
            users,
            selectedContract: contracts[0] || null,
            loading: false
          }
        });
      } catch (error) {
        console.error('Error loading app data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  const setSelectedContract = (contract: UtilityContract | null) => {
    dispatch({ type: 'SET_SELECTED_CONTRACT', payload: contract });
  };

  const addCrew = (crew: Crew) => {
    dispatch({ type: 'ADD_CREW', payload: crew });
  };

  const updateCrew = (crew: Crew) => {
    dispatch({ type: 'UPDATE_CREW', payload: crew });
  };

  const deleteCrew = (crewId: string) => {
    dispatch({ type: 'DELETE_CREW', payload: crewId });
  };

  const addUser = (user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const deleteUser = (userId: string) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const addTimeEntry = (timeEntry: TimeEntry) => {
    dispatch({ type: 'ADD_TIME_ENTRY', payload: timeEntry });
  };

  const updateTimeEntry = (timeEntry: TimeEntry) => {
    dispatch({ type: 'UPDATE_TIME_ENTRY', payload: timeEntry });
  };

  const addException = (exception: Exception) => {
    dispatch({ type: 'ADD_EXCEPTION', payload: exception });
  };

  const updateException = (exception: Exception) => {
    dispatch({ type: 'UPDATE_EXCEPTION', payload: exception });
  };

  const getCrewsByContract = (contractId: string) => {
    return state.crews.filter(crew => crew.utilityContractId === contractId);
  };

  const getTimeEntriesByCrew = (crewId: string) => {
    return state.timeEntries.filter(entry => entry.crewId === crewId);
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setSelectedContract,
      addCrew,
      updateCrew,
      deleteCrew,
      addUser,
      updateUser,
      deleteUser,
      addTimeEntry,
      updateTimeEntry,
      addException,
      updateException,
      getCrewsByContract,
      getTimeEntriesByCrew
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};