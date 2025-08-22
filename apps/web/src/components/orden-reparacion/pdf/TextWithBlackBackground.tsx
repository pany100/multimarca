import { Typography } from "@mui/material";

type Props = {
  children: string;
};

function TextWithBlackBackground({ children }: Props) {
  return (
    <div
      style={{
        marginTop: 0,
        marginRight: "auto",
        marginBottom: 30,
        marginLeft: 0,
        padding: 10,
        backgroundColor: "black",
      }}
    >
      <Typography variant="h6" sx={{ color: "common.white" }}>
        {children}
      </Typography>
    </div>
  );
}

export default TextWithBlackBackground;
