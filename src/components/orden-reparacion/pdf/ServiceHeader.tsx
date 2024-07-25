import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

type Props = {
  repair: {
    id: number;
    startDate: string;
    kms: number;
    outputDate: string;
  };
};

const HeaderBox = styled("div")(() => ({
  marginLeft: "50px",
  display: "grid",
  gridTemplateColumns: "30% 70%",
}));

const Info = styled("div")(() => ({
  display: "grid",
  gridTemplateRows: "auto auto",
  gridTemplateColumns: "50% 50%",
  gridAutoFlow: "column",
}));

function ServiceHeader({ repair }: Props) {
  return (
    <HeaderBox>
      <Typography variant="h5" sx={{ color: "common.black" }}>
        Service N° {repair.id}
      </Typography>
      <Info>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Ingreso {repair.startDate}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Kilometraje {repair.kms}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Fecha Egreso {repair.outputDate}
        </Typography>
      </Info>
    </HeaderBox>
  );
}

export default ServiceHeader;
