import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

// Define the shape of the state
interface State {
    isAuthenticated: boolean;
    user: any | null;
    theme: 'light' | 'dark';
}

// Define action types
type Action =
    | { type: 'LOGIN'; payload: any }
    | { type: 'LOGOUT' }
    | { type: 'SET_THEME'; payload: 'light' | 'dark' };

// Initial state
const initialState: State = {
    isAuthenticated: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

// Reducer function
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem('user', JSON.stringify(action.payload));
            return { ...state, isAuthenticated: true, user: action.payload };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { ...state, isAuthenticated: false, user: null };
        case 'SET_THEME':
            localStorage.setItem('theme', action.payload);
            return { ...state, theme: action.payload };
        default:
            return state;
    }
};

// Create Context
const GlobalContext = createContext<{
    state: State;
    dispatch: Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null,
});

// Provider Component
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Custom Hook
export const useGlobal = () => useContext(GlobalContext);
