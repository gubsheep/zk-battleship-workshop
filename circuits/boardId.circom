pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/mimcsponge.circom";

template BoardId(nRows, nCols) {
    signal input hasShip[nRows][nCols];
    signal input salt;

    var totalShips = 0;
    var boardBitstring = 0;
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            totalShips += hasShip[i][j];
            boardBitstring += 2 ** (nCols * i + j) * hasShip[i][j];
        }
    }
    totalShips === 3;

    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            hasShip[i][j] * (hasShip[i][j] - 1) === 0;
        }
    }

    signal output boardId;
    component hash = MiMCSponge(2, 220, 1);
    hash.ins[0] <== boardBitstring;
    hash.ins[1] <== salt;
    hash.k <== 0;

    boardId <== hash.outs[0];
}

component main = BoardId(3, 3);