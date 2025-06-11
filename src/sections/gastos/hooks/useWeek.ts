import { startOfWeek } from "date-fns";
import { useState } from "react";

interface WeekDates {
  startDate: Date;
  endDate: Date;
}

export const useWeek = (): WeekDates => {
  const [dates, setDates] = useState<WeekDates>(() => {
    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    // Calculate Friday (4 days after Monday)
    const fridayDate = new Date(startDate);
    fridayDate.setDate(startDate.getDate() + 4);

    return {
      startDate,
      endDate: fridayDate,
    };
  });

  return dates;
};

export default useWeek;
