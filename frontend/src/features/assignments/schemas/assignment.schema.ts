import { z } from "zod";

export const assignmentSchema = z
  .object({
    member: z.string().min(1, "Please select a member"),
    trainer: z.string().min(1, "Please assign a trainer"),
    workout: z.string().min(1, "Please select a workout routine"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  // 💡 التحقق من صحة النطاق الزمني (Date Range Validation)
  .refine(
    (data) => {
      // لو أحد الحقول فاضية، بنسيب الـ min(1) فوق يتولى إظهار رسالة الخطأ
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be earlier than the start date",
      path: ["endDate"], // 💡 الخطأ هيتربط مباشرة بحقل الـ endDate
    },
  );

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
