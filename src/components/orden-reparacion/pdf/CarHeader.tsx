import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const HeaderBox = styled("div")(() => ({
  border: "1px solid black",
  borderRadius: "4px",
  height: "150px",
  width: "100%",
  padding: "10px",
  marginBottom: 20,
}));

const Info = styled("div")(() => ({
  display: "grid",
  gridTemplateRows: "auto auto auto auto",
  gridTemplateColumns: "50% 50%",
  gridAutoFlow: "column",
}));

type Props = {
  car: {
    patent: string;
    brand: string;
    model: string;
    year: string;
    color: string;
  };
  owner: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
};

function CarHeader({ car, owner }: Props) {
  return (
    <HeaderBox>
      <Typography
        variant="h6"
        sx={{ color: "common.black", textTransform: "uppercase" }}
      >
        {car.patent} {car.brand} {car.model} {car.year} {car.color}
      </Typography>
      <Info>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Titular: {owner.fullName}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Domicilio: {owner.address}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Localidad: {owner.city}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Codigo Postal: {owner.zipCode}
        </Typography>
        <Typography variant="body1" sx={{ color: "common.black" }}>
          Teléfono: {owner.phone}
        </Typography>
      </Info>
    </HeaderBox>
  );
}

export default CarHeader;
