import { styled } from "@mui/material/styles";

const PDF_PAGE_HEIGHT = 1130;
const PDF_PAGE_WIDTH = 800;

const PDFPage = styled("div")(() => ({
  height: PDF_PAGE_HEIGHT,
  width: PDF_PAGE_WIDTH,
  display: "flex",
  flexDirection: "column",
}));

export default PDFPage;
