import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Text = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  width: "100%",
}));

const Line = styled("div")(() => ({
  borderBottom: "1.5px solid black",
  marginLeft: 10,
}));

type Props = {
  children: string;
  variant?: React.ComponentProps<typeof Typography>["variant"];
  sx?: React.ComponentProps<typeof Typography>["sx"];
};

function TextWithFillLine({
  children,
  variant = "h6",
  sx = { color: "common.black", textTransform: "uppercase" },
}: Props) {
  return (
    <Text>
      <Typography variant={variant} sx={sx}>
        {children}
      </Typography>
      <Line />
    </Text>
  );
}

export default TextWithFillLine;
