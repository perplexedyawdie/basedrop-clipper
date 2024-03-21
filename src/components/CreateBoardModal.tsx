import React, { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import axios from 'axios';

function CreateBoardModal() {
    const { token, tableId, status: authStatus } = useContext(AuthContext);
    const [boardName, setBoardName] = useState<string>("")
    const [boardDesc, setBoardDesc] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // TODO add validation to input
    // TODO create context to react to new board
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function handleCreateBoard(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        try {
            setIsLoading(true)
            if (token !== "" && authStatus) {
                const resp = await axios({
                        method: "POST",
                        url: `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`,
                        headers: {
                          Authorization: `Token ${token}`,
                          "Content-Type": "application/json"
                        },
                        data: {
                            boardName, 
                            boardDesc
                          }
                      })
                console.log(resp.data)
                setBoardName("")
                setBoardDesc("")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <dialog id="create_board_modal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                {/* <h3 className="font-bold text-lg">Hello!</h3> */}
                <label className="form-control w-full">
                    <div className="label">
                        <span className="label-text">What's the name of your board?</span>
                    </div>
                    <input value={boardName} onChange={(e) => setBoardName(e.target.value)} type="text" className="input input-bordered w-full" />
                    <div className="label">
                        <span className="label-text">What's it about?</span>
                    </div>
                    <input value={boardDesc} onChange={(e) => setBoardDesc(e.target.value)} type="text" className="input input-bordered w-full" />
                    <button disabled={isLoading} onClick={handleCreateBoard} className="btn btn-block btn-primary mt-6"> Create </button>
                </label>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}

export default CreateBoardModal