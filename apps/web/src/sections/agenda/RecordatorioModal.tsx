import FormModal from "@/components/formV2/FormModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import {
  createAgendaSchema,
  CreateAgendaSchema,
} from "../../core/infrastructure/validation/schemas/agenda.schema";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";

function RecordatorioModal() {
  const { isModalOpen, setIsModalOpen } = useAgendaUIContext();
  const { currentRecordatorio } = useCalendarContext();
  const methods = useForm<CreateAgendaSchema>({
    resolver: zodResolver(createAgendaSchema),
    defaultValues: currentRecordatorio || {},
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = (data: CreateAgendaSchema) => {
    console.log(data);
  };

  return (
    <FormModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Información Del Recordatorio
          </Typography>
        </form>
      </FormProvider>
    </FormModal>
  );
}

export default RecordatorioModal;
