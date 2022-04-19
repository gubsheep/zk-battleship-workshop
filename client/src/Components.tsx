import React from "react";
import styled, { css, createGlobalStyle } from "styled-components";

export const Center = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

export const Spacer = styled.div`
  ${({ width, height }: { width?: number; height?: number }) => css`
    width: 1em;
    height: 1em;
    ${width && !height ? "display: inline-block;" : ""}
    ${width ? `width: ${width}em;` : ""}
    ${height ? `height: ${height}em;min-height:${height}em;` : ""}
  `}
`;

export const GridRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const GridSquare = styled.div`
  width: 22px;
  height: 22px;
  border-color: rgba(0, 0, 0, 0.15);
  border-style: solid;
  border-width: 1px;
  justify-content: center;
  vertical-align: middle;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;