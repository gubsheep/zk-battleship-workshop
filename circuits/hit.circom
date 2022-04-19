pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/mimcsponge.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template ShotHit(nRows, nCols) {
    signal input hasShip[nRows][nCols];
    signal input salt;
    signal input boardId;
    signal input shotRow;
    signal input shotCol;

    signal output didHit;

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

    component hash = MiMCSponge(2, 220, 1);
    hash.ins[0] <== boardBitstring;
    hash.ins[1] <== salt;
    hash.k <== 0;

    boardId === hash.outs[0];

    var accum = 0;
    component testIndex[nRows][nCols][2];
    signal isSelected[nRows][nCols];
    signal isSelectedAndHasShip[nRows][nCols];
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            testIndex[i][j][0] = IsEqual();
            testIndex[i][j][0].in[0] <== shotRow;
            testIndex[i][j][0].in[1] <== i;
            testIndex[i][j][1] = IsEqual();
            testIndex[i][j][1].in[0] <== shotCol;
            testIndex[i][j][1].in[1] <== j;
            isSelected[i][j] <== testIndex[i][j][0].out * testIndex[i][j][1].out;
            isSelectedAndHasShip[i][j] <== isSelected[i][j] * hasShip[i][j];
            accum += isSelectedAndHasShip[i][j];
        }
    }
    didHit <== accum;
}

component main { public [boardId, shotRow, shotCol] } = ShotHit(3, 3);