import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const Header = styled("div")(() => ({
  display: "grid",
  gridGap: 20,
  gridTemplateColumns: "200px auto",
  marginBottom: 10,
}));

function TemplateHeader() {
  return (
    <Header>
      <img
        style={{
          width: "100%",
        }}
        alt="mtservice"
        src="/bosch-icon.svg"
      />
      <div>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            textTransform: "uppercase",
            color: "common.black",
          }}
        >
          BOSCH CAR SERVICE MT MULTIMARCA
        </Typography>
        <Typography variant="body2" sx={{ color: "common.black" }}>
          Guemes 1798 entre José María Paz y Blois
        </Typography>
        <Typography variant="body2" sx={{ color: "common.black" }}>
          San Miguel (1663)
        </Typography>
        <Typography variant="body2" sx={{ color: "common.black" }}>
          Buenos Aires. Argentina
        </Typography>
        <Typography variant="body2" sx={{ color: "common.black" }}>
          11 5716 7766
        </Typography>
        <Typography variant="body2" sx={{ color: "common.black" }}>
          {" "}
          mtservice.multimarca@gmail.com
        </Typography>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "30px auto",
            gridGap: 10,
          }}
        >
          <img style={{ width: "100%" }} alt="mtservice" src="/instagram.png" />
          <Typography sx={{ color: "common.black" }}>
            mtservicemultimarca
          </Typography>
        </div>
      </div>
    </Header>
  );
}

export default TemplateHeader;
