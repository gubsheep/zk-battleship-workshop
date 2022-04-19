import bigInt from "big-integer";
import React, { useState } from "react";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import {
  Center, GridRow, GridSquare, Spacer,
} from "./Components";
import mimcHash from "./mimc";
import { calculateBoardIdProof, calculateShotHitProof, verifyBoardIDProof, verifyShotHitProof } from "./snarks";

/**
 * This is the root of the application.
 */
export function App() {
  return (

    <BrowserRouter>
    <Switch>
      <Route path="/" exact component={LandingPage} />
      <Route path="/verify-board-id" exact component={VerifyBoardIdPage} />
      <Route path="/verify-shot-hit" exact component={VerifyShotHitPage} />
    </Switch>
  </BrowserRouter>
  );
}

function LandingPage() {
  const BOARD_SIZE = 3;
  const MAX_SHIPS = 3;
  const [nShips, setNShips] = useState(0);
  const [board, setBoard] = useState<boolean[][]>([[false, false, false], [false, false, false], [false, false, false]]);
  const [boardBitstring, setBoardBitstring] = useState(0);
  const [saltStr, setSaltStr] = useState('');
  const [boardID, setBoardID] = useState('0');

  const [boardIDProof, setBoardIDProof] = useState('');

  const [revealAtRow, setRevealAtRow] = useState('');
  const [revealAtCol, setRevealAtCol] = useState('');
  const [shotHitProof, setShotHitProof] = useState('');

  const onGridClick = (row, col) => {
    const newBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard.push([]);
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[i].push(board[i][j]);
      }
    }
    if (!board[row][col] && nShips < MAX_SHIPS) {
      newBoard[row][col] = true;
      setNShips(nShips + 1);
    } else if (board[row][col]) {
      newBoard[row][col] = false;
      setNShips(nShips - 1);
    }
    setBoard(newBoard);

    let newBoardBitstring = 0;
    for (let i = 0; i < BOARD_SIZE; i++) 
      for (let j = 0; j < BOARD_SIZE; j++)
        newBoardBitstring += (2 ** (i * BOARD_SIZE + j)) * (newBoard[i][j] ? 1 : 0);
    setBoardBitstring(newBoardBitstring);
    setBoardID(mimcHash(0)(bigInt(newBoardBitstring), bigInt(saltStr)).toString());
  }

  const updateSalt = (saltStr) => {
    setSaltStr(saltStr);
    setBoardID(mimcHash(0)(bigInt(boardBitstring), bigInt(saltStr)).toString());
  }

  const displayBoardIdProof = () => {
    calculateBoardIdProof(board, saltStr).then((res) => {
      setBoardIDProof(JSON.stringify(res));
    });
  }

  const displayShotHitProof = () => {
    calculateShotHitProof(board, saltStr, boardID, revealAtRow, revealAtCol).then(res => {
      setShotHitProof(JSON.stringify(res));
    });
  }

  return (
    <>
      <Spacer height={2}/>

      <div style={{ textAlign: "center" }}>
        ZK Battleship
      </div>

      <div style={{ textAlign: "center" }}>
        Ships placed: {`ships: ${nShips}`} / {MAX_SHIPS}
      </div>

      <Spacer height={2}/>

      <Center>
        <div>
          {board.map((row, i) => (
            <GridRow key={i}>
              {row.map((hasShip, j) => {
                return (
                  <GridSquare
                    key={100 * i + j}
                    style={{
                      backgroundColor: hasShip ? 'red' : 'blue',
                    }}
                    onClick={() => onGridClick(i, j)} />
                );
              })}
            </GridRow>
          ))}
        </div>

        <Spacer height={1}/>

        <div style={{ textAlign: "center" }}>
          salt:
        </div>
        <input
          type='text'
          name={saltStr}
          value={saltStr}
          onChange={(e) => updateSalt(e.target.value)}
          placeholder={'0'}
        />

        <Spacer height={1}/>

        <div style={{ textAlign: "center" }}>
          Board ID: {boardID}
        </div>
      </Center>

      <Spacer height={1}/>

      <Center>
        <button
          disabled={MAX_SHIPS !== nShips}
          onClick={displayBoardIdProof}
        >Generate board ID proof!</button>

        <Spacer height={2}/>
        <div style={{ width: 600, wordWrap: "break-word" }}>
          {boardIDProof}
        </div>
      </Center>

      <Spacer height={4}/>

      <Center>
        <input
          type='text'
          name={"shotRow"}
          value={revealAtRow}
          onChange={(e) => setRevealAtRow(e.target.value)}
          placeholder={'row #'}
        />
        <input
          type='text'
          name={"shotCol"}
          value={revealAtCol}
          onChange={(e) => setRevealAtCol(e.target.value)}
          placeholder={'col #'}
        />

        <Spacer height={1}/>

        <button
          onClick={displayShotHitProof}
        >Generate "shot hit" proof!</button>

        <Spacer height={2}/>

        <div style={{ width: 600, wordWrap: "break-word" }}>
          {shotHitProof}
        </div>
      </Center>
    </>
  );
}

function VerifyBoardIdPage() {
  const [boardID, setBoardID] = useState('');
  const [boardIDProof, setBoardIDProof] = useState('');
  const [verifyState, setVerifyState] = useState<'verified' | 'failed' | 'unknown'>('unknown');

  const verifyProof = () => {
    verifyBoardIDProof(boardID, boardIDProof).then(res => {
      setVerifyState(res ? 'verified' : 'failed');
    })
  }

  return (
    <Center>
    <Spacer height={2}/>
      <div style={{ textAlign: "center" }}>
        VerifyState: {verifyState}
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"boardID"}
          value={boardID}
          onChange={(e) => setBoardID(e.target.value)}
          placeholder={'board ID'}
        />
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"proof"}
          value={boardIDProof}
          onChange={(e) => setBoardIDProof(e.target.value)}
          placeholder={'proof'}
        />
      </div>
      <Spacer height={1}/>
      <button
          onClick={verifyProof}
        >Verify board ID proof!</button>
    </Center>
  )
}

function VerifyShotHitPage() {
  const [boardID, setBoardID] = useState('');
  const [revealAtRow, setRevealAtRow] = useState('');
  const [revealAtCol, setRevealAtCol] = useState('');
  const [didHit, setDidHit] = useState('');
  const [hitProof, setHitProof] = useState('');
  const [verifyState, setVerifyState] = useState<'verified' | 'failed' | 'unknown'>('unknown');

  const verifyProof = () => {
    verifyShotHitProof(boardID, revealAtRow, revealAtCol, didHit, hitProof).then(res => {
      setVerifyState(res ? 'verified' : 'failed');
    })
  }

  return (
    <Center>
    <Spacer height={2}/>
      <div style={{ textAlign: "center" }}>
        VerifyState: {verifyState}
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"boardID"}
          value={boardID}
          onChange={(e) => setBoardID(e.target.value)}
          placeholder={'board ID'}
        />
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"row"}
          value={revealAtRow}
          onChange={(e) => setRevealAtRow(e.target.value)}
          placeholder={'row'}
        />
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"col"}
          value={revealAtCol}
          onChange={(e) => setRevealAtCol(e.target.value)}
          placeholder={'col'}
        />
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"didHit"}
          value={didHit}
          onChange={(e) => setDidHit(e.target.value)}
          placeholder={'hit?'}
        />
      </div>
      <Spacer height={1}/>
      <div>
        <input
          type='text'
          name={"proof"}
          value={hitProof}
          onChange={(e) => setHitProof(e.target.value)}
          placeholder={'proof'}
        />
      </div>
      <Spacer height={1}/>
      <button
          onClick={verifyProof}
        >Verify board ID proof!</button>
    </Center>
  )
}