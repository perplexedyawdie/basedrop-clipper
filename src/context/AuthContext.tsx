import { Dispatch, SetStateAction, createContext } from 'react'

export interface BlockData {
    nodeId: string;
    document: string;
}
interface AuthData {
    blockData: BlockData[];   
    setBlockData: Dispatch<SetStateAction<BlockData[]>>;    
}

const AuthContext  = createContext<AuthData>({} as AuthData)

export default AuthContext