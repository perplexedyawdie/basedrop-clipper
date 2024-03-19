import { Dispatch, SetStateAction, createContext } from 'react'

interface AuthData {
    status: boolean;
    token: string;
    tableId: number | undefined;
    setStatus: Dispatch<SetStateAction<boolean>>;
    setToken: Dispatch<SetStateAction<string>>;
    setTableId: Dispatch<SetStateAction<number | undefined>>;
}

const AuthContext  = createContext<AuthData>({} as AuthData)

export default AuthContext