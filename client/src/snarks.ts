export const calculateBoardIdProof = async (board: boolean[][], salt: string) => {
    const hasShip = board.map(row => row.map(e => e ? "1" : "0"));

    const input = {
        hasShip,
        salt
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "../public/boardId.wasm", "../public/boardId.zkey");

    return proof;
}

export const calculateShotHitProof = async (board: boolean[][], salt: string, boardId: string, revealAtRow: string, revealAtCol: string) => {
    const hasShip = board.map(row => row.map(e => e ? "1" : "0"));

    const input = {
        hasShip,
        salt,
        boardId,
        shotRow: revealAtRow,
        shotCol: revealAtCol
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "../public/hit.wasm", "../public/hit.zkey");

    return proof;
}

export const verifyBoardIDProof = async (boardID, proofStr) => {
    let vkey = await fetch("./public/boardId.vkey.json").then(function(res) {
        return res.json();
    });
    const res = await snarkjs.groth16.verify(vkey, [boardID], JSON.parse(proofStr));
    return res;
}

export const verifyShotHitProof = async (boardID, revealAtRow, revealAtCol, didHit, proofStr) => {
    let vkey = await fetch("./public/hit.vkey.json").then(function(res) {
        return res.json();
    });
    const res = await snarkjs.groth16.verify(vkey, [didHit, boardID, revealAtRow, revealAtCol], JSON.parse(proofStr));
    return res;
}